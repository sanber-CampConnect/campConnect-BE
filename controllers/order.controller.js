import crypto from "node:crypto";
import Orders from "../models/Orders.js";
import DBConnection from "../models/DBConnection.js";
import Users from "../models/Users.js";

export default {
    index: function(req, res, next) {
        Orders.getAll()
            .then(result => res.send({ data: result }))
            .catch(err => next(err))
    },

    findOne: function(req, res, next) {
        let orderInfo;
        Orders.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: "No Order with specified id has found"
                }

                orderInfo = result[0]
                return Orders.orderItems(req.params.id)
            })
            .then(result => {
                return res.send({ 
                    data: {
                        ...orderInfo,
                        orderItems: result
                    }
                })
            })
            .catch(err => next(err))
    },
    
    store: function(req, res, next) {
        const ACCEPTED = ["method", "cartItems"];
        Object.keys(req.body).forEach(key => {
            if(!ACCEPTED.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != ACCEPTED.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }

        if(req.body.cartItems.length == 0) throw {
            code: "illegal_operation",
            msg: "No cartItems to be processed"
        }

        let totalItems = 0;
        let totalPrice = 0;
        let originCartId = -1;
        let newOrderId;
        let orderedCartItems;

        Users.getById(req.user.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `Associated cart somehow didn't found for User with id ${req.user.id}`
                }

                if(result[0].is_verified == 0) throw {
                    code: "not_verified",
                    msg: "Requester's account has yet been activated"
                }

                return DBConnection.query( "SELECT id FROM Carts WHERE user_id = ?", req.user.id)
            })
            .then(result => { 
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `Associated cart somehow didn't found for User with id ${req.user.id}`
                }

                // Retrieve cartItems info
                originCartId = result[0].id;
                return DBConnection.query(
                    "SELECT * FROM CartItems WHERE id IN (?)",
                    [req.body.cartItems]
                )
            })
            .then(cartItems => { // Does all orderItems is owned by the requester?
                if(cartItems.length != req.body.cartItems.length) throw {
                    code: "not_found",
                    msg: "Certain items that want to be ordered doesn't exist"
                }

                orderedCartItems = cartItems
                const itemsOwnedBySelf = cartItems.every(item => item.cart_id == originCartId)
                if(!itemsOwnedBySelf) throw {
                    code: "not_owner",
                    msg: "Request contains CartItem owned by another user"
                };

                return DBConnection.query(
                    "SELECT * FROM Variants WHERE id IN (?)",
                    [cartItems.map(item => item.variant_id)]
                )
            })
            .then(result => { 
                const availableVariantsId = result.map(variant => variant.id)
                const allVariantsAvailable = orderedCartItems
                                            .map(cartItem => cartItem.variant_id)
                                            .every(item => availableVariantsId.includes(item))

                if(!allVariantsAvailable) throw {
                    code: "not_found",
                    msg: "Certain variant of product is not found"
                }

                // Does the items that are going to be orderd still has enough stock or even available?
                const variants = {}
                result.forEach(variant => { variants[variant.id] = variant.stock })
                orderedCartItems.forEach(orderItem => {
                    const {variant_id, count, subtotal} = orderItem
                    if(count > variants[variant_id]) throw {
                        code: "stock_insufficient",
                        msg: "Some of the ordered item amount is more than what was available"
                    }

                    variants[variant_id] -= count
                    totalItems += count;
                    totalPrice += subtotal;
                })

                // Update stock based on what already ordered
                const orderedVariantId = []
                const sqlCases = []
                Object.entries(variants).forEach(entry => {
                    const [id, stock] = entry
                    sqlCases.push(`WHEN id = ${id} THEN ${stock}`)
                    orderedVariantId.push(id);
                })

                const sqlUpdateStock = [
                    "UPDATE Variants",
                    "SET stock =",
                        `CASE ${sqlCases.join(" ")} END`,
                    "WHERE id IN (?)",
                ].join(" ")
                return DBConnection.query(sqlUpdateStock, [orderedVariantId])
            }) 
            .then(_ => { // delete cartItems
                const sqlClearOrderedItems = "DELETE FROM CartItems WHERE id IN (?)"
                return DBConnection.query(sqlClearOrderedItems, [orderedCartItems.map(item => item.id)])
            }) 
            .then(_ => { 
                const INVOICE_NUMBER = `INV_${crypto.randomBytes(14).toString("hex")}`
                const data = [req.user.id, INVOICE_NUMBER, req.body.method, totalItems, totalPrice]
                return Orders.store(data)
            })
            .then(result => {
                newOrderId = result[0][0].insertId
                return DBConnection.query(
                    "INSERT INTO OrderItems(??) VALUES ?", 
                    [
                        ["order_id", "variant_id", "count", "rent_duration", "subtotal"],
                        orderedCartItems.map(item => [
                            newOrderId, 
                            ...(["variant_id", "count", "rent_duration", "subtotal"]
                                .map(prop => item[prop]))
                        ])
                    ]
                )
            })
            .then(result => {
                const orderItemsInsertId = [...Array(result.affectedRows)]
                                        .map( (_, id) => result.insertId + id)
                return res.status(201).send({
                    msg: `Order has been created`,
                    data: {
                        id: newOrderId,
                        user_id: req.body.user_id,
                        method: req.body.method,
                        totalItems: totalItems,
                        totalPrice: totalPrice,
                        orderItems: orderedCartItems.map((value, idx) => (
                            { id: orderItemsInsertId[idx], ...value }
                        ))
                    }
                })
            })
            .catch(err => next(err))
    },

    /*
    updateStatus: function(req, res, next) {
        const ACCEPTED = ["status", "note"];
        Object.keys(req.body).forEach(key => {
            if(!ACCEPTED.includes(key)) delete req.body[key]
        })

        if(Object.keys(req.body).length != ACCEPTED.length) {
            return next({code: "incomplete_request", msg: "Not enough data to process"})
        }

        const {status, note} = req.body;
        if(!["disetujui", "diproses", "ditolak"].includes(status)) throw {
            code: "bad_request",
            msg: "status could only be either one of {'disetujui', 'diproses', 'ditolak'}"
        }

        const orderId = req.params.id
        let oldOrder = undefined
        Orders.getById(orderId)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `No Order with id ${orderId} found`
                }

                // Ended order doesn't need to be updated
                if(["ditolak", "selesai"].includes(result[0].status)) throw {
                    code: "illegal_operation",
                    msg: "Completed order's status couldn't be updated"
                }

                oldOrder = result[0]
                oldOrder.status = status;

                const shouldRestoreStock = ["ditolak", "selesai"].includes(status)
                if(!shouldRestoreStock) return undefined
                return Orders.orderItems(orderId)
            })
            .then(result => {
                if(result == undefined) return undefined; 
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `Certain orderItem associated with id ${orderId} could not be found`
                }

                // Replenish stock
                const sqlCases = []
                const data = []
                const orderedVariantId = []
                result.forEach(orderItem => {
                    const {variant_id, count} = orderItem
                    sqlCases.push(`WHEN id = ${variant_id} THEN (stock + ?)`);
                    data.push(count);
                    orderedVariantId.push(variant_id)
                })

                const sqlUpdateStock = [
                    "UPDATE Variants",
                    "SET stock =",
                        `CASE ${sqlCases.join(" ")} END`,
                    "WHERE id IN ?",
                ].join(" ")
                return DBConnection.query(sqlUpdateStock, [...data, orderedVariantId])
            })
            .then(() => Orders.updateById(orderId, req.body))
            .then(() => res.status(201).send({
                msg: `Order with id ${orderId} updated`,
                data: oldOrder
            }))
            .catch(err => next(err))
    },
    */
    destroy: function(req, res, next) {
        Orders.deleteById(req.params.id)
            .then(result => {
                if(result.affectedRows == 0) throw {
                    code: "not_found", 
                    msg: `No Order with id ${req.params.id} found`
                }
                return res.send({msg: `Deleted Order with id: ${req.params.id}`})
            })
            .catch(err => next(err))
    },
}