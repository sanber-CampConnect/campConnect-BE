import CartItems from "../models/CartItems.js"
import DBConnection from "../models/DBConnection.js";

export default function isCartItemOwner(req, res, next) {
    if(req.user.role == "admin") return next()

    // TODO: make a stored procedure to do all of these things with one DB call
    const cartItemId = Number(req.params.id);
    CartItems.getById(cartItemId) 
        .then(result => {
            if(result.length == 0) throw {
                code: "not_found", 
                msg: `No CartItem with id ${cartItemId} has found`
            }

            return DBConnection.query(
                "SELECT 1 from Carts WHERE id = ? AND user_id = ?", 
                [result[0].cart_id, req.user.id]
            )
        })
        .then(result => {
            if(result.length == 0) throw {
                code: "not_owner", 
                msg: `CartItem with id ${cartItemId} owned by other user`
            }

            return next();
        })
        .catch(err => next(err))
}