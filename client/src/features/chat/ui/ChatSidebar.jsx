import { useEffect } from "react";
import { Search, MoreVertical, Plus, CheckCheck, Check } from "lucide-react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat.js";

export default function ChatSidebar() {
  const { user } = useSelector((state) => state.auth);
  
  // Pull our data and actions directly from the custom hook
  const { chats, loadChats, openChat, selectedChat, isLoadingChats } = useChat();

  // Fire off the API call the second the sidebar renders
  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Utility to extract the correct user details for 1-on-1 chats
  const getOtherUser = (users) => {
    if (!users || users.length === 0) return null;
    return users.find((u) => u._id !== user?._id) || users[0];
  };

  return (
    <div className="flex h-screen w-full flex-col border-r border-border bg-primary transition-all md:w-87.5 lg:w-100">
      
      {/* 1. Header Section */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full bg-secondary ring-2 ring-border">
            <img 
              src={user?.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} 
              alt="Profile" 
              className="h-full w-full rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary bg-green-500"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold font-space text-primary">{user?.name || "Nexus User"}</h2>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent font-jetbrains">Online</p>
          </div>
        </div>
        <button className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-secondary hover:text-primary">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* 2. Search Section */}
      <div className="px-5 pb-4">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm font-jakarta text-primary outline-none transition-all placeholder:text-zinc-500 focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* 3. Chat List Section */}
      <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
        {isLoadingChats ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
          </div>
        ) : chats?.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-500 font-jakarta">
            No chats found. Start a new conversation.
          </div>
        ) : (
          chats?.map((chat) => {
            const otherUser = !chat.isGroupChat ? getOtherUser(chat.users) : null;
            const chatName = chat.isGroupChat ? chat.chatName : otherUser?.name;
            const isSelected = selectedChat?._id === chat._id;

            return (
              <div 
                key={chat._id} 
                onClick={() => openChat(chat)} // Triggers Redux selection & API fetch for messages
                className={`group flex cursor-pointer items-center justify-between rounded-xl p-3 transition-all hover:bg-secondary ${isSelected ? 'bg-secondary ring-1 ring-border' : ''}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  
                  {/* Avatar */}
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-zinc-300 font-space ring-1 ring-border">
                    {chat.isGroupChat ? (
                      chatName.substring(0, 2).toUpperCase()
                    ) : (
                      <img src={otherUser?.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatName}`} alt={chatName} className="h-full w-full rounded-full" />
                    )}
                  </div>

                  {/* Message Details */}
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="truncate text-sm font-semibold font-jakarta text-primary">{chatName}</h3>
                    <div className="flex items-center gap-1">
                      {chat.latestMessage && (
                        <p className="truncate text-xs text-zinc-500 font-jakarta">
                          {/* If the latest message was sent by the logged in user, add a "You: " prefix */}
                          {chat.latestMessage.sender === user?._id ? "You: " : ""}
                          {chat.latestMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Bottom Action */}
      <div className="border-t border-border p-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-zinc-950 transition-all hover:opacity-90 active:scale-95 font-space">
          <Plus size={18} />
          New Chat
        </button>
      </div>

    </div>
  );
}