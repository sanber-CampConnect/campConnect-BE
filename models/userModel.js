import connection from '../configs/db.js';

const User = {
    getById: (id, callback) => {
        const sql = 'SELECT id_user, name, email, phone, role, image, is_verified FROM users WHERE id_user = ?';
        connection.query(sql, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    updateById: (id, user, callback) => {
        const sql = 'UPDATE users SET name = ?, email = ?, phone = ?, image = ? WHERE id_user = ?';
        connection.query(sql, [user.name, user.email, user.phone, user.image, id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

export default User;
