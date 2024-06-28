import connection from "./DBConnection.js";

const TABLE_NAME = "OrderItems";
const VARIANT_TABLE = "Variants";
const PRODUCT_TABLE = "Products";

export default {
    getAll: async function(orderId) {
        const sql = [
            `SELECT`, [
                `${TABLE_NAME}.*`,
                `${PRODUCT_TABLE}.id AS product_id`,
                `${PRODUCT_TABLE}.name AS product_name`,
                `${PRODUCT_TABLE}.price AS product_unit_price`,
                `${VARIANT_TABLE}.id AS variant_id`,
                `${VARIANT_TABLE}.name AS variant_name`,
                `${TABLE_NAME}.count AS orderItem_count`,
                `${TABLE_NAME}.rent_duration AS orderItem_rent_duration`,
                `${TABLE_NAME}.subtotal AS orderItem_subtotal`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${VARIANT_TABLE} ON ${TABLE_NAME}.variant_id = ${VARIANT_TABLE}.id`,
            `JOIN ${PRODUCT_TABLE} ON ${VARIANT_TABLE}.product_id = ${PRODUCT_TABLE}.id`,
            `WHERE ${TABLE_NAME}.order_id = ?`
        ].join(" ");
        const params = [orderId];
        return await connection.query(sql, params);
    },

    getById: async function(orderId, id) {
        const sql = [
            `SELECT`, [
                `${TABLE_NAME}.*`,
                `${PRODUCT_TABLE}.id AS product_id`,
                `${PRODUCT_TABLE}.name AS product_name`,
                `${PRODUCT_TABLE}.price AS product_unit_price`,
                `${VARIANT_TABLE}.id AS variant_id`,
                `${VARIANT_TABLE}.name AS variant_name`,
                `${TABLE_NAME}.count AS orderItem_count`,
                `${TABLE_NAME}.rent_duration AS orderItem_rent_duration`,
                `${TABLE_NAME}.subtotal AS orderItem_subtotal`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${VARIANT_TABLE} ON ${TABLE_NAME}.variant_id = ${VARIANT_TABLE}.id`,
            `JOIN ${PRODUCT_TABLE} ON ${VARIANT_TABLE}.product_id = ${PRODUCT_TABLE}.id`,
            `WHERE ${TABLE_NAME}.order_id = ? AND ${TABLE_NAME}.id = ?`
        ].join(" ");
        const params = [orderId, id];
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
}
