import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getMyInfo } from "../services/userService.js";
import { logOut } from "../services/authenticationService.js";

export default function Navbar() {
  const [userInfo, setUserInfo] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getMyInfo();
        setUserInfo(response.data.result);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchInfo();
  }, []);

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `
    relative group flex flex-col items-center justify-center
    transition-all duration-300
    ${isActive ? "text-white" : "text-white/70 hover:text-white"}
  `;

  const iconClass = (isActive) =>
    `
    text-2xl
    transition-transform duration-300
    group-hover:scale-110
    ${isActive ? "scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" : ""}
  `;

  return (
    <div className="w-full bg-blue-400 flex items-center border-b border-blue-500 px-6 py-3">

      {/* Logo */}
      <div className="w-60">
        <img
          src="/logo_nexus_nobackground.png"
          alt="logo"
          className="h-12 object-contain"
        />
      </div>

      {/* Navigation icons */}
      <div className="flex ml-auto flex-1 justify-evenly">
        <NavLink to="/home" className={navItemClass}>
          {({ isActive }) => (
            <>
              <i
                className={`
            fa-solid fa-house
            text-2xl
            transition-all duration-300
            group-hover:scale-110
            ${isActive
                    ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                    : "text-white/80"}`}
              />
              <span
                className={`
            absolute -bottom-2 h-[3px] rounded-full bg-white
            transition-all duration-300
            ${isActive
                    ? "w-6 opacity-100"
                    : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-80"}`}
              />
            </>
          )}
        </NavLink>

        <NavLink to="/friendship" className={navItemClass}>
          {({ isActive }) => (
            <>
              <i
                className={`
            fa-solid fa-users
            text-2xl
            transition-all duration-300
            group-hover:scale-110
            ${isActive
                    ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                    : "text-white/80"}`}
              />
              <span
                className={`
            absolute -bottom-2 h-[3px] rounded-full bg-white
            transition-all duration-300
            ${isActive
                    ? "w-6 opacity-100"
                    : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-80"}
          `}
              />
            </>
          )}
        </NavLink>

        <NavLink to="/chat" className={navItemClass}>
          {({ isActive }) => (
            <>
              <i
                className={`
            fa-solid fa-comments
            text-2xl
            transition-all duration-300
            group-hover:scale-110
            ${isActive
                    ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                    : "text-white/80"}
          `}
              />
              <span
                className={`
            absolute -bottom-2 h-[3px] rounded-full bg-white
            transition-all duration-300
            ${isActive
                    ? "w-6 opacity-100"
                    : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-80"}
          `}
              />
            </>
          )}
        </NavLink>
      </div>


      {/* User info */}
      <div className="w-[280px] flex items-center justify-end relative">
        <div className="flex flex-col items-end mr-3 text-right">
          <span className="text-white text-sm font-semibold leading-tight">
            Xin chào, {userInfo?.fullname || "..."}
          </span>
          <span className="text-white/80 text-xs">
            {userInfo?.email || "...@gmail.com"}
          </span>
        </div>

        <img
          src={userInfo?.avatarUrl || "/default_user_avatar.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover cursor-pointer ring-2 ring-white/50 hover:ring-white transition-all"
          onClick={() => setOpenMenu(!openMenu)}
        />

        {openMenu && (
          <div className="absolute right-0 top-full mt-3 w-52 bg-white rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
            <NavLink
              to="/personal-page"
              onClick={() => setOpenMenu(false)}
              className="block px-5 py-3 hover:bg-gray-100 text-gray-700 font-medium"
            >
              Trang cá nhân
            </NavLink>
            <div
              onClick={handleLogout}
              className="w-full text-left px-5 py-3 hover:bg-gray-100 text-red-500 font-medium cursor-pointer"
            >
              Đăng xuất
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
