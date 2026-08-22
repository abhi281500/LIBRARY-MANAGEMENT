import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Abhi sirf login page par bhej rahe hain.
    // Tumhara actual logout logic baad mein auth context ke saath connect karenge.
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      
      {/* Left */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Library Management
        </h2>

        <p className="text-xs text-gray-500">
          Manage your library efficiently
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        
        {/* Notification */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          🔔
          
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            O
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              Library Owner
            </p>

            <p className="text-xs text-gray-500">
              Owner
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Logout
        </button>

      </div>
    </header>
  );
}

export default Topbar;