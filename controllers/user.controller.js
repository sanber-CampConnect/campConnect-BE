import model from "../models/Users.js";

export default {
    index: function(req, res, next) {
        model.getAll()
            .then((result) => {
                return res.send({
                    msg: "hello from CampConnect",
                    data: result
                })
            })
            .catch((err) => {
                next({code: "sql_error", detail: err})
            })

        // return res.send({
        //     msg: "hello from CampConnect",
        //     data: model.getAll()
        // })
    },

    findOne: function(req, res, next) {

    },
    
    store: function(req, res, next) {

    },

    edit: function(req, res, next) {

    },

    destroy: function(req, res, next) {

    },
}