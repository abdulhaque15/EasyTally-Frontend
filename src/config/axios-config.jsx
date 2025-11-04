import axios from 'axios';
import { API_BASE_URL } from '../helper/Constraints';
import ROUTE from '../helper/Route';
import { navigateTo } from "./navigate.helper";

const api = axios.create({
  baseURL: API_BASE_URL || '',  
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});
 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('interceptores error :', error)
    if (error.response && error.response.status === 401) {
       navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

export default api;