import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";


export const getMyPosts = async (page) => {
  return await httpClient.get(API.MY_POST, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: {
      page: page,
      size: 10,
    },
  });
};

export const getPostsOfOne = async (userId, page) => {
  if (!API.GET_POST_OF_ONE) {
    console.error("Lỗi: API.GET_POST_OF_ONE chưa được định nghĩa trong configuration.js");
    return;
  }

  const url = `${API.GET_POST_OF_ONE}/${userId}`;

  return await httpClient.get(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: {
      page: page,
      size: 10,
    },
  });
};

export const getFriendPosts = async (page) => {
  return await httpClient.get(API.FRIEND_POST, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: {
      page: page,
      size: 10,
    },
  });
};

export const createPost = async (content, file) => {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("file", file); // chỉ cần 1 file

  return await httpClient.post(API.CREATE_POST, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const handlePostReaction = async (postId, reactionType) => {
  const url = `${API.PATCH_POST_REACTION}/${postId}/reaction`;

  return await httpClient.patch(url,
    { type: reactionType },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
};

export const getPostReactions = async (postId) => {
  const url = `${API.GET_POST_REACTIONS}/${postId}/reactions`;

  return await httpClient.get(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};