import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IconHome,
  IconChartBar,
  IconBell,
  IconMenu2,
  IconLogout,
  IconUsers,
  IconHistory,
  IconUser,
  IconChevronDown,
} from "@tabler/icons-react";

export default function HistoryApprovalDetail() {
  const { batch_id } = useParams();
  const goto = useNavigate();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Loading...",
    username: "Loading...",
    role: "Admin",
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const getSidebarItemClass = (isActive = false) => {
    const baseClasses = "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
    return isActive
      ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold`
      : `${baseClasses} text-[#667790] hover:bg-gray-100`;
  };

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        if (data.length === 0) setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:8080/api/history/batch/${batch_id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            params: {
              search,
              page: currentPage,
              limit: rowsPerPage
            }
          }
        );

        setData(res.data?.data || []);
        setTotal(res.data?.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batch_id, search, currentPage, rowsPerPage]);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const user_id = user?.user_id;
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `http://localhost:8080/api/profile/userInfo?user_id=${user_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );
        setProfileData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        setProfileData({
          name: "Admin",
          username: "N/A",
          role: "Admin",
        });
      }
    };
    fetchProfile();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset ke halaman pertama saat search
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleExportPDF = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang.");
      return;
    }
    window.open(
      `http://localhost:8080/api/history/batch/${batch_id}/export-pdf?token=${token}`,
      "_blank"
    );
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "N/A";
    const d = new Date(datetime);

    const tanggal = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const jam = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${tanggal} ${jam}`;
  };

const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return "bg-[#FFE2E2] text-[#E53935]";
        case "rejected":
            return "bg-[#FFF3E0] text-[#FB8C00]";
        case "approved":
        default:
            return "bg-[#D9FBD9] text-[#4ABC4C]";
    }
};

  const totalPages = Math.ceil(total / rowsPerPage);
  const pageNumbers = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <main className="font-jakarta bg-[#F9FAFB] min-h-screen">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out 
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                    lg:translate-x-0 lg:static`}
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
              <a href="/dashboardSA" className={getSidebarItemClass()}>
                <IconHome size={20} />
                Dashboard
              </a>
              <a href="/analyticSA" className={getSidebarItemClass()}>
                <IconChartBar size={20} />
                Data Analitik
              </a>
              <a href="/ApprovalSA" className={getSidebarItemClass()}>
                <IconBell size={20} />
                Konfirmasi Data
              </a>
              <a href="/usercontrolSA" className={getSidebarItemClass()}>
                <IconUsers size={20} />
                User Control
              </a>
              <a href="/HistoryApprovalSA" className={getSidebarItemClass(true)}>
                <IconHistory size={20} />
                History
              </a>
            </nav>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        <div className="flex-1 flex flex-col min-h-screen">
          {/* NAVBAR */}
          <header className="w-full bg-white border-b p-4 flex justify-between lg:justify-end relative z-20">
            <button
              className="lg:hidden text-[#023048]"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <IconMenu2 size={24} />
            </button>
            <a href="/historySA" className="mt-2.5 mr-4 text-[#023048] hover:text-[#A8B5CB]">
              <IconBell size={24} />
            </a>
            <div
              className="flex items-center gap-2 cursor-pointer pr-4 relative"
              onClick={toggleDropdown}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 overflow-hidden">
                <IconUser size={24} className="text-gray-500" />
              </div>
              <p className="font-semibold text-sm text-[#023048] select-none hidden sm:block">
                Hai, {profileData.name}
              </p>
              <IconChevronDown size={18} className="text-gray-600" />
            </div>

            {isDropdownOpen && (
              <div className="absolute right-4 top-full mt-2 w-64 bg-white rounded-md shadow-lg border z-30">
                <div className="flex items-center gap-3 p-4 border-b">
                  <IconUser size={24} className="text-gray-500" />
                  <div>
                    <p className="font-semibold text-sm text-[#023048] text-left">
                      {profileData.name}
                    </p>
                    <p className="text-xs text-gray-500">{profileData.role}</p>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => goto("/profileSA")}
                    className="flex items-center gap-3 p-2 w-full text-left text-sm hover:bg-gray-100 rounded-md text-gray-700"
                  >
                    <IconUser size={18} />
                    Profile
                  </button>
                  <button
                    onClick={() => setShowLogout(true)}
                    className="flex items-center gap-3 p-2 w-full text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <IconLogout size={18} />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </header>

          <div className="ml-0 flex-1 p-4 md:p-8">
            <p className="font-semibold text-xl text-black mb-2 mt-0 md:mt-2 text-left">
              History Approval – Batch {batch_id}
            </p>
            <div className="flex items-start gap-1 text-[#9A9A9A] text-lg font-medium mb-3">
              <svg xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
              </svg>
              <div className="flex">
                <p className="text-sm ml-1">{total} &nbsp;</p>
                <p className="text-sm mb-6">data yang sudah di-approve</p>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-wrap gap-2 items-center justify-between mt-4">
              <div className="flex items-center text-[#616161] text-sm font-semibold">
                <p className="mr-2">Tunjukkan</p>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={rowsPerPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= 100) {
                      setRowsPerPage(value);
                      setCurrentPage(1);
                    }
                  }}
                  className="w-24 h-8 bg-transparent border border-[#E3E3E3] text-center focus:outline-none"
                />
                <p className="ml-2">Entitas</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex border-2 border-[#E3E3E3] items-center justify-center">
                  <div className="relative w-40">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={handleSearchChange}
                      className="w-full bg-transparent pl-12 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A8B5CB]"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                      <path d="M21 21l-6 -6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="grid grid-cols-1 mt-9 overflow-x-auto">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "#D8DFEC" }}>
                      <th className="p-2 font-normal text-[#333333] text-sm">Nama</th>
                      <th className="p-2 font-normal text-[#333333] text-sm">NIM</th>
                      <th className="p-2 font-normal text-[#333333] text-sm">Institusi</th>
                      <th className="p-2 font-normal text-[#333333] text-sm">Program Studi</th>
                      <th className="p-2 font-normal text-[#333333] text-sm">Status</th>
                      <th className="p-2 font-normal text-[#333333] text-sm">Waktu Approval</th>
                      <th className="p-2 font-normal text-[#333333] text-sm">Petugas</th>
                      <th className="p-2 font-normal text-[#333333] text-sm">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-gray-500">
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr
                          key={item.id ?? index}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}
                        >
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-[#616161]">
                            {item.nama_mahasiswa || 'N/A'}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-[#616161]">
                            {item.nim || 'N/A'}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-[#616161]">
                            {item.institusi || 'N/A'}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-[#616161]">
                            {item.program_studi || 'N/A'}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full inline-block
    ${getStatusClass(item.STATUS_bebas_pustaka)}`}
                            >
                              {item.STATUS_bebas_pustaka || "Approved"}
                            </span>
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-[#616161]">
                            {formatDateTime(item.waktu_bebaspustaka)}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-[#616161]">
                            {item.petugas_approve || 'N/A'}
                          </td>
                          <td className="py-2 px-4 items-center justify-center">
                            <div className="relative group inline-block">
                              <button
                                className="cursor-pointer relative flex items-center gap-2 text-[#667790] px-3 py-1 left-[15px] rounded transition-all active:scale-90 hover:text-[#445266]"
                                onClick={() => goto(`/KeteranganSA/${item.nim}`)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                                </svg>
                              </button>
                              <span className="absolute z-10 bottom-full left-1/2 -translate-x-1/3 mb-3 px-1 bg-[#EDEDED] text-gray-600 text-xs border border-gray-300 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                Keterangan Riwayat Peminjaman
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-8">
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-[#757575] rounded disabled:opacity-40"
                >
                  ← Sebelumnya
                </button>

                {pageNumbers.map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded-md transition-all duration-150
                                            ${currentPage === num
                        ? 'border-2 bg-[#EDF1F3] border-[#667790] text-[#023048] scale-105 shadow-md'
                        : 'text-[#023048] hover:scale-105 hover:bg-[#F3F6F9]'
                      }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-[#757575] rounded disabled:opacity-40"
                >
                  Selanjutnya →
                </button>
              </div>

              <button
                className="cursor-pointer flex items-center p-2 rounded-lg border border-[#757575] bg-[#023048] text-white active:scale-90 transition-transform duration-200"
                onClick={handleExportPDF}
              >
                Cetak ke PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}