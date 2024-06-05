import model from  '../models/Users.js';
import bcrypt from 'bcryptjs';
import connection from '../models/DBConnection.js';

export const getProfile = (req, res, next) => {
    const userId = req.user.id;

    model.getById(userId)
        .then(result => {
            if (result.length == 0) return next({code: "not_found", msg: "User not found"})
            return res.send({ data: result });
        })
        .catch(err => next(err))
};

export const updateProfile = (req, res, next) => {
    const FILLABLES = ["name", "email", "phone", "image"];
    const updatedUser = {};
    Object.keys(req.body).forEach((key) => { // filter
        if(FILLABLES.includes(key)) {
            updatedUser[key] = req.body[key]
        }
    })

    if(Object.keys(updatedUser).length == 0) {
        return next({code: "bad_request", msg: "No processable data being supplied to server"})
    }

    const userId = Number(req.user.id);
    model.updateById(userId, updatedUser)
        .then(result => {
            if(result.affectedRows === 0) return next({code: "not_found", msg: 'User not found'});
            return res.send({ msg: 'Profile updated successfully' });
        })
        .catch(err => next(err));
};

export const updatePassword = (req, res, next) => {
    const invalidRequest = (
        req.body.currentPassword == undefined 
        || req.body.newPassword == undefined
    );

    if(invalidRequest) return next({code: "bad_request", msg: "Need both current password and new password data"})

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    model.getById(userId)
        .then(result => {
            if (result.length == 0) return next({code: "not_found", msg: "User not found"})

            result = result[0]
            const passwordMatch = bcrypt.compareSync(currentPassword, result.password);
            if (!passwordMatch) return res.status(400).json({ message: 'Current password is incorrect' });

            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            const sql = 'UPDATE Users SET password = ? WHERE id = ?';
            connection.query(sql, [hashedPassword, userId])
                .then(result => res.send({ message: 'Password updated successfully' }) )
                .catch(err => next(err))
        })
        .catch(err => next(err))
};
