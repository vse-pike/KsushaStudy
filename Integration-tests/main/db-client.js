const {knex} = require("knex");
const {dbHost} = require("./config");
function createDbClient(){
    const dbConfig = {
        client: "pg",
        connection:{
            host: dbHost,
            user: "postgres",
            password:"postgres",
            database: "sso-postgres",
            port: "5432"
        }

    }
    const dbClient = knex(dbConfig);
    afterAll(async()=> {
        await dbClient.destroy();
    });
    return dbClient;
}

module.exports={
    createDbClient
}