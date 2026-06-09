import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [], // Populates the Left Panel
  selectedChat: null, // Determines what the Right Panel shows
  messages: [], // The actual message bubbles
  isLoadingChats: false,
  isLoadingMessages: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // --- SIDEBAR: Chat List Reducers ---
    fetchChatsStart: (state) => {
      state.isLoadingChats = true;
      state.error = null;
    },
    fetchChatsSuccess: (state, action) => {
      state.isLoadingChats = false;
      state.chats = action.payload;
    },
    fetchChatsFailure: (state, action) => {
      state.isLoadingChats = false;
      state.error = action.payload;
    },

    // --- SELECTION: Active Chat Logic ---
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
      // Instantly clear old messages when swapping chats to prevent UI ghosting
      state.messages = []; 
    },

    // --- RIGHT PANEL: Message History Reducers ---
    fetchMessagesStart: (state) => {
      state.isLoadingMessages = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action) => {
      state.isLoadingMessages = false;
      state.messages = action.payload;
    },
    fetchMessagesFailure: (state, action) => {
      state.isLoadingMessages = false;
      state.error = action.payload;
    },

    // --- REAL-TIME: Socket.io Update Handlers ---
    addRealTimeMessage: (state, action) => {
      // Pushes a newly received message directly into the active array
      state.messages.push(action.payload);
    },
    // Swaps the temporary message with the real DB document
    replaceTempMessage: (state, action) => {
      const { tempId, realMessage } = action.payload;
      const index = state.messages.findIndex((m) => m._id === tempId);
      if (index !== -1) {
        state.messages[index] = realMessage;
      }
    },
    // Removes the temp message if the API call fails
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
    updateChatListLatestMessage: (state, action) => {
      // Finds the chat in the sidebar and updates its subtext/timestamp
      const { chatId, lastMessage } = action.payload;
      const chatIndex = state.chats.findIndex((c) => c._id === chatId);
      
      if (chatIndex !== -1) {
        state.chats[chatIndex].latestMessage = lastMessage;
        // Optional: Move this chat to the top of the array
        const updatedChat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(updatedChat);
      }
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setSelectedChat,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  addRealTimeMessage,
  updateChatListLatestMessage,
  replaceTempMessage,
  removeMessage
} = chatSlice.actions;

export default chatSlice.reducer;