import React, { useState } from "react";
import {
  IconHome,
  IconChartBar,
  IconBell,
  IconLogout,
  IconUser,
  IconChevronDown,
  IconPencil,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

const EditProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getSidebarItemClass = () => {
    const baseClasses = "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
    return `${baseClasses} text-[#667790] hover:bg-gray-100`;
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r">
        <div className="flex flex-col h-full">

          {/* Logo Bebas Pustaka */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="bg-[url('https://cdn.designfast.io/image/2025-10-28/d0d941b0-cc17-46b2-bf61-d133f237b449.png')] w-[29px] h-[29px] bg-cover bg-center"> 
              </div>
              <h1 className="text-lg font-medium text-[#023048]">Bebas Pustaka</h1>
            </div>
            <div className="w-full border-b border-gray-200"></div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-6 space-y-4 pb-6">
            <a
              href="/dashboard"
              className={getSidebarItemClass()}
            >
              <IconHome size={20} />
              Dashboard
            </a>
            <a
              href="/analytic"
              className={getSidebarItemClass()}
            >
              <IconChartBar size={20} />
              Data Analitik
            </a>
            <a
              href="/konfirmasi"
              className={getSidebarItemClass()}
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

              {/* Header Profile Dropdown */}
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

        {/* CONTENT EDIT PROFILE */}
        <div className="p-8">

          {/* Breadcrumb */}
          <div className="text-md text-gray-500 mb-6 flex items-center">
            <span className="text-gray-400 mr-2">&gt;</span>
            <a href="/profile" className="text-[#667790] text-2xl font-semibold hover:underline">Profile</a>
            <span className="mx-2 text-gray-400">&gt;</span>
            <span className="text-[#023048] font-semibold text-2xl">Edit Profile</span>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border">

            {/* Header Profile Card - Hapus border-b dan sesuaikan padding */}
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

            {/* Tabs (Edit Profile Aktif) - Hapus mt-5 */}
            <div className="flex gap-8 border-b"> 
              {/* Rincian Saya (Non-Aktif) */}
              <a 
                href="/profile" 
                className="pb-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Rincian Saya
              </a>

              {/* Edit Profile (Aktif) */}
              <span className="pb-2 border-b-2 border-[#023048] text-[#023048] font-medium text-sm">
                Edit Profile
              </span>
            </div>

            {/* FORMULIR EDIT PROFILE */}
            <div className="mt-6 space-y-8">

              {/* Edit Profile Utama */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-[#023048]">
                  Edit Profile Utama
                </h3>

                {/* Nama */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Nama<span className="text-[#FF1515]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="Zahrah Purnama Alam"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048]"
                    />
                    <IconPencil size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
                  </div>
                </div>

                {/* Peran */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Peran
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin"
                    readOnly
                    className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Username<span className="text-[#FF1515]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="zhrahprnm"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048]"
                    />
                    <IconPencil size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Edit Password */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-[#023048]">
                  Edit Password
                </h3>

                {/* Password Baru */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Password Baru<span className="text-[#FF1515]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="***********"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048]"
                    />
                    {/* Toggle Eye Icon */}
                    {showPassword ? (
                      <IconEyeOff 
                        size={18} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
                        onClick={togglePasswordVisibility}
                      />
                    ) : (
                      <IconEye 
                        size={18} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Konfirmasi Password<span className="text-[#FF1515]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      defaultValue="***********"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048]"
                    />
                    {/* Toggle Eye Icon */}
                    {showPassword ? (
                      <IconEyeOff 
                        size={18} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
                        onClick={togglePasswordVisibility}
                      />
                    ) : (
                      <IconEye 
                        size={18} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" 
                        onClick={togglePasswordVisibility}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol Aksi - Sesuaikan padding atas */}
              <div className="pt-6 flex justify-end gap-5">
                <button className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Batal
                </button>
                <button className="px-6 py-2 bg-[#023048] text-white rounded-md hover:bg-[#023048]/90">
                  Simpan Perubahan
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;