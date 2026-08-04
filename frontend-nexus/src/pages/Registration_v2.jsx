import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion"; // Thêm motion
import { registerUser } from "../services/userService";
import LoadingButton from "./AnimationLoading";

import showPasswordIcon from "../assets/showPassword.png";
import hidePasswordIcon from "../assets/hidePassword.png";

export default function Registration() {
   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(false); // Mặc định ẩn pass sẽ hay hơn
   const [formData, setFormData] = useState({
      email: "",
      password: "",
      fullname: "",
      dob: "",
      city: "",
   });

   const [loading, setLoading] = useState(false);
   const [fieldErrors, setFieldErrors] = useState({});
   const [isSubmitted, setIsSubmitted] = useState(false);

   // Hàm cập nhật state chung cho gọn code
   const handleChange = (e) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
   };

   const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setIsSubmitted(true);
      setFieldErrors({});

      const formattedDob = formData.dob ? format(new Date(formData.dob), "yyyy-MM-dd") : "";
      const userData = { ...formData, dob: formattedDob };

      try {
         const response = await registerUser(userData);

         if (response.status === 201 || response.status === 200 || response.ok) {
            console.log("Đăng ký thành công!");
            navigate("/login"); // Chỉ navigate khi chắc chắn thành công
         } else {
            handleBackendErrors(response.data?.message || "Đăng ký thất bại");
         }

      } catch (error) {
         console.error("Lỗi đăng ký:", error);
         if (error.response) {
            const errorMsg = error.response.data?.message || "Đăng ký thất bại";
            handleBackendErrors(errorMsg);
         } else {
            alert("Không thể kết nối đến server");
         }
      } finally {
         setLoading(false);
      }
   };

   const handleBackendErrors = (msg) => {
      // Chuyển message về chữ thường để so sánh chính xác hơn
      const lowerMsg = msg.toLowerCase();

      if (lowerMsg.includes("email")) {
         setFieldErrors({ email: msg });
      } else if (lowerMsg.includes("họ tên") || lowerMsg.includes("fullname")) {
         setFieldErrors({ fullname: msg });
      } else if (lowerMsg.includes("mật khẩu") || lowerMsg.includes("password")) {
         setFieldErrors({ password: msg });
      } else if (lowerMsg.includes("tuổi") || lowerMsg.includes("dob")) {
         setFieldErrors({ dob: msg });
      } else if (lowerMsg.includes("thành phố") || lowerMsg.includes("city")) {
         setFieldErrors({ city: msg });
      } else {
         // Thay vì alert, hãy hiển thị lỗi chung này vào ô Email hoặc một khu vực thông báo tổng
         setFieldErrors({ email: msg });
      }
   };

   // Animation variants cho từng item
   const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
   };

   return (
      // Sửa: Thay items-center bằng py-10 để luôn có khoảng trống trên dưới khi cuộn
      // Thêm: h-screen để cố định vùng nhìn, overflow-y-auto để kích hoạt cuộn
      <div className="flex justify-center h-screen bg-linear-to-br from-blue-50 to-indigo-100 overflow-y-auto py-10 px-4">

         <motion.div
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}

            // Sửa: Loại bỏ my-auto, thêm h-fit để container tự co giãn theo nội dung
            className="w-full max-w-lg h-fit p-8 bg-white rounded-3xl shadow-2xl border border-gray-100"
         >
            <div className="text-center mb-8">
               <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Tạo tài khoản
               </h2>
               <p className="text-gray-500 mt-2">Bắt đầu hành trình cùng Nexus</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-black">
               {/* Các trường input giữ nguyên logic của bạn */}
               <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                  <InputGroup
                     label="Email"
                     id="email"
                     type="email"
                     placeholder="example@gmail.com"
                     value={formData.email}
                     onChange={handleChange}
                     error={isSubmitted && !formData.email ? "Email không được để trống" : fieldErrors.email}
                     required
                  />
               </motion.div>

               <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                  <InputGroup
                     label="Họ và tên"
                     id="fullname"
                     type="text"
                     placeholder="Ví dụ: Nguyễn Huỳnh Chí"
                     value={formData.fullname}
                     onChange={handleChange}
                     error={isSubmitted && !formData.fullname ? "Họ tên không được để trống" : fieldErrors.fullname}
                     required
                  />
               </motion.div>

               <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu <span className="text-red-400">*</span></label>
                  <div className="relative">
                     <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={`w-full p-3 bg-gray-50 text-black border ${fieldErrors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none`}
                        placeholder=" Từ 6 kí tự trở lên, phải có cả chữ và số. Ví dụ: Abc123"
                        value={formData.password}
                        onChange={handleChange}
                     />
                     <img
                        src={showPassword ? hidePasswordIcon : showPasswordIcon}
                        alt="toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer opacity-60 hover:opacity-100 transition"
                     />
                  </div>
                  <ErrorMessage message={isSubmitted && !formData.password ? "Mật khẩu không được để trống" : fieldErrors.password} />
               </motion.div>

               <div className="grid grid-cols-2 gap-4 text-black">
                  <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                     <InputGroup
                        label="Ngày sinh"
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        error={isSubmitted && !formData.dob ? "Trống" : fieldErrors.dob}
                        required
                     />
                  </motion.div>
                  <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                     <InputGroup
                        label="Thành phố"
                        id="city"
                        type="text"
                        placeholder="Trà Vinh"
                        value={formData.city}
                        onChange={handleChange}
                     />
                  </motion.div>
               </div>

               <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
               >
                  <LoadingButton
                     loading={loading}
                     text="Đăng ký ngay"
                     loadingText="Đang tạo tài khoản..."
                     type="submit"
                     className="w-full mt-2"
                  />
               </motion.div>
            </form>

            <div className="mt-8 text-center pb-2">
               <p className="text-gray-600">
                  Đã có tài khoản?{" "}
                  <span
                     onClick={() => navigate("/login")}
                     className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                     Đăng nhập
                  </span>
               </p>
            </div>
         </motion.div>
      </div>
   );
}

// Component phụ cho đỡ lặp code
const InputGroup = ({ label, id, type, value, onChange, placeholder, error, required }) => (
   <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
         {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
         type={type}
         id={id}
         value={value}
         onChange={onChange}
         placeholder={placeholder}
         className={`w-full p-3 bg-gray-50 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none`}
      />
      <ErrorMessage message={error} />
   </div>
);

const ErrorMessage = ({ message }) => (
   <AnimatePresence>
      {message && (
         <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-500 text-xs mt-1 ml-1"
         >
            {message}
         </motion.p>
      )}
   </AnimatePresence>
);