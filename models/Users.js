import connection from "./DBConnection.js";

const TABLE_NAME = "Users";

export default {
    getAll: async function(index = 0) {
        const sql = `SELECT * FROM ${TABLE_NAME}`; // LIMIT ${index*50},${(index+1)*50}
        return await connection.query(sql)
    },
    
    store: function() {},

    getById: async function(id) {
        const sql = (
            `SELECT * `
                + `FROM ${TABLE_NAME} `
                + `WHERE id = ?`
        );
        const params = [id];
        return await connection.query(sql, params);
        // , (err, results) => {
            // if (err) return callback(err);
            // callback(null, results[0]);
        // });
    },

    updateById: async (id, user) => {
        const sql = (
            `UPDATE ${TABLE_NAME} SET ? `
            + `WHERE id = ? `
        );
        const params = [user, id]
        return await connection.query(sql, params);
            // , (err, results) => {
            // if (err) return callback(err);
            // callback(null, results);
        // });
    },

    deleteById: function() {}
}