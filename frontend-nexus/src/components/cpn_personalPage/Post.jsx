import React, { forwardRef, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { handlePostReaction, getPostReactions } from "../../services/postService";

// --- Component Tooltip hiển thị danh sách người dùng ---
const ReactionTooltip = ({ reactions, type, loading }) => {
  const filteredUsers = reactions.filter((r) => r.type === type);

  if (loading) {
    return (
      <div className="absolute bottom-full mb-3 left-0 bg-slate-800 text-white text-[11px] px-3 py-2 rounded-lg shadow-xl z-50 min-w-[120px] border border-slate-700">
        Đang tải...
      </div>
    );
  }

  if (filteredUsers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: -10 }} // Hiệu ứng hiện ra từ bên trái
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -5 }}
      className={`
        absolute bottom-full mb-3 left-0 z-50 
        w-[200px] bg-white border border-slate-200 
        p-2 rounded-2xl shadow-2xl
        ${filteredUsers.length >= 5 ? "h-[220px] overflow-y-auto" : "h-auto overflow-hidden"}
      `}
      style={{
        scrollbarWidth: 'thin', // Cho Firefox
        msOverflowStyle: 'none' // Cho IE
      }}
    >
      {/* Header Tooltip */}
      <div className="flex items-center justify-between mb-2 px-2 border-b border-slate-50 pb-2 sticky top-0 bg-white z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ĐÃ THẢ {type}</span>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
          {filteredUsers.length}
        </span>
      </div>

      {/* Danh sách người dùng */}
      <div className="flex flex-col gap-1">
        {filteredUsers.map((user) => (
          <div key={user.userId} className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-default">
            <img
              src={user.avatarUrl || "/default_user_avatar.png"}
              className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
              alt="avatar"
            />
            <span className="text-[13px] font-semibold text-slate-700 truncate">
              {user.fullname}
            </span>
          </div>
        ))}
      </div>

      {/* Mũi tên nhỏ (nằm lệch trái cho khớp với tooltip) */}
      <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
    </motion.div>
  );
};

// --- Component hiệu ứng hạt ---
const ReactionParticles = ({ emoji }) => {
  const particles = Array.from({ length: 6 });
  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, scale: 3, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0.8,
            x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 40 + 20),
            y: -(Math.random() * 50 + 40)
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute text-sm select-none"
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  );
};

