import AppLayout from './AppLayout';
import axios from 'axios';
import authCheckSA from './authCheckSA';
import { useNavigate, useParams } from "react-router-dom";
import {
    IconBookOff,
    IconHome,
    IconChartBar,
    IconBell,
    IconLogout,
    IconUser,
    IconChevronDown,
    IconMenu2,
    IconUsers,
    IconHistory,
    IconBellRinging,
    IconFileDescription
} from "@tabler/icons-react";
import { useState, useEffect } from 'react';

export default function KeteranganSA() {
    authCheckSA();

    const [data, setData] = useState([]);
    const [dataMahasiswa, setDataMahasiswa] = useState([]);
    const [loanHistory, setLoanHistory] = useState([]);
    const [loanHistoryMap, setLoanHistoryMap] = useState({});

    const [profileData, setProfileData] = useState({
        name: "Loading...",
        username: "Loading...",
        role: "Admin",
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { nim } = useParams();
    const goto = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const getSidebarItemClass = (isActive = false) => {
        const baseClasses =
            "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
        return isActive
            ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold`
            : `${baseClasses} text-[#667790] hover:bg-gray-100`;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`http://localhost:8080/api/profile/userInfo?user_id=${user.user_id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setProfileData(response.data);
            } catch (err) {
                console.error("Gagal ambil profil:", err);
                setProfileData({ name: "Gagal memuat", username: "N/A", role: "N/A" });
            }
        };

        const fetchDataMahasiswa = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return console.warn("⚠️ No token!");
                const response = await axios.get(`http://localhost:8080/api/keterangan/dataMahasiswa?nim=${nim}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDataMahasiswa(Array.isArray(response.data) ? response.data : [response.data]);
            } catch (err) {
                console.error("❌ Error fetch mahasiswa:", err);
            }
        };

        fetchProfile();
        fetchTokenLogin();
        fetchDataMahasiswa();
    }, [nim]);

    useEffect(() => {
        const fetchLoanHistory = async () => {
            if (!dataMahasiswa.length) return;
            const token = localStorage.getItem("token");
            if (!token) return;

            const map = {};

            for (let mhs of dataMahasiswa) {
                try {
                    const res = await axios.get(`http://localhost:8080/api/keterangan/loanHistoryByNIM/${mhs.nim}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    map[mhs.nim] = res.data.success ? res.data.history : [];
                    console.log("Fetched history for:", mhs.nim);
                } catch (err) {
                    console.error(`Error fetch history for ${mhs.nim}:`, err);
                    map[mhs.nim] = [];
                }
            }

            setLoanHistoryMap(map);
        };

        fetchLoanHistory();
    }, [dataMahasiswa]);


    const fetchTokenLogin = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return console.warn("⚠️ No token!");
            const res = await fetch("http://localhost:8080/api/landing/landingpagechart?year=2025", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        } catch (err) {
            console.error('❌ error token', err);
        }
    };

    return (
        <main className="font-jakarta bg-[#F9FAFB] min-h-screen">
            <div className="flex h-full">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
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
                            <a href="/ApprovalSA" className={getSidebarItemClass(true)}>
                                <IconFileDescription size={20} />
                                Konfirmasi Data
                            </a>
                            <a href="/usercontrolSA" className={getSidebarItemClass()}>
                                <IconUsers size={20} />
                                Kontrol Pengguna
                            </a>
                            <a href="/HistoryApprovalSA" className={getSidebarItemClass()}>
                                <IconHistory size={20} />
                                Riwayat
                            </a>
                        </nav>
                    </div>
                </aside>
                {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden" onClick={toggleSidebar}></div>}

                {/* Content */}
                <div className="flex-1 flex flex-col h-screen">
                    {/* Navbar */}
                    <header className="w-full bg-white border-b p-4 flex justify-end relative">
                        <button className="lg:hidden text-[#023048]" onClick={toggleSidebar} aria-label="Toggle menu">
                            <IconMenu2 size={24} />
                        </button>
                      
                        <a href="/historySA" className="group mt-2.5 mr-4 text-[#023048] hover:text-[#A8B5CB]">
                            <IconBell size={24} className="block group-hover:hidden" />
                            <IconBellRinging size={24} className="hidden group-hover:block animate-ring-bell" />
                        </a>
                        
                        <div className="flex items-center gap-2 cursor-pointer pr-4 relative" onClick={toggleDropdown}>
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
                                        <p className="font-semibold text-sm text-[#023048]">{profileData.name}</p>
                                        <p className="text-xs text-gray-500">{profileData.role}</p>
                                    </div>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button onClick={() => goto("/profile")} className="flex items-center gap-3 p-2 w-full text-left text-sm hover:bg-gray-100 rounded-md text-gray-700">
                                        <IconUser size={18} /> Profile
                                    </button>
                                    <a href="/logout" className="flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                        <IconLogout size={18} /> Keluar
                                    </a>
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Breadcrumb & Mahasiswa */}
                    <div className="flex-1 overflow-y-auto">
                        <div className=" p-8">
                            <div className="w-full flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-semibold text-xl mb-2">Keterangan Mahasiswa</p>
                                </div>

                                <div className="flex items-center flex-wrap gap-2 mb-4 text-sm font-medium">
                                    <p className="text-[#667790]">&gt;</p>
                                    <p className="px-1 text-[#667790] hover:underline cursor-pointer"
                                        onClick={() => goto('/approvalSA')} >
                                        Konfirmasi Data
                                    </p>
                                    <p className="">&gt;</p>
                                    <p className=" px-1 hover:underline cursor-pointer">
                                        Keterangan Data <span className="font-bold">{nim}</span>
                                    </p>
                                </div>
                            </div>


                            <div className="w-full mx-auto rounded-lg shadow-sm mb-4">
                                {dataMahasiswa?.map((mhs) => {
                                    const history = loanHistoryMap[mhs.nim] || [];

                                    return (
                                        <div key={mhs.nim} className="flex flex-col gap-6 mb-8">
                                            {/* Card info */}
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <div className="bg-white w-full lg:w-80 flex flex-col items-center text-center p-6 rounded-xl border border-[#EDEDED]">
                                                    <div className="w-20 h-20 rounded-full flex items-center justify-center border border-gray-300 mb-3">
                                                        <IconUser size={40} className="text-gray-500" />
                                                    </div>
                                                    <p className="font-semibold text-sm">{mhs.nama}</p>
                                                    {/* <p className="font-medium text-gray-500 text-sm">{mhs.nim}</p> */}
                                                </div>

                                                <div className="bg-white w-full p-6 flex flex-col rounded-xl border border-[#EDEDED]">
                                                    <p className="font-semibold text-base mb-4 text-left">Rincian Informasi</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                                                        <div className='ml-5 mt-7'>
                                                            <p className="text-base font-medium">Nama</p>
                                                            <p className="text-sm">{mhs.nama}</p>
                                                        </div>
                                                        <div className='ml-5 mt-7'>
                                                            <p className="text-base font-medium">NIM</p>
                                                            <p className="text-sm">{mhs.nim}</p>
                                                        </div>
                                                        <div className='ml-5 mt-7'>
                                                            <p className="text-base font-medium">Status Bebas Pustaka</p>
                                                            <p className={`text-sm ${mhs.approved === 1 ? "text-[#4ABC4C]" : "text-[#FF1515]"}`}>
                                                                {mhs.status === 1 ? "Bebas Pustaka" : "Tidak Bebas Pustaka"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tabel Keterangan */}
                                            <div className="mx-auto bg-white rounded-lg w-full mt-1 border border-[#EDEDED] p-4 flex flex-col">
                                                <p className="font-semibold text-base mb-4 text-left">Keterangan</p>
                                                <div className="w-full overflow-x-auto">
                                                    {history.length > 0 ? (
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr className="border-b-5 border-gray-300">
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Loan ID</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">NIM</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Item Code</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Biblio ID</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Jenis Buku</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Tanggal Peminjaman</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Waktu</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Due Date</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Tanggal Pengembalian</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Waktu</th>
                                                                    <th className="text-center px-2 py-2 text-xs font-semibold">Status</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {history.map((item) => (
                                                                    <tr key={item.id} className="border-b text-xs text-[#616161] hover:text-black border-gray-100 hover:bg-gray-50">

                                                                        <td className="p-1 text-center">{item.id}</td>
                                                                        <td className="p-1 text-center">{item.nim}</td>
                                                                        <td className="p-1 text-center">{item.item_code}</td>
                                                                        <td className="p-1 text-center">{item.biblio_id}</td>

                                                                        <td className="p-1 text-center">{item.book}</td>

                                                                        <td className="p-1 text-center">{item.tpinjam}</td>
                                                                        <td className="p-1 text-center">{item.wpinjam}</td>

                                                                        <td className="p-1 text-center">
                                                                            {item.due_date ? item.due_date.split("T")[0] : "-"}
                                                                        </td>

                                                                        <td className="p-1 text-center">{item.tkembali || "-"}</td>
                                                                        <td className="p-1 text-center">{item.wkembali || "-"}</td>

                                                                        <td className={`p-1 font-semibold text-center ${item.statusbuku === 0 ? "text-red-500" : "text-green-600"}`}>
                                                                            {item.statusbuku === 0 ? "Belum Dikembalikan" : "Sudah Dikembalikan"}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (

                                                        <div className="flex flex-col items-center justify-center py-12 px-4">
                                                            <div className="bg-gray-100 rounded-full p-6 mb-4">
                                                                <IconBookOff size={48} className="text-gray-400" />
                                                            </div>
                                                            <p className="text-lg font-medium text-gray-700 mb-2">
                                                                Tidak Ada Riwayat Peminjaman
                                                            </p>
                                                            <p className="text-sm text-gray-500 text-center max-w-md">
                                                                Mahasiswa ini belum memiliki riwayat peminjaman buku di perpustakaan.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="sticky w-full z-50">
                            <AppLayout />
                        </div>
                    </div>
                </div>
            </div>



        </main>
    );
}
