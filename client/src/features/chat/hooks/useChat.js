import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../../context/SocketContext.jsx";
import { useState, useEffect } from "react"; // Added useState
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
  removeMessage,
  incrementUnreadCount,
  clearUnreadCount,
  updateMessageReceipt,
  updateCurrentChat
} from "../state/chatSlice.js";
import {
  fetchChatsAPI,
  accessChatAPI,
  fetchMessagesAPI,
  sendMessageAPI,
  createGroupChatAPI,
  markMessageReadAPI,
  renameGroupAPI,
  removeFromGroupAPI,
  addToGroupAPI
} from "../api/chat.api.js";
import { logoutUserAPI, searchUsersAPI } from "../../auth/api/auth.api.js"; // Added search API
import { logout } from "../../auth/state/authSlice.js";

export const useChat = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { user } = useSelector((state) => state.auth);

  const { chats, selectedChat, messages, isLoadingChats, isLoadingMessages, unreadCounts } = useSelector((state) => state.chat);

  // --- SEARCH STATE & LOGIC ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const data = await searchUsersAPI(searchQuery);
        setSearchResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket) return;

    // 1. INCOMING MESSAGE HANDLER
    socket.on("message received", async (newMessage) => {

      if (selectedChat && selectedChat._id === newMessage.chat._id) {
        // SCENARIO A: The user is actively looking at this chat
        dispatch(addRealTimeMessage(newMessage));

        try {
          // Tell the DB it is read, then emit to the sender!
          await markMessageReadAPI(newMessage.chat._id);
          socket.emit("message read", { chat: newMessage.chat, readerId: user._id });
        } catch (error) {
          console.error("Failed to mark read:", error);
        }

      } else {
        // SCENARIO B: The user is somewhere else. Add a notification badge!
        dispatch(incrementUnreadCount({
          chatId: newMessage.chat._id,
          messageId: newMessage._id
        }));

      }

      dispatch(updateChatListLatestMessage({ chatId: newMessage.chat._id, lastMessage: newMessage }));
    });

    // 2. OUTGOING READ RECEIPT HANDLER (The blue tick trigger)
    socket.on("receipt updated", (updatedMessage) => {

      dispatch(updateMessageReceipt(updatedMessage));
    });

    return () => {
      socket.off("message received");
      socket.off("receipt updated");
    };
  }, [socket, selectedChat, dispatch, user]);

  // --- ACTIONS ---
  const loadChats = async () => {
    try {
      dispatch(fetchChatsStart());
      const data = await fetchChatsAPI();
      dispatch(fetchChatsSuccess(data));
    } catch (error) {
      dispatch(fetchChatsFailure(error.response?.data?.message || "Failed to load chats."));
    }
  };

  const openChat = async (chatData) => {
    dispatch(setSelectedChat(chatData));
    dispatch(clearUnreadCount(chatData._id));

    const latestMessageSenderId = chatData.latestMessage?.sender?._id || chatData.latestMessage?.sender;
    if (chatData.latestMessage && latestMessageSenderId !== user._id) {
      try {
        await markMessageReadAPI(chatData._id);
        socket?.emit("message read", { chat: chatData, readerId: user._id });
      } catch (error) {
        console.error("Failed to mark chat as read:", error);
      }
    }

    try {
      dispatch(fetchMessagesStart());
      const data = await fetchMessagesAPI(chatData._id);
      dispatch(fetchMessagesSuccess(data));
    } catch (error) {
      dispatch(fetchMessagesFailure(error.response?.data?.message || "Failed to load messages."));
    }
  };

  const createOrOpenChat = async (userId) => {
    try {
      const chatData = await accessChatAPI(userId);
      await openChat(chatData);
      await loadChats();
      // Logic handled here: clear the search automatically after selecting a user
      setSearchQuery("");
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  const sendNewMessage = async (content) => {
    if (!selectedChat || !content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      content,
      sender: user,
      chat: selectedChat,
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    dispatch(addRealTimeMessage(tempMessage));

    try {
      const realMessage = await sendMessageAPI(selectedChat._id, content);
      dispatch(replaceTempMessage({ tempId, realMessage }));
      dispatch(
        updateChatListLatestMessage({
          chatId: selectedChat._id,
          lastMessage: realMessage,
        })
      );
      socket.emit("new message", realMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      dispatch(removeMessage(tempId));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUserAPI();
      dispatch(logout());
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Create a Group Chat 
  const createNewGroupChat = async (name, selectedUserIds) => {
    try {
      const newGroup = await createGroupChatAPI(name, selectedUserIds);

      await loadChats();

      // Instantly open the newly created group in the Chat Window
      dispatch(setSelectedChat(newGroup));

      return true; // Return true so the UI knows it can close the modal
    } catch (error) {
      console.error("Failed to create group:", error);
      return false;
    }
  };

  const renameGroup = async (chatId, newName) => {
    try {
      const updatedChat = await renameGroupAPI(chatId, newName);
      dispatch(updateCurrentChat(updatedChat));
      return true;
    } catch (error) {
      console.error("Rename failed:", error);
      return false;
    }
  };

  const addUserToGroup = async (chatId, userIdToAdd) => {
    try {
      const updatedChat = await addToGroupAPI(chatId, userIdToAdd);
      dispatch(updateCurrentChat(updatedChat));
      return true;
    } catch (error) {
      console.error("Add user failed:", error);
      return false;
    }
  };

  const removeUserFromGroup = async (chatId, userIdToRemove) => {
    try {
      const updatedChat = await removeFromGroupAPI(chatId, userIdToRemove);

      // EDGE CASE: If the logged-in user just left the group themselves!
      if (userIdToRemove === user._id) {
        dispatch(setSelectedChat(null)); // Close the window
        loadChats(); // Refresh the sidebar to remove the group
      } else {
        dispatch(updateCurrentChat(updatedChat)); // Otherwise just update the modal
      }
      return true;
    } catch (error) {
      console.error("Remove user failed:", error);
      return false;
    }
  };


  return {
    chats,
    selectedChat,
    messages,
    unreadCounts,
    isLoadingChats,
    isLoadingMessages,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchLoading,
    loadChats,
    openChat,
    createOrOpenChat,
    sendNewMessage,
    handleLogout,
    createNewGroupChat,
    renameGroup,
    addUserToGroup,
    removeUserFromGroup
  };
};