const Post = forwardRef(({ post }, ref) => {
  const { id, fullname, created, content, fileUrl, avatarUrl, reactionCounts: initialCounts } = post;

  // States cho Reaction
  const [currentReactions, setCurrentReactions] = useState(initialCounts || {});
  const [activeReaction, setActiveReaction] = useState(null);

  // States cho Tooltip/Hover logic
  const [allReactionsData, setAllReactionsData] = useState([]);
  const [hoveredType, setHoveredType] = useState(null);
  const [isFetchingReactions, setIsFetchingReactions] = useState(false);

  // Refs
  const hoverTimerRef = useRef(null);

  // Xử lý khi đưa chuột vào (Delay 3 giây)
  const handleMouseEnter = (type) => {
    // Nếu icon này có người thả cảm xúc thì mới chạy timer
    if (!currentReactions[type] || currentReactions[type] === 0) return;

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    hoverTimerRef.current = setTimeout(async () => {
      setHoveredType(type);

      // Cache dữ liệu: Nếu chưa có dữ liệu danh sách thì mới gọi API
      if (allReactionsData.length === 0) {
        setIsFetchingReactions(true);
        try {
          const response = await getPostReactions(id);
          if (response.data.code === 1000) {
            setAllReactionsData(response.data.result);
          }
        } catch (error) {
          console.error("Error fetching reactions:", error);
        } finally {
          setIsFetchingReactions(false);
        }
      }
    }, 3000); // Đợi đúng 3 giây theo yêu cầu của bạn
  };

  // Xử lý khi rời chuột
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredType(null);
  };

  // Cleanup timer khi component bị hủy
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const reactions = [
    { key: "LIKE", emoji: "👍", label: "Thích", color: "text-blue-500", hoverBg: "hover:bg-blue-50" },
    { key: "HAHA", emoji: "😆", label: "Haha", color: "text-yellow-500", hoverBg: "hover:bg-yellow-50" },
    { key: "WOW", emoji: "😮", label: "Wow", color: "text-orange-500", hoverBg: "hover:bg-orange-50" },
    { key: "SAD", emoji: "😢", label: "Buồn", color: "text-indigo-400", hoverBg: "hover:bg-indigo-50" },
    { key: "ANGRY", emoji: "😡", label: "Phẫn nộ", color: "text-red-500", hoverBg: "hover:bg-red-50" },
  ];

  const onReactionClick = async (reactionType) => {
    setActiveReaction(reactionType);
    try {
      const response = await handlePostReaction(id, reactionType);
      if (response.data.code === 1000) {
        setCurrentReactions(response.data.result.reactionCounts);
        // Xóa cache để lần hover tới sẽ lấy lại danh sách mới nhất
        setAllReactionsData([]);
      }
    } catch (error) {
      console.error("Lỗi khi thả cảm xúc:", error);
    } finally {
      setTimeout(() => setActiveReaction(null), 600);
    }
  };

  const isVideo = fileUrl?.match(/\.(mp4|mov|avi|mkv)$/i);

  const renderReactionStatus = (isVertical = false) => (
    <div className={`flex ${isVertical ? "flex-col items-center" : "flex-wrap pt-4 border-t border-gray-100"} gap-3`}>
      {reactions.map((item) => (
        <div
          key={item.key}
          onClick={() => onReactionClick(item.key)}
          onMouseEnter={() => handleMouseEnter(item.key)}
          onMouseLeave={handleMouseLeave}
          className={`flex items-center gap-2 bg-white ${item.hoverBg} px-2 py-1.5 rounded-full transition-all cursor-pointer group active:scale-95 relative overflow-visible select-none shadow-sm border border-gray-50`}
        >
          {/* Tooltip nổi lên sau 3s */}
          <AnimatePresence>
            {hoveredType === item.key && (
              <ReactionTooltip
                reactions={allReactionsData}
                type={item.key}
                loading={isFetchingReactions}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {activeReaction === item.key && <ReactionParticles emoji={item.emoji} />}
          </AnimatePresence>

          <motion.span
            animate={activeReaction === item.key ? { scale: [1, 1.4, 1] } : {}}
            className="text-lg group-hover:scale-110 transition-transform relative z-10"
          >
            {item.emoji}
          </motion.span>

          <AnimatePresence mode="wait">
            <motion.span
              key={currentReactions[item.key]}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`text-[12px] font-bold ${item.color} relative z-10 min-w-3 text-center`}
            >
              {currentReactions[item.key] || 0}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-3xl shadow-sm p-6 flex flex-row gap-4 border border-gray-100 mb-5 hover:shadow-md transition-shadow duration-300"
    >
      {/* CỘT TRÁI: AVATAR + REACTION DỌC */}
      <div className="flex flex-col shrink-0 w-14 relative">
        {/* Avatar nằm cố định ở trên cùng */}
        <div className="flex justify-center w-full">
          <div className="relative group">
            <img
              src={avatarUrl || "/default_user_avatar.png"}
              alt="avatar"
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-gray-50 group-hover:ring-blue-100 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Thanh reaction dọc: Sát mép dưới của bài post */}
        {fileUrl && (
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2">
            {renderReactionStatus(true)}
          </div>
        )}
      </div>

      {/* CỘT PHẢI: NỘI DUNG CHÍNH (Văn bản + Hình ảnh) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex flex-col mb-3 w-fit">
            <span className="font-bold text-gray-900 text-[16px] hover:text-blue-600 cursor-pointer transition-colors w-fit">
              {fullname}
            </span>
            <span className="text-gray-400 text-[12px] font-medium flex items-center gap-1">
              {created} • <span><i className="fa-solid fa-user text-[10px]"></i></span>
            </span>
            <hr className="border-t border-black w-full mt-1" />
          </div>

          <div className="text-[15px] text-gray-800 leading-relaxed font-medium mb-4 whitespace-pre-wrap">
            {content}
          </div>
        </div>

        {fileUrl ? (
          <div className="rounded-2xl overflow-hidden shadow-inner border border-gray-50 bg-gray-50 relative group">
            {isVideo ? (
              <video src={fileUrl} controls className="w-full max-h-[500px] object-contain bg-black/5" />
            ) : (
              <img
                src={fileUrl}
                alt="media"
                className="w-full h-auto object-contain max-h-[600px] transition-transform duration-700 group-hover:scale-[1.02]"
              />
            )}
          </div>
        ) : (
          <div className="mt-2">
            {renderReactionStatus(false)}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default Post;