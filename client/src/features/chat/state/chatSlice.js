import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [], // Populates the Left Panel
  selectedChat: null, // Determines what the Right Panel shows
  messages: [], // The actual message bubbles
  unreadCounts: {},
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

    // UNREAD BADGE logic
    incrementUnreadCount: (state, action) => {
      const { chatId, messageId } = action.payload;

      // 1. If this chat doesn't have an unread array yet, create an empty one
      if (!state.unreadCounts[chatId]) {
        state.unreadCounts[chatId] = [];
      }

      // 2. The Gatekeeper: Only push the message ID if it isn't already in the array!
      if (!state.unreadCounts[chatId].includes(messageId)) {
        state.unreadCounts[chatId].push(messageId);
      }
    },

    clearUnreadCount: (state, action) => {
      const chatId = action.payload;
      // Reset it to an empty array when they open the chat
      state.unreadCounts[chatId] = [];
    },

    // --- REAL-TIME: Socket.io Update Handlers ---
    addRealTimeMessage: (state, action) => {
      // Gatekeeper: Check if a message with this exact ID already exists
      const messageExists = state.messages.some((m) => m._id === action.payload._id);

      // Only push it if it is truly a new message
      if (!messageExists) {
        state.messages.push(action.payload);
      }
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

    // --- BULK BLUE TICK UPDATER (FIXED) ---
    updateMessageReceipt: (state, action) => {
      const { chatId, readerId } = action.payload;
      
      // Safety check: Only update if the user is currently looking at this specific chat
      if (state.selectedChat && state.selectedChat._id === chatId) {
        
        state.messages.forEach((msg) => {
          // Smart Gatekeeper: Check if readerId already exists, 
          // handling BOTH raw strings and populated objects safely!
          const isAlreadyRead = msg.readBy.some(
            (reader) => reader === readerId || reader._id === readerId
          );

          if (!isAlreadyRead) {
            // Push the ID into the array. Immer (Redux Toolkit) will catch this 
            // array mutation and force the UI to instantly turn the ticks blue!
            msg.readBy.push(readerId);
          }
        });
      }
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
  removeMessage,
  updateMessageReceipt,
  incrementUnreadCount,
  clearUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;