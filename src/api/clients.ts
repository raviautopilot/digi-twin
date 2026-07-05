import axios from 'axios';

export const configClient = axios.create({
  baseURL: 'http://localhost:1705/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const coreClient = axios.create({
  baseURL: 'http://localhost:1706/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// A helper to determine if an error is a connection refused/network error
export const isNetworkError = (error: any): boolean => {
  return axios.isAxiosError(error) && (!error.response || error.code === 'ERR_NETWORK');
};
