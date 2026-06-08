import { createSlice } from "@reduxjs/toolkit";

let storedUser = localStorage.getItem("nexusUser")
    ? JSON.parse(localStorage.getItem("nexusUser"))
    : null;

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: storedUser,
        accessToken: storedUser ? storedUser.accessToken : null,
        isLoading: false,
        error: null
    },
    reducers: {
        loginStart: (state) => {
            state.isLoading = true,
                state.error = null
        },
        loginSuccess: (state, action) => {
            state.isLoading = false,
                state.user = action.payload,
                state.accessToken = action.payload.accessToken

            localStorage.setItem("nexusUser", JSON.stringify(action.payload))
        },
        loginFailure: (state, action) => {
            state.isLoading = false,
                state.error = action.payload
        },
        updateAccessToken: (state, action) => {
            state.accessToken = action.payload;
            if (state.user) {
                state.user.accessToken = action.payload;
                localStorage.setItem("nexusUser", JSON.stringify(state.user))
            }
        },
        logout: (state) => {
            state.user = null,
                state.accessToken = null,
                state.error = null,
                state.isLoading = false,
                localStorage.removeItem("nexusUser")
        }
    }
})

export const {
    loginStart,
    loginFailure,
    loginSuccess,
    logout,
    updateAccessToken
} = authSlice.actions;

export default authSlice.reducer;