import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { getMyFriends } from "../../services/friendshipService.js";

export default function SidebarRight() {

  const [listFriends, setListFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await getMyFriends();
        if (res?.data.code === 1000) {
          setListFriends(res.data.result);
        }
        else {
          console.error("Lấy danh sách bạn bè thất bại:", res.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách bạn bè:", error);
      }
    };

    fetchFriends();
  }, []);

  return (
    <div className="w-[250px] bg-gray-100 h-full p-4 flex flex-col gap-4">

      {/* Vùng trống phía trên */}
      <div className="bg-cyan-200 text-black h-32 rounded">
        Gợi ý bạn bè

      </div>

      <div className="text-lg text-black font-semibold">Bạn bè</div>

      <div className="grid grid-cols-3 gap-3">
        {listFriends.map((friend) => (
          <Avatar
            // key={friend.id}
            size={50}
            src={friend.avatarUrl || "/default_user_avatar.png"}
            name={friend.fullname}
          />
        ))}
      </div>
    </div>
  );
}
