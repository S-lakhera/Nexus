import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setSelectedChat,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  addRealTimeMessage,
  updateChatListLatestMessage,
} from "../state/chatSlice.js";
import {
  fetchChatsAPI,
  accessChatAPI,
  fetchMessagesAPI,
  sendMessageAPI,
} from "../api/chat.api.js";

export const useChat = () => {
  const dispatch = useDispatch();
  
  // Pull the current state directly from Redux so the UI can just consume it
  const {
    chats,
    selectedChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
  } = useSelector((state) => state.chat);

  // 1. Load the Sidebar Chat List
  const loadChats = async () => {
    try {
      dispatch(fetchChatsStart());
      const data = await fetchChatsAPI();
      dispatch(fetchChatsSuccess(data));
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to load chats.";
      dispatch(fetchChatsFailure(errMsg));
    }
  };

  // 2. Select a Chat & Load its Messages
  const openChat = async (chatData) => {
    // Optimistically set the selected chat so the UI updates instantly
    dispatch(setSelectedChat(chatData));

    try {
      dispatch(fetchMessagesStart());
      const data = await fetchMessagesAPI(chatData._id);
      dispatch(fetchMessagesSuccess(data));
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to load messages.";
      dispatch(fetchMessagesFailure(errMsg));
    }
  };

  // 3. Start a new 1-on-1 chat from a search result
  const createOrOpenChat = async (userId) => {
    try {
      const chatData = await accessChatAPI(userId);
      // Once created/fetched, we open it
      await openChat(chatData);
      // And refresh the sidebar so it appears there
      await loadChats(); 
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  // 4. Send a Message
  const sendNewMessage = async (content) => {
    if (!selectedChat || !content.trim()) return;

    try {
      // Hit the backend
      const newMessage = await sendMessageAPI(selectedChat._id, content);
      
      // Update the active message log instantly
      dispatch(addRealTimeMessage(newMessage));
      
      // Update the sidebar snippet so it shows the latest message text
      dispatch(
        updateChatListLatestMessage({
          chatId: selectedChat._id,
          lastMessage: newMessage,
        })
      );
      
      return newMessage; // Return it so we can emit it via Socket.io next!
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    // State
    chats,
    selectedChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    // Actions
    loadChats,
    openChat,
    createOrOpenChat,
    sendNewMessage,
  };
};