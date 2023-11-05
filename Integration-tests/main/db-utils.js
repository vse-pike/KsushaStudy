async function getUserRecordFromDatabase(client, login) {
    const result = await client.select('*')
        .from('Users')
        .where('Login', login);
    console.log(result);
}

module.exports = {
    getUserRecordFromDatabase
};

