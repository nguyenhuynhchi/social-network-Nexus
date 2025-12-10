import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

import { search as searchUsers } from "../../services/userService";

const NewChatPopover = ({ open, onClose, onSelectUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);


  const handleSearch = useCallback(
    async (query) => {
      if (!query?.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      setError(null);

      try {
        const response = await searchUsers(query.trim());
        if (response?.data?.result) {
          setSearchResults(response.data.result);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Error searching users:", err);
        setError("Failed to search users. Please try again.");
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },[]);

  // Debounced search effect (Logic không đổi)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
      }
    }, 800); // 500ms debounce time

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleUserSelect = (user) => {
    onSelectUser(user);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };

  if (!open) {
    return null;
  }

  // Căn chỉnh vị trí Popover (Sử dụng CSS thuần/Tailwind để mô phỏng)
  const popoverStyle = {
    top: '5rem',
    right: '1rem',
    zIndex: 50,
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-40"
      onClick={onClose}
    >
      <div
        className="absolute bg-white rounded-lg shadow-xl p-4 w-80 mt-1"
        style={popoverStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tiêu đề */}
        <h2 className="text-lg font-bold mb-4">Start a new conversation</h2>

        {/* Input với Icon Font Awesome */}
        <div className="relative mb-4">
          {/* Icon Search (fa-search) */}
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

          <input
            className="w-full pl-10 pr-10 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start typing to search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 rounded-full"
              aria-label="clear search"
            >
              {/* Icon Clear (fa-times hoặc fa-xmark) */}
              <i className="fas fa-xmark w-4 h-4"></i>
            </button>
          )}
        </div>

        {/* Khu vực kết quả/Trạng thái */}
        <div className="h-72 overflow-y-auto">
          {/* Loading - Icon Spinner (fa-spinner) */}
          {loading && (
            <div className="flex justify-center p-6">
              <i className="fas fa-spinner fa-spin w-7 h-7 text-blue-500 text-2xl"></i>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!loading && !error && searchResults.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {searchResults.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center p-2 cursor-pointer rounded-md hover:bg-gray-100 transition duration-150"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-3">
                    <img
                      src={user.avatarUrl || "default-avatar-url"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.fullname}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* No results found */}
          {!loading && !error && searchResults.length === 0 && hasSearched && (
            <div className="p-4 text-center">
              <p className="text-gray-500">
                No users found matching "{searchQuery}"
              </p>
            </div>
          )}

          {/* Initial state/Prompt */}
          {!loading && !error && !hasSearched && (
            <div className="p-4 text-center">
              <p className="text-gray-500">
                Search for a user to start a conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// PropTypes (Không thay đổi)
NewChatPopover.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectUser: PropTypes.func.isRequired,
};

export default NewChatPopover;