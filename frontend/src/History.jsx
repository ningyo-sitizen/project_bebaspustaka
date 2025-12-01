import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    IconHome, IconChartBar, IconBell, IconLogout, IconUser, IconChevronDown,
    IconMenu2, IconUsers, IconHistory, IconSearch, IconFilter, IconSortDescendingLetters,
    IconX, IconChevronRight, IconChevronLeft, IconCheck, 
} from "@tabler/icons-react";

// URL Foto Dummy yang digunakan di Navbar dan Timeline
const ZAHRAH_PHOTO_URL = "https://i.ibb.co/C07X0Q0/dummy-profile.jpg";

// Data Dummy yang Lebih Realistis (Menggunakan ISO String Timestamp, seperti dari DB)
const historyDataFromDB = [
    { 
        id: 1, 
        name: "Zahrah Purnama", 
        role: "Admin", 
        timestamp: "2025-11-27T09:00:00.000Z", // Timestamp dari DB
        activity: "Admin sistem telah berhasil menyelesaikan proses persetujuan sebanyak 20 data entri mahasiswa.",
        photo: null 
    },
    { 
        id: 2, 
        name: "Zuriel Joseph Jowy", 
        role: "Admin", 
        timestamp: "2025-11-27T08:30:00.000Z", 
        activity: "Admin sistem telah berhasil menyelesaikan proses persetujuan sebanyak 20 data entri mahasiswa.",
        photo: null 
    },
    { 
        id: 3, 
        name: "Budi Santoso", 
        role: "Mahasiswa", 
        timestamp: "2025-11-26T15:30:00.000Z", 
        activity: "Pengguna telah berhasil memperbarui informasi profilnya, termasuk alamat dan nomor telepon.",
        photo: null 
    },
    { 
        id: 4, 
        name: "Sistem Otomatis", 
        role: "Maintenance", 
        timestamp: "2025-11-25T02:00:00.000Z", 
        activity: "Maintenance rutin database telah berhasil diselesaikan tanpa hambatan.",
        photo: null 
    },
];

// Array Nama Bulan
const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Helper untuk format tanggal untuk display (Contoh: "21 November 2025")
const formatDisplayDate = (date) => {
    if (!date) return '';
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

// Helper untuk format timestamp ISO ke format display lokal
const formatDisplayTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Gunakan opsi locale untuk format Indonesia
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
            timeZone: 'Asia/Jakarta' // Asumsi WIB
        }).replace(/\./g, ':'); // Ganti titik dengan titik dua jika diperlukan

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
        const [year, month, day] = isoString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    } catch (e) {
        return null;
    }
};

