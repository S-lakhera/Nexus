import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/state/authSlice.js'
import chatReducer from '../features/chat/state/chatSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer
    },
    devTools: process.env.NODE_ENV !== "production",
})