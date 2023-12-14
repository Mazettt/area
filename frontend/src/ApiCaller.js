import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:6500';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const callApi = (method, endpoint, data = null, headers = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await api({
                method,
                url: endpoint,
                data,
                headers,
            });
            resolve(response.data);
        } catch (error) {
            console.error(`Error during API call to ${endpoint}:`, error);
            reject(error);
        }
    });
};

export default api;
