import connection from "./DBConnection.js";

const TABLE_NAME = "Rents";
const ORDERITEM_TABLE = "OrderItems";
const VARIANT_TABLE = "Variants";

export default {
    getAll: async function() {
        const sql = `SELECT * FROM ${TABLE_NAME}`;
        return await connection.query(sql);
    },

    getById: async function(id) {
        const sql = `SELECT * FROM ${TABLE_NAME} WHERE id = ?`;
        const params = [id];
        return await connection.query(sql, params);
    },

    getByOrderItemId: async function(orderItemId) {
        const sql = `SELECT * FROM ${TABLE_NAME} WHERE orderItem_id = ?`;
        const params = [orderItemId];
        return await connection.query(sql, params);
    },

    store: async function(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const sql = `INSERT INTO ${TABLE_NAME} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
        return await connection.query(sql, values);
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

    checkAvailability: async function(orderItemId, rent_start, rent_due) {
        const sql = `SELECT * FROM ${TABLE_NAME} WHERE orderItem_id = ? AND (rent_start < ? AND rent_due > ?)`;
        const params = [orderItemId, rent_due, rent_start];
        return await connection.query(sql, params);
    },

    reduceStock: async function(variant_id, count) {
        const sql = `UPDATE ${VARIANT_TABLE} SET stock = stock - ? WHERE id = ? AND stock >= ?`;
        const params = [count, variant_id, count];
        return await connection.query(sql, params);
    },

    restoreStock: async function(variant_id, count) {
        const sql = `UPDATE ${VARIANT_TABLE} SET stock = stock + ? WHERE id = ?`;
        const params = [count, variant_id];
        return await connection.query(sql, params);
    }
};
