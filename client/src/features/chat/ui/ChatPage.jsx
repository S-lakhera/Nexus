// Remove the local useState
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useSelector } from "react-redux"; // Add this

export default function ChatPage() {
  // Pull the actual selectedChat from Redux!
  const { selectedChat } = useSelector((state) => state.chat);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-primary">
      <ChatSidebar />

      <div className="hidden flex-1 md:flex">
        {selectedChat ? ( // Conditionally render based on real data
          <ChatWindow />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#0F0F11]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-secondary shadow-lg shadow-purple-500/5">
              <svg className="h-8 w-8 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-space text-primary">Your Messages</h2>
            <p className="mt-2 text-center text-sm text-zinc-400 font-jakarta max-w-sm leading-relaxed">
              Select a chat from the sidebar to start messaging, or create a new chat to connect with someone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}