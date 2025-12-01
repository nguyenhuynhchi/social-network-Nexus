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

   useEffect(() => {
      if (isAuthenticated()) {
         navigate("/home");
      }
   }, [navigate]);

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [fullname, setFullname] = useState("");
   const [dob, setDob] = useState("");
   const [city, setCity] = useState("");

   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);

      try {
         const response = await logIn(email, password);
         console.log("Registration is actioned")
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
         <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
               Đăng Ký
            </h2>
            <form onSubmit={handleSubmit}>

               {/************** Họ tên ***************/}
               <div className="mb-4">
                  <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
                     Họ tên
                     {fullname.trim() === "" && (
                        <span className="text-red-500 text-sm font-bold mt-1"> *</span>
                     )}
                  </label>
                  <input
                     type="text"
                     id="fullname"
                     className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                     placeholder="Nhập họ tên đầy đủ"
                     value={fullname}
                     onChange={(e) => setFullname(e.target.value)}
                  />
                  {isSubmitted && fullname.trim() === "" && (
                     <p className="text-red-500 text-sm mt-1">Bạn không được bỏ trống họ tên</p>
                  )}
                  {fieldErrors.fullname && fullname.trim() != "" && (
                     <p className="text-red-500 text-sm mt-1">{fieldErrors.fullname}</p>
                  )}
               </div>

               {/************** Mật khẩu ***************/}
               <div className="mb-4 relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                     Mật khẩu
                     {password.trim() === "" && (
                        <span className="text-red-500 text-sm font-bold mt-1"> *</span>
                     )}
                  </label>
                  <input
                     type={showPassword ? "password" : "text"}
                     id="password"
                     className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  {isSubmitted && password.trim() === "" && (
                     <p className="text-red-500 text-sm mt-1">Bạn không được bỏ trống mật khẩu</p>
                  )}
                  {fieldErrors.password && password.trim() != "" && (
                     <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                  )}
               </div>

               {/************** Email ***************/}
               <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                     Email
                     {email.trim() === "" && (
                        <span className="text-red-500 text-sm font-bold mt-1"> *</span>
                     )}
                  </label>
                  <input
                     type="text"
                     id="email"
                     className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                     placeholder="Nhập email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                  />
                  {isSubmitted && email.trim() === "" && (
                     <p className="text-red-500 text-sm mt-1">Bạn không được bỏ trống email</p>
                  )}
                  {fieldErrors.email && email.trim() != "" && (
                     <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                  )}
               </div>

               

               {/************** Ngày sinh ***************/}
               <div className="mb-4">
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                     Ngày sinh
                     {dob.trim() === "" && (
                        <span className="text-red-500 text-sm font-bold mt-1"> *</span>
                     )}
                  </label>
                  <input
                     type="date"
                     id="dob"
                     className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                     value={dob}
                     onChange={(e) => setDob(e.target.value)}
                  />
                  {isSubmitted && dob.trim() === "" && (
                     <p className="text-red-500 text-sm mt-1">Bạn không được bỏ trống ngày sinh</p>
                  )}
                  {fieldErrors.dob && (
                     <p className="text-red-500 text-sm mt-1">{fieldErrors.dob}</p>
                  )}
               </div>

               

               {/* Nút submit */}
               <div>
                  <button
                     type="submit"
                     className="w-full bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                     Đăng Ký
                  </button>
               </div>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
               Đã có tài khoản?{" "}
               <Link to="/dangnhap" className="text-blue-500 hover:underline">
                  Đăng nhập thôi !
               </Link>
            </div>
         </div>
      </div>
   );
};