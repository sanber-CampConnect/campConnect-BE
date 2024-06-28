import Carts from "../models/Carts.js"
import DBConnection from "../models/DBConnection.js";

export default function isCartOwner(req, res, next) {
    if(req.user.role == "admin") return next()

    const cart_id = req.body.cart_id || req.params.id;
    DBConnection.query("SELECT * FROM Carts WHERE id=?", [cart_id])
        .then(result => {
            if(result.length == 0) throw {
                code: "not_found", 
                msg: `No Cart with id ${cart_id} has found`
            }

            if(result[0].user_id != req.user.id) throw {
                code: "not_owner", 
                msg: `Cart with id ${cart_id} belongs to other user`
            }

            return next();
        })
        .catch(err => next(err))
}