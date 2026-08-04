import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { search as searchUsers } from "../../services/userService";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../services/authenticationService";

const NewChatPopover = ({ anchorEl, open, onClose, onSelectUser, newChatRect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [Navigate]);

  const handleSearch = useCallback(
    async (query) => {
      if (!query?.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      setError(null);

      try {
        const response = await searchUsers(query.trim());
        if (response?.data?.result) {
          // Chỉ lấy 10 kết quả đầu tiên nếu có nhiều
          setSearchResults(response.data.result.slice(0, 10));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm users:", err);
        setError("Không thể tìm kiếm users. Vui lòng thử lại.");
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
      }
    }, 500); // 500ms debounce time

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
    // Reset trạng thái sau khi chọn
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    onClose();
  };


  if (!open || !anchorEl || !newChatRect) {
    return null; // Không render nếu không mở hoặc không có anchor
  }

  const LEFT_OFFSET = 180;
  const TOP_MARGIN = 8;

  // Tính toán vị trí Popover
  const popoverStyle = {
    position: 'absolute',
    top: newChatRect.bottom + TOP_MARGIN,
    // Dịch Popover sang trái từ vị trí nút.
    left: newChatRect.left - LEFT_OFFSET,
  };

  return (
    // Backdrop/Overlay (Đóng khi click ra ngoài)
    <div
      // backdrop
      className="fixed inset-0 z-40"
      onClick={onClose} // Đóng khi click vào backdrop
    >
      {/* Nội dung Popover */}
      <div
        // Ngăn chặn việc click vào nội dung popover làm đóng nó
        onClick={(e) => e.stopPropagation()}
        style={popoverStyle}
        className="w-80 p-4 bg-white rounded-lg shadow-2xl shadow-gray-600 border border-gray-100 z-50 transform origin-top-left transition-transform duration-200 ease-out"
      >
        {/* Tiêu đề */}
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          Bắt đầu cuộc hội thoại mới
        </h3>

        {/* Search Field */}
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-10 border text-black border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500"
            placeholder="Bắt đầu gõ để tìm kiếm users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {/* Biểu tượng tìm kiếm */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-gray-400 text-base"></i>
          </div>

          {/* Nút xóa */}
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <div
                type="button"
                className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none transition duration-150"
                onClick={handleClearSearch}
                aria-label="xóa tìm kiếm"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </div>
            </div>
          )}
        </div>

        {/* Search Results Area */}
        <div className="h-72 overflow-y-auto">
          {loading && (
            <div className="flex justify-center p-6">
              <div
                className="w-7 h-7 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"
                role="status"
              >
                <span className="sr-only">Đang tải...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="p-2">
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {searchResults.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-100"
                >
                  {/* Avatar */}
                  <div className="shrink-0 mr-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover bg-gray-200"
                      src={user.avatarUrl || "/default_user_avatar.png"}
                      alt={user.fullname || "User Avatar"}
                      // Avatar placeholder nếu không có ảnh
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default_user_avatar.png";
                      }}
                    />
                  </div>

                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullname}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && searchResults.length === 0 && hasSearched && (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">
                Không tìm thấy users phù hợp với "{searchQuery}"
              </p>
            </div>
          )}

          {!loading && !error && !hasSearched && (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">
                Tìm kiếm một user để bắt đầu cuộc hội thoại
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

NewChatPopover.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectUser: PropTypes.func.isRequired,
};

export default NewChatPopover;