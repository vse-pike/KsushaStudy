const {knex} = require("knex");
function createDbClient(){
    const dbConfig = {
        client: "pg",
        connection:{
            host: "localhost",
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