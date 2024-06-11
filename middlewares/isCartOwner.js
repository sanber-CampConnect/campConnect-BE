import DBConnection from "../models/DBConnection.js";

export default function isCartOwner(req, res, next) {
    if(req.user.role == "admin") next()

    const cart_id = req.body.cart_id || req.params.id;
    DBConnection.query("SELECT * FROM Carts WHERE user_id=?", [req.user.id])
        .then(result => {
            if(result.length == 0) throw {code: "not_found", msg: `No Cart with id ${cart_id} has found`}
            if(result[0].id != cart_id) throw {code: "not_owner", msg: `Cart with id ${cart_id} belongs to other user`}
            next();
        })
        .catch(err => next(err))
}