import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import authCheck from "./authCheck";
import { DayPicker } from "react-day-picker";
import 'react-day-picker/dist/style.css';
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

import { data, Link } from 'react-router-dom';
import "./App.css";

import axios from "axios";

function ApprovalSA() {
    authCheck();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [checkedItems, setCheckedItems] = useState({});
    const [approvedAll, setApprovedAll] = useState(false);

    const [backendTotal, setBackendTotal] = useState(0);


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const res = await axios.get("http://localhost:8080/api/approval/data", {
                params: { search, page: currentPage, limit: rowsPerPage }
            });

            const result = res.data?.data || [];

            const formatted = result.map(d => ({
                id: d.id,
                name: d.nama || d.member_name,
                nim: d.nim || d.member_id,
                pengembalian: d.status_peminjaman,
                status: d.approved,
                statusbebaspustakanya: d.status_bepus,
                keterangan: d.keterangan,
                approved_at: d.approved_at,
                ...d
            }));
            setTotal(res.data.total);
            setData(formatted);          // langsung set 10 data, JANGAN SLICE

        } catch (err) {
            console.error(err);
            alert("Gagal mengambil data.");
        } finally {
            setLoading(false);
        }
    }, [search, currentPage, rowsPerPage]);



    //GET login user
    const [profileData, setProfileData] = useState({
        name: "Loading...",
        username: "Loading...",
        role: "Admin",
    });


    //atur header + sidebar
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const getSidebarItemClass = (isActive = false) => {
        const baseClasses =
            "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
        return isActive
            ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold`
            : `${baseClasses} text-[#667790] hover:bg-gray-100`;
    };

    //ceklis
    const cekAll = () => {
        const newValue = !approvedAll;
        setApprovedAll(newValue);

        const newChecked = {};
        data.forEach(item => {
            newChecked[item.id] = newValue;
        });

        setCheckedItems(newChecked);
    };

    const SetujuiSemuaBepus = () => {
        (!setAlertBebasPustakaAll)
        console.log("Setuju semua bepustaka clicked");
    };

    const handleSingleCheck = (id) => {
        setCheckedItems(prev => {
            const updated = { ...prev, [id]: !prev[id] };


            const allChecked = data.every(item => updated[item.id]);
            setApprovedAll(allChecked);

            return updated;
        });
    };

    //search
    const filteredData = data.filter(
        item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.nim.toLowerCase().includes(search.toLowerCase())
    );

    //pagination
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



    //next page
    const goto = useNavigate();
    const [alertBebasPustaka, setAlertBebasPustaka] = useState(false);

    const [alertBebasPustakaAll, setAlertBebasPustakaAll] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [urutkanBy, setUrutkanBy] = useState(false);

    //sort by
    const sortAZ = () => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setData(sorted);
    };
    const sortZA = () => {
        const sorted = [...data].sort((a, b) => b.name.localeCompare(a.name));
        setData(sorted);
    };

    //pick date
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [rangeText, setRangeText] = useState('');

    const [range, setRange] = useState({
        from: undefined,
        to: undefined,
    });

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    };


    const handleRangeChange = (selectedRange) => {
        setRange(selectedRange);
        setStartDate(selectedRange?.from ? selectedRange.from.toISOString().slice(0, 10) : "");
        setEndDate(selectedRange?.to ? selectedRange.to.toISOString().slice(0, 10) : "");

        if (selectedRange?.from && selectedRange?.to) {
            setRangeText(`${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`);
        } else {
            setRangeText("");
        }
    };
    const handleStartInput = (e) => {
        setStartDate(e.target.value);
        setRange((prev) => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }));

        if (value && endDate) {
            setRangeText(`${formatDate(value)} - ${formatDate(endDate)}`);
        } else {
            setRangeText("");
        }
    };
    const handleEndInput = (e) => {
        setEndDate(e.target.value);
        setRange((prev) => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }));

        if (startDate && value) {
            setRangeText(`${formatDate(startDate)} - ${formatDate(value)}`);
        } else {
            setRangeText("");
        }
    };
    const SortByDate = async () => {
        setShowFilter(false);

        //sisanya tar taro UPDATE status bebas pustaka ya
    };
    //acc n
    const SetujuiBepus = async () => {
        setAlertBebasPustaka(false);

        const selectedIDs = Object.keys(checkedItems).filter(id => checkedItems[id]);

        if (selectedIDs.length === 0) {
            alert("Ga ada yang dicentang cuy 😭");
            return;
        }

        console.log("Update BEPUS ID:", selectedIDs);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

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
                                {/* Icon Bebas Pustaka */}
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
                            <a href="/ApprovalSA" className={getSidebarItemClass(true)}>
                                <IconBell size={20} />
                                Konfirmasi Data
                            </a>
                            <a href="/usercontrolSA" className={getSidebarItemClass()}>
                                <IconUsers size={20} />
                                User Control
                            </a>
                            <a href="/historySA" className={getSidebarItemClass()}>
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
                        <div
                            className="flex items-center gap-2 cursor-pointer pr-4 relative"
                            onClick={toggleDropdown}
                        >
                            <IconChevronDown size={18} className="text-gray-600" />
                            <p className="font-semibold text-sm text-[#023048] select-none hidden sm:block">
                                Hai, {profileData.name.split(" ")[0]}
                            </p>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 overflow-hidden">
                                <IconUser size={24} className="text-gray-500" />
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

                    <div className="p-1">
                        {/* TABLE APPROVAL */}
                        <div className="ml-0 flex-1 p-4 md:p-8 overflow-x-auto">

                            <p className="font-semibold text-2xl text-black mb-8 mt-0 md:mt-2 text-left">Konfirmasi Data Bebas Pustaka</p>
                            <div className="flex items-start gap-1 text-[#9A9A9A] text-lg font-medium">
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
                                    <p className="text-lg ml-1">xxxx &nbsp;</p>
                                    <p className="text-lg m-0">permohonan bebas pustaka</p>
                                </div>
                            </div>



                            <div className="flex flex-wrap gap-3 items-center justify-between mt-4">
                                <div className="flex items-center text-[#9A9A9A] font-semibold">

                                    <p className="mr-2">Tunjukkan</p>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20" //nanti diganti based on db
                                        // value={bikin function nya}
                                        className="w-16 h-8 bg-transparent border border-[#9A9A9A] rounded-lg shadow-sm text-center focus:outline-none"
                                    />
                                    <p className="ml-2">Entitas</p>
                                </div>


                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowFilter(!showFilter)}
                                            className={`cursor-pointer flex relative items-center gap-2 px-3 py-1 rounded border active:scale-90 transition-transform duration-100
                                  ${showFilter
                                                    ? 'bg-[#667790] text-white border-[#667790]'
                                                    : 'bg-transparent text-[#667790] border-[#667790]'
                                                }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="icon icon-tabler"
                                            >
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" />
                                            </svg>
                                            Date
                                        </button>
                                        {showFilter && (
                                            <div className="absolute top-12 right-0 bg-white p-3 rounded-md shadow-lg z-50 w-[90vw] max-w-[260px]">
                                                <p className="text-sm font-semibold text-gray-700 mb-3">Filter</p>
                                                <div className="w-full h-[1px] bg-gray-300 mb-4"></div>

                                                <div className="calendar-scale w-full max-w-xs px-2 py-3">
                                                    <DayPicker
                                                        mode="range"
                                                        selected={range}
                                                        onSelect={handleRangeChange}
                                                    />
                                                </div>

                                                <div className="w-full h-[1px] bg-gray-300 mb-4"></div>

                                                {/* Start Date */}
                                                <div className="text-sm mb-3">
                                                    <label className="block mb-1 font-medium">
                                                        Tanggal Mulai <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={handleStartInput}
                                                        className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-blue-400"
                                                    />
                                                </div>

                                                {/* End Date */}
                                                <div className="text-sm mb-3">
                                                    <label className="block mb-1 font-medium">
                                                        Tanggal Selesai <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={handleEndInput}
                                                        className="border border-gray-300 px-3 py-2 rounded-md w-full text-sm focus:outline-blue-400"
                                                    />
                                                </div>

                                                {/* Range Text */}
                                                <p className="text-[11px] font-semibold text-gray-700 mt-2">Rentang :</p>
                                                <p className="text-[11px] text-gray-500 mb-4">{rangeText}</p>

                                                {/* Buttons */}
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        className="px-3 py-2 text-sm border border-gray-400 rounded-md text-gray-600 hover:bg-gray-100 active:scale-95 transition"
                                                        onClick={() => setShowFilter(false)}
                                                    >
                                                        Batalkan
                                                    </button>

                                                    <button
                                                        className="px-3 py-2 text-sm rounded-md bg-[#023048] text-white hover:bg-[#012C3F] active:scale-95 transition"
                                                        onClick={SortByDate}
                                                    >
                                                        Cari Data
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                    <button
                                        onClick={() => {
                                            if (approvedAll) setAlertBebasPustakaAll(true);
                                        }}
                                        disabled={!approvedAll}
                                        className={`cursor-pointer flex relative items-center gap-2 px-3 py-1 rounded border active:scale-90 transition-transform duration-100
                                  ${alertBebasPustakaAll
                                                ? 'bg-[#667790] text-white border-[#667790]'
                                                : 'bg-transparent text-[#667790] border-[#667790]'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="icon icon-tabler icons-tabler-outline icon-tabler-square-check"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
                                            <path d="M9 12l2 2l4 -4" />
                                        </svg>
                                        Approve All
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => setUrutkanBy(!urutkanBy)}
                                            className={`cursor-pointer flex relative items-center gap-2 px-3 py-1 rounded border active:scale-90 transition-transform duration-100
                                  ${urutkanBy
                                                    ? 'bg-[#667790] text-white border-[#667790]'
                                                    : 'bg-transparent text-[#667790] border-[#667790]'
                                                }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="icon icon-tabler icons-tabler-outline icon-tabler-sort-descending"
                                            >
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M4 6l9 0" />
                                                <path d="M4 12l7 0" />
                                                <path d="M4 18l7 0" />
                                                <path d="M15 15l3 3l3 -3" />
                                                <path d="M18 6l0 12" />
                                            </svg>
                                            Urutkan
                                        </button>
                                        {urutkanBy && (
                                            <div className="absolute top-12 right-0 flex flex-col gap-2 bg-[#F9FAFB] rounded-sm shadow z-50 w-40">
                                                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                                                    <p className="text-[#616161] font-bold text-sm">Urutkan</p>
                                                    <p
                                                        className="text-[#616161] font-bold cursor-pointer text-sm"
                                                        onClick={() => setUrutkanBy(false)}
                                                    >
                                                        X
                                                    </p>
                                                </div>

                                                <p className="font-normal text-sm px-3 py-1 cursor-pointer hover:bg-gray-300 rounded-sm">Terbaru</p>
                                                <p className="font-normal text-sm px-3 py-1 cursor-pointer hover:bg-gray-300 rounded-sm">Terlama</p>

                                                <button
                                                    onClick={sortAZ}
                                                    className="px-3 py-1 w-full font-normal text-left text-sm rounded-sm hover:bg-gray-300 focus:bg-[#A8B5CB] outline-none transition-colors"
                                                >
                                                    A &gt; Z
                                                </button>
                                                <button
                                                    onClick={sortZA}
                                                    className="px-3 py-1 w-full font-normal text-left text-sm rounded-sm hover:bg-gray-300 focus:bg-[#A8B5CB] outline-none transition-colors"
                                                >
                                                    Z &gt; A
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative w-40">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-8 pr-2 py-2 text-sm rounded-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#A8B5CB]"
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
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                            <path d="M21 21l-6 -6" />
                                        </svg>

                                    </div>

                                </div>
                            </div>



                            <div className='grid grid-cols-1 gap-8 '>

                                <div className="overflow-x-auto w-full">
                                    <table className="min-w-full border-collapse mt-7">
                                        <thead>
                                            <tr className="bg-gray-50 border-b-2 border-black">
                                                <th className="text-left p-4 font-normal text-gray-600 bg-[#667790]">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={approvedAll}
                                                            onChange={cekAll}
                                                            className="absolute opacity-0 w-4 h-4"
                                                        />

                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${approvedAll
                                                            ? 'bg-transparent border-[#A8B5CB]'
                                                            : 'bg-transparent border-white'
                                                            }`}
                                                        >
                                                            {approvedAll && (
                                                                <svg
                                                                    width="12"
                                                                    height="10"
                                                                    viewBox="0 0 12 10"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        d="M1 5L4 8L11 1"
                                                                        stroke="white"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </label>
                                                </th>
                                                <th className="text-left p-4 font-normal text-white bg-[#667790]">&#8203;</th>
                                                <th className="text-left p-4 font-normal text-white bg-[#667790]">Nama</th>
                                                <th className="text-left p-4 font-normal text-white bg-[#667790]">NIM</th>
                                                <th className="text-left p-4 font-normal text-white bg-[#667790]">Status Peminjaman</th>
                                                <th className="text-left p-4 font-normal text-white bg-[#667790]">Status</th>
                                                <th className="text-left p-4 font-normal text-white bg-[#667790]">Tindakan</th>
                                                <th className="text-left p-4 font-normal text-white bg-[#667790]">Keterangan</th>
                                            </tr>
                                        </thead>

                                        {/* isianya dari db */}
                                        <tbody>
                                            {data.map((item, index) => ( //ssesuain sama db
                                                <tr key={item.id ?? index} 
                                                className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}
                                                >
                                                    <td className="p-4">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={checkedItems[item.id] || false}
                                                                onChange={() => handleSingleCheck(item.id)}
                                                                className="absolute w-4 h-4 opacity-0 cursor-pointer"
                                                            />
                                                            <div 
                                                            key={item.id ?? index}
                                                            className={`w-4 h-4 border rounded flex items-center justify-center ${checkedItems[item.id]
                                                                ? 'bg-[#A8B5CB] border-white'
                                                                : 'bg-white border-[#A8B5CB]'
                                                                }`}
                                                            >

                                                                <svg
                                                                    width="12"
                                                                    height="10"
                                                                    viewBox="0 0 12 10"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        d="M1 5L4 8L11 1"
                                                                        stroke="white"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>

                                                            </div>
                                                        </label>
                                                    </td>
                                                    <td className="px-4">
                                                        <div
                                                            className="relative bg-[url('https://cdn.designfast.io/image/2025-11-21/b89ae749-b5b2-40e4-967d-18be9ef8aed8.png')] bg-cover bg-no-repeat bg-center w-12 h-12">
                                                        </div>
                                                    </td>
                                                    <td className="p-4 whitespace-nowrap overflow-x-auto truncate">{item.name}</td>
                                                    <td className="p-4 whitespace-nowrap overflow-x-auto truncate">{item.nim}</td>

                                                    <td className={`p-4 whitespace-nowrap overflow-x-auto ${item.pengembalian === 1 ? "text-[#4ABC4C]" : "text-[#FF1515]"}`}>
                                                        {item.pengembalian === 1 ? "Sudah Dikembalikan" : "Belum Dikembalikan"}
                                                    </td>

                                                    <td className={`p-4 whitespace-nowrap overflow-x-auto ${item.status === 1 ? "text-[#4ABC4C]" : "text-[#FF1515]"}`}>
                                                        {item.status === 1 ? "Bebas Pustaka" : "Tidak Bebas Pustaka"}
                                                    </td>
                                                    <td className="p-4 text-[#4ABC4C] whitespace-nowrap overflow-x-auto">

                                                        {item.statusbebaspustakanya === 0 ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAlertBebasPustaka(!alertBebasPustaka)}
                                                                    className="cursor-pointer px-5 py-1 border-2 border-[#A8B5CB] rounded-md bg-[#EDF1F3] text-[#A8B5CB] font-semibold
                                                                               active:scale-90 transition-transform duration-100"
                                                                >
                                                                    Setujui
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <p className="text-[#A8B5CB] font-semibold">Bebas Pustaka</p>
                                                        )}
                                                    </td>

                                                    <td className="p-4 whitespace-nowrap overflow-x-auto">
                                                        <button
                                                            className="cursor-pointer relative flex items-center gap-2 text-[#667790] px-3 py-1 left-[15px] rounded"
                                                            onClick={() => goto(`/KeteranganSA/${item.nim}`)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="icon icon-tabler icons-tabler-outline icon-tabler-file"
                                                            >
                                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                                                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                                                            </svg>
                                                        </button>
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            {/* pagination dan export */}
                            <button className='cursor-pointer flex relative items-center p-2 top-4 my-5 rounded-lg border border-[#757575] bg-[#023048] text-white active:scale-90 transition-transform duration-200'
                                onClick={() => console.log("PDF clicked")}>Cetak ke PDF
                            </button>

                            <div className="flex flex-wrap gap-2 justify-center mt-4 items-center">
                                {/* Prev */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border text-[#757575] rounded disabled:opacity-40"
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

                                {/* Next */}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border text-[#757575] rounded disabled:opacity-40"
                                >
                                    Selanjutnya →
                                </button>
                            </div>


                        </div>

                        {alertBebasPustaka && (
                            <div className="fixed inset-0 bg-[#333333]/60 flex items-center justify-center z-50">
                                <div className="relative w-80 h-80 overflow-hidden">

                                    <div className="absolute bg-[url('https://cdn.designfast.io/image/2025-11-22/cf3fe802-a5e6-4d12-89e9-3cdec8f83aed.png')] 
                            bg-cover bg-center left-[120px] top-12 w-20 h-20 z-50">
                                    </div>

                                    <p className='absolute ml-2 left-[270px] top-24 font-semibold text-xl cursor-pointer z-50' onClick={() => setAlertBebasPustaka(false)}> X </p>

                                    <div className="absolute bottom-0 bg-white w-80 h-60 rounded-md font-semibold flex flex-col items-center justify-center text-center px-5">

                                        <p className="text-xl mt-7">Setujui Data Ini?</p>
                                        <p className="text-xs font-extralight mt-4 px-2">
                                            Setelah data disetujui, perubahan tidak dapat dibatalkan dan akan dianggap
                                            sebagai data yang sah serta tersimpan dalam sistem.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={SetujuiBepus}
                                            className="cursor-pointer mt-4 px-5 py-1 rounded-md bg-[#023048] text-white font-semibold
                                    active:scale-90 transition-transform duration-100"
                                        >
                                            Setujui
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {alertBebasPustakaAll && (
                            <div className="fixed inset-0 bg-[#333333]/60 flex items-center justify-center z-50">
                                <div className="relative w-80 h-80 overflow-hidden">

                                    <div className="absolute bg-[url('https://cdn.designfast.io/image/2025-11-22/cf3fe802-a5e6-4d12-89e9-3cdec8f83aed.png')] 
                            bg-cover bg-center left-[120px] top-12 w-20 h-20 z-50">
                                    </div>

                                    <p className='absolute ml-2 left-[270px] top-24 font-semibold text-xl cursor-pointer z-50' onClick={() => setAlertBebasPustakaAll(false)}> X </p>

                                    <div className="absolute bottom-0 bg-white w-80 h-60 rounded-md font-semibold flex flex-col items-center justify-center text-center px-5">

                                        <p className="text-xl mt-7">Setujui Semua Data?</p>
                                        <p className="text-xs font-extralight mt-4 px-2">
                                            Setelah data disetujui, perubahan tidak dapat dibatalkan dan akan dianggap
                                            sebagai data yang sah serta tersimpan dalam sistem.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={SetujuiSemuaBepus}
                                            className="cursor-pointer mt-4 px-5 py-1 rounded-md bg-[#023048] text-white font-semibold
                                                    active:scale-90 transition-transform duration-100"
                                        >
                                            Setujui
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div >
            </div>

            <div className="sticky w-full z-50">
                <AppLayout></AppLayout>
            </div>
        </main >
    );
}

export default ApprovalSA;