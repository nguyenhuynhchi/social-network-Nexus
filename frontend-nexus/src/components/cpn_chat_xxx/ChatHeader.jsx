export default function ChatHeader({ user }) {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-white">
      <img
        src={user.avatarUrl || "default-avatar-url"}
        alt="avatar"
        className="w-10 h-10 rounded-full border"
      />
      <div>
        <p className="font-medium text-black">{user.fullname}</p>
        <p className="text-sm text-gray-500">Active now</p>
      </div>
    </div>
  );
}
