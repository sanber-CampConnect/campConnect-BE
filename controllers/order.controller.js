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
                    msg: `User with id ${req.user.id} is not found`
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
                    msg: `Associated 'Cart' somehow didn't found for User with id ${req.user.id}`
                }

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

                const itemsOwnedBySelf = cartItems.every(item => item.cart_id == originCartId)
                if(!itemsOwnedBySelf) throw {
                    code: "not_owner",
                    msg: "Request contains CartItem owned by another user"
                };

                orderedCartItems = cartItems
                return DBConnection.query(
                    "SELECT * FROM Variants WHERE id IN (?)",
                    [cartItems.map(item => item.variant_id)]
                )
            })
            .then(orderedVariants => { 
                const availableVariantsId = orderedVariants.map(variant => variant.id)
                const allVariantsAvailable = orderedCartItems
                                            .map(cartItem => cartItem.variant_id)
                                            .every(item => availableVariantsId.includes(item))

                if(!allVariantsAvailable) throw {
                    code: "not_found",
                    msg: "Certain variant of product is not found"
                }

                // Does the items that are going to be orderd still has enough stock or even available?
                const variants = {}
                orderedVariants.forEach(variant => { variants[variant.id] = variant.stock })
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

                // Reduce stock based on what already ordered
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
            .then(_ => { // delete cartItems that is being ordered
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

    cancelOrder: function(req, res, next) {
        let oldOrder = undefined
        Orders.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `No Order with id ${orderId} found`
                }

                oldOrder = result[0]
                if(oldOrder.status != "belum_bayar") throw { // Completed order doesn't need to be updated
                    code: "illegal_operation",
                    msg: "Ongoing or done order's status shouldn't be cancelled"
                }

                oldOrder.status = "dibatalkan";
                return DBConnection.query( "SELECT * FROM OrderItems WHERE order_id = ?", [oldOrder.id])
            })
            .then(orderItems => {
                // Replenish stock
                // Note: Items recovery outside cancelled order is handled via `Rents`
                //      which could only be done if the item is already returned
                const orderedVariantId = {}
                orderItems.forEach(orderItem => {
                    const {variant_id, orderItem_count: count} = orderItem
                    orderedVariantId[variant_id] =  (
                        orderedVariantId[variant_id] != undefined?
                            orderedVariantId[variant_id] + count
                            : count
                    )
                })

                const sqlCases = []
                const data = []
                Object.keys(orderedVariantId).forEach(variant_id => {
                    sqlCases.push(`WHEN id = ${variant_id} THEN (stock + ?)`);
                    data.push(orderedVariantId[variant_id]);
                })

                const sqlUpdateStock = [
                    "UPDATE Variants",
                    "SET stock =",
                        `CASE ${sqlCases.join(" ")} END`,
                    "WHERE id IN (?)",
                ].join(" ")
                return DBConnection.query(sqlUpdateStock, [...data, Object.keys(orderedVariantId)])
            })
            .then(_ => Orders.updateById(oldOrder.id, {status: oldOrder.status}))
            .then(_ => res.status(201).send({
                msg: `Status of order with id ${oldOrder.id} updated`,
                data: oldOrder
            }))
            .catch(err => next(err))
    },

    completeOrder: function(req, res, next) {
        let oldOrder = undefined
        Orders.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `No Order with id ${orderId} found`
                }

                oldOrder = result[0]
                if(["dibatalkan", "selesai"].includes(oldOrder.status)) throw { // Completed order doesn't need to be updated
                    code: "illegal_operation",
                    msg: "Completed order's status doesn't need to be updated"
                }
                else if(oldOrder.status == "belum_bayar") throw {
                    code: "illegal_operation",
                    msg: "Order couldn't declared as 'selesai' if its status is still 'belum_bayar'"
                }

                oldOrder.status = "selesai";
                return DBConnection.query( "SELECT * FROM OrderItems WHERE order_id = ?", [oldOrder.id])
            })
            .then(orderedItems => DBConnection.query( 
                "SELECT * FROM Rents WHERE orderItem_id IN (?)",
                [orderedItems.map(item => item.id)]
            ))
            .then(rents => { 
                // Does all rented item already returned?
                // Note: `Rents` record only generated via `Transactions`
                //      which implies: No completed `Transactions`, no `Rents` record
                const allOrderedItemHasReturned = (
                    rents.map(rentItem => rentItem.return_date)
                        .every(return_date => {
                            console.log(return_date)
                            return return_date != undefined;
                        })
                );

                if(!allOrderedItemHasReturned) throw {
                    code: "illegal_operation",
                    msg: "Only orders with all item returned could be declared as done"
                }
                return Orders.updateById(oldOrder.id, {status: oldOrder.status})
            })
            .then(_ => res.status(201).send({
                msg: `Status of order with id ${oldOrder.id} updated`,
                data: oldOrder
            }))
            .catch(err => next(err))
    },

    destroy: function(req, res, next) {
        Orders.getById(req.params.id)
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found", 
                    msg: `No Order with id ${req.params.id} found`
                }

                const oldOrder = result[0]
                if(!["selesai", "dibatalkan"].includes(oldOrder.status)) throw {
                    code: "illegal_operation",
                    msg: "Could not delete uncompleted orders"
                }

                return DBConnection.query(
                    "SELECT * FROM Transactions WHERE id = ?",
                    [oldOrder.id]
                )
            })
            .then(result => {
                if(result.length == 0) throw {
                    code: "not_found",
                    msg: `Associated Transaction of Order with id of ${req.params.id} somehow could not be found`
                }

                const oldTransaction = result[0]
                return (oldTransaction.evidence_image == null
                    ? undefined
                    : unlink( path.join(process.env.STORAGE_PATH, oldTransaction.evidence_image)))
            })
            .then(_ => Orders.deleteById(req.params.id))
            .then(_ => res.send({msg: `Deleted Order with id: ${req.params.id}`}))
            .catch(err => next(err))
    },
}