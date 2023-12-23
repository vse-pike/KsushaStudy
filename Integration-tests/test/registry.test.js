const {getUserRecordFromDatabase, setUserRecordToDatabase} = require("../main/db-utils");
const {createDbClient} = require("../main/db-client");
const {checkPasswordHash, generatePasswordHash} = require("../main/bcryptjs");
const {getRandomInt} = require("../main/utils");
const uuid = require('uuid');
const {Api} = require("../main/api/apiMethods");
const path = "/api/v1/registry";

test('Регистрация: проверка валидного запроса с role = client', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(200);
    const userRecord = await getUserRecordFromDatabase(client, userData.login);
    expect(userRecord.Login).toBe(userData.login);
    expect(userRecord.Name).toBe(userData.name);
    expect(userRecord.Role).toBe(userData.role);
    const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
    expect(result).toBe(true);

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
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(200);
    const userRecord = await getUserRecordFromDatabase(client, userData.login);
    expect(userRecord.Login).toBe(userData.login);
    expect(userRecord.Name).toBe(userData.name);
    expect(userRecord.Role).toBe(userData.role);
    const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
    expect(result).toBe(true);

});

test('Регистрация: попытка создания пользователя с существующим логином', async () => {
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
    const userData =
        {
            login: userRecord.Login,
            password: password,
            name: userRecord.Name,
            role: userRecord.Role
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(409);
    expect(response.data[0].code).toBe("UserAlreadyExist");

});

test('Регистрация: попытка создания пользователя c невалидным логином без @', async () => {
    const client = createDbClient();
    const invalidLogin = `login${getRandomInt()}email.ru`;
    const userData =
        {
            login: invalidLogin,
            password: "Qwerty123!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidEmailFormat");

});

test('Регистрация: попытка создания пользователя c невалидным логином без доменной зоны', async () => {
    const client = createDbClient();
    const invalidLogin = `login${getRandomInt()}@email.`;
    const userData =
        {
            login: invalidLogin,
            password: "Qwerty123!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidEmailFormat");

});

test('Регистрация: попытка создания пользователя c невалидным логином без . в доменной части', async () => {
    const client = createDbClient();
    const invalidLogin = `login${getRandomInt()}emailru`;
    const userData =
        {
            login: invalidLogin,
            password: "Qwerty123!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidEmailFormat");

});

test('Регистрация: попытка создания пользователя c невалидным логином без доменной части', async () => {
    const client = createDbClient();
    const invalidLogin = `login${getRandomInt()}@`;
    const userData =
        {
            login: invalidLogin,
            password: "Qwerty123!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidEmailFormat");

});

test('Регистрация: попытка создания пользователя c невалидным логином без имени пользователя', async () => {
    const client = createDbClient();
    const invalidLogin = `@email.ru`;
    const userData =
        {
            login: invalidLogin,
            password: "Qwerty123!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidEmailFormat");

});

test('Регистрация: попытка создания пользователя c паролем менее 8 символов', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qw1!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("PasswordTooShort");

});

test('Регистрация: попытка создания пользователя c паролем не содержащим заглавную букву', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "qwerty123!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("PasswordMissingUppercase");

});

test('Регистрация: попытка создания пользователя c паролем не содержащим спецсимвол', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("PasswordMissingSpecialCharacter");

});

test('Регистрация: попытка создания пользователя c паролем содержащим в качестве спецсимвола "?"', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123?",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("PasswordMissingSpecialCharacter");

});

test('Регистрация: попытка создания пользователя c паролем на кириллице', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Пароль123!",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("PasswordMissingSpecialCharacter");

});

test('Регистрация: попытка создания пользователя c паролем не содержащим не одной цифры', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty!@",
            name: "Max",
            role: "renter"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("PasswordMissingDigit");

});

test('Регистрация: попытка создания пользователя c ролью не client и не renter', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!@",
            name: "Max",
            role: "seller"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidRole");

});

test('Регистрация: попытка создания пользователя с пустым полем login', async () => {
    const client = createDbClient();
    const userData =
        {
            login: '',
            password: "Qwerty123!@",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя с пустым полем password', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя с пустым полем name', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123@",
            name: "",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя с пустым полем role', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123@",
            name: "Ivan",
            role: ""
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя только с пробелом в login', async () => {
    const client = createDbClient();
    const userData =
        {
            login: ' ',
            password: "Qwerty123!@",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя только с пробелом в password', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: " ",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя только с пробелом в name', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123@",
            name: " ",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя только с пробелом в role', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123@",
            name: "Ivan",
            role: " "
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");

});

test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле login', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `loginloginloginloginloginloginloginloginlogin${getRandomInt()}@email.com`,
            password: "Qwerty123!@",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("EmailIsTooLong");

});

test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле password', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!@Qwerty123!@Qwerty123!@Qwerty123!@Qwerty!",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("PasswordIsTooLong");

});

test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле name', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!@",
            name: "MaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMax",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("NameIsTooLong");

});

test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле role', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!@",
            name: "Max",
            role: "clientclientclientclientclientclientclientclientttt"
        };
    const response = await Api.postRequest(path, userData);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidRole");

});


test('Регистрация: проверка валидного запроса с 50 символами в поле login', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `loginloginloginloginloginloginloginlog${getRandomInt()}@email.com`,
            password: "Qwerty123!",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);

    expect(response.status).toBe(200);
    const userRecord = await getUserRecordFromDatabase(client, userData.login);
    expect(userRecord.Login).toBe(userData.login);
    expect(userRecord.Name).toBe(userData.name);
    expect(userRecord.Role).toBe(userData.role);
    const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
    expect(result).toBe(true);

});

test('Регистрация: проверка валидного запроса с 50 символами в поле password', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!Qwerty123!Qwerty123!Qwerty123!Qwerty123!",
            name: "Max",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);

    expect(response.status).toBe(200);
    const userRecord = await getUserRecordFromDatabase(client, userData.login);
    expect(userRecord.Login).toBe(userData.login);
    expect(userRecord.Name).toBe(userData.name);
    expect(userRecord.Role).toBe(userData.role);
    const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
    expect(result).toBe(true);

});

test('Регистрация: проверка валидного запроса с 50 символами в поле name', async () => {
    const client = createDbClient();
    const userData =
        {
            login: `login${getRandomInt()}@email.com`,
            password: "Qwerty123!",
            name: "MaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxxx",
            role: "client"
        };
    const response = await Api.postRequest(path, userData);

    expect(response.status).toBe(200);
    const userRecord = await getUserRecordFromDatabase(client, userData.login);
    expect(userRecord.Login).toBe(userData.login);
    expect(userRecord.Name).toBe(userData.name);
    expect(userRecord.Role).toBe(userData.role);
    const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
    expect(result).toBe(true);

});


