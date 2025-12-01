import React from "react";
import {
  IconHome,
  IconChartBar,
  IconBell,
} from "@tabler/icons-react";

const Sidebar = () => {
  
  // Fungsi untuk menentukan kelas item sidebar
  const getSidebarItemClass = () => {
    const baseClasses = "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
    return `${baseClasses} text-[#667790] hover:bg-gray-100`;
  };

  // Kelas khusus untuk item "Dashboard" yang sedang aktif (sesuai contoh di screenshot)
  const getDashboardClass = () => {
    const activeClasses = "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm bg-gray-200 text-[#023048]";
    return activeClasses;
  };

  return (
    // SIDEBAR
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
            // Asumsi Dashboard adalah halaman aktif dari contoh screenshot
            className={getDashboardClass()}
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
  );
};

export default Sidebar;