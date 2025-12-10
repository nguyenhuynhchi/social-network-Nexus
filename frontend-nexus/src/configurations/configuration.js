export const CONFIG = {
   API_GATEWAY: "http://localhost:8888/nexus/v1",
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

   // Post 
   MY_POST: "/post/my-posts", // GET
   FRIEND_POST: "/post/friend-posts", // GET
   CREATE_POST: "/post/create", // POST

   // Relationship
   FRIEND_REQUEST: "/profile/friends/request", // POST
   ACCEPT_FRIEND: "/profile/friends/accept", // PUT
   PENDING_REQUESTS: "/profile/friends/pending-requests", // GET
   MY_FRIENDS: "/profile/friends", // GET
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