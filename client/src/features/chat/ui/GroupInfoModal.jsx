import { useState, useEffect } from "react";
import { X, Crown, Edit2, Check, Search, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat.js";
import { searchUsersAPI } from "../../auth/api/auth.api.js"; // Needed for adding new users

export default function GroupInfoModal({ isOpen, onClose, chat }) {
  const { user } = useSelector((state) => state.auth);
  const { renameGroup, addUserToGroup, removeUserFromGroup } = useChat();

  // --- LOCAL STATE ---
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Determine if the currently logged in user has Admin privileges
  const isAdmin = chat?.groupAdmin?._id === user?._id;

  // Initialize rename input when modal opens
  useEffect(() => {
    if (chat) setRenameInput(chat.chatName);
  }, [chat]);

  // Debounced search for adding new members
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchUsersAPI(searchQuery);
        setSearchResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleRename = async () => {
    if (!renameInput.trim() || renameInput === chat.chatName) {
      setIsRenaming(false);
      return;
    }
    await renameGroup(chat._id, renameInput);
    setIsRenaming(false);
  };

  const handleAddUser = async (userToAdd) => {
    // Prevent adding if they are already in the group
    if (chat.users.find((u) => u._id === userToAdd._id)) return;
    
    await addUserToGroup(chat._id, userToAdd._id);
    setSearchQuery(""); // Clear search bar on success
    setSearchResults([]);
  };

  const handleRemoveUser = async (userToRemove) => {
    await removeUserFromGroup(chat._id, userToRemove._id);
  };

  const handleLeaveGroup = async () => {
    await removeUserFromGroup(chat._id, user._id);
    onClose();
  };

  if (!isOpen || !chat || !chat.isGroupChat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-primary shadow-2xl">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold font-space text-primary">Group Settings</h2>
          <button onClick={onClose} className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-secondary hover:text-primary">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Name Edit Section */}
        <div className="flex flex-col items-center gap-4 border-b border-border p-6 bg-secondary/50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-bold text-zinc-950 font-space shadow-lg">
            {chat.chatName.substring(0, 2).toUpperCase()}
          </div>
          
          <div className="flex w-full items-center justify-center gap-2">
            {isRenaming ? (
              <div className="flex w-full max-w-[200px] items-center gap-2">
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full rounded-md border border-accent bg-primary px-3 py-1.5 text-center text-sm font-bold text-primary outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                <button onClick={handleRename} className="rounded-md bg-accent p-1.5 text-zinc-950 hover:opacity-90">
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold font-jakarta text-primary">{chat.chatName}</h3>
                <button onClick={() => setIsRenaming(true)} className="text-zinc-400 hover:text-accent">
                  <Edit2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ADMIN ONLY: Add Member Search */}
        {isAdmin && (
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Add new members..."
                className="w-full rounded-xl border border-border bg-secondary py-2 pl-9 pr-4 text-sm font-jakarta text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="mt-2 max-h-32 overflow-y-auto rounded-xl border border-border bg-primary scrollbar-thin">
                {isSearching ? (
                  <p className="p-3 text-center text-xs text-zinc-500">Searching...</p>
                ) : searchResults.map((u) => (
                  <div key={u._id} onClick={() => handleAddUser(u)} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-secondary">
                    <img src={u.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="h-8 w-8 rounded-full" />
                    <span className="text-sm font-medium text-primary">{u.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members List */}
        <div className="flex flex-col p-2">
          <div className="px-4 py-2 flex justify-between items-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-jetbrains">
              Participants ({chat.users.length})
            </p>
          </div>
          
          <div className="max-h-56 overflow-y-auto px-2 scrollbar-thin">
            {chat.users.map((member) => {
              const isGroupAdmin = chat.groupAdmin && chat.groupAdmin._id === member._id;
              
              return (
                <div key={member._id} className="group flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <img src={member.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} className="h-10 w-10 rounded-full bg-secondary ring-1 ring-border" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold font-jakarta text-primary">
                        {member._id === user._id ? "You" : member.name}
                      </span>
                      <span className="text-xs text-zinc-500 font-jakarta">{member.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isGroupAdmin && (
                      <div className="flex items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent font-jetbrains">
                        <Crown size={12} /> ADMIN
                      </div>
                    )}
                    
                    {/* ADMIN ONLY: Remove Button (Cannot remove themselves) */}
                    {isAdmin && !isGroupAdmin && (
                      <button 
                        onClick={() => handleRemoveUser(member)}
                        className="hidden rounded-full p-1.5 text-red-400 hover:bg-red-400/10 group-hover:block"
                        title="Remove User"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Leave Group Button */}
        <div className="border-t border-border bg-secondary p-4">
          <button 
            onClick={handleLeaveGroup}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-500 hover:text-white"
          >
            <LogOut size={16} />
            Leave Group
          </button>
        </div>

      </div>
    </div>
  );
}