import { useState, useRef, useEffect } from "react";
import { MoreVertical, Paperclip, Smile, Send, CheckCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat.js";

export default function ChatWindow() {
  const { user } = useSelector((state) => state.auth);
  const { selectedChat, messages, isLoadingMessages, sendNewMessage } = useChat();
  
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Utility to extract the other user's details for the header
  const getOtherUser = (users) => {
    if (!users) return null;
    return users.find((u) => u._id !== user?._id) || users[0];
  };

  const otherUser = !selectedChat?.isGroupChat ? getOtherUser(selectedChat?.users) : null;
  const chatName = selectedChat?.isGroupChat ? selectedChat.chatName : otherUser?.name;
  const chatAvatar = selectedChat?.isGroupChat 
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${chatName}` 
    : (otherUser?.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chatName}`);

  // Handle hitting 'Enter' to send
  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && content.trim()) {
      await handleSend();
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    const textToSend = content;
    setContent(""); // Clear input immediately for better UX
    await sendNewMessage(textToSend);
  };

  if (!selectedChat) return null; // Safety catch

  return (
    <div className="flex h-screen w-full flex-col bg-[#0F0F11]">
      
      {/* 1. Header Area */}
      <div className="flex items-center justify-between border-b border-border bg-primary/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-10 rounded-full bg-secondary ring-1 ring-border">
            <img 
              src={chatAvatar} 
              alt="Avatar" 
              className="h-full w-full rounded-full object-cover"
            />
            {!selectedChat.isGroupChat && (
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-primary bg-green-500"></div>
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold font-space text-primary">{chatName}</h2>
            <p className="text-xs font-medium text-accent font-jakarta">
              {selectedChat.isGroupChat ? "Group Chat" : "Online"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-secondary hover:text-primary">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* 2. Message Log Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            <div className="flex justify-center">
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[10px] font-medium text-zinc-500 font-jetbrains">
                START OF CONVERSATION
              </span>
            </div>

            {messages.map((msg) => {
              // Check if the sender ID matches our logged-in user ID
              const isSelf = msg.sender._id === user._id || msg.sender === user._id;
              
              return (
                <div key={msg._id} className={`flex w-full ${isSelf ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[70%] flex-col gap-1 ${isSelf ? "items-end" : "items-start"}`}>
                    
                    <div 
                      className={`relative rounded-2xl px-4 py-2.5 text-sm font-jakarta shadow-sm 
                      ${isSelf 
                        ? "bg-accent text-zinc-950 rounded-tr-sm" 
                        : "border border-border bg-secondary text-primary rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>

                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] text-zinc-500 font-jetbrains">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isSelf && <CheckCheck size={14} className="text-blue-500" />}
                    </div>
                    
                  </div>
                </div>
              );
            })}
            
            {/* Invisible div to anchor our auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. Input Tray */}
      <div className="border-t border-border bg-primary p-4">
        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-400 transition-colors hover:text-primary">
            <Paperclip size={20} />
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full rounded-full border border-border bg-secondary py-3 pl-4 pr-12 text-sm font-jakarta text-primary outline-none transition-all placeholder:text-zinc-500 focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 transition-colors hover:text-accent">
              <Smile size={20} />
            </button>
          </div>

          <button 
            onClick={handleSend}
            disabled={!content.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-zinc-950 shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send size={18} className="ml-1" />
          </button>
        </div>
      </div>

    </div>
  );
}