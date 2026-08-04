import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logIn, isAuthenticated } from "../services/authenticationService";
import LoadingButton from "./AnimationLoading";

import showPasswordIcon from "../assets/showPassword.png";
import hidePasswordIcon from "../assets/hidePassword.png";

export default function Login() {
  const logo = "/logo_nexus_nobackground.png";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await isAuthenticated();
      if (token) {
        navigate("/home");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(""); // Reset lỗi cũ

    try {
      const response = await logIn(email, password);
      // Kiểm tra phản hồi thành công
      if (response.status === 200 || response.ok) {
        navigate("/home");
      }
    } catch (err) {
      // Ưu tiên hiển thị thông báo lỗi lên giao diện thay vì alert
      const msg = err.response?.data?.message || "Email hoặc mật khẩu không chính xác.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4 overflow-hidden">
      <motion.div
        // 1. Cấu hình hiệu ứng lật
        initial={{ rotateY: -90, opacity: 0 }} // Khi vào: lật từ phía sau tới
        animate={{ rotateY: 0, opacity: 1 }}    // Khi đứng yên: phẳng
        exit={{ rotateY: 90, opacity: 0 }}      // Khi chuyển trang: lật ra phía trước
        transition={{ duration: 0.6, ease: "easeInOut" }}

        // 2. Perspective tạo chiều sâu 3D (càng nhỏ càng lật mạnh)
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}

        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-gray-100"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-full flex justify-center h-20 mb-4">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={logo}
              alt="Logo Nexus"
              className="h-full w-auto object-contain" // Giữ tỉ lệ ảnh theo chiều cao h-20
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight text-center">Đăng Nhập</h2>
          <p className="text-gray-400 mt-2 text-sm text-center">
            Vui lòng đăng nhập vào tài khoản Nexus của bạn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email Input */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
              Email đăng nhập
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-black"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1 relative">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-black pr-12"
                placeholder="Abc123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <img
                src={showPassword ? hidePasswordIcon : showPasswordIcon}
                alt="toggle password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 transition"
              />
            </div>
          </div>

          {/* Error Message Animation */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md"
              >
                <p className="text-red-700 text-xs font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Button */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="pt-2"
          >
            <LoadingButton
              loading={loading}
              text="Đăng Nhập"
              loadingText="Đang xác thực..."
              type="submit"
              className="py-4 shadow-lg shadow-blue-100"
            />
          </motion.div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Bạn chưa có tài khoản?{" "}
            <span
              onClick={() => navigate("/registration")}
              className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer transition-colors"
            >
              Đăng ký ngay
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}