import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Link } from "react-router-dom";


import { registerUser } from "../services/userService";

import LoadingButton from "./AnimationLoading";
// import "tailwindcss";

import showPasswordIcon from "../assets/showPassword.png";
import hidePasswordIcon from "../assets/hidePassword.png";

export default function Registration() {

   const logo = "/logo_nexus_nobackground.png";
   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(true);  // Ẩn hiện password

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [fullname, setFullname] = useState("");
   const [dob, setDob] = useState("");
   const [city, setCity] = useState("");

   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
   const [loading, setLoading] = useState(false);
   const [fieldErrors, setFieldErrors] = useState({});
   const [isSubmitted, setIsSubmitted] = useState(false);

   const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setIsSubmitted(true); // Bật kiểm tra lỗi trống
      console.log("Đăng ký được kích hoạt");

      const formattedDob = dob ? format(new Date(dob), "yyyy-MM-dd") : "";

      const userData = {
         email,
         password,
         fullname,
         dob: formattedDob,
         city,
      };

      try {
         const response = await registerUser(userData);
         console.log("Response body:", response.data);
         navigate("/login");

         if (!response.ok) {
            // Gán lỗi theo từng trường
            const errorMsg = response.data.message || "Đăng ký thất bại";
            let fieldErrs = {};

            if (errorMsg.toLowerCase().includes("email")) {
               fieldErrs.email = errorMsg;
            } else if (errorMsg.toLowerCase().includes("password")) {
               fieldErrs.password = errorMsg;
            } else if (errorMsg.toLowerCase().includes("fullname")) {
               fieldErrs.fullname = errorMsg;
            } else if (errorMsg.toLowerCase().includes("dob")) {
               fieldErrs.dob = errorMsg;
            } else if (errorMsg.toLowerCase().includes("city")) {
               fieldErrs.city = errorMsg;
            }

            setFieldErrors(fieldErrs);
            return; // Ngưng xử lý tiếp
         }

      } catch (error) {
         if (error.response) {
            // Lỗi từ backend trả về
            alert(error.response.data.message);
         } else if (error.request) {
            // Request gửi đi nhưng không nhận được response
            alert("Không thể kết nối đến server. Vui lòng kiểm tra lại backend.");
         } else {
            alert("Có lỗi xảy ra: " + error.message);
         }
      } finally {
         setLoading(false);
      }


   };

   return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-500">
         <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
               Đăng Ký
            </h2>
            <form onSubmit={handleSubmit}>

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
                     className="w-full mt-1 p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                     className="w-full mt-1 p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                     className="w-full mt-1 p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                     className="w-full mt-1 p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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

               {/************** City ***************/}
               <div className="mb-4">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                     Thành phố
                  </label>
                  <input
                     type="text"
                     id="city"
                     className="w-full mt-1 p-3 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                     placeholder="Nhập tên thành phố bạn sinh sống"
                     value={city}
                     onChange={(e) => setCity(e.target.value)}
                  />
                  {/* {isSubmitted && fullname.trim() === "" && (
                     <p className="text-red-500 text-sm mt-1">Bạn không được bỏ trống họ tên</p>
                  )}
                  {fieldErrors.fullname && fullname.trim() != "" && (
                     <p className="text-red-500 text-sm mt-1">{fieldErrors.fullname}</p>
                  )} */}
               </div>

               {/* Nút submit */}
               <div>
                  {/* <button
                     type="submit"
                     className="w-full bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                     Đăng Ký
                  </button> */}
                  <LoadingButton
                     loading={loading}
                     text="Đăng ký"
                     loadingText="Đang đăng nhập..."
                     type="submit"
                  />
               </div>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
               Đã có tài khoản?{" "}
               <div onClick={() => navigate("/login")} className="text-blue-500 hover:text-blue-800 cursor-pointer inline">
                  Đăng nhập thôi !
               </div>
            </div>
         </div>
      </div>
   );
};