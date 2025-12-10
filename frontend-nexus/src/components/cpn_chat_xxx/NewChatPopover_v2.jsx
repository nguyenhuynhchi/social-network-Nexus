import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

import { search as searchUsers } from "../../services/userService";

const NewChatPopover = ({ open, onClose, onSelectUser }) => {
   const [searchQuery, setSearchQuery] = useState("");
   const [loading, setLoading] = useState(false);
   const [searchResults, setSearchResults] = useState([]);
   const [hasSearched, setHasSearched] = useState(false);
   const [error, setError] = useState(null);

   const handleSearch = useCallback(
      async (query) => {
         if (!query?.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
         }

         setLoading(true);
         setHasSearched(true);
         setError(null);

         try {
            const response = await searchUsers(query.trim());
            if (response?.data?.result) {
               setSearchResults(response.data.result);
            } else {
               setSearchResults([]);
            }
         } catch (err) {
            console.error("Error searching users:", err);
            setError("Failed to search users. Please try again.");
            setSearchResults([]);
         } finally {
            setLoading(false);
         }
      }, []);

   useEffect(() => {
      const timeout = setTimeout(() => {
         if (searchQuery) {
            handleSearch(searchQuery);
         } else {
            setSearchResults([]);
            setHasSearched(false);
            setError(null);
         }
      }, 600);

      return () => clearTimeout(timeout);
   }, [searchQuery, handleSearch]);

   const handleClearSearch = () => {
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
   };

   const handleUserSelect = (user) => {
      onSelectUser(user);
      handleClearSearch();
      onClose();
   };

   if (!open) return null;

   return (
      <div
         className="fixed inset-0 z-40 bg-black/10"
         onClick={onClose}
      >
         <div
            className="absolute right-4 top-20 bg-white border border-gray-200 rounded-xl shadow-xl w-80 p-4 z-50"
            onClick={(e) => e.stopPropagation()}
         >
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
               Start a new conversation
            </h2>

            {/* Search input */}
            <div className="relative mb-4">
               {/* Icon search */}
               <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

               <input
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
               />

               {/* Clear button */}
               {searchQuery && (
                  <button
                     onClick={handleClearSearch}
                     className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                     <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
               )}
            </div>

            <div className="h-72 overflow-y-auto">

               {/* Loading */}
               {loading && (
                  <div className="flex justify-center py-6">
                     <i className="fa-solid fa-spinner fa-spin text-blue-500 text-2xl"></i>
                  </div>
               )}

               {/* Error */}
               {!loading && error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
                     {error}
                  </div>
               )}

               {/* Results list */}
               {!loading && !error && searchResults.length > 0 && (
                  <ul className="divide-y divide-gray-100">
                     {searchResults.map((user) => (
                        <li
                           key={user.id}
                           onClick={() => handleUserSelect(user)}
                           className="flex items-center p-2 cursor-pointer rounded-md hover:bg-gray-100 transition"
                        >
                           <img
                              src={user.avatarUrl || "/default-avatar.png"}
                              alt={user.fullname}
                              className="w-10 h-10 rounded-full object-cover mr-3"
                           />

                           <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                 {user.fullname}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                 {user.email}
                              </p>
                           </div>
                        </li>
                     ))}
                  </ul>
               )}

               {/* No results */}
               {!loading && !error && searchResults.length === 0 && hasSearched && (
                  <div className="text-center text-gray-500 py-4">
                     No users found for "{searchQuery}"
                  </div>
               )}

               {/* Initial help text */}
               {!loading && !error && !hasSearched && (
                  <div className="text-center text-gray-500 py-4">
                     Search for a user to begin chatting
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

NewChatPopover.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   onSelectUser: PropTypes.func.isRequired,
};

export default NewChatPopover;
