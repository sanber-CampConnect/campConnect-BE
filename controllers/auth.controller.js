import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Users from "../models/Users.js";
import jwtConfig from "../configs/jwt.js";
import connection from '../models/DBConnection.js';
import mailService from "../services/mail.service.js";

dotenv.config()

const sendVerificationEmail = function(req, res, next) {
    Users.getByEmail(req.body["email"])
        .then(result => {
            if(result.length == 0) throw {code: "not_found", msg: "User with given email not found"}
            if(result[0]["is_verified"]) throw {code: "no_op", msg: "This email has been verified. Verification is not needed"}

            return composeVerificationEmail(req.body["email"])
        })
        .then(result => {
            const {destination, subject, content} = result;
            mailService.sendMail(destination, subject, content, (err, data) => {
                if(err) throw {err: "internal_error", detail: err}
                return res.send({msg: `Verification email sent to ${req.body["email"]}`})
            });
        })
        .catch(err => next(err))
}


const register = function(req, res, next) {
    const FILLABLES = ["fullname", "username",  "email", "password"];
    Object.keys(req.body).forEach(key => {
        if(!FILLABLES.includes(key)) delete req.body[key]
    })

    if(Object.keys(req.body).length != FILLABLES.length) {
        return next({code: "incomplete_request", msg: "Not enough data to process"})
    }

    let mailWarning = undefined;
    let newUser = undefined
    Users.getByEmail(req.body["email"])
        .then(result => {
            if(result.length > 0) throw {code: "duplicate_entry", msg: "This email has already be used"}
            return bcrypt.hash(req.body["password"], 10)
        })
        .then(hashedPassword => {
            req.body["password"] = hashedPassword
            const newUserData = [FILLABLES, FILLABLES.map(key => req.body[key])];
            return Users.store(newUserData)
        })
        .then(result => {
            newUser = {
                id: result.insertId,
                fullname: req.body.fullname,
                username: req.body.username,
                email: req.body.email,
            }
            return composeVerificationEmail(req.body["email"])
        })
        .then(result => {
            const {destination, subject, content} = result
            mailService.sendMail(destination, subject, content, (err, data) => {
                if(err) {
                    mailWarning = "Verification email not sent. Please access other menu part to request it again"
                    console.log(err)
                }
            });

            return generateToken({ id: newUser.id, role: "user" })
        })
        .then(token => res.send({
            msg: `Account registered. Hello ${req.body["name"]} (U#${newUser.id})!`,
            warning: mailWarning,
            authorization: token,
            data: newUser
        }))
        .catch(err => next(err))
}

const login = function(req, res, next) {
    const FILLABLES = ["email", "password"];
    Object.keys(req.body).forEach(key => {
        if(!FILLABLES.includes(key)) delete req.body[key]
    })

    if(Object.keys(req.body).length != FILLABLES.length) {
        return next({code: "incomplete_request", msg: "Not enough data to process"})
    }
    
    let user = undefined;
    const {email, password} = req.body;
    Users.getByEmail(email)
        .then(result => {
            if(result.length == 0) throw {code: "not_found", msg: "User with given email not found"}

            user = result[0];
            return result;
        })
        .then(_ => bcrypt.compare(password, user.password))
        .then(isMatched => {
            if(!isMatched) throw { code: "unmatched_credentials", msg: "Password doesn't match" }
            return generateToken({ id: user.id, role: user.role });
        })
        .then(token => {
            user.password = undefined;
            res.send({
                msg: `Hello ${user.name} (U#${user.id})!`,
                authorization: token,
                data: user
            })
        })
        .catch(err => next(err))
}

const forgotPassword = async function(req, res, next) {
    const {email} = req.body;
    if(email == undefined) return next({code: "incomplete_request", msg: "Email is either not provided or has no associated user"})
    let mailWarning = undefined;
    const {destination, subject, content} = await composeResetPasswordEmail(email, next)
    console.log(await generateToken({email}))
    mailService.sendMail(destination, subject, content, (err, data) => {
        if(err) {
            console.log(err)
            mailWarning = "Verification email not sent. Please access other menu part to request it again"
        }
    });
    res.send({msg: "Work in progress"});
}

