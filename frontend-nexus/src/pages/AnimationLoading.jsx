import "tailwindcss";

export default function LoadingButton({ loading, text, loadingText, ...props }) {
  return (
    <button
      {...props}
      disabled={loading}
      className={`w-full bg-blue-500 text-white p-3 rounded-lg font-medium 
                  hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          {/* Spinner */}
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          
          {/* Loading text */}
          {loadingText || "Đang xử lý..."}
        </div>
      ) : (
        text
      )}
    </button>
  );
}
