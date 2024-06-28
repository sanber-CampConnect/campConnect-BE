import connection from "./DBConnection.js";

const TABLE_NAME = "Carts";
const CART_ITEMS_TABLE = "CartItems";
const VARIANT_TABLE = "Variants";
const PRODUCT_TABLE = "Products";

export default {
    getAll: async function(index = 0) {
        const sql = `SELECT * FROM ${TABLE_NAME}`; 
        return await connection.query(sql);
    },

    getById: async function(id) {
        const sql = `SELECT * FROM ${TABLE_NAME} WHERE id = ?`;
        const params = [id];
        return await connection.query(sql, params);
    },
    
    getCartItems: async function(cartId) {
        const sql = [
            `SELECT`,
            [
                `${CART_ITEMS_TABLE}.*`,
                `${PRODUCT_TABLE}.id AS product_id`,
                `${PRODUCT_TABLE}.name AS product_name`,
                `${PRODUCT_TABLE}.price AS product_price`,
                `${PRODUCT_TABLE}.image AS product_image`,
                `${VARIANT_TABLE}.id AS variant_id`,
                `${VARIANT_TABLE}.name AS variant_name`,
                `${VARIANT_TABLE}.stock AS variant_stock`,
            ].join(", "),
            `FROM ${CART_ITEMS_TABLE}`,
            `JOIN ${VARIANT_TABLE} ON ${CART_ITEMS_TABLE}.variant_id = ${VARIANT_TABLE}.id`,
            `JOIN ${PRODUCT_TABLE} ON ${VARIANT_TABLE}.product_id = ${PRODUCT_TABLE}.id`,
            `WHERE ${CART_ITEMS_TABLE}.cart_id = ?`
        ].join(" ");
        const params = [cartId];
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
