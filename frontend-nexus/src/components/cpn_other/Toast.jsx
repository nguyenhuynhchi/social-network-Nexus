import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-gray-700";

  return (
    <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-xl z-50`}>
      {message}
    </div>
  );
}
