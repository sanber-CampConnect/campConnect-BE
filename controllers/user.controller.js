import bcrypt from "bcryptjs";
import model from "../models/Users.js";
import { filterBody, hasEnoughData } from "../utils/requestPreprocessor.js";

const FILLABLES = ["fullname", "username", "email", "phone", "role", "image", "is_verified", "password"];

export default {
    index: function(req, res, next) {
        model.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        model.getById(req.params.id)
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

        bcrypt.hash(req.body.password, 10)
            .then(hashed => {
                req.body["password"] = hashed
                const data = [ FILLABLES, FILLABLES.map(key => {
                    if(key != "is_verified") return req.body[key];
                    return (req.body[key] == "true"? true: false);
                })]
                return model.store(data)
            })
            .then(result => res.status(201).send({ 
                msg: `User created with id:${result.insertId}`,
                data: {
                    id: result.insertId,
                    ...Object.fromEntries(FILLABLES.map((entry) => [entry, req.body[entry]]))
                }
            }))
            .catch(err => (
                err.detail.code == "ER_DUP_ENTRY"? 
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
        model.getById(req.params.id)
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
                return model.updateById(req.params.id, req.body)
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
        model.deleteById(req.params.id)
            .then(result => {
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No user with id ${req.params.id} found`}
                return res.send({msg: `Deleted User with id: ${req.params.id}`})
            })
            .catch(err => next(err))
    },
}