import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../context/SocketContext.jsx";
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
  replaceTempMessage,
  removeMessage
} from "../state/chatSlice.js";
import {
  fetchChatsAPI,
  accessChatAPI,
  fetchMessagesAPI,
  sendMessageAPI,
} from "../api/chat.api.js";
import { useEffect } from "react";

export const useChat = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket()

  const { user } = useSelector((state) => state.auth);

  // Pull the current state directly from Redux so the UI can just consume it
  const {
    chats,
    selectedChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
  } = useSelector((state) => state.chat);

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    // Listener MUST match backend string exactly
    socket.on("message received", (newMessage) => {

      if (selectedChat && selectedChat._id === newMessage.chat._id) {
        dispatch(addRealTimeMessage(newMessage));
      }

      dispatch(
        updateChatListLatestMessage({
          chatId: newMessage.chat._id,
          lastMessage: newMessage,
        })
      );
    });

    return () => {
      socket.off("message received");
    };
  }, [socket, selectedChat, dispatch]);

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

    // 1. OPTIMISTIC UI: Construct a temporary local message
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      content,
      sender: user, // The logged-in user from your auth state
      chat: selectedChat,
      createdAt: new Date().toISOString(),
      status: "sending", // We can use this to show a gray 'sending' tick in the UI
    };

    // 2. Instantly render it on the sender's screen (Zero latency UX!)
    dispatch(addRealTimeMessage(tempMessage));

    try {
      // 3. Perform the actual backend save
      const realMessage = await sendMessageAPI(selectedChat._id, content);

      // 4. Swap the temp ID for the real MongoDB _id
      dispatch(replaceTempMessage({ tempId, realMessage }));

      // 5. Update the sidebar
      dispatch(
        updateChatListLatestMessage({
          chatId: selectedChat._id,
          lastMessage: realMessage,
        })
      );

      // 6. Now that data integrity is guaranteed, emit to the receiver!
      socket.emit("new message", realMessage);

    } catch (error) {
      console.error("Failed to send message:", error);
      // If the Backend fails, remove the fake message so the UI doesn't lie to the user
      dispatch(removeMessage(tempId));
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