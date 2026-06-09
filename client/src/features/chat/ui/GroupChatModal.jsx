import { useState, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import { searchUsersAPI } from "../../auth/api/auth.api.js";
import { useChat } from "../hooks/useChat.js";

export default function GroupChatModal({ isOpen, onClose }) {
  const { createNewGroupChat } = useChat();

  // Local Presentation State
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Debounced Search (isolated to the modal)
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
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handlers
  const handleSelectUser = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) return; // Prevent duplicates
    setSelectedUsers([...selectedUsers, userToAdd]);
    setSearchQuery(""); // Clear search bar after selection
  };

  const handleRemoveUser = (userToRemove) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userToRemove._id));
  };

  const handleSubmit = async () => {
    if (!groupName || selectedUsers.length < 2) return;
    
    setIsCreating(true);
    // Map the array of objects to an array of just the IDs for the backend
    const userIds = selectedUsers.map((u) => u._id);
    
    const success = await createNewGroupChat(groupName, userIds);
    if (success) {
      // Reset modal state and close
      setGroupName("");
      setSelectedUsers([]);
      onClose();
    }
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-primary shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold font-space text-primary">Create Group Chat</h2>
          <button onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:bg-secondary hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4 p-5">
          
          {/* Group Name Input */}
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-jakarta text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />

          {/* Selected Users Chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span key={u._id} className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent font-jakarta">
                  {u.name}
                  <button onClick={() => handleRemoveUser(u)} className="ml-1 rounded-full hover:bg-accent/30 p-0.5">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* User Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users to add..."
              className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-9 pr-4 text-sm font-jakarta text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Search Results List */}
          <div className="flex max-h-40 flex-col overflow-y-auto scrollbar-thin rounded-xl border border-border">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-zinc-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => {
                const isSelected = selectedUsers.some((u) => u._id === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="flex cursor-pointer items-center justify-between border-b border-border bg-primary p-3 last:border-0 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={user.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="h-8 w-8 rounded-full" />
                      <span className="text-sm font-medium font-jakarta text-primary">{user.name}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-accent" />}
                  </div>
                );
              })
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-xs text-zinc-500">No users found</div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-secondary p-5">
          <button
            onClick={handleSubmit}
            disabled={!groupName || selectedUsers.length < 2 || isCreating}
            className="flex items-center justify-center rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-zinc-950 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 font-space disabled:active:scale-100"
          >
            {isCreating ? "Creating..." : "Create Group"}
          </button>
        </div>

      </div>
    </div>
  );
}