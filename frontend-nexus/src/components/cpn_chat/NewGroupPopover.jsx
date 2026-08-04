import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
// Nhập các hook và hàm cần thiết, loại bỏ các component MUI
import { getMyFriends } from "../../services/friendshipService.js";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../services/authenticationService";


const NewGroupPopover = ({ anchorEl, open, onClose, onCreateGroup, newGroupRect }) => {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // Bắt đầu loading khi mở popover
  const [friendsList, setFriendsList] = useState([]); // Danh sách bạn bè gốc
  const [filteredFriends, setFilteredFriends] = useState([]); // Danh sách bạn bè đã lọc/tìm kiếm
  const [selectedMembers, setSelectedMembers] = useState([]); // Danh sách IDs đã chọn
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [Navigate]);

  // --- Logic Tải Danh sách Bạn bè ---

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyFriends();
      if (response?.data?.result) {
        setFriendsList(response.data.result);
        setFilteredFriends(response.data.result);
      } else {
        setFriendsList([]);
        setFilteredFriends([]);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách bạn bè:", err);
      setError("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
      setFriendsList([]);
      setFilteredFriends([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFriends();
      // Reset trạng thái khi mở Popover
      setGroupName("");
      setSearchQuery("");
      setSelectedMembers([]);
    }
  }, [open, fetchFriends]);

  // --- Logic Tìm kiếm và Lọc ---

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredFriends(friendsList);
    } else {
      const results = friendsList.filter(
        (friend) =>
          friend.fullname.toLowerCase().includes(query) ||
          friend.email.toLowerCase().includes(query) ||
          friend.username.toLowerCase().includes(query)
      );
      setFilteredFriends(results);
    }
  }, [searchQuery, friendsList]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // --- Logic Chọn Thành viên ---

  const handleSelectMember = (userId) => {
    setSelectedMembers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        // Bỏ chọn
        return prevSelected.filter((id) => id !== userId);
      } else {
        // Chọn
        return [...prevSelected, userId];
      }
    });
  };

  // --- Logic Tạo nhóm ---

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm.");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("Vui lòng chọn ít nhất một thành viên để tạo nhóm.");
      return;
    }


    onCreateGroup({
      groupName: groupName.trim(),
      memberIds: selectedMembers,
    });

    // Reset và đóng popover
    setGroupName("");
    setSearchQuery("");
    setSelectedMembers([]);
    onClose();
  };



  if (!open || !anchorEl || !newGroupRect) {
    return null;
  }

  const POPOVER_WIDTH = 320;
  const BUTTON_WIDTH = 40;
  const SPACE_X = 12;

  const newGroupButtonLeft = newGroupRect.right + 12;

  const LEFT_OFFSET = 250;
  const TOP_MARGIN = 8;

  const popoverStyle = {
    position: 'absolute',
    top: newGroupRect.bottom + TOP_MARGIN,
    // Lấy lề phải của nút đầu tiên + khoảng cách + chiều rộng nút thứ hai - LEFT_OFFSET
    // Để dịch sang trái nhiều hơn.
    left: newGroupRect.left + BUTTON_WIDTH + SPACE_X - LEFT_OFFSET,
  };

  const finalStyle = {
    position: 'absolute',
    top: newGroupRect.bottom + TOP_MARGIN,
    left: newGroupRect.left - 230,
  };

  return (
    <div
      className="fixed inset-0 z-40"
      onClick={onClose}
    >
      {/* Popover Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={finalStyle}
        className="w-80 p-4 bg-white rounded-lg shadow-2xl shadow-gray-600 border border-gray-100 z-50 transform origin-top-left transition-transform duration-200 ease-out"
      >
        {/* Tiêu đề */}
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          Tạo Nhóm Mới
        </h3>

        {/* Group Name Input */}
        <div className="mb-4">
          <input
            type="text"
            className="w-full py-2 px-3 border text-black border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500"
            placeholder="Nhập Tên Nhóm (tối thiểu 2 thành viên)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* Trường Tìm Kiếm Bạn Bè */}
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-10 border text-black border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500"
            placeholder="Tìm kiếm bạn bè để thêm vào..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fa-solid fa-magnifying-glass text-gray-400 text-base"></i>
          </div>

          {/* Nút Xóa */}
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

        {/* Số Thành Viên Được Chọn */}
        <p className="text-xs text-blue-600 font-medium mb-2">
          Đã Chọn: {selectedMembers.length} thành viên
        </p>

        {/* Khu vực Danh Sách Bạn Bè */}
        <div className="h-48 overflow-y-auto border border-gray-200 rounded-lg">
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
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2 text-sm"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && filteredFriends.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {filteredFriends.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleSelectMember(user.userId)} // Dùng userId để chọn
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-gray-100"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="shrink-0 mr-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        src={user.avatarUrl || "/default_user_avatar.png"}
                        alt={user.fullname || "User Avatar"}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default_user_removebg.png";
                        }}
                      />
                    </div>

                    {/* User Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullname}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="ml-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.userId)}
                      onChange={() => handleSelectMember(user.userId)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && filteredFriends.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm">
                Không tìm thấy bạn bè nào.
              </p>
            </div>
          )}
        </div>

        {/* Create Group Button */}
        <div className="mt-4">
          <div
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="w-full py-2 rounded-lg text-white font-semibold transition duration-200 
                           disabled:bg-blue-300 disabled:cursor-not-allowed
                           flex justify-center items-center
                           bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          >
            Tạo Nhóm
          </div>
        </div>
      </div>
    </div>
  );
};

NewGroupPopover.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateGroup: PropTypes.func.isRequired,
  newGroupRect: PropTypes.object, // Rect của nút tạo nhóm
};

export default NewGroupPopover;