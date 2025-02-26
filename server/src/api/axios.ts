import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const config = {
  apiUrl: process.env.API_URL,
  port: process.env.PORT || 3000,
};

export const axiosInstance = axios.create({
  baseURL: `${config.apiUrl}:${config.port}`,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});
