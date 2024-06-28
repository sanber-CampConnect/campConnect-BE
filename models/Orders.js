import connection from "./DBConnection.js";

const TABLE_NAME = "Orders";
const VARIANT_TABLE = "Variants";
const TRANSACTION_TABLE = "Transactions";
const ORDERITEM_TABLE = "OrderItems";
const PRODUCT_TABLE = "Products";
const RENT_TABLE = "Rents"

export default {
    getAll: async function(index = 0) {
        const sql = [
            `SELECT`, [
                `${TABLE_NAME}.*`,
                `${TRANSACTION_TABLE}.id as transaction_id`,
                `${TRANSACTION_TABLE}.invoice_number as transaction_invoice_number`,
                `${TRANSACTION_TABLE}.evidence_image as transaction_evidence_image`,
                `${TRANSACTION_TABLE}.method as transaction_method`,
                `${TRANSACTION_TABLE}.status AS transaction_status`,
                `${TRANSACTION_TABLE}.note AS transaction_note`,
                `${TRANSACTION_TABLE}.total_items as transaction_item_count`,
                `${TRANSACTION_TABLE}.total_price as transaction_total_price`
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${TRANSACTION_TABLE} ON ${TABLE_NAME}.id = ${TRANSACTION_TABLE}.order_id`
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        return await connection.query(sql)
    },
    
    store: async function(data) {
        const placeholder = data.map(_ => "?").join(", ")
        const sql = `CALL Order_add(${placeholder}, @newUserId)`;
        return await connection.query(sql, data);
    },

    getById: async function(id) {
        const sql = [
            `SELECT`, [
                `${TABLE_NAME}.*`,
                `${TRANSACTION_TABLE}.id AS transaction_id`,
                `${TRANSACTION_TABLE}.invoice_number AS transaction_invoice_number`,
                `${TRANSACTION_TABLE}.evidence_image AS transaction_evidence_image`,
                `${TRANSACTION_TABLE}.method AS transaction_method`,
                `${TRANSACTION_TABLE}.status AS transaction_status`,
                `${TRANSACTION_TABLE}.note AS transaction_note`,
                `${TRANSACTION_TABLE}.total_items AS transaction_item_count`,
                `${TRANSACTION_TABLE}.total_price AS transaction_total_price`
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${TRANSACTION_TABLE} ON ${TABLE_NAME}.id = ${TRANSACTION_TABLE}.order_id`,
            `WHERE ${TABLE_NAME}.id = ?`
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        const params = [id];
        return await connection.query(sql, params);
    },

    updateById: async (id, data) => {
        const sql = [
            `UPDATE ${TABLE_NAME} SET ?`,
            ", last_update = NOW()",
            "WHERE id = ? "
        ].join(" ");
        const params = [data, id]
        return await connection.query(sql, params);
    },

    deleteById: async function(id) {
        const sql = `CALL Order_delete(?)`;
        const params = [id];
        return await connection.query(sql, params);
    },

    orderItems: async function(order_id) {
        const sql = [
            `SELECT`, [
                `${PRODUCT_TABLE}.id AS product_id`,
                `${PRODUCT_TABLE}.name AS product_name`,
                `${PRODUCT_TABLE}.price AS product_unit_price`,
                `${VARIANT_TABLE}.id AS variant_id`,
                `${VARIANT_TABLE}.name AS variant_name`,
                `${ORDERITEM_TABLE}.count AS orderItem_count`,
                `${ORDERITEM_TABLE}.rent_duration AS orderItem_rent_duration`,
                `${ORDERITEM_TABLE}.subtotal AS orderItem_subtotal`,
                `${RENT_TABLE}.rent_start AS rent_start`,
                `${RENT_TABLE}.rent_due AS rent_due`,
                `${RENT_TABLE}.return_date AS rent_return_date`,
            ].join(", "),
            `FROM ${ORDERITEM_TABLE} `,
            `JOIN ${VARIANT_TABLE} ON ${ORDERITEM_TABLE}.variant_id = ${VARIANT_TABLE}.id`,
            `JOIN ${PRODUCT_TABLE} ON ${VARIANT_TABLE}.product_id = ${PRODUCT_TABLE}.id`,
            `JOIN ${TABLE_NAME} ON ${ORDERITEM_TABLE}.order_id = ${TABLE_NAME}.id`,
            `LEFT JOIN ${RENT_TABLE} ON ${RENT_TABLE}.orderItem_id = ${ORDERITEM_TABLE}.id`,
            `WHERE ${ORDERITEM_TABLE}.order_id = ?`
        ].join(" ");
        const params = [order_id];
        return await connection.query(sql, params);
    },

    byUserId: async function(userId) {
        const sql = [
            `SELECT`, [
                `${TABLE_NAME}.*`,
                `${TRANSACTION_TABLE}.id AS transaction_id`,
                `${TRANSACTION_TABLE}.invoice_number AS transaction_invoice_number`,
                `${TRANSACTION_TABLE}.evidence_image AS transaction_evidence_image`,
                `${TRANSACTION_TABLE}.method AS transaction_method`,
                `${TRANSACTION_TABLE}.status AS transaction_status`,
                `${TRANSACTION_TABLE}.note AS transaction_note`,
                `${TRANSACTION_TABLE}.total_items AS transaction_item_count`,
                `${TRANSACTION_TABLE}.total_price AS transaction_total_price`
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${TRANSACTION_TABLE} ON ${TABLE_NAME}.id = ${TRANSACTION_TABLE}.order_id`,
            `WHERE ${TABLE_NAME}.user_id = ?`
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        const params = [userId];
        return await connection.query(sql, params);
    }
}