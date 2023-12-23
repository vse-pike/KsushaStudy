const {httpClient} = require("../core/httpClient");

class Api {
    static async postRequest(path, body) {
        return await httpClient.post(path, body);
    }

    static async putRequest(path, body) {
        return await httpClient.put(path, body);
    }

    static async getRequest(path) {
        return await httpClient.get(path);
    }

    static async deleteRequest(path) {
        return await httpClient.delete(path);
    }
}

module.exports = {
    Api
}