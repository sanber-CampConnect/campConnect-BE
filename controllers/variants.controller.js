import model from "../models/Variants.js";

const FILLABLES = ["product_id","name","stock"];

export default {
    index: function(req, res, next) {
        model.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        model.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: "No Variant with specified id has found"}
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

        const data = [ FILLABLES, FILLABLES.map(key => req.body[key])]
        model.store(data)
            .then(result => res.send({ msg: `Variant created with id:${result.insertId}` }))
            .catch(err => (
                    next(err)
            ));
    },

    edit: function(req, res, next) {
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length == 0) {
            return next({code: "incomplete_request", msg: "No data to process"})
        }
        
        model.updateById(req.params.id, req.body)
            .then(result => {
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No Variant with id ${req.params.id} found`}
                return res.send({ msg: `Variant edited with id:${req.params.id}` })
            })
            .catch(err => (
                    next(err)
            ));

    },

    destroy: function(req, res, next) {
        model.deleteById(req.params.id)
            .then(result => {
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No Variant with id ${req.params.id} found`}
                return res.send({msg: `Deleted Variant with id: ${req.params.id}`})
            })
            .catch(err => next(err))
    },
}