const verifyAccount = function(req, res, next) {
    jwt.verify(req.query.token, jwtConfig.secret, (err, decodedData) => {
        if (err) return next({code: "invalid_token", msg: "Token may be invalid or expired. Try to login again"})
        if (decodedData.email == undefined) return next({code: "invalid_token", msg: "Token may not belong to this endpoint"})

        Users.getByEmail(decodedData.email)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: "User with given email not found"}
                const user = result[0]
                return Users.updateById(user.id, {"is_verified": true});
            })
            .then(result => {
                if(result.affectedRows === 0) throw {code: "not_found", msg: 'User not found or activation has already done'};
                return res.send({ msg: 'Account successfully updated!' });
            })
            .catch(err => next(err));
    });
}

const resetPassword = function(req, res, next) {
    const { newPassword, confirmPassword } = req.body;
                
    const invalidRequest = (
        newPassword == undefined 
        || confirmPassword == undefined
        || newPassword !== confirmPassword
    );

    if(invalidRequest) return next({code: "bad_request", msg: "Need both current new password and current password data / new password does not match with confirm password"})

    jwt.verify(req.query.token, jwtConfig.secret, (err, decodedData) => {
        if (err) return next({code: "invalid_token", msg: "Token may be invalid or expired. Try make forgot password request again"})
        if (decodedData.email == undefined) return next({code: "invalid_token", msg: "Token may not belong to this endpoint"})
        Users.getByEmail(decodedData.email)
            .then(result => {
                const user = result[0];
                
                const hashedPassword = bcrypt.hashSync(newPassword, 10);
                const sql = 'UPDATE Users SET password = ? WHERE id = ?';
                connection.query(sql, [hashedPassword, user.id])
                .then(result => res.send({ message: 'Password updated successfully' }) )
                .catch(err => next(err))
            })
            .catch(err => next(err));
    });
}

function generateToken(userInfo) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            userInfo, 
            jwtConfig.secret,
            { expiresIn: 60*60*jwtConfig.lifetime },
            (err, token) => {
                if(err) reject({
                    code: "internal_error", 
                    msg: "Something went wrong during generating token",
                    detail: err, 
                })
                resolve(token)
            }
        );
    })
}

function composeVerificationEmail(destination) {
    return new Promise((resolve, reject) => {
        generateToken({email: destination})
            .then(token => {
                const url = `${process.env.SERVER_DOMAIN}/auth/verifyAccount?token=${token}`
                resolve({
                    destination: destination,
                    subject: "Yuk aktifkan akunmu",
                    content: `Halo! Terima kasih telah bergabung dengan CampConnect`
                        + `\nSilakan akses tautan berikut untuk mulai menyewa perlengkapan kemahanmu!\n${url}`
                })
            })
            .catch(err => reject(err))
    })
}

function composeResetPasswordEmail(email) {
    return new Promise((resolve, reject) => {
        generateToken({email})
            .then(token => {
                const url = `${process.env.SERVER_DOMAIN}/auth/resetPassword?token=${token}`;
                resolve({
                    destination: email,
                    subject: "Permintaan Reset Password",
                    content: `Halo! Kami menerima permintaan untuk mereset password akun Anda.`
                        + `\nSilakan klik tautan di bawah ini untuk melanjutkan proses reset password Anda:\n${url}`
                        + `\nJika Anda tidak meminta reset password ini, abaikan email ini dan pastikan akun Anda aman.`
                });
            })
            .catch(err => reject(err));
    });
}

export default { 
    register: register, 
    login: login,
    forgotPassword: forgotPassword, 
    resetPassword: resetPassword,  
    sendVerificationEmail: sendVerificationEmail, 
    verifyAccount: verifyAccount, 
};