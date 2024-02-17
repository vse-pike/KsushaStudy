const {getUserRecordFromDatabase, setUserRecordToDatabase} = require("../main/db-utils");
const {createDbClient} = require("../main/db-client");
const {checkPasswordHash, generatePasswordHash} = require("../main/bcryptjs");
const {getRandomInt} = require("../main/utils");
const uuid = require('uuid');
const {Api} = require("../main/api/apiMethods");
const {UserDataBuilder, UserRecordBuilder} = require("../main/builder/builder");
const path = "/api/v1/registry";

describe('Тесты регистрации', () => {
    let client;
    beforeAll(() => {
        client = createDbClient();
    });

    test('Регистрация: проверка валидного запроса с role = client', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();

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

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("renter")
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

        const password = "Qwerty123!";
        const passwordHash = await generatePasswordHash(password);
        const userRecord = new UserRecordBuilder()
            .withUserId(uuid.v4())
            .withName("Max")
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPasswordHash(passwordHash)
            .withRole("renter")
            .build();

        await setUserRecordToDatabase(client, userRecord);
        const userData = new UserDataBuilder()
            .withLogin(userRecord.Login)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(409);
        expect(response.data[0].code).toBe("UserAlreadyExist");

    });

    test('Регистрация: попытка создания пользователя c невалидным логином без @', async () => {

        const invalidLogin = `login${getRandomInt()}email.ru`;
        const userData = new UserDataBuilder()
            .withLogin(invalidLogin)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("InvalidEmailFormat");

    });

    test('Регистрация: попытка создания пользователя c невалидным логином без доменной зоны', async () => {

        const invalidLogin = `login${getRandomInt()}@email.`;
        const userData = new UserDataBuilder()
            .withLogin(invalidLogin)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("InvalidEmailFormat");

    });

    test('Регистрация: попытка создания пользователя c невалидным логином без . в доменной части', async () => {

        const invalidLogin = `login${getRandomInt()}emailru`;
        const userData = new UserDataBuilder()
            .withLogin(invalidLogin)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("InvalidEmailFormat");

    });

    test('Регистрация: попытка создания пользователя c невалидным логином без доменной части', async () => {

        const invalidLogin = `login${getRandomInt()}@`;
        const userData = new UserDataBuilder()
            .withLogin(invalidLogin)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("InvalidEmailFormat");

    });

    test('Регистрация: попытка создания пользователя c невалидным логином без имени пользователя', async () => {

        const invalidLogin = `@email.ru`;
        const userData = new UserDataBuilder()
            .withLogin(invalidLogin)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("InvalidEmailFormat");

    });

    test('Регистрация: попытка создания пользователя c паролем менее 8 символов', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwe123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("PasswordTooShort");

    });

    test('Регистрация: попытка создания пользователя c паролем не содержащим заглавную букву', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("PasswordMissingUppercase");

    });

    test('Регистрация: попытка создания пользователя c паролем не содержащим спецсимвол', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty1234')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("PasswordMissingSpecialCharacter");

    });

    test('Регистрация: попытка создания пользователя c паролем содержащим в качестве спецсимвола "?"', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123?')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("PasswordMissingSpecialCharacter");

    });

    test.skip('Регистрация: попытка создания пользователя c паролем на кириллице', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Пароль123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("PasswordMissingSpecialCharacter");

    });

    test.skip('Регистрация: попытка создания пользователя c паролем не содержащим не одной цифры', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("PasswordMissingDigit");

    });

    test('Регистрация: попытка создания пользователя c ролью не client и не renter', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("seller")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("InvalidRole");

    });

    test('Регистрация: попытка создания пользователя с пустым полем login', async () => {

        const userData = new UserDataBuilder()
            .withLogin(``)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя с пустым полем password', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя с пустым полем name', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя с пустым полем role', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя только с пробелом в login', async () => {

        const userData = new UserDataBuilder()
            .withLogin(` `)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя только с пробелом в password', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword(' ')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя только с пробелом в name', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName(" ")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя только с пробелом в role', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole(" ")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data.code).toBe("ModelException");

    });

    test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле login', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`loginloginloginloginloginloginloginloginlogin${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("EmailIsTooLong");

    });

    test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле password', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!@Qwerty123!@Qwerty123!@Qwerty123!@Qwerty!')
            .withName("Max")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("PasswordIsTooLong");

    });

    test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле name', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("MaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMax")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("NameIsTooLong");

    });

    test('Регистрация: попытка создания пользователя с количеством символов больше 50 в поле role', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!@')
            .withName("Max")
            .withRole("clientclientclientclientclientclientclientclientttt")
            .build();
        const response = await Api.postRequest(path, userData);
        expect(response.status).toBe(400);
        expect(response.data[0].code).toBe("InvalidRole");

    });


    test('Регистрация: проверка валидного запроса с 50 символами в поле login', async () => {

        const userData = new UserDataBuilder()
            .withLogin(`loginloginloginloginloginloginloginlog${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
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

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!Qwerty123!Qwerty123!Qwerty123!Qwerty123!')
            .withName("Max")
            .withRole("client")
            .build();
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

        const userData = new UserDataBuilder()
            .withLogin(`login${getRandomInt()}@email.com`)
            .withPassword('Qwerty123!')
            .withName("MaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxMaxxx")
            .withRole("client")
            .build();
        const response = await Api.postRequest(path, userData);

        expect(response.status).toBe(200);
        const userRecord = await getUserRecordFromDatabase(client, userData.login);
        expect(userRecord.Login).toBe(userData.login);
        expect(userRecord.Name).toBe(userData.name);
        expect(userRecord.Role).toBe(userData.role);
        const result = await checkPasswordHash(userRecord.PasswordHash, userData.password);
        expect(result).toBe(true);

    });
});


