import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import authCheckSA from "./authCheckSA";
import {
  IconHome, IconChartBar, IconBell, IconFileDescription, IconLogout, IconUser, IconChevronDown,
  IconMenu2, IconUsers, IconHistory, IconSearch, IconFilter, IconSortDescendingLetters,
  IconX, IconChevronRight, IconChevronLeft, IconCheck, IconCalendar,
  IconBellRinging,
  IconEye,
  IconTrash
} from "@tabler/icons-react";
import LogoutAlert from "./logoutConfirm";
import AppLayout from "./AppLayout";

// nahhh pokoknya replace aja semua fungsi dengan call fungsi ke backend

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const formatDisplayDate = (date) => {
  if (!date) return '';
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

// Helper untuk format timestamp ISO ke format display lokal
const formatDisplayTimestamp = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timePart = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }).replace(/\./g, ':');

    return `${datePart} | ${timePart} WIB`;
  } catch (e) {
    console.error("Error parsing date:", e);
    return isoString;
  }
};

// Helper untuk format tanggal untuk input type="date" (Contoh: "2025-11-21")
const formatDateISO = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper untuk membuat Date object dari string ISO (e.g., "2025-11-21")
const parseDateISO = (isoString) => {
  if (!isoString) return null;
  try {
    // handle both "YYYY-MM-DD" and full ISO date
    if (isoString.includes('T')) {
      return new Date(isoString);
    }
    const [year, month, day] = isoString.split('-').map(Number);
    return new Date(year, month - 1, day);
  } catch (e) {
    return null;
  }
};

const handleLogout = () => {
  // Hapus local storage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Redirect ke halaman login
  navigate("/login");
};

// KOMPONEN: Modal Filter Tanggal

