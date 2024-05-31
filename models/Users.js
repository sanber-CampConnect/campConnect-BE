import connection from "./DBConnection.js";

const TABLE_NAME = "Users";

export default {
    getAll: async function() {
        const sql = "SELECT SLEEP(4)"
        return await connection.query(sql)
    },

}