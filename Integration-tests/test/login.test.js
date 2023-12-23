const axios = require("axios");
const {setUserAuthToDatabase, setUserRecordToDatabase, getUserAuthFromDatabase} = require("../main/db-utils");
const {createDbClient} = require("../main/db-client");
const {checkPasswordHash, generatePasswordHash} = require("../main/bcryptjs");
const {getRandomInt} = require("../main/utils");
const uuid = require('uuid');
const options = {
    validateStatus: function (status) {
        return status < 500; // Разрешить, если код состояния меньше 500
    }

};

test('Авторизация: проверка валидной комбинации login/password', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    const userRecord = {
        UserId: uuid.v4(),
        Name: "Max",
        Login: `login${getRandomInt()}@email.com`,
        PasswordHash: passwordHash ,
        Role: "renter"
    };
    await setUserRecordToDatabase(client, userRecord);
    const userAuth = {
        login: userRecord.Login,
        password: password
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(200);
    const userToken = await getUserAuthFromDatabase(client, userAuth.login);
    expect(response.data.accessToken).toBeDefined();
    await client.destroy();
});

test('Авторизация: проверка accessToken на соответствие формату uuid', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    const userRecord = {
        UserId: uuid.v4(),
        Name: "Max",
        Login: `login${getRandomInt()}@email.com`,
        PasswordHash: passwordHash ,
        Role: "renter"
    };
    await setUserRecordToDatabase(client, userRecord);
    const userAuth = {
        login: userRecord.Login,
        password: password
    };
    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    const userToken = await getUserAuthFromDatabase(client, userAuth.login);
    expect(response.data.accessToken).toBe(userToken.Token);
    expect(userToken.Token).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i);
    await client.destroy();
});

test('Авторизация: проверка времени жизни токена', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    let timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() + 15);
    const userRecord = {
        UserId: uuid.v4(),
        Name: "Max",
        Login: `login${getRandomInt()}@email.com`,
        PasswordHash: passwordHash,
        Role: "renter"
    };
    await setUserRecordToDatabase(client, userRecord);
    const userAuth = {
        login: userRecord.Login,
        password: password
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    const userToken = await getUserAuthFromDatabase(client, userAuth.login);
    expect(userToken.ExpirationDateTime).toBe(timeNow);
    await client.destroy();
});

test('Авторизация: попытка входа с несуществующим логином', async () => {
    const client = createDbClient();
    const userAuth = {
        login: "non_existent@email.ru",
        password: "Qwerty123!"
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidCredentials");
    await client.destroy();
});

test('Авторизация: попытка входа с несуществующим паролем для валидного логина', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    const userRecord = {
        UserId: uuid.v4(),
        Name: "Max",
        Login: `login${getRandomInt()}@email.com`,
        PasswordHash: passwordHash,
        Role: "renter"
    };
    await setUserRecordToDatabase(client, userRecord);
    const userAuth = {
        login: userRecord.Login,
        password: "Password123!"
    };


    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidCredentials");
    await client.destroy();
});

test('Авторизация: попытка входа с пустым полем логин', async () => {
    const client = createDbClient();
    const userAuth = {
        login: "",
        password: "Qwerty123!"
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    await client.destroy();
});

test('Авторизация: попытка входа с пустым полем пароль', async () => {
    const client = createDbClient();
    const userAuth = {
        login: "login@email.com",
        password: ""
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    await client.destroy();
});

test('Авторизация: попытка входа с пробелом в качестве логина', async () => {
    const client = createDbClient();
    const userAuth = {
        login: " ",
        password: "Qwerty123!"
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    await client.destroy();
});

test('Авторизация: попытка входа с пробелом в качестве пароля', async () => {
    const client = createDbClient();
    const userAuth = {
        login: "login@email.com",
        password: " "
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    await client.destroy();
});

test('Авторизация: проверка повторной авторизации', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    let timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() + 15);
    const userRecord = {
        UserId: uuid.v4(),
        Name: "Max",
        Login: `login${getRandomInt()}@email.com`,
        PasswordHash: passwordHash ,
        Role: "renter"
    };
    await setUserRecordToDatabase(client, userRecord);

    const userToken ={
        UserId: userRecord.UserId,
        Token: uuid.v4(),
        ExpirationDateTime: timeNow
    }
    await setUserAuthToDatabase(client, userToken);
    const userAuth = {
        login: userRecord.Login,
        password: password
    };

    const response = await axios.post('http://localhost:8080/api/v1/login', userAuth, options);
    expect(response.status).toBe(200);
    expect(userToken.ExpirationDateTime).toBe(timeNow);
    await client.destroy();
});
