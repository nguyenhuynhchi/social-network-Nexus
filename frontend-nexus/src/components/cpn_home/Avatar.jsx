export default function Avatar({ size = 50, src, name }) {
  return (
    <div className="relative group inline-block">
      <img
        src={src || "/default_avatar_removebg.png"}
        alt="avatar"
        className="rounded-full object-cover cursor-pointer border border-gray-300"
        style={{ width: size, height: size }}
      />
      {/* Popup nổi */}
      {name && (
        <div
          className="
            absolute top-full mt-2 left-1/2 -translate-x-1/2
            opacity-0 scale-95 pointer-events-none
            group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
            transition-all duration-200
            bg-cyan-300 shadow-lg rounded-xl px-3 py-2
            text-sm font-medium text-gray-800
            whitespace-nowrap z-50
          "
        >
          {name}

          {/* Mũi tên nhỏ
          <div
            className="
              absolute top-full left-1/2 -translate-x-1/2
              w-3 h-3 bg-gray-400 rotate-45
              shadow-md
            "
          /> */}
        </div>
      )}
    </div>
  );
}
