import React, { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { handlePostReaction } from "../../services/postService";

// Component con cho hiệu ứng hạt bay (giữ nguyên logic của bạn)
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
  const [currentReactions, setCurrentReactions] = useState(initialCounts || {});
  const [activeReaction, setActiveReaction] = useState(null);

  const isVideo = fileUrl?.match(/\.(mp4|mov|avi|mkv)$/i);

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
      }
    } catch (error) {
      console.error("Lỗi khi thả cảm xúc:", error);
    } finally {
      setTimeout(() => setActiveReaction(null), 600);
    }
  };

  // Render thanh Reaction dạng cột hoặc hàng
  const renderReactionStatus = (isVertical = false) => (
    <div className={`flex ${isVertical ? "flex-col items-center" : "flex-wrap pt-4 border-t border-gray-100"} gap-3`}>
      {reactions.map((item) => (
        <div
          key={item.key}
          onClick={() => onReactionClick(item.key)}
          className={`flex items-center gap-2 bg-white ${item.hoverBg} px-2 py-1.5 rounded-full transition-all cursor-pointer group active:scale-95 relative overflow-visible select-none shadow-sm border border-gray-50`}
        >
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
              {created} • <span><i className="fa-solid fa-users text-[10px]"></i></span>
            </span>
            <hr className="border-t border-black w-full mt-1" />
          </div>

          <div className="text-[15px] text-gray-800 leading-relaxed font-medium mb-4 whitespace-pre-wrap select-text">
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