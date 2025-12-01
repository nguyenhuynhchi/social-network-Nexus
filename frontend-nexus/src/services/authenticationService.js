import { getToken, removeToken, setToken } from "./localStorageService";
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

export const logIn = async (email, password) => {
   const response = await httpClient.post(API.LOGIN, {
      email: email,
      password: password,
   });

   setToken(response.data?.result?.token);

   return response;
};

export const logOut = () => {
   removeToken();
};


let refreshPromise = null;

export const isAuthenticated = async () => {

   let token = getToken();

   // Nếu có token và hợp lệ thì return luôn
   if (token && await isTokenValid(token)) {
      console.log("Token hợp lệ → không cần refresh");
      return token;
   }

   // Nếu refresh đang chạy thì chờ Promise đó
   if (refreshPromise) {
      console.log("Đang đợi refresh đang chạy...");
      return refreshPromise;
   }

   // Tự refresh mới
   console.log("Bắt đầu refresh token...");

   refreshPromise = refreshToken().finally(() => {
      refreshPromise = null;   // set lại null khi xong
   });

   return refreshPromise;
};

const refreshToken = async () => {
   const oldToken = getToken();
   if (!oldToken) return null;   // Không có token cũ

   try {
      const response = await httpClient.post(API.REFRESH, {
         token: oldToken,
      });

      const json = response.data;

      if (response.status !== 200 || json.code !== 1000) {
         removeToken();
         return null;
      }

      const newToken = json.result.token;
      setToken(newToken);
      return newToken;

   } catch {
      removeToken();
      return null;
   }
};


export const isTokenValid = async (token) => {
   if (!token) return false;  // Không có token

   try {
      const response = await httpClient.post(API.INTROSPECT, { token });
      return response.data?.result?.valid === true;
   } catch {
      return false;
   }
}

