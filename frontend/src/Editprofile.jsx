import React, { useState } from "react";
import {
  IconHome,
  IconChartBar,
  IconBell,
  IconLogout,
  IconUser,
  IconChevronDown,
  IconPencil, // Ikon untuk edit
  IconEye, // Ikon untuk password
} from "@tabler/icons-react";

// Tentukan menu aktif, sekarang kembali ke 'dashboard'
const activeMenu = 'dashboard';

const EditProfile = () => { 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Fungsi helper untuk menentukan gaya sidebar
  const getSidebarItemClass = (menuName) => {
    const baseClasses = "flex items-center gap-3 p-3 rounded-md font-medium transition-colors";
    
    // Logika gaya diperbarui (seperti di image_01d891.png)
    if (menuName === activeMenu) {
      // Item Aktif: Latar belakang abu-biru terang, Teks putih/gelap tergantung desain final Anda.
      // Saya menggunakan gaya biru tua/abu-abu terang seperti gambar pertama.
      return `${baseClasses} bg-[#627C94] text-white shadow-sm`; 
    } else {
      // Item Non-aktif: Teks abu-abu
      return `${baseClasses} text-[#667790] hover:bg-gray-100`;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">
      
      {/* SIDEBAR - Menggunakan gaya aktif untuk Dashboard */}
      <aside className="w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          
          {/* Logo Bebas Pustaka */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4"> 
              {/* DIV dengan Background Image yang Disediakan */}
              <div 
                className="bg-[url('https://cdn.designfast.io/image/2025-10-28/d0d941b0-cc17-46b2-bf61-d133f237b449.png')] w-[29px] h-[29px] bg-cover bg-center"
              ></div>
              <h1 className="text-lg font-medium text-[#023048]">Bebas Pustaka</h1>
            </div>
            <div className="border-b border-gray-200"></div> 
          </div>
          
          {/* Menu */}
          <nav className="flex-1 px-6 space-y-4 pb-6">
            
            {/* Dashboard (Active) */}
            <a
              href="/dashboard"
              className={getSidebarItemClass('dashboard')} 
            >
              <IconHome size={20} />
              Dashboard
            </a>

            {/* Data Analitik (Inactive) */}
            <a
              href="/analytic"
              className={getSidebarItemClass('analytic')}
            >
              <IconChartBar size={20} />
              Data Analitik
            </a>

            {/* Konfirmasi Data (Inactive) */}
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
        
        {/* NAVBAR (Tetap sama) */}
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
              
              <div className="flex items-center gap-3 p-4 border-b">
                <IconUser size={24} className="text-gray-500" />
                <div>
                  <p className="font-semibold text-sm text-[#023048]">
                    Zahrah Purnama
                  </p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <a
                  href="/profile"
                  className="flex items-center gap-3 p-2 text-sm text-[#023048] hover:bg-gray-100 rounded-md"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <IconUser size={18} className="text-gray-500" />
                  Profile
                </a>

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

        {/* CONTENT EDIT PROFILE - MODIFIKASI DIMULAI DI SINI */}
        <div className="p-8">
          
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            <span className="text-[#023048] font-medium">Profile</span>
            <span className="mx-2">&gt;</span>
            <span className="text-[#023048] font-medium">Edit Profile</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            
            {/* Header Profile Card (Tetap sama) */}
            <div className="flex items-center gap-4 pb-5 border-b">
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

            {/* Tabs (Edit Profile Aktif) */}
            <div className="flex gap-8 mt-5 border-b">
              <button className="pb-2 text-gray-500 hover:text-gray-700">
                Rincian Saya
              </button>

              <button className="pb-2 border-b-2 border-[#023048] text-[#023048] font-medium">
                Edit Profile
              </button>
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
                    Nama*
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
                    Username*
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
                    Password Baru*
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      defaultValue="***********"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048]"
                    />
                    <IconEye size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Konfirmasi Password*
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      defaultValue="***********"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048]"
                    />
                    <IconEye size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 flex justify-end gap-3 border-t">
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

export default Editprofile;