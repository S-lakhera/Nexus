import API from "../../../services/api";

export const registerUserAPI = async (userData) => {
    const res = await API.post("/auth/register",userData)
    return res.data;
}

export const loginUserAPI = async (credentials) => {
    const res = await API.post("/auth/login",credentials)
    return res.data;
}

export const logoutUserAPI = async () => {
    const res = await API.post("/auth/logout")
    return res.data;
}