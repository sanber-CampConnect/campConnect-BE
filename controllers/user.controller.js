import { unlink } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/Users.js";
import { filterBody, hasEnoughData } from "../utils/requestPreprocessor.js";

dotenv.config()
const FILLABLES = ["fullname", "username", "email", "phone", "role", "is_verified", "password"];

export default {
    index: function(req, res, next) {
        User.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        User.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: "No user with specified id has found"}
                return res.send({ data: result[0] })
            })
            .catch(err => next(err))
    },
    
    store: function(req, res, next) {
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }

        let insertId;
        let cartInsertId;
        bcrypt.hash(req.body.password, 10)
            .then(hashed => {
                req.body.password = hashed
                const data = [
                    req.body.fullname,
                    req.body.username,
                    req.body.email,
                    req.body.password
                ]
                return User.store(data)
            })
            .then(result => {
                insertId = result[0][0].userInsertId;
                cartInsertId = result[0][0].cartInsertId;
                User.updateById(insertId, req.body)
            })
            .then(_ => res.status(201).send({ 
                msg: `User created with id:${insertId}`,
                data: {
                    id: insertId,
                    ...Object.fromEntries(FILLABLES.map((entry) => [entry, req.body[entry]])),
                    cart_id: cartInsertId,
                }
            }))
            .catch(err => (
                err.detail?.code == "ER_DUP_ENTRY"? 
                    next({code: "duplicate_entry", msg: "This email has already be used"}) : 
                    next(err)
            ));
    },

    edit: function(req, res, next) {
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }
        
        let oldUser = undefined
        User.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: `No user with id ${req.params.id} found`}

                oldUser = result[0];
                return bcrypt.compare(req.body.password, oldUser.password)
            })
            .then((isMatched) => {
                if(!isMatched) return bcrypt.hash(req.body.password, 10)
                return undefined;
            })
            .then(hashed => {
                req.body.password = hashed || oldUser.password
                return User.updateById(req.params.id, req.body)
            })
            .then(_ => {
                return res.status(201).send({ 
                    msg: `User edit success`,
                    data: {
                        id: req.params.id,
                        ...Object.fromEntries(FILLABLES.map((entry) => [entry, req.body[entry]]))
                    }
                })
            })
            .catch(err => (
                err.detail?.code == "ER_DUP_ENTRY"? 
                    next({code: "duplicate_entry", msg: "This email has already be used"}) : 
                    next(err)
            ));
    },

    destroy: function(req, res, next) {
        User.getById(req.params.id)
            .then(result => {
                if(result.length === 0) throw {code: "not_found", msg: 'User not found'};
                if(result[0].image != null) return unlink(path.join(process.env.STORAGE_PATH, result[0].image))
                return undefined;
            })
            .then(_ => User.deleteById(req.params.id))
            .then(_ =>  res.send({ msg: `Deleted User with id: ${req.params.id}` }))
            .catch(err => next(err));
    },
}