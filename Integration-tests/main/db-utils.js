async function getUserRecordFromDatabase(client, login) {
    const result = await client.select('*')
        .from('Users')
        .where('Login', login);
    return result[0];
}

async function setUserRecordToDatabase(client, userRecord){
    await client.insert(userRecord)
        .into('Users');
}

module.exports = {
    getUserRecordFromDatabase,
    setUserRecordToDatabase
};

