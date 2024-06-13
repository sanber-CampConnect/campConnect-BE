import Users from "../models/Users.js"

export default function isVerifiedAccount(req, res, next) {
    if(req.user.role == "admin") next()

    // TODO: make a stored procedure to do all of these things with one DB call
    Users.getById(req.user.id) 
        .then(result => {
            if(result.length == 0) throw {
                code: "not_found", 
                msg: `No user with id ${req.user.id} has found`
            }

            if(result[0].is_verified == 0) throw {
                code: "not_verified",
                msg: "Check your email for verification link or request one if you don't receive one or it's already expired"
            }

            next()
        })
        .catch(err => next(err))
}