import OrderItems from "../models/OrderItems.js";

export default {
    index: function(req, res, next) {
        OrderItems.getAll(req.params.orderId)
            .then(result => res.send({ data: result }))
            .catch(err => next(err));
    },

    findOne: function(req, res, next) {
        OrderItems.getById(req.params.orderId, req.params.id)
            .then(result => {
                if (result.length == 0) throw {
                    code: "not_found",
                    msg: "No OrderItem with specified id has found"
                }
                res.send({ data: result[0] });
            })
            .catch(err => next(err));
    },

    store: function(req, res, next) {
        const ACCEPTED = ["order_id", "variant_id", "count", "rent_duration", "subtotal"];
        Object.keys(req.body).forEach(key => {
            if (!ACCEPTED.includes(key)) delete req.body[key];
        });

        if (Object.keys(req.body).length != ACCEPTED.length) {
            return next({ code: "incomplete_request", msg: "Not enough data to process" });
        }

        const data = [ACCEPTED, ACCEPTED.map(key => req.body[key])];
        OrderItems.store(data)
            .then(result => res.status(201).send({
                msg: `OrderItem created with id:${result.insertId}`,
                data: {
                    id: result.insertId,
                    ...req.body,
                }
            }))
            .catch(err => next(err));
    },

    edit: function(req, res, next) {
        const ACCEPTED = ["variant_id", "count", "rent_duration", "subtotal"];
        Object.keys(req.body).forEach(key => {
            if (!ACCEPTED.includes(key)) delete req.body[key];
        });

        if (Object.keys(req.body).length == 0) {
            return next({ code: "incomplete_request", msg: "No data to process" });
        }

        OrderItems.updateById(req.params.id, req.body)
            .then(result => {
                if (result.affectedRows == 0) throw {
                    code: "not_found",
                    msg: `No OrderItem with id ${req.params.id} found`
                }
                return res.status(201).send({
                    msg: `OrderItem edited with id:${req.params.id}`,
                    data: {
                        id: Number(req.params.id),
                        ...req.body,
                    }
                });
            })
            .catch(err => next(err));
    },

    destroy: function(req, res, next) {
        OrderItems.deleteById(req.params.id)
            .then(result => {
                if (result.affectedRows == 0) throw { code: "not_found", msg: `No OrderItem with id ${req.params.id} found` };
                return res.send({ msg: `Deleted OrderItem with id: ${req.params.id}` });
            })
            .catch(err => next(err));
    },
}
