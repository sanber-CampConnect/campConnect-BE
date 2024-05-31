import model from "../models/Users.js";

const FILLABLES = ["name", "email", "phone", "role", "image", "is_verified", "password"];

export default {
    index: function(req, res, next) {
        model.getAll()
            .then((result) => {
                return res.send({ data: result })
            })
            .catch((err) => {
                next({code: "sql_error", detail: err})
            })
    },

    findOne: function(req, res, next) {
        model.getById(1)
            .then((result) => {
                return res.send({ data: result })
            })
            .catch((err) => {
                next({code: "sql_error", detail: err})
            })
    },
    
    store: function(req, res, next) {

    },

    edit: function(req, res, next) {

    },

    destroy: function(req, res, next) {

    },
}