import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import connection from '../configs/db.js';

export const getProfile = (req, res) => {
    const userId = req.user.id;

    User.getById(userId, (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    });
};

export const updateProfile = (req, res) => {
    const userId = req.user.id;
    const { name, email, phone, image } = req.body;

    const updatedUser = { name, email, phone, image };

    User.updateById(userId, updatedUser, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Profile updated successfully' });
    });
};

export const updatePassword = (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    User.getById(userId, (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordMatch = bcrypt.compareSync(currentPassword, user.password);

        if (!passwordMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const sql = 'UPDATE users SET password = ? WHERE id_user = ?';

        connection.query(sql, [hashedPassword, userId], (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'Password updated successfully' });
        });
    });
};
