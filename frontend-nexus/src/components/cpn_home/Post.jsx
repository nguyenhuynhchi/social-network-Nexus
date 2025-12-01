import React, { forwardRef } from "react";

const Post = forwardRef(({ post }, ref) => {
  const { fullname, created, content, fileUrl, avatarUrl } = post;

  // Kiểm tra file là ảnh hay video
  const isVideo = fileUrl?.match(/\.(mp4|mov|avi|mkv)$/i);

  return (
    <div
      ref={ref}
      className="w-full bg-gray-200 p-4 rounded-lg shadow mb-4 flex flex-row gap-3"
    >
      {/* Avatar */}
      <div>
        <img
          src={avatarUrl || "https://i.pravatar.cc/150?img=1"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Name + Time */}
        <div className="flex flex-col w-fit">
          <span className="font-semibold text-black text-[14px]">{fullname}</span>
          <span className="text-gray-600 text-[14px]">{created}</span>
          <hr className="border-t border-black w-full mt-1" />
        </div>

        {/* <hr className="bg-black h-[1.5px] w-[100px]" /> */}

        {/* Text Content */}
        <div className="mt-2 text-[14px] text-black font-medium">{content}</div>

        {/* Image or Video */}
        {fileUrl && (
          <div className="mt-3">
            {isVideo ? (
              <video
                src={fileUrl}
                controls
                className="rounded-lg w-full max-h-[450px] object-cover"
              />
            ) : (
              <img
                src={fileUrl}
                alt="post media"
                className="rounded-lg w-full object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default Post;
