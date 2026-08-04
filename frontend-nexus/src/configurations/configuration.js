export const CONFIG = {
   API_GATEWAY: import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8888/nexus/v1",
   CHAT_SOCKET: import.meta.env.VITE_CHAT_SOCKET_URL || "http://localhost:8099",
};

export const API = {
   // Authentication
   REGISTRATION: "/authentication/users/registration", //POST
   LOGIN: "/authentication/auth/token", // POST
   REFRESH:"/authentication/auth/refresh", // POST
   INTROSPECT:"/authentication/auth/introspect",   // POST

   // Profile
   UPDATE_PROFILE: "/profile/users/update-profile", // PUT
   UPDATE_AVATAR: "/profile/users/set-avatar", // POST
   MY_INFO: "/profile/users/my-profile", // GET
   // ONE_PROFILE_INFO: "/profile/users/of", // GET

   // Post 
   MY_POST: "/post/my-posts", // GET
   GET_POST_OF_ONE: "/post/of", // GET
   FRIEND_POST: "/post/friend-posts", // GET
   CREATE_POST: "/post/create", // POST
   GET_POST_REACTIONS: "/post", // GET
   PATCH_POST_REACTION: "/post", // PATCH

   // Relationship
   FRIEND_REQUEST: "/profile/friends/request", // POST
   ACCEPT_FRIEND: "/profile/friends/accept", // PUT
   PENDING_REQUESTS: "/profile/friends/pending-requests", // GET
   MY_FRIENDS: "/profile/friends", // GET
   SUGGEST_FRIENDS: "/profile/friends/suggestions", // GET
   CANCLE_REQUEST: "/profile/friends/cancel-request", // DELETE
   DECLINE_REQUEST: "/profile/friends/decline-request", // DELETE
   UNFRIEND: "/profile/friends/unfriend", // DELETE

   // Chat
   SEARCH_USER: "/profile/users/search", // POST
   MY_CONVERSATIONS: "/chat/conversations/my-conversations", // GET
   CREATE_CONVERSATION: "/chat/conversations/create", // POST
   CREATE_MESSAGE: "/chat/messages/create", // POST
   GET_CONVERSATION_MESSAGES: "/chat/messages", // GET
};
