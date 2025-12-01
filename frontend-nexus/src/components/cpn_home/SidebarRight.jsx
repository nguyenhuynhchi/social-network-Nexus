import Avatar from "./Avatar";

export default function SidebarRight() {
  const mockFriends = Array.from({ length: 15 }, () => ({}));

  return (
    <div className="w-[250px] bg-blue-50 h-full p-4 flex flex-col gap-4">

      {/* Vùng trống phía trên */}
      <div className="bg-cyan-200 text-black h-32 rounded">
        Gợi ý bạn bè

      </div>

      <div className="text-lg text-black font-semibold">Bạn bè</div>

      <div className="grid grid-cols-3 gap-3">
        {mockFriends.map((_, i) => (
          <Avatar key={i} size={50} />
        ))}
      </div>
    </div>
  );
}
