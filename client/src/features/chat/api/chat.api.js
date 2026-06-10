import API from "../../../services/api.js";

// --- CHAT LIST ENDPOINTS ---

// Fetch all active chats for the logged-in user
export const fetchChatsAPI = async () => {
  const response = await API.get("/chat");
  return response.data;
};

// Access a 1-on-1 chat (Creates it if it doesn't exist, fetches if it does)
export const accessChatAPI = async (userId) => {
  const response = await API.post("/chat", { userId });
  return response.data;
};

// --- MESSAGE ENDPOINTS ---

// Fetch all messages for a specific chat ID
export const fetchMessagesAPI = async (chatId) => {
  const response = await API.get(`/message/${chatId}`);
  return response.data;
};

// Send a new text message
export const sendMessageAPI = async (chatId, content) => {
  const response = await API.post("/message", {
    chatId,
    content,
  });
  return response.data;
};

// Create a new multi-user group chat
export const createGroupChatAPI = async (name, users) => {
  const response = await API.post("/chat/group", {
    name,
    users,
  });
  return response.data;
};

// Send the Chat ID to mark the entire room as read
export const markMessageReadAPI = async (chatId) => {
  const response = await API.put("/message/read", { chatId });
  return response.data;
};

// --- GROUP MANAGEMENT ENDPOINTS ---

export const renameGroupAPI = async (chatId, chatName) => {
  const response = await API.put("/chat/rename", { chatId, chatName });
  return response.data;
};

export const removeFromGroupAPI = async (chatId, userId) => {
  const response = await API.put("/chat/groupremove", { chatId, userId });
  return response.data;
};

export const addToGroupAPI = async (chatId, userId) => {
  const response = await API.put("/chat/groupadd", { chatId, userId });
  return response.data;
};