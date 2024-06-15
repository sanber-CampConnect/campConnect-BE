import connection from "./DBConnection.js";

const TABLE_NAME = "Carts";

export default {
    getAll: async function(index = 0) {
        const sql = `SELECT * FROM ${TABLE_NAME}`; // LIMIT ${index*50},${(index+1)*50}
        return await connection.query(sql);
    },

    getById: async function(id) {
        const sql = `SELECT * FROM ${TABLE_NAME} WHERE id = ?`;
        const params = [id];
        return await connection.query(sql, params);
    },
    
    store: async function(data) {
        const sql = `INSERT INTO ${TABLE_NAME}(??) VALUES (?)`;
        return await connection.query(sql, data);
    },

    updateById: async function(id, data) {
        const sql = `UPDATE ${TABLE_NAME} SET ? WHERE id = ?`;
        const params = [data, id];
        return await connection.query(sql, params);
    },

    deleteById: async function(id) {
        const sql = `DELETE FROM ${TABLE_NAME} WHERE id = ?`;
        const params = [id];
        return await connection.query(sql, params);
    },
}
