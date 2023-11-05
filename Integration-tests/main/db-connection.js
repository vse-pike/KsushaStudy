const {Client} = require('pg');
function getClient() {
    return new Client(
        {
            host: "localhost",
            user: "postgres",
            password:"postgres",
            database: "sso-postgres",
            port: "5432"
        }
    );
}
async function connectToDatabase() {
   const client = getClient();
   await client.connect();
   return client;
}

async function disconnectFromDatabase(client) {
    await client.end();
}

module.exports={
    getClient,
    connectToDatabase,
    disconnectFromDatabase
};