import model from "../models/Carts.js";

const FILLABLES = ["user_id"];

export default {
    index: function(req, res, next) {
        model.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        let cart;
        model.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: "No Cart with specified id has found"
                }
                cart = result[0];
                return model.getCartItems(req.params.id);
            })
            .then(cartItems => {
                cart.items = cartItems;
                res.send({ data: cart });
            })
            .catch(err => next(err));
    },
    
    store: function(req, res, next) {
        Object.keys(req.body).forEach(key => {
            if(!FILLABLES.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != FILLABLES.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }

        const data = [ FILLABLES, FILLABLES.map(key => req.body[key])];
        model.store(data)
            .then(result => res.status(201).send({ 
                msg: `Cart created with id:${result.insertId}`,
                data: { 
                    id: result.insertId,
                    ...req.body,
                }
            }))
            .catch(err => next(err));
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
                if(result.affectedRows == 0) throw {
                    code: "not_found", 
                    msg: `No Cart with id ${req.params.id} found`
                }
                return res.status(201).send({ 
                    msg: `Cart edited with id:${req.params.id}`,
                    data: {
                        id: Number(req.params.id),
                        ...req.body,
                    }
                })
            })
            .catch(err => next(err));
    },

    destroy: function(req, res, next) {
        model.deleteById(req.params.id)
            .then(result => {
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No Cart with id ${req.params.id} found`}
                return res.send({msg: `Deleted Cart with id: ${req.params.id}`})
            })
            .catch(err => next(err))
    },
}
