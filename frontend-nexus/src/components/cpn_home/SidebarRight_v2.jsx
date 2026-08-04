import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";
import {
  getMyFriends,
  getSuggestFriends,
  sendFriendRequest
} from "../../services/friendshipService.js";

export default function SidebarRight() {
  const [listFriends, setListFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const intervalRef = useRef(null);

  /* ===== Fetch data ===== */
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await getMyFriends();
        if (res?.data.code === 1000) setListFriends(res.data.result);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await getSuggestFriends(10);
        if (res?.data.code === 1000) {
          setSuggestions(
            res.data.result.map(u => ({
              ...u,
              isSent: false,
              isSending: false
            }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchSuggestions();
  }, []);

  /* ===== Slider ===== */
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev =>
        suggestions.length ? (prev + 1) % suggestions.length : 0
      );
    }, 5000);
  }, [suggestions.length]);

  useEffect(() => {
    if (suggestions.length > 1) startAutoSlide();
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [suggestions, startAutoSlide]);

  const paginate = (dir) => {
    setDirection(dir);
    setCurrentIndex(prev =>
      dir === 1
        ? (prev + 1) % suggestions.length
        : prev === 0
          ? suggestions.length - 1
          : prev - 1
    );
    startAutoSlide();
  };

  const handleSendRequest = async (userId) => {
    setSuggestions(prev =>
      prev.map(u => u.id === userId ? { ...u, isSending: true } : u)
    );
    try {
      const res = await sendFriendRequest(userId);
      if (res.data.code === 1000) {
        setSuggestions(prev =>
          prev.map(u =>
            u.id === userId
              ? { ...u, isSent: true, isSending: false }
              : u
          )
        );
      }
    } catch {
      setSuggestions(prev =>
        prev.map(u => u.id === userId ? { ...u, isSending: false } : u)
      );
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 260 : -260,
      opacity: 0
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction < 0 ? 260 : -260,
      opacity: 0
    })
  };

  const currentUser = suggestions[currentIndex];

  return (
    <div
      className="
        w-[300px] h-screen p-6 flex flex-col gap-10 overflow-hidden
        bg-linear-to-b from-slate-50 via-slate-100 to-slate-50
        border-l border-slate-200
        shadow-[-2px_0_12px_rgba(0,0,0,0.05)]
      "
    >
      {/* ===== Friend Suggestions ===== */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Gợi ý bạn bè
          </h3>
          <div className="flex gap-3">
            <i
              onClick={() => paginate(-1)}
              className="fa-solid fa-circle-chevron-left text-slate-300 hover:text-indigo-500 cursor-pointer transition"
            />
            <i
              onClick={() => paginate(1)}
              className="fa-solid fa-circle-chevron-right text-slate-300 hover:text-indigo-500 cursor-pointer transition"
            />
          </div>
        </div>

        <div
          className="
            relative h-40 w-full overflow-hidden rounded-3xl
            bg-linear-to-br from-white to-slate-50
            border border-slate-200
            shadow-inner
          "
        >
          <AnimatePresence initial={false} custom={direction}>
            {currentUser ? (
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0 p-5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentUser.avatarUrl || "/default_user_avatar.png"}
                      className="
                        w-14 h-14 rounded-full object-cover
                        ring-2 ring-indigo-100
                        shadow-md
                      "
                    />
                    <div
                      className="
                        absolute -bottom-1 -right-1
                        w-4 h-4 rounded-full
                        bg-indigo-500 border-2 border-white
                        flex items-center justify-center
                      "
                    >
                      <i className="fa-solid fa-plus text-[8px] text-white" />
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <p className="text-[15px] font-semibold text-slate-800 truncate">
                      {currentUser.fullname}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      {currentUser.commonFriendsCount} bạn chung
                    </p>
                  </div>
                </div>

                {currentUser.isSent ? (
                  <div
                    className="
                      w-full py-2.5 rounded-2xl
                      bg-emerald-50 text-emerald-600
                      text-[11px] font-bold text-center
                      border border-emerald-100
                      tracking-wider
                    "
                  >
                    ĐÃ GỬI LỜI MỜI
                  </div>
                ) : currentUser.isSending ? (
                  <div className="w-full py-2.5 bg-slate-100 rounded-2xl flex justify-center">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div
                    onClick={() => handleSendRequest(currentUser.id)}
                    className="
                      w-full py-2.5 rounded-2xl
                      bg-linear-to-r from-indigo-500 to-indigo-600
                      hover:from-indigo-600 hover:to-indigo-700
                      text-white text-[11px] font-bold text-center
                      tracking-wider cursor-pointer
                      active:scale-[0.97]
                      shadow-lg shadow-indigo-200
                      transition
                    "
                  >
                    KẾT BẠN NGAY
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 text-[12px] italic">
                Đang cập nhật...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ===== Friends List ===== */}
      <section className="flex-1 flex flex-col gap-5 overflow-visible">
        <div className="px-1 flex items-baseline gap-2">
          <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Bạn bè
          </h3>
          <span className="text-[14px] font-bold text-indigo-400">
            {listFriends.length}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-y-8 overflow-y-auto no-scrollbar pb-10">
          {listFriends.map(friend => (
            <motion.div
              key={friend.id}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center cursor-pointer group relative z-10 hover:z-50"
            >
              <div className="relative">
                <Avatar
                  size={56}
                  src={friend.avatarUrl || "/default_user_avatar.png"}
                  name={friend.fullname}
                />
                <div
                  className="
                    absolute bottom-0 right-0
                    w-3.5 h-3.5 rounded-full
                    bg-emerald-500 border-2 border-white
                    shadow-sm
                  "
                />
              </div>

              <span
                className="
                  text-[11px] font-semibold text-slate-600
                  mt-3 truncate w-full text-center px-2
                  group-hover:text-indigo-600
                  transition
                "
              >
                {friend.fullname.split(" ").pop()}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
