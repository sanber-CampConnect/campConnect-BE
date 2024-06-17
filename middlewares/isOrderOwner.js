import DBConnection from "../models/DBConnection.js";

export default function isOrderOwner(req, res, next) {
    if(req.user.role == "admin") return next()

    // TODO: Make a stored procedure for this
    const order_id = req.body.order_id || req.params.id;
    DBConnection.query("SELECT * FROM Orders WHERE id=?", [order_id])
        .then(result => {
            if(result.length == 0) throw {
                code: "not_found", 
                msg: `No Order with id ${order_id} has found`
            }

            if(result[0].user_id != req.user.id) throw {
                code: "not_owner", 
                msg: `Order with id ${order_id} belongs to other user`
            }

            return next();
        })
        .catch(err => next(err))
}