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

async function getUserAuthFromDatabase(client, login) {
    const result = await client.select('Tokens.UserId','Tokens.Token', 'Tokens.ExpirationDateTime' )
        .from('Tokens')
        .join('Users', 'Users.UserId', '=', 'Tokens.UserId')
        .where('Login', login);
    return result[0];
}

async function setUserAuthToDatabase(client, userToken){
    await client.insert(userToken)
        .into('Tokens');
}


module.exports = {
    getUserRecordFromDatabase,
    setUserRecordToDatabase,
    getUserAuthFromDatabase,
    setUserAuthToDatabase
};

