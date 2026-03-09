const { default: axios } = require("axios");


export const BASE_URL = "https://proconnect-7726.onrender.com";


export const clientServer = axios.create({
  baseURL: BASE_URL,
});