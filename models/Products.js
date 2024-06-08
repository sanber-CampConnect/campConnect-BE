import connection from "./DBConnection.js";

const TABLE_NAME = "Products";
const PRODUCT_CATEGORY = "Categories";
const PRODUCT_VARIANTS = "Variants";

export default {
    getAll: async function(pageSize, offset) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${PRODUCT_CATEGORY}.id AS category_id`,
                `${PRODUCT_CATEGORY}.name AS category_name`,
                // `${PRODUCT_VARIANTS}.id AS variant_id`,
                // `${PRODUCT_VARIANTS}.name AS variant_name`,
                // `${PRODUCT_VARIANTS}.stock AS variant_stock`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${PRODUCT_CATEGORY} ON ${TABLE_NAME}.category_id = ${PRODUCT_CATEGORY}.id`,
            // `JOIN ${PRODUCT_VARIANTS} ON ${PRODUCT_VARIANTS}.product_id = ${TABLE_NAME}.id`,
            `LIMIT ${pageSize} OFFSET ${offset*pageSize}`
        ].join(" ");
        return await connection.query(sql)
    },

    getAllFiltered: async function(filters, pageSize, offset) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${PRODUCT_CATEGORY}.id AS category_id`,
                `${PRODUCT_CATEGORY}.name AS category_name`,
                // `${PRODUCT_VARIANTS}.id AS variant_id`,
                // `${PRODUCT_VARIANTS}.name AS variant_name`,
                // `${PRODUCT_VARIANTS}.stock AS variant_stock`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${PRODUCT_CATEGORY} ON ${TABLE_NAME}.category_id = ${PRODUCT_CATEGORY}.id`,
            // `JOIN ${PRODUCT_VARIANTS} ON ${PRODUCT_VARIANTS}.product_id = ${TABLE_NAME}.id`,
            `WHERE ?`,
            `LIMIT ${pageSize} OFFSET ${offset*pageSize}`
        ].join(" ");
        return await connection.query(sql, filters)
    },
    
    store: async function(data) {
        const sql = `INSERT INTO ${TABLE_NAME}(??) VALUES (?)`;
        return await connection.query(sql, data);
    },

    getById: async function(id) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${PRODUCT_CATEGORY}.id AS category_id`,
                `${PRODUCT_CATEGORY}.name AS category_name`,
                // `${PRODUCT_VARIANTS}.id AS variant_id`,
                // `${PRODUCT_VARIANTS}.name AS variant_name`,
                // `${PRODUCT_VARIANTS}.stock AS variant_stock`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${PRODUCT_CATEGORY} ON ${TABLE_NAME}.category_id = ${PRODUCT_CATEGORY}.id`,
            // `JOIN ${PRODUCT_VARIANTS} ON ${PRODUCT_VARIANTS}.product_id = ${TABLE_NAME}.id`,
            `WHERE ${TABLE_NAME}.id = ?`
        ].join(" ");
        const params = [id];
        return await connection.query(sql, params);
    },

    updateById: async (id, data) => {
        const sql = (
            `UPDATE ${TABLE_NAME} SET ? `
            + `WHERE id = ? `
        );
        const params = [data, id]
        return await connection.query(sql, params);
    },

    deleteById: async function(id) {
        const sql = `CALL Product_delete(?)`;
        const params = [id];
        return await connection.query(sql, params);
    },
}