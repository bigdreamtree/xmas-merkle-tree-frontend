import axios from "axios";

// Create an axios instance with the server URL
export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL, // Server URL from environment variable
  timeout: 5000, // Set a timeout (optional)
  headers: {
    "Content-Type": "application/json",
  },
});
