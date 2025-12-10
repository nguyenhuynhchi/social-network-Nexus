import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyInfo } from "../../services/userService.js";
import { logOut } from "../../services/authenticationService.js";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Navbar() {

  const [userInfo, setUserInfo] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getMyInfo();
        console.log("My info:", response);
        setUserInfo(response.data.result);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchInfo();
  }, []);

  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/login");
    logOut();
  }

  const toggleMenu = () => {
    const newState = !openMenu;
    setOpenMenu(newState);
  };

  return (
    <div className="w-full bg-blue-400 flex items-center border-b-2 border-gray-500 px-4 py-3">

      <div className="w-[250px]">
        <img
          src="../../src/assets/logo_nexus_nobackground.png"
          alt="logo"
          className="h-12 object-contain"
        />
      </div>

      <div className="flex ml-auto flex-1 text-2xl justify-evenly w-full">
        <Link to="/home"><i className="fa-solid fa-house text-white cursor-pointer"></i></Link>
        <i className="fa-solid fa-users text-white cursor-pointer"></i>
        <Link to="/chat"><i className="fa-solid fa-comments text-white cursor-pointer"></i></Link>
      </div>

      <div className="w-[250px]">
        <img
          src={userInfo?.avatarUrl || "/default_avatar_removebg.png"}
          alt="avatar"
          className="w-12 h-12 float-right rounded-full object-cover"
          onClick={toggleMenu}
        />

        {openMenu && (
          <div className="dropdown-menu absolute right-0 mt-14 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
            <ul>
              <li
                className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                <Link to="/"
                  onClick={() => setOpenMenu(false)}
                >
                  Trang cá nhân
                </Link>
              </li>
              <li
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
                onClick={handleLogout}>
                Đăng xuất
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