const FilterModal = ({ isOpen, onClose, onApplyFilter, initialStart, initialEnd }) => {
  if (!isOpen) return null;

  const initStart = initialStart ? parseDateISO(formatDateISO(initialStart)) : null;
  const initEnd = initialEnd ? parseDateISO(formatDateISO(initialEnd)) : null;

  const [currentDate, setCurrentDate] = useState(initStart || new Date());
  const [selectedRange, setSelectedRange] = useState({ start: initStart, end: initEnd });
  const [startDateISO, setStartDateISO] = useState(initStart ? formatDateISO(initStart) : '');
  const [endDateISO, setEndDateISO] = useState(initEnd ? formatDateISO(initEnd) : '');

  useEffect(() => {
    setStartDateISO(selectedRange.start ? formatDateISO(selectedRange.start) : '');
    setEndDateISO(selectedRange.end ? formatDateISO(selectedRange.end) : '');
  }, [selectedRange]);


  const handleDayClick = (day) => {
    if (!day) return;
    const dayNormalized = parseDateISO(formatDateISO(day));
    if (!dayNormalized) return;

    const start = selectedRange.start;
    const end = selectedRange.end;

    if (!start || (start && end)) {
      setSelectedRange({ start: dayNormalized, end: null });
      setCurrentDate(dayNormalized);
    } else if (dayNormalized.getTime() < start.getTime()) {
      setSelectedRange({ start: dayNormalized, end: start });
    } else {
      setSelectedRange({ start: start, end: dayNormalized });
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startDayIndex; i++) days.push(null);
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getCalendarDayClass = (day) => {
    let classes = "text-gray-900 hover:bg-gray-100 rounded-full";
    if (!day) return "text-gray-900";
    const start = selectedRange.start;
    const end = selectedRange.end;
    const dayNorm = parseDateISO(formatDateISO(day));
    if (!dayNorm) return classes;
    const dayTime = dayNorm.getTime();

    if (!start || (start && !end)) {
      if (start && dayTime === start.getTime()) {
        classes = "bg-[#667790] text-white rounded-full";
      } else {
        classes = "text-gray-900 hover:bg-gray-100 rounded-full";
      }
      return classes;
    }

    const rangeStart = Math.min(start.getTime(), end.getTime());
    const rangeEnd = Math.max(start.getTime(), end.getTime());

    if (dayTime >= rangeStart && dayTime <= rangeEnd) {
      const isStart = dayTime === rangeStart;
      const isEnd = dayTime === rangeEnd;
      if (isStart && isEnd) classes = "bg-[#667790] text-white rounded-full";
      else if (isStart) classes = "bg-[#667790] text-white rounded-l-full rounded-r-none";
      else if (isEnd) classes = "bg-[#667790] text-white rounded-r-full rounded-l-none";
      else classes = "bg-[#AEC2E6] text-white rounded-none";
    } else {
      classes = "text-gray-900 hover:bg-gray-100 rounded-full";
    }
    return classes;
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateInputChange = (field, isoString) => {
    const newDate = isoString ? parseDateISO(isoString) : null;

    setSelectedRange(prev => {
      const newState = { ...prev };
      if (field === 'start') {
        newState.start = newDate;
        if (newDate && newState.end && newState.end.getTime() < newDate.getTime()) newState.end = newDate;
      } else if (field === 'end') {
        newState.end = newDate;
        if (newDate && newState.start && newState.start.getTime() > newDate.getTime()) newState.start = newDate;
      }
      if (newDate) setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      return newState;
    });

    if (field === 'start') setStartDateISO(isoString);
    if (field === 'end') setEndDateISO(isoString);
  };

  const handleApply = () => {
    onApplyFilter(selectedRange.start, selectedRange.end);
    onClose();
  };

  const displayMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  const days = getDaysInMonth(currentDate);
  const currentRangeText = selectedRange.start
    ? `Rentang : ${formatDisplayDate(selectedRange.start)} ${selectedRange.end ? ` - ${formatDisplayDate(selectedRange.end)}` : ''}`
    : 'Rentang :';

  return (
    <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 bg-white rounded-lg shadow-xl border p-4 font-['Plus_Jakarta_Sans'] origin-top transition-all duration-150
                ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
    >
      <div className="flex justify-between items-center pb-3 border-b mb-4">
        <h3 className="font-semibold text-base text-gray-800">Filter</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <IconX size={20} />
        </button>
      </div>

      <div className="text-center">
        <div className="flex justify-between items-center mb-4 text-sm">
          <button onClick={prevMonth} className="text-gray-600 hover:text-gray-800"><IconChevronLeft size={18} /></button>
          <span className="font-semibold text-gray-800">{displayMonthYear}</span>
          <button onClick={nextMonth} className="text-gray-600 hover:text-gray-800"><IconChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="font-medium text-gray-500 text-xs">{day}</div>
          ))}
          {days.map((day, index) => (
            <div key={index} className="h-6 flex items-center justify-center">
              {day && (
                <button
                  onClick={() => handleDayClick(day)}
                  className={`w-full h-full flex items-center justify-center transition text-xs ${getCalendarDayClass(day)}`}
                >
                  {day.getDate()}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 text-left">Tanggal Mulai <span className="text-[#FF1515]">*</span></label>
          <input
            type="date"
            value={startDateISO}
            onChange={(e) => handleDateInputChange('start', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:border-[#023048] focus:ring-[#023048]"
            placeholder="Pilih tanggal mulai"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 text-left">Tanggal Selesai <span className="text-[#FF1515]">*</span></label>
          <input
            type="date"
            value={endDateISO}
            onChange={(e) => handleDateInputChange('end', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:border-[#023048] focus:ring-[#023048]"
            placeholder="Pilih tanggal selesai"
          />
          <p className="text-xs text-gray-500 mt-2 text-left">
            {currentRangeText}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 mt-3 border-t">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 text-xs"
        >
          Batalkan
        </button>
        <button
          onClick={handleApply}
          className="px-3 py-1.5 bg-[#023048] text-white rounded-lg hover:bg-[#023048]/90 transition duration-150 text-xs"
          disabled={!selectedRange.start || !selectedRange.end || (selectedRange.start && selectedRange.end && selectedRange.start.getTime() > selectedRange.end.getTime())}
        >
          Cari data
        </button>
      </div>
    </div>
  );
};

const HistoryApprovalSA = () => {
  authCheckSA();
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [selectedSort, setSelectedSort] = useState("Terbaru");
  const [searchTerm, setSearchTerm] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState({ start: null, end: null });



  const [profileData, setProfileData] = useState({
    user_id: "",
    username: "",
    name: "",
    role: "",
    photo: "https://i.ibb.co/C07X0Q0/dummy-profile.jpg",
  });


  // logic pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 8,
  });
  const totalPages = pagination.totalPages;
  const maxPage = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const startPage = Math.max(
    1,
    currentPage - Math.floor(maxPage / 2)
  );
  const endPage = Math.min(
    totalPages,
    startPage + maxPage - 1
  );
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );


  useEffect(() => {
    const fetchProfile = async () => {
      const user = JSON.parse(localStorage.getItem('user'))
      const user_id = user.user_id;
      const token = localStorage.getItem('token')
      try {
        // Ganti URL sesuai endpoint backend Anda
        const response = await axios.get(`http://localhost:8080/api/profile/userInfo?user_id=${user_id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        setProfileData(response.data);


      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        // Tampilkan pesan default jika gagal
        setProfileData({
          name: "Gagal memuat",
          username: "N/A",
          role: "N/A",
        });
        // Tambahkan alert jika perlu
        // alert("Gagal terhubung ke server untuk memuat data profil.");
      }
    }
    fetchProfile();

  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const fetchHistoryApproval = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8080/api/history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (isMounted) {
          const rows = res.data.data || [];

          const mapped = rows.map((item) => ({
            id: item.id,
            batch_id: item.batch_id,
            start_date: item.start_date,
            end_date: item.end_date,
            input_date: item.input_date
          }));

          setHistoryList(mapped);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Gagal fetch history approval:", err);
        if (isMounted) {
          setHistoryList([]);
          setIsLoading(false);
        }
      }
    };

    fetchHistoryApproval();

    return () => {
      isMounted = false;
    };
  }, []);



  const toggleProfileDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    setIsSortOpen(false);
  };

  const handleDelete = async (id, batch_id) => {
    if (!window.confirm("Yakin ingin menghapus history ini?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:8080/api/history/${id}?batch_id=${batch_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistoryList(prev => prev.filter(item => item.id !== id));

    } catch (err) {
      console.error("Gagal menghapus history:", err);
      alert("Gagal menghapus data history");
    }
  };



  const toggleSort = () => {
    setIsSortOpen(!isSortOpen);
    setIsFilterOpen(false);
  };

  const handleApplyDateFilter = (start, end) => {
    setDateFilter({ start, end });
    setCurrentPage(1);
  };

  const filteredData = historyList.filter(item => {
    const searchLower = debouncedSearch.toLowerCase();
    if (!searchLower) return true;
    const matchesName = item.name && item.name.toLowerCase().includes(searchLower);
    const matchesRole = item.role && item.role.toLowerCase().includes(searchLower);
    const matchesActivity = item.activity && item.activity.toLowerCase().includes(searchLower);
    return matchesName || matchesRole || matchesActivity;
  });

  const getSidebarItemClass = (isActive = false) => {
    const baseClasses =
      "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
    return isActive
      ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold`
      : `${baseClasses} text-[#667790] hover:bg-gray-100`;
  };


  const goPrev = () => {
    if (pagination.hasPrevPage && currentPage > 1) setCurrentPage(prev => prev - 1);
  };
  const goNext = () => {
    if (pagination.hasNextPage && currentPage < pagination.totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
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
              <a href="/dashboardSA" className={getSidebarItemClass()}><IconHome size={20} /> Dashboard</a>
              <a href="/analyticSA" className={getSidebarItemClass()}><IconChartBar size={20} /> Data Analitik</a>
              <a href="/approvalSA" className={getSidebarItemClass()}><IconFileDescription size={20} /> Konfirmasi Data</a>
              <a href="/usercontrolSA" className={getSidebarItemClass()}><IconUsers size={20} /> Kontrol Pengguna</a>
              <a href="/HistoryApprovalSA" className={getSidebarItemClass(true)}><IconHistory size={20} /> Riwayat</a>

            </nav>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col h-screen">
          <header className="w-full bg-white border-b p-4 flex justify-between lg:justify-end relative z-20">
            <button
              className="lg:hidden text-[#023048]"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <IconMenu2 size={24} />
            </button>

            <a href="/historySA" className="group mt-2.5 mr-4 text-[#023048] hover:text-[#A8B5CB]">
              <IconBell size={24} className="block group-hover:hidden" />
              <IconBellRinging size={24} className="hidden group-hover:block animate-ring-bell" />
            </a>

            <div
              className="flex items-center gap-2 cursor-pointer pr-4 relative"
              onClick={toggleProfileDropdown}
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
                    <p className="font-semibold text-sm text-[#023048] text-left">{profileData.name}</p>
                    <p className="text-xs text-gray-500 text-left">{profileData.role}</p>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <button onClick={() => navigate("/profileSA")} className="flex items-center gap-3 p-2 w-full text-left text-sm hover:bg-gray-100 rounded-md text-gray-700">
                    <IconUser size={18} /> Profile
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
          {showLogout && (
            <LogoutAlert onClose={() => setShowLogout(false)} />
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-1 sm:p-2">

              <div className="flex flex-col md:flex-row md:justify-between md:items-center my-3  ml-5">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-xl font-semibold text-left">Riwayat</h1>
                  <p className="text-sm text-[#9A9A9A] mt-1 text-left">
                    Seluruh rekaman aktivitas pengguna dan administrator tersimpan dan tercatat secara berurutan di sini.
                  </p>
                </div>


              </div>

              <div className="border-b border-gray-200 mt-5 mb-2 mx-5"></div>

              <div className="w-full border-b border-gray-200 mb-5">
                <div>
                  {filteredData.map((item, index) => (
                    <div key={item.id} className="relative flex w-full">
                      <div className="flex flex-col w-full"> {/* Pastikan lebar full */}
                        <div className="flex-1 gap-6 relative w-full">
                          <div className="relative bg-white rounded-xs shadow-sm border border-gray-200 p-4 mx-5 mt-4 min-w-[650px]">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#A8B5CB] rounded-l-xs"></div>

                            <div className="flex justify-between">
                              <div className="items-center gap-2 p-2 text-left">
                                <p className="text-sm text-[#023048]">
                                  Permohonan approval batch <b>{item.batch_id}</b> telah mendapatkan persetujuan pada tanggal{" "}
                                  <b>{formatDisplayDate(new Date(item.start_date))}</b> sampai{" "}
                                  <b>{formatDisplayDate(new Date(item.end_date))}</b>.
                                </p>
                                <p className="text-xs text-gray-500 mt-5">
                                  Diinput pada: {formatDisplayTimestamp(item.input_date)}
                                </p>
                              </div>

                              <div className="flex gap-3 items-center">
                                {/* Tombol Lihat Detail */}
                                <div className="relative group inline-block">
                                  <button
                                    className="bg-[#023048] rounded text-white p-2 active:scale-90 transition-transform duration-100 hover:bg-[#023048]/90"
                                    onClick={() => navigate(`/history/${item.batch_id}`)}
                                  >
                                    <IconEye size={20} />
                                  </button>
                                  <span className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-3 px-1 bg-[#EDEDED] text-gray-600 text-xs border border-gray-300 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    Lihat Detail
                                  </span>
                                </div>

                                {/* Tombol Hapus - SUDAH DIPERBAIKI STRUKTURNYA */}
                                <div className="relative group inline-block">
                                  <button
                                    className="bg-[#FF1515] rounded text-white p-2 active:scale-90 transition-transform duration-100 hover:bg-[#FF1515]/90"
                                    onClick={() => handleDelete(item.id, item.batch_id)}
                                  >
                                    <IconTrash size={20} />
                                  </button>
                                  <span className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-3 px-1 bg-[#EDEDED] text-gray-600 text-xs border border-gray-300 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    Hapus
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div> {/* Penutup Card Utama */}
                        </div> {/* Penutup flex-1 */}
                      </div> {/* Penutup flex-col */}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
          <div className="sticky w-full z-99">
            <AppLayout></AppLayout>
          </div>
        </div>
      </div>
    </div>
  )
};
export default HistoryApprovalSA;
