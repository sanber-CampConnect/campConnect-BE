import CartItems from "../models/CartItems.js"

export default function isCartOwner(req, res, next) {
    if(req.user.role == "admin") next()

    const cartItemId = req.params.id;
    CartItems.getById(req.user.id)
        .then(result => {
            if(result.length == 0) throw {code: "not_found", msg: `No CartItem with id ${cartItemId} has found`}
            if(result[0].id != cartItemId) throw {code: "not_owner", msg: `CartItem with id ${cartItemId} belongs to other user`}
            next();
        })
        .catch(err => next(err))
}