import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import {
  IconHome,
  IconChartBar,
  IconBell,
  IconLogout,
  IconUser,
  IconChevronDown,
  IconMenu2,
  IconTrash, 
  IconUsers,
  IconHistory, 
  IconPlus,
  IconLayoutGrid, 
  IconList,
} from "@tabler/icons-react";

const UserControl = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  const [viewMode, setViewMode] = useState('grid'); 

  const [users, setUsers] = useState([
    { id: 1, name: "Zahrah Purnama Alam", username: "zhrahprnm", role: "Admin" },
    { id: 2, name: "Budi Santoso", username: "budis", role: "Admin" },
    { id: 3, name: "Citra Dewi", username: "citrad", role: "Admin" },
    { id: 4, name: "Doni Pratama", username: "donip", role: "Editor" },
    { id: 5, name: "Eka Putri", username: "ekap", role: "Viewer" },
  ]);
  
  const [profileData, setProfileData] = useState({
      name: "Zahrah Purnama",
      role: "Admin",
      photo: "https://i.ibb.co/C07X0Q0/dummy-profile.jpg", 
  });

  const navigate = useNavigate();
  
  // --- HANDLERS ---
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDeleteUser = async (userId) => {
      if (window.confirm(`Apakah Anda yakin ingin menghapus user ID ${userId}?`)) {
          setUsers(users.filter(user => user.id !== userId));
          alert(`User ID ${userId} berhasil dihapus.`);
      }
  };

  // --- UTILITY CLASS ---
  
  const getSidebarItemClass = (isActive = false) => {
    const baseClasses =
      "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
    return isActive 
      ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold` 
      : `${baseClasses} text-[#667790] hover:bg-gray-100`; 
  };

  // --- RENDER COMPONENT ---

  if (loading) {
      return (
          <div className="flex justify-center items-center min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">
              <p>Memuat Data...</p>
          </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">
      
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:h-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[url('https://cdn.designfast.io/image/2025-10-28/d0d941b0-cc17-46b2-bf61-d133f237b449.png')] w-[29px] h-[29px] bg-cover bg-center"></div>
              <h1 className="text-lg font-medium text-[#023048]">Bebas Pustaka</h1>
            </div>
            <div className="w-full border-b border-gray-200"></div>
          </div>

          <nav className="flex-1 px-6 pt-3 space-y-4 pb-6">
            <a href="/dashboard" className={getSidebarItemClass()}>
              <IconHome size={20} />
              Dashboard
            </a>
            <a href="/analytic" className={getSidebarItemClass()}>
              <IconChartBar size={20} />
              Data Analitik
            </a>
            <a href="/konfirmasi" className={getSidebarItemClass()}>
              <IconBell size={20} />
              Konfirmasi Data
            </a>
            <a href="/user-control" className={getSidebarItemClass(true)}>
              <IconUsers size={20} />
              User Control
            </a>
            <a href="/history" className={getSidebarItemClass()}>
              <IconHistory size={20} />
              History
            </a>
          </nav>
        </div>
      </aside>
      
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 lg:ml-0"> 

        {/* NAVBAR */}
        <header className="w-full bg-white border-b p-4 flex justify-between lg:justify-end relative z-20">
            <button
                className="lg:hidden text-[#023048]"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
            >
                <IconMenu2 size={24} />
            </button>
            <div
            className="flex items-center gap-2 cursor-pointer pr-4 relative"
            onClick={toggleDropdown}
            >
                <IconChevronDown size={18} className="text-gray-600" />
                <p className="font-semibold text-sm text-[#023048] select-none hidden sm:block"> 
                Hai, {profileData.name.split(" ")[0]} 
                </p>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 overflow-hidden">
                    <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
            {isDropdownOpen && (
                <div className="absolute right-4 top-full mt-2 w-64 bg-white rounded-md shadow-lg border z-30"> 
                    <div className="flex items-center gap-3 p-4 border-b">
                        <IconUser size={24} className="text-gray-500" />
                        <div>
                            <p className="font-semibold text-sm text-[#023048]">
                                {profileData.name}
                            </p>
                            <p className="text-xs text-gray-500">{profileData.role}</p>
                        </div>
                    </div>
                    <div className="p-2 space-y-1">
                        <button 
                            onClick={() => navigate("/profile")}
                            className="flex items-center gap-3 p-2 w-full text-left text-sm hover:bg-gray-100 rounded-md text-gray-700"
                        >
                            <IconUser size={18} />
                            Profile
                        </button>
                        <a
                            href="/logout"
                            className="flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                            <IconLogout size={18} />
                            Keluar
                        </a>
                    </div>
                </div>
            )}
        </header>

        {/* MAIN USER CONTROL CONTENT */}
        <div className="p-4 sm:p-8"> 
            
          <div className="flex justify-between items-start mb-6"> 
            <div>
                <h1 className="text-xl font-semibold text-[#023048]">Kontrol Pengguna</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Fitur User Control memungkinkan admin menambah dan menghapus akun pengguna sesuai kebutuhan sistem.
                </p>
            </div>

            {/* IKON TAMPILAN DATA */}
            <div className="flex-shrink-0 flex items-center mt-2 sm:mt-0"> 
              <button 
                  onClick={() => setViewMode('grid')}
                  className={`w-10 h-10 border rounded-lg flex items-center justify-center ${
                      viewMode === 'grid' 
                      ? 'bg-[#023048] text-white border-[#023048] shadow-sm' 
                      : 'bg-white text-[#667790] border-gray-300 hover:bg-gray-50'
                  } transition duration-150`}
                  aria-label="Tampilan Grid"
              >
                <IconLayoutGrid size={20} />
              </button>
              <button 
                  onClick={() => setViewMode('list')}
                  className={`w-10 h-10 border rounded-lg flex items-center justify-center ml-3 ${
                      viewMode === 'list' 
                      ? 'bg-[#023048] text-white border-[#023048] shadow-sm' 
                      : 'bg-white text-[#667790] border-gray-300 hover:bg-gray-50'
                  } transition duration-150`}
                  aria-label="Tampilan List"
              >
                <IconList size={20} />
              </button>
            </div>
          </div>
          
          {/* USER CARD GRID/LIST */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {users.map(user => (
                  // ⭐️ CARD REVISI FINAL ANTI BERANTAKAN ⭐️
                  <div key={user.id} className="relative bg-white rounded-md shadow-sm border border-gray-200 pl-4 pr-4 py-3 flex items-start justify-between">
                      {/* Garis biru di kiri */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#667790] rounded-l-md"></div> 
                      
                      <div className="flex ml-2 w-full"> 
                          
                          {/* Kontainer Foto & Teks (Menggunakan Flex Row untuk baris pertama) */}
                          <div className="flex items-start">
                              
                              {/* FOTO PROFIL */}
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3 mt-1"> {/* Tambahkan mt-1 untuk vertical alignment */}
                                  <IconUser size={20} className="text-gray-500" />
                              </div>
                              
                              {/* KONTEN TEKS: Username, Nama, Role (Menumpuk) */}
                              <div className="flex flex-col pt-1"> 
                                  {/* Username */}
                                  <p className="font-semibold text-sm text-[#023048] leading-tight">{user.username}</p>
                                  
                                  {/* Nama Panjang */}
                                  <p className="text-sm text-gray-700 mt-1 leading-snug">{user.name}</p> 
                                  
                                  {/* Role */}
                                  <p className="text-xs text-[#667790] font-medium leading-snug">Role : {user.role}</p> 
                              </div>
                          </div>
                      </div>
                      
                      {/* Tombol Hapus */}
                      <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-150 flex-shrink-0 self-start mt-1"
                          aria-label={`Hapus user ${user.username}`}
                      >
                          <IconTrash size={20} />
                      </button>
                  </div>
              ))}
          </div>

          {/* TOMBOL TAMBAH AKUN BARU */}
          <div className="mt-8 flex justify-end">
              <button
                  onClick={() => alert("Menuju halaman Tambah Akun Baru...")}
                  className="flex items-center gap-2 px-6 py-2 bg-[#023048] text-white rounded-lg hover:bg-[#023048]/90 transition duration-150 font-medium"
              >
                  <IconPlus size={20} />
                  Tambah Account Baru
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserControl;