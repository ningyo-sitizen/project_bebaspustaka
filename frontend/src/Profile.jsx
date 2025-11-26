
import React, { useState } from "react";
import {
  IconHome,
  IconChartBar,
  IconBell,
  IconLogout,
  IconUser,
  IconChevronDown,
} from "@tabler/icons-react";

const Profile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fungsi helper untuk menentukan gaya sidebar
  const getSidebarItemClass = () => {
    const baseClasses = "flex items-center gap-3 p-3 rounded-md font-medium transition-colors";

    // SEMUA MENU SIDEBAR NON-AKTIF (PUTIH/DEFAULT)
    return `${baseClasses} text-[#667790] hover:bg-gray-100`;
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">
      <aside className="w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[url('https://cdn.designfast.io/image/2025-10-28/d0d941b0-cc17-46b2-bf61-d133f237b449.png')] w-[29px] h-[29px] bg-cover bg-center">       
                </div>
              <h1 className="text-lg font-medium text-[#023048]">Bebas Pustaka</h1>
            </div>
            <div className="w-full border-b border-gray-200"></div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-6 pt-3 space-y-6 pb-6">
            <a
              href="/dashboard"
              className={getSidebarItemClass('dashboard')}
            >
              <IconHome size={20} />
              Dashboard
            </a>
            <a
              href="/analytic"
              className={getSidebarItemClass('analytic')}
            >
              <IconChartBar size={20} />
              Data Analitik
            </a>
            <a
              href="/konfirmasi"
              className={getSidebarItemClass('konfirmasi')}
            >
              <IconBell size={20} />
              Konfirmasi Data
            </a>
          </nav>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1">

        {/* NAVBAR */}
        <header className="w-full bg-white border-b p-4 flex justify-end relative">

          <div
            className="flex items-center gap-2 cursor-pointer pr-4 relative"
            onClick={toggleDropdown}
          >
            <IconChevronDown size={18} className="text-gray-600" />

            <p className="font-semibold text-sm text-[#023048] select-none">
              Hai, Zahrah Purnama
            </p>

            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
              <IconUser size={24} className="text-gray-500" />
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-4 top-full mt-2 w-64 bg-white rounded-md shadow-lg border z-10">

              {/* Header Profile Dropdown (Default/Putih) */}
              <div className="flex items-center gap-3 p-4 border-b">
                <IconUser size={24} className="text-gray-500" />
                <div>
                  <p className="font-semibold text-sm text-[#023048]">
                    Zahrah Purnama
                  </p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>

              {/* Menu Dropdown */}
              <div className="p-2 space-y-1">
                <a
                  href="/profile"
                  className="flex items-center gap-3 p-2 text-sm bg-[#667790] text-white rounded-md"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <IconUser size={18} className="text-white" />
                  Profile
                </a>

                {/* Keluar (Logout) Link */}
                <a
                  href="/logout"
                  className="flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <IconLogout size={18} />
                  Keluar
                </a>
              </div>
            </div>
          )}
        </header>

        {/* CONTENT PROFILE */}
        <div className="p-8">
          <h1 className="text-2xl font-semibold mb-6 text-[#023048]">Profile</h1>

          <div className="bg-white rounded-xl shadow-sm p-6 border">

            {/* Header Profile Card */}
            <div className="flex items-center gap-4 pb-5">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <IconUser size={50} className="text-gray-500" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#023048]">
                  Zahrah Purnama Alam
                </h2>
                <p className="text-sm text-gray-500">Admin</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mt-5 border-b">
              <button className="pb-2 border-b-2 border-[#023048] text-[#023048] font-medium text-sm">
                Rincian Saya
              </button>
              <button className="pb-2 text-gray-500 hover:text-gray-700 text-sm">
                Edit Profile
              </button>
            </div>

            {/* Profile Detail Content */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-[#023048]">
                Profile Utama
              </h3>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="font-medium">Nama :</p>
                  <p className="text-gray-700 mt-1">Zahrah Purnama Alam</p>
                </div>

                <div>
                  <p className="font-medium">Peran :</p>
                  <p className="text-gray-700 mt-1">Admin</p>
                </div>

                <div>
                  <p className="font-medium">Username :</p>
                  <p className="text-gray-700 mt-1">zhrahprnm</p>
                </div>

                <div>
                  <p className="font-medium">Password :</p>
                  <p className="text-gray-700 mt-1">********</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;