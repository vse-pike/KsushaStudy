const axios = require("axios");
const {getClient, connectToDatabase} = require("../main/db-connection");
const {getUserRecordFromDatabase} = require("../main/db-utils");
const options = {
    validateStatus: function (status) {
        return status < 500; // Разрешить, если код состояния меньше 500
    }

};

test('Регистрация: проверка валидного запроса с role = client', async () => {
    const client= await connectToDatabase();
    const userData=
    {
        login: "login3@email.com",
        password: "Password@1",
        name: "Max",
        role: "client"
    };
    //const response =  await axios.post('http://localhost:8080/api/v1/registry', userData, options );

    //expect(response.status).toBe(200);

    const userRecord = await getUserRecordFromDatabase(client, userData.login);

});