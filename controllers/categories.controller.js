import model from "../models/Categories.js";

const FILLABLES = ["name"];

export default {
    index: function(req, res, next) {
        model.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        model.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {code: "not_found", msg: "No Category with specified id has found"}
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
            .then(result => res.send({ msg: `Category created with id:${result.insertId}` }))
            .catch(err => (
                err.detail.code == "ER_DUP_ENTRY"? 
                    next({code: "duplicate_entry", msg: "Category name has already be used"}) : 
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
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No Category with id ${req.params.id} found`}
                return res.send({ msg: `Category edited with id:${req.params.id}` })
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
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No Category with id ${req.params.id} found`}
                return res.send({msg: `Deleted Category with id: ${req.params.id}`})
            })
            .catch(err => next(err))
    },
}