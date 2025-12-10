import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const sendFriendRequest = async (profileId) => {
   return await httpClient.post(
      API.FRIEND_REQUEST,
      { profileId: profileId },
      {
         headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
         },
      }
   );
}

export const acceptFriendRequest = async (profileId) => {
   return await httpClient.put(
      API.ACCEPT_FRIEND,
      { profileId: profileId },
      {
         headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
         },
      }
   );
}

export const declineFriendRequest = async (profileId) => {
   return await httpClient.delete(
      API.DECLINE_REQUEST,
      { profileId: profileId },
      {
         headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
         },
      });
}

export const getPendingRequests = async () => {
   return await httpClient.get(
      API.PENDING_REQUESTS, {
      headers: {
         Authorization: `Bearer ${getToken()}`,
      },
   });
}

export const cancelFriendRequest = async (profileId) => {
   return await httpClient.delete(
      API.CANCLE_REQUEST,
      { profileId: profileId },
      {
         headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
         },
      });
}

export const getMyFriends = async () => {
   return await httpClient.get(
      API.MY_FRIENDS, {
      headers: {
         Authorization: `Bearer ${getToken()}`,
      },
   });
}
