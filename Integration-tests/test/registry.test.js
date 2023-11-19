const axios = require("axios");
const {getUserRecordFromDatabase, setUserRecordToDatabase} = require("../main/db-utils");
const {createDbClient} = require("../main/db-client");
const {checkPasswordHash, generatePasswordHash} = require("../main/bcryptjs");
const {getRandomInt} = require("../main/utils");
const {uuid} = require('uuid');
const options = {
    validateStatus: function (status) {
        return status < 500; // Разрешить, если код состояния меньше 500
    }

};

test('Регистрация: проверка валидного запроса с role = client', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!",
            name: "Max",
            role: "client"
        };
    const response = await axios.post('http://localhost:8080/api/v1/registry', userData, options);
    expect(response.status).toBe(200);
    const userRecord = await getUserRecordFromDatabase(client, userData.login);
    expect(userRecord.Login).toBe(userData.login);
    expect(userRecord.Name).toBe(userData.name);
    expect(userRecord.Role).toBe(userData.role);
    const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
    expect(result).toBe(true);
    await client.destroy();
});

test('Регистрация: проверка валидного запроса с role = renter', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!",
            name: "Max",
            role: "renter"
        };
    const response = await axios.post('http://localhost:8080/api/v1/registry', userData, options);
    expect(response.status).toBe(200);
    const userRecord = await getUserRecordFromDatabase(client, userData.login);
    expect(userRecord.Login).toBe(userData.login);
    expect(userRecord.Name).toBe(userData.name);
    expect(userRecord.Role).toBe(userData.role);
    const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
    expect(result).toBe(true);
    await client.destroy();
});

test('Регистрация: попытка создания пользователя с существующим логином', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    const userRecord = {
        //UserId: uuid.v4(),
        UserId: "66ea354e-73d1-4359-aecd-0c93c3f933ef",
        Name: "Max",
        Login: `login${getRandomInt()}@email.com`,
        PasswordHash: passwordHash ,
        Role: "renter"
    };
    await setUserRecordToDatabase(client, userRecord);
    const userData =
        {
            login: userRecord.Login,
            password: password,
            name: userRecord.Name,
            role: userRecord.Role
        };
    const response = await axios.post('http://localhost:8080/api/v1/registry', userData, options);
    expect(response.status).toBe(409);
    expect(response.data[0].code).toBe("UserAlreadyExist");
    await client.destroy();
});

//Получаем статус 409 с кодом “User Already Exist”, при попытке создать пользователя с уже существующим login-ом, созданным ранее в БД

