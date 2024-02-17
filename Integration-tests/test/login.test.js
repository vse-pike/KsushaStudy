const {setUserAuthToDatabase, setUserRecordToDatabase, getUserAuthFromDatabase} = require("../main/db-utils");
const {createDbClient} = require("../main/db-client");
const {checkPasswordHash, generatePasswordHash} = require("../main/bcryptjs");
const {getRandomInt} = require("../main/utils");
const uuid = require('uuid');
const {Api} = require("../main/api/apiMethods");
const {UserRecordBuilder, UserAuthBuilder, UserTokenBuilder} = require("../main/builder/builder");
const path = "/api/v1/login";

test('Авторизация: проверка валидной комбинации login/password', async () => {
    const client = createDbClient();
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
    const userAuth = new UserAuthBuilder()
        .withLogin(userRecord.Login)
        .withPassword(password)
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(200);
    const userToken = await getUserAuthFromDatabase(client, userAuth.login);
    expect(response.data.accessToken).toBeDefined();
    
});

test('Авторизация: проверка accessToken на соответствие формату uuid', async () => {
    const client = createDbClient();
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
    const userAuth = new UserAuthBuilder()
        .withLogin(userRecord.Login)
        .withPassword(password)
        .build();
    const response = await Api.postRequest(path, userAuth);
    const userToken = await getUserAuthFromDatabase(client, userAuth.login);
    expect(response.data.accessToken).toBe(userToken.Token);
    expect(userToken.Token).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i);
    
});

test.skip('Авторизация: проверка времени жизни токена', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    let timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() + 15);
    const userRecord = new UserRecordBuilder()
        .withUserId(uuid.v4())
        .withName("Max")
        .withLogin(`login${getRandomInt()}@email.com`)
        .withPasswordHash(passwordHash)
        .withRole("renter")
        .build();
    await setUserRecordToDatabase(client, userRecord);
    const userAuth = new UserAuthBuilder()
        .withLogin(userRecord.Login)
        .withPassword(password)
        .build();

    const response = await Api.postRequest(path, userAuth);
    const userToken = await getUserAuthFromDatabase(client, userAuth.login);
    expect(userToken.ExpirationDateTime).toBe(timeNow);
    
});

test('Авторизация: попытка входа с несуществующим логином', async () => {
    const client = createDbClient();
    const userAuth = new UserAuthBuilder()
        .withLogin("non_existent@email.ru")
        .withPassword("Qwerty123!")
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidCredentials");
    
});

test('Авторизация: попытка входа с несуществующим паролем для валидного логина', async () => {
    const client = createDbClient();
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
    const userAuth = new UserAuthBuilder()
        .withLogin(userRecord.Login)
        .withPassword("Password123!!")
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(400);
    expect(response.data[0].code).toBe("InvalidCredentials");
    
});

test('Авторизация: попытка входа с пустым полем логин', async () => {
    const client = createDbClient();
    const userAuth = new UserAuthBuilder()
        .withLogin('')
        .withPassword("Password123!!")
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    
});

test('Авторизация: попытка входа с пустым полем пароль', async () => {
    const client = createDbClient();
    const userAuth = new UserAuthBuilder()
        .withLogin("login@email.com")
        .withPassword("")
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    
});

test('Авторизация: попытка входа с пробелом в качестве логина', async () => {
    const client = createDbClient();
    const userAuth = new UserAuthBuilder()
        .withLogin(" ")
        .withPassword("Qwerty123!")
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    
});

test('Авторизация: попытка входа с пробелом в качестве пароля', async () => {
    const client = createDbClient();
    const userAuth = new UserAuthBuilder()
        .withLogin("login@email.com")
        .withPassword(" ")
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(400);
    expect(response.data.code).toBe("ModelException");
    
});

test('Авторизация: проверка повторной авторизации', async () => {
    const client = createDbClient();
    const password = "Qwerty123!";
    const passwordHash = await generatePasswordHash(password);
    let timeNow = new Date();
    timeNow.setMinutes(timeNow.getMinutes() + 15);
    const userRecord = new UserRecordBuilder()
        .withUserId(uuid.v4())
        .withName("Max")
        .withLogin(`login${getRandomInt()}@email.com`)
        .withPasswordHash(passwordHash)
        .withRole("renter")
        .build();
    await setUserRecordToDatabase(client, userRecord);

    const userToken = new UserTokenBuilder()
        .withUserId(userRecord.UserId)
        .withToken(uuid.v4())
        .withExpirationDateTime(timeNow)
        .build();
    await setUserAuthToDatabase(client, userToken);
    const userAuth = new UserAuthBuilder()
        .withLogin(userRecord.Login)
        .withPassword(password)
        .build();

    const response = await Api.postRequest(path, userAuth);
    expect(response.status).toBe(200);
    expect(userToken.ExpirationDateTime).toBe(timeNow);
    
});
