import bcrypt from "bcryptjs";
import model from "../models/Users.js";

const FILLABLES = ["name", "email", "phone", "role", "image", "is_verified", "password"];

function hashPassword(password, callback) {
    bcrypt.hash(password, 10, (err, hashed) => {
        if(err) return next({code: "internal_error", detail: err})
        callback(hashed);
    });
}

export default {
    index: function(req, res, next) {
        model.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next({code: "sql_error", detail: err}))
    },

    findOne: function(req, res, next) {
        model.getById(req.params.id)
            .then(result => {
                if(result.length == 0) return next({code: "not_found", msg: "No user with specified id has found"})
                return res.send({ data: result[0] })
            })
            .catch(err => next({code: "sql_error", detail: err}))
    },
    
    store: function(req, res, next) {
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }

        hashPassword(req.body["password"], hashed => {
            req.body["password"] = hashed
            const data = [ FILLABLES, FILLABLES.map(key => {
                if(key != "is_verified") return req.body[key];
                return (req.body[key] == "true"? true: false);
            })]
            model.store(data)
                .then(result => res.send({ msg: `User created with id:${result.insertId}` }))
                .catch(err => (
                    err.code == "ER_DUP_ENTRY"? 
                        next({code: "duplicate_entry", msg: "This email has already be used"}) : 
                        next({code: "sql_error", detail: err})
                ));
        })
    },

    edit: function(req, res, next) {
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length == 0) {
            return next({code: "incomplete_request", msg: "No data to process"})
        }
        
        if(req.body["password"] == undefined) {
            model.updateById(req.params.id, req.body)
                .then(result => {
                    if(result.affectedRows == 0) return next({code: "not_found", msg: `No user with id ${req.params.id} found`})
                    return res.send({ msg: `User edited with id:${req.params.id}` })
                })
                .catch(err => (
                    err.code == "ER_DUP_ENTRY"? 
                        next({code: "duplicate_entry", msg: "This email has already be used"}) : 
                        next({code: "sql_error", detail: err})
                ));
        } else {
            hashPassword(req.body["password"], hashed => {
                req.body["password"] = hashed
                model.updateById(req.params.id, req.body)
                    .then(result => {
                        if(result.affectedRows == 0) return next({code: "not_found", msg: `No user with id ${req.params.id} found`})
                        return res.send({ msg: `User edited with id:${req.params.id}` })
                    })
                    .catch(err => (
                        err.code == "ER_DUP_ENTRY"? 
                            next({code: "duplicate_entry", msg: "This email has already be used"}) : 
                            next({code: "sql_error", detail: err})
                    ));
            })
        }

    },

    destroy: function(req, res, next) {
        model.destroy(req.params.id)
            .then(result => res.send({msg: `Deleted User with id: ${req.params.id}`}))
            .catch(err => next({code: "sql_error", detail: err}))
    },
}