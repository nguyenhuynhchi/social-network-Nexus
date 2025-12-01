import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { logIn, isAuthenticated } from "../services/authenticationService";
import LoadingButton from "./AnimationLoading";
import "tailwindcss";

import showPasswordIcon from "../assets/showPassword.png";
import hidePasswordIcon from "../assets/hidePassword.png";

export default function Login() {

  const logo = "/vite.svg";
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     navigate("/home");
  //   }
  // }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await isAuthenticated();   // ⬅️ CHỜ token

      if (token) {
        navigate("/home");
      }
      // nếu token null → không điều hướng → người dùng ở lại trang login
    };

    checkAuth();
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await logIn(email, password);
      console.log("Login is actioned")
      console.log("Response body:", response.data);
      navigate("/home");
    } catch (error) {
      if (error.response) {
        // Lỗi từ backend trả về
        alert(error.response.data.message);
      } else if (error.request) {
        // Request gửi đi nhưng không nhận được response
        alert("Không thể kết nối đến server. Vui lòng kiểm tra lại backend.");
      } else {
        // Lỗi khác (ví dụ: logIn() bug)
        alert("Có lỗi xảy ra: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-500">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="w-24 h-24" />
        </div>
        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Nhập</h2>
        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {/* Success Message */}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email đăng nhập
            </label>
            <input
              type="text"
              id="email"
              className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-400"
              placeholder="Nhập tên đăng nhập"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Password Input */}
          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-400 pr-10"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Icon con mắt */}
            <img
              src={showPassword ? hidePasswordIcon : showPasswordIcon}
              alt="toggle password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] w-6 h-6 cursor-pointer"
            />
          </div>
          {/* Submit Button */}
          <LoadingButton
            loading={loading}
            text="Đăng Nhập"
            loadingText="Đang đăng nhập..."
            type="submit"
          />
        </form>
        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Bạn chưa có tài khoản?{" "}
          {/* <Link to="/dangky" className="text-blue-500 hover:underline">
            Đăng ký ngay !
          </Link> */}
        </div>
      </div>
    </div>
  );
};