import DBConnection from "../models/DBConnection.js";
import model from "../models/CartItems.js";

const FILLABLES = [
    "cart_id", "variant_id", 
    "count", "rent_duration"
];
const productPricesql = [
    `SELECT`,
        `Products.price as price`,
    `FROM Products`,
    `JOIN Variants ON Products.id = Variants.product_id`,
    `WHERE Variants.id = ?`
].join(" "); // LIMIT ${index*50},${(index+1)*50}

export default {
    index: function(req, res, next) {
        model.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        model.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: "No CartItem with specified id has found"
                }
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

        Object.keys(req.body).forEach(key => req.body[key] = Number(req.body[key]))
        DBConnection.query(productPricesql, [req.body.variant_id])
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: `No Variant of product with id ${req.body.variant_id} had found`
                }

                const data = [ [...FILLABLES], FILLABLES.map(key => req.body[key])]
                const subtotal = (result[0].price
                    * Number(req.body.rent_duration)
                    * Number(req.body.count)
                )
                data[0].push("subtotal");
                data[1].push(subtotal);
                req.body.subtotal = subtotal;
                return model.store(data)
            })
            .then(result => res.status(201).send({ 
                msg: `CartItem created with id:${result.insertId}`,
                data: { 
                    id: result.insertId,
                    ...req.body,
                    count: Number(req.body.count),
                    rent_duration: Number(req.body.rent_duration),
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

        Object.keys(req.body).forEach(key => req.body[key] = Number(req.body[key]))
        DBConnection.query(productPricesql, [req.body.variant_id])
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: `No Variant of product with id ${req.body.variant_id} had found`
                }

                req.body.subtotal = (result[0].price
                    * Number(req.body.rent_duration)
                    * Number(req.body.count)
                )
                return model.updateById(req.params.id, req.body)
            })
            .then(result => {
                if(result.affectedRows == 0) throw {
                    code: "not_found", 
                    msg: `No CartItem with id ${req.params.id} found`
                }
                return res.status(201).send({ 
                    msg: `CartItem edited with id:${req.params.id}`,
                    data: {
                        id: Number(req.params.id),
                        ...req.body,
                        count: Number(req.body.count),
                        rent_duration: Number(req.body.rent_duration),
                    }
                })
            })
            .catch(err => next(err));

    },

    destroy: function(req, res, next) {
        model.deleteById(req.params.id)
            .then(result => {
                if(result.affectedRows == 0) throw {code: "not_found", msg: `No CartItem with id ${req.params.id} found`}
                return res.send({msg: `Deleted CartItem with id: ${req.params.id}`})
            })
            .catch(err => next(err))
    },
}