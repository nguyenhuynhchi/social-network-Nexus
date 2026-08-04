export default function LoadingButton({ loading, text, loadingText, className, ...props }) {
  // Thêm 'appearance-none' và 'border-none' để xóa bỏ style mặc định của trình duyệt
  const defaultStyles = "w-full bg-blue-500 text-white p-3 rounded-xl font-medium flex justify-center items-center hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 border-none outline-none appearance-none";

  return (
    <button
      {...props}
      disabled={loading}
      className={`${defaultStyles} ${className || ""}`}
      // Thêm style trực tiếp nếu CSS Tailwind vẫn bị lỗi build
      style={{ backgroundColor: !loading ? '#3b82f6' : undefined }}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {loadingText || "Đang xử lý..."}
        </div>
      ) : (
        text
      )}
    </button>
  );
}