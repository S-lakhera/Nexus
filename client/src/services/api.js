import axios from 'axios';
import { store } from '../app/store';
// NEW: Import your existing actions
import { logout, updateAccessToken } from '../features/auth/state/authSlice'; 

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

API.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
);

API.interceptors.response.use(
    (response) => {
        return response; // Success? Pass it through.
    },
    async (error) => {
        const originalRequest = error.config;

        // If backend says 401 Expired AND we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 1. Ask backend for a new access token via the HTTPOnly Refresh Cookie
                const res = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true } // Crucial to send the refresh cookie
                );

                // 2. Dispatch your existing action to save the new token to Redux & LocalStorage
                store.dispatch(updateAccessToken(res.data.accessToken));

                // 3. The request interceptor above will automatically grab this new token. Retry the failed request!
                return API(originalRequest);
                
            } catch (refreshError) {
                // 4. If refresh fails (Refresh Token expired), nuke the session.
                store.dispatch(logout()); // Your existing logout action!
                window.location.href = "/login"; // Hard redirect
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;