// ---------------------------------------------------
// KOMPONEN: Modal Filter Tanggal
// ---------------------------------------------------
const FilterModal = ({ isOpen, onClose, onApplyFilter }) => {
    if (!isOpen) return null;

    // Inisialisasi agar kalender menunjukkan rentang contoh (Nov 2025)
    const initialStart = parseDateISO('2025-11-21');
    const initialEnd = parseDateISO('2025-11-30');
    
    const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); 
    const [selectedRange, setSelectedRange] = useState({ start: initialStart, end: initialEnd }); 
    const [startDateISO, setStartDateISO] = useState(formatDateISO(initialStart));
    const [endDateISO, setEndDateISO] = useState(formatDateISO(initialEnd));
    
    React.useEffect(() => {
        setStartDateISO(formatDateISO(selectedRange.start));
        setEndDateISO(formatDateISO(selectedRange.end));
    }, [selectedRange]);


    // --- FUNGSI KALENDER ---
    const handleDayClick = (day) => {
        const dayNormalized = parseDateISO(formatDateISO(day));
        if (!dayNormalized) return; 

        const dayTime = dayNormalized.getTime();
        const start = selectedRange.start;
        const end = selectedRange.end;

        if (!start || (start && end)) {
            setSelectedRange({ start: dayNormalized, end: null });
            setCurrentDate(dayNormalized);
        } else if (dayTime < start.getTime()) {
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
        
        for (let i = 0; i < startDayIndex; i++) {
            days.push(null);
        }
        
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDayOfMonth; i++) {
            days.push(new Date(year, month, i)); 
        }
        return days;
    };

    const getCalendarDayClass = (day) => {
        let classes = "text-gray-900 hover:bg-gray-100 rounded-full"; 

        if (!day) return "text-gray-900"; 
        
        const start = selectedRange.start;
        const end = selectedRange.end;
        const dayNormalized = parseDateISO(formatDateISO(day));
        if (!dayNormalized) return classes; 
        
        const dayTime = dayNormalized.getTime();

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

            if (isStart && isEnd) { 
                classes = "bg-[#667790] text-white rounded-full";
            } else if (isStart) { 
                classes = "bg-[#667790] text-white rounded-l-full rounded-r-none";
            } else if (isEnd) { 
                classes = "bg-[#667790] text-white rounded-r-full rounded-l-none";
            } else { 
                classes = "bg-[#AEC2E6] text-white rounded-none";
            }
        } else {
            classes = "text-gray-900 hover:bg-gray-100 rounded-full";
        }
        return classes;
    };
    
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const handleDateInputChange = (field, isoString) => {
        const newDate = parseDateISO(isoString);

        setSelectedRange(prev => {
            const newState = { ...prev };
            
            if (field === 'start') {
                newState.start = newDate;
                if (newDate && newState.end && newState.end.getTime() < newDate.getTime()) {
                    newState.end = newDate; 
                }
            } else if (field === 'end') {
                newState.end = newDate;
                if (newDate && newState.start && newState.start.getTime() > newDate.getTime()) {
                    newState.start = newDate; 
                }
            }

            if (newDate) {
                setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1)); 
            } else if (isoString === '') {
                 if (field === 'start') newState.start = null;
                 if (field === 'end') newState.end = null;
            }
            return newState;
        });

        if (field === 'start') setStartDateISO(isoString);
        if (field === 'end') setEndDateISO(isoString);
    };

    const handleApply = () => {
        // Panggil fungsi onApplyFilter dari parent
        onApplyFilter(selectedRange.start, selectedRange.end);
        onClose();
    };
    
    const displayMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    const days = getDaysInMonth(currentDate);
    const currentRangeText = selectedRange.start
        ? `Rentang : ${formatDisplayDate(selectedRange.start)} ${selectedRange.end ? ` - ${formatDisplayDate(selectedRange.end)}` : ''}`
        : 'Rentang :';


    return (
        <div className="absolute right-0 top-[48px] z-50 w-72 bg-white rounded-lg shadow-xl border p-4 font-['Plus_Jakarta_Sans']">
            
            {/* ... (Header, Navigasi Bulan & Grid Kalender, Input Tanggal) ... */}
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
                    {days.map((day, index) => {
                        return (
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
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Mulai*</label>
                    <input 
                        type="date"
                        value={startDateISO} 
                        onChange={(e) => handleDateInputChange('start', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:border-[#023048] focus:ring-[#023048]"
                        placeholder="Pilih tanggal mulai"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Selesai*</label>
                    <input 
                        type="date"
                        value={endDateISO} 
                        onChange={(e) => handleDateInputChange('end', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white text-sm focus:border-[#023048] focus:ring-[#023048]"
                        placeholder="Pilih tanggal selesai" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {currentRangeText}
                    </p>
                </div>
            </div>


            {/* Footer Tombol Filter */}
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
                    disabled={!selectedRange.start || !selectedRange.end || selectedRange.start.getTime() > selectedRange.end.getTime()}
                >
                    Cari data
                </button>
            </div>
        </div>
    );
};

// ---------------------------------------------------
// KOMPONEN: Dropdown Urutkan (Tidak Berubah)
// ---------------------------------------------------
const SortDropdown = ({ isOpen, onClose, selectedSort, setSelectedSort }) => {
    if (!isOpen) return null;

    const sortOptions = ["Terbaru", "Terlama", "A > Z", "Z > A"];

    return (
        <div className="absolute right-0 top-[48px] z-50 w-36 bg-white rounded-lg shadow-xl border py-2 font-['Plus_Jakarta_Sans']">
            
            {sortOptions.map((option) => (
                <button
                    key={option}
                    onClick={() => { setSelectedSort(option); onClose(); }}
                    className={`flex justify-between items-center w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 transition duration-100 ${selectedSort === option ? 'text-[#023048] font-semibold bg-gray-100' : 'text-gray-700'}`}
                >
                    {option}
                    {selectedSort === option && <IconCheck size={16} className="text-[#023048]" />}
                </button>
            ))}
        </div>
    );
};

// ---------------------------------------------------
// KOMPONEN UTAMA HISTORY
// ---------------------------------------------------
const History = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    const [selectedSort, setSelectedSort] = useState("Terbaru");
    const [searchTerm, setSearchTerm] = useState(''); 
    
    // State untuk data yang diambil dari DB
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    
    // State untuk menyimpan filter tanggal yang sudah diterapkan
    const [dateFilter, setDateFilter] = useState({ start: null, end: null });

    const [profileData] = useState({
        name: "Zahrah Purnama",
        role: "Admin",
        photo: ZAHRAH_PHOTO_URL,
    });

    const navigate = useNavigate();

    // SIMULASI PENGAMBILAN DATA DARI DATABASE (API)
    React.useEffect(() => {
        setIsLoading(true);
        // Simulasi penundaan API
        const fetchData = setTimeout(() => {
            // Ini adalah tempat data dari API/DB Anda dimasukkan
            setHistoryList(historyDataFromDB); 
            setIsLoading(false);
        }, 1000); 

        return () => clearTimeout(fetchData);
    }, []); 


    // --- HANDLERS & LOGIC ---
    const toggleProfileDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    
    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
        setIsSortOpen(false);
    };

    const toggleSort = () => {
        setIsSortOpen(!isSortOpen);
        setIsFilterOpen(false);
    };

    const handleApplyDateFilter = (start, end) => {
        // Fungsi ini akan dipanggil oleh FilterModal saat tombol "Cari data" diklik
        setDateFilter({ start, end });
    };

    // 1. Logika Sorting
    const sortedData = [...historyList].sort((a, b) => {
        // Sorting berdasarkan string ISO timestamp agar lebih akurat
        if (selectedSort === "Terbaru") {
            return b.timestamp.localeCompare(a.timestamp); 
        } else if (selectedSort === "Terlama") {
            return a.timestamp.localeCompare(b.timestamp);
        } else if (selectedSort === "A > Z") {
            return a.name.localeCompare(b.name);
        } else if (selectedSort === "Z > A") {
            return b.name.localeCompare(b.name);
        }
        return 0;
    });

    // 2. Logika Filtering
    const filteredData = sortedData.filter(item => {
        // Filter Pencarian (Search Term)
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(searchLower) ||
                              item.role.toLowerCase().includes(searchLower) ||
                              item.activity.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        // Filter Tanggal
        if (dateFilter.start && dateFilter.end) {
            const itemDateOnly = parseDateISO(item.timestamp.substring(0, 10)); // Ambil bagian YYYY-MM-DD
            
            // Normalisasi filter date (tanpa waktu)
            const filterStart = dateFilter.start.getTime();
            const filterEnd = dateFilter.end.getTime();
            
            if (itemDateOnly.getTime() < filterStart || itemDateOnly.getTime() > filterEnd) {
                return false;
            }
        }

        return true;
    });

    // --- UTILITY CLASS (Tidak Berubah) ---
    const getSidebarItemClass = (isActive = false) => {
        const baseClasses =
            "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
        return isActive
            ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold`
            : `${baseClasses} text-[#667790] hover:bg-gray-100`;
    };

    // --- RENDER COMPONENT ---
    return (
        <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">

            {/* 1. SIDEBAR */}
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
                        <a href="/dashboard" className={getSidebarItemClass()}>
                            <IconHome size={20} /> Dashboard
                        </a>
                        <a href="/analytic" className={getSidebarItemClass()}>
                            <IconChartBar size={20} /> Data Analitik
                        </a>
                        <a href="/konfirmasi" className={getSidebarItemClass()}>
                            <IconBell size={20} /> Konfirmasi Data
                        </a>
                        <a href="/user-control" className={getSidebarItemClass()}>
                            <IconUsers size={20} /> User Control
                        </a>
                        <a href="/history" className={getSidebarItemClass(true)}>
                            <IconHistory size={20} /> History
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

            {/* 2. MAIN AREA */}
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
                        onClick={toggleProfileDropdown}
                    >
                        <p className="font-semibold text-sm text-[#023048] select-none hidden sm:block">
                            Hai, {profileData.name}
                        </p>
                        <IconChevronDown size={18} className="text-gray-600" />
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
                                    <IconUser size={18} /> Profile
                                </button>
                                <a
                                    href="/logout"
                                    className="flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                                >
                                    <IconLogout size={18} /> Keluar
                                </a>
                            </div>
                        </div>
                    )}
                </header>

                {/* 3. MAIN HISTORY CONTENT */}
                <div className="p-4 sm:p-8">

                    {/* Header dan Bar Aksi */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-xl font-semibold text-[#023048]">History</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Seluruh rekaman aktivitas pengguna dan administrator tersimpan dan tercatat secara berurutan di sini.
                            </p>
                        </div>

                        <div className="flex gap-3 relative flex-wrap justify-end">
                            <div className="relative">
                                <button
                                    onClick={toggleFilter}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition duration-150 ${isFilterOpen ? 'bg-[#023048] text-white border-[#023048]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <IconFilter size={18} /> Filter
                                    {/* Indikator filter aktif (opsional) */}
                                    {(dateFilter.start || dateFilter.end) && (
                                        <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1"></span>
                                    )}
                                </button>
                                {isFilterOpen && (
                                    <FilterModal 
                                        isOpen={isFilterOpen} 
                                        onClose={() => setIsFilterOpen(false)}
                                        onApplyFilter={handleApplyDateFilter} 
                                    />
                                )}
                            </div>
                            
                            <div className="relative">
                                <button
                                    onClick={toggleSort}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition duration-150 ${isSortOpen ? 'bg-[#023048] text-white border-[#023048]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <IconSortDescendingLetters size={18} /> Urutkan
                                </button>
                                {isSortOpen && (
                                    <SortDropdown 
                                        isOpen={isSortOpen} 
                                        onClose={() => setIsSortOpen(false)} 
                                        selectedSort={selectedSort}
                                        setSelectedSort={setSelectedSort}
                                    />
                                )}
                            </div>

                            <div className="relative w-48 sm:w-64 flex-shrink-0">
                                <input
                                    type="text"
                                    placeholder="Cari data...."
                                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-[#023048] focus:border-[#023048] text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <IconSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                    </div>
                    
                    <div className="w-full border-b border-gray-200 mb-8"></div>
                    
                    {/* Timeline Aktivitas */}
                    
                    {isLoading ? (
                        <div className="text-center py-20 text-gray-600">
                            <svg className="animate-spin h-6 w-6 text-[#023048] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memuat data histori...
                        </div>
                    ) : filteredData.length > 0 ? (
                        <div className="space-y-8"> 
                            {filteredData.map((item, index) => (
                                <div key={item.id} className="relative flex">
                                    
                                    {/* Vertical Line Connector */}
                                    {index < filteredData.length - 1 && (
                                        <div className="absolute left-[15px] top-0 h-full w-px bg-gray-300 z-0"></div>
                                    )}
                                    
                                    {/* Kolom Kiri: Ikon Profil */}
                                    <div className="flex flex-col items-center flex-shrink-0 mr-4"> 
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 bg-gray-100 flex-shrink-0 z-10">
                                            {item.photo ? (
                                                <img src={item.photo} alt={item.name} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <IconUser size={20} className="text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Kolom Kanan: Konten Utama */}
                                    <div className="flex-1 -mt-1">
                                        
                                        {/* Nama Pengguna & Role */}
                                        <div className="flex items-center gap-2 mb-2"> 
                                            <p className="font-semibold text-base text-[#023048]">{item.name}</p>
                                            <span 
                                                className="text-xs text-[#023048] bg-[#E7EBF1] border border-[#C6D0DF] px-2 py-0.5 rounded-md font-medium"
                                            >
                                                {item.role}
                                            </span>
                                        </div>
                                        
                                        {/* Card Aktivitas - Full Width */}
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full"> 
                                            {/* Timestamp yang sudah diformat */}
                                            <p className="text-xs text-gray-500 font-medium mb-2">{formatDisplayTimestamp(item.timestamp)}</p>
                                            
                                            {/* Aktivitas */}
                                            <p className="text-sm text-gray-700">{item.activity}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-200">
                            Tidak ada aktivitas yang ditemukan dengan kriteria tersebut.
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default History;