import Orders from "../models/Orders.js";
import Transactions from "../models/Transactions.js";

export default function isOrderOwner(req, res, next) {
    if(req.user.role == "admin") return next()

    // TODO: Make a stored procedure for this
    const transaction_id = req.params.id;
    Transactions.getById(transaction_id)
        .then(result => {
            if(result.length == 0) throw {
                code: "not_found", 
                msg: `No Transaction with id ${transaction_id} has found`
            }
            return Orders.getById(result[0].order_id);
        })
        .then(result => {
            if(result.length == 0) throw {
                code: "not_found",
                msg: `Order associated with Tranasaction with id ${transaction_id} somehow could not be found`
            }

            if(result[0].user_id != req.user.id) throw {
                code: "not_owner", 
                msg: `Transaction with id ${transaction_id} belongs to other user`
            }

            return next();
        })
        .catch(err => next(err))
}