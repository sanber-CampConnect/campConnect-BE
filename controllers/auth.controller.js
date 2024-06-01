import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import Users from "../models/Users.js";

dotenv.config();
const secret = {
    "DEVEL": process.env.DEVEL_JWT_SECRET,
    "STAGING": process.env.STAGING_JWT_SECRET,
    "PRODUCTION": process.env.PRODUCTION_JWT_SECRET,
}

function generateToken(userInfo, onError, onSuccess) {
    jwt.sign(
        userInfo, 
        secret[process.env.NODE_ENV],
        { expiresIn: 60*60*3 },
        (err, token) => err? onError(err): onSuccess(token)
    );
}

export default {
    register: function(req, res, next) {
        const FILLABLES = ["name", "email", "password"];
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }

        Users.getByEmail(req.body["email"])
            .then(result => {
                if(result.length > 0) next({code: "duplicate_entry", msg: "This email has already be used"})

                bcrypt.hash(req.body["password"], 10, (err, hashed) => {
                    if(err) return next({code: "internal_error", detail: err})

                    req.body["password"] = hashed
                    const newUserData = [FILLABLES, FILLABLES.map(key => req.body[key])];
                    Users.store(newUserData)
                        .then(result => generateToken( 
                            { id: result.insertId, role: "user" }, 
                            err => next({code: "internal_error", detail: err}),
                            token => res.send({
                                msg: `Account registered. Hello ${req.body["name"]} (U#${result.insertId})!`,
                                authorization: token 
                            })
                        )) 
                        .catch(err => next({code: "sql_error", detail: err}))
                })
            })
            .catch(err => next({code: "sql_error", detail: err}))
    },

    login: function(req, res, next) {
        const FILLABLES = ["email", "password"];
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }
        
        const {email, password} = req.body;
        Users.getByEmail(email)
            .then(result => {
                if(result.length == 0) next({code: "not_found", msg: "User with given email not found"})

                const {id, name, password: actualPassword, role} = result[0];
                bcrypt.compare(password, actualPassword)
                    .then(isMatched => {
                        if(!isMatched) return next({code: "unmatched_credentials", msg: "Wrong password"})

                        generateToken({ id: id, role: role }, next, token => res.send({
                            msg: `Hello ${name} (U#${id})!`,
                            authorization: token
                        }));
                    })
                    .catch(err => next({code: "internal_error", detail: err}))
                })
            .catch(err => next({code: "sql_error", detail: err}))
    },
    
    resetPassword: function(req, res, next) {
        // Provide special link here
        res.send({msg: "Work in progress"});
    },

    verifyAccount: function(req, res, next) {
        // Send verification email here
        res.send({msg: "Work in progress"});
    }
}