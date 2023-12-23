const bcrypt = require("bcryptjs");

async function checkPasswordHash(passwordHash, password) {
    return await bcrypt.compare(password, passwordHash);

}

async function generatePasswordHash(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
}

module.exports = {
    checkPasswordHash,
    generatePasswordHash
}