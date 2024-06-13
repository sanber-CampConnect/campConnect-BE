import DBConnection from "../models/DBConnection.js";

export default function isOrderItemOwner(req, res, next) {
    if(req.user.role == "admin") next()

    // TODO: make a stored procedure to do all of these things with one DB call
    const orderItemId = Number(req.params.id);
    DBConnection.query("SELECT * FROM OrderItems WHERE id = ?", [orderItemId])
        .then(result => {
            if(result.length == 0) throw {
                code: "not_found", 
                msg: `No OrderItem with id ${orderItemId} has found`
            }

            return DBConnection.query(
                "SELECT 1 from Orders WHERE id = ? AND user_id = ?", 
                [result[0].order_id, req.user.id]
            )
        })
        .then(result => {
            if(result.length == 0) throw {
                code: "not_owner", 
                msg: `OrderItem with id ${orderItemId} owned by other user`
            }

            next();
        })
        .catch(err => next(err))
}