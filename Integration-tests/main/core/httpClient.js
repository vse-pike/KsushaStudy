const axios = require("axios");
const {baseUrl} = require("./appSetings");
const httpClient = axios.create({
    baseURL: baseUrl
});

httpClient.defaults.validateStatus = _ => true;

module.exports = {
    httpClient
}