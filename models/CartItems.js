import connection from "./DBConnection.js";

const TABLE_NAME = "CartItems";
const PRODUCT_TABLE = "Products";
const VARIANT_TABLE = "Variants";

export default {
    getAll: async function(index = 0) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${PRODUCT_TABLE}.id AS product_id`,
                `${PRODUCT_TABLE}.name AS product_name`,
                `${PRODUCT_TABLE}.price AS product_price`,
                `${PRODUCT_TABLE}.image AS product_image`,
                `${VARIANT_TABLE}.id AS variant_id`,
                `${VARIANT_TABLE}.name AS variant_name`,
                `${VARIANT_TABLE}.stock AS variant_stock`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${VARIANT_TABLE} ON ${TABLE_NAME}.variant_id = ${VARIANT_TABLE}.id`,
            `JOIN ${PRODUCT_TABLE} ON ${VARIANT_TABLE}.product_id = ${PRODUCT_TABLE}.id`,
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        return await connection.query(sql)
    },

    getById: async function(id) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${PRODUCT_TABLE}.id AS product_id`,
                `${PRODUCT_TABLE}.name AS product_name`,
                `${PRODUCT_TABLE}.price AS product_price`,
                `${PRODUCT_TABLE}.image AS product_image`,
                `${VARIANT_TABLE}.id AS variant_id`,
                `${VARIANT_TABLE}.name AS variant_name`,
                `${VARIANT_TABLE}.stock AS variant_stock`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${VARIANT_TABLE} ON ${TABLE_NAME}.variant_id = ${VARIANT_TABLE}.id`,
            `JOIN ${PRODUCT_TABLE} ON ${VARIANT_TABLE}.product_id = ${PRODUCT_TABLE}.id`,
            `WHERE ${TABLE_NAME}.id = ?`,
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        const params = [id];
        return await connection.query(sql, params);
    },
    
    store: async function(data) {
        const sql = `INSERT INTO ${TABLE_NAME}(??) VALUES (?)`;
        return await connection.query(sql, data);
    },

    updateById: async (id, data) => {
        const sql = [
            `UPDATE ${TABLE_NAME}`,
            `SET ?`,
            `WHERE id = ?`
        ].join(" ");
        const params = [data, id]
        return await connection.query(sql, params);
    },

    deleteById: async function(id) {
        const sql = [
            `DELETE FROM ${TABLE_NAME}`,
            `WHERE id = ?`
        ].join(" ");
        const params = [id];
        return await connection.query(sql, params);
    },
}