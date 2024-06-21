import connection from "./DBConnection.js";

const TABLE_NAME = "Users";
const CART_TABLE = "Carts"

export default {
    getAll: async function(index = 0) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${CART_TABLE}.id AS cart_id`,
            ].join(", ")
            `FROM ${TABLE_NAME}`,
            `JOIN ${CART_TABLE} ON ${TABLE_NAME}.id = ${CART_TABLE}.user_id`
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        return await connection.query(sql)
    },
    
    store: async function(data) {
        const placeholder = data.map(_ => "?").join(", ")
        const sql = `CALL User_add(${placeholder}, @newUserId, @newCartId)`;
        return await connection.query(sql, data);
    },

    getById: async function(id) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${CART_TABLE}.id AS cart_id`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${CART_TABLE} ON ${TABLE_NAME}.id = ${CART_TABLE}.user_id`
            `WHERE id = ?`,
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        const params = [id];
        return await connection.query(sql, params);
    },

    updateById: async (id, data) => {
        console.log(data)
        const sql = (
            `UPDATE ${TABLE_NAME} SET ? `
            + `WHERE id = ? `
        );
        const params = [data, id]
        return await connection.query(sql, params);
    },

    deleteById: async function(id) {
        const sql = (
            `DELETE FROM ${TABLE_NAME} `
            + `WHERE id = ?`
        );
        //`CALL User_delete(${id})`
        const params = [id];
        return await connection.query(sql, params);
    },


    // ::::::::::::::::::::::::: NON BOILERPLATE CRUD OPERATIONS :::::::::::::::::::::::::
    getByEmail: async function(email) {
        const sql = [
            `SELECT`,
            [
                `${TABLE_NAME}.*`,
                `${CART_TABLE}.id AS cart_id`,
            ].join(", "),
            `FROM ${TABLE_NAME}`,
            `JOIN ${CART_TABLE} ON ${TABLE_NAME}.id = ${CART_TABLE}.user_id`,
            `WHERE email = ?`,
        ].join(" "); // LIMIT ${index*50},${(index+1)*50}
        const params = [email];
        return await connection.query(sql, params);
    },
}