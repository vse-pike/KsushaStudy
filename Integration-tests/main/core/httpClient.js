const axios = require("axios");
const {baseUrl} = require("../config");
const httpClient = axios.create({
    baseURL: baseUrl
});

httpClient.defaults.validateStatus = _ => true;

module.exports = {
    httpClient
}