import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import AppLayout from './AppLayout';
import axios from 'axios';
import authCheck from './authCheck';
import { useNavigate } from "react-router-dom";
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
    IconX,
    IconEye,
    IconEyeOff,
    IconCheck,
} from "@tabler/icons-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function Keterangan() {
    authCheck();
    //data dummy
    const [data, setData] = useState([
        { id: 1, book: "Winter in Tokyo", tpinjam: "12 Januari 2025", wpinjam: "10.00", tkembali: '', wkembali: '', statusbuku: 1 },
        { id: 1, book: "Winter in Tokyo", tpinjam: "12 Januari 2025", wpinjam: "10.00", tkembali: '', wkembali: '', statusbuku: 0 },
        { id: 1, book: "Winter in Tokyo", tpinjam: "12 Januari 2025", wpinjam: "10.00", tkembali: '', wkembali: '', statusbuku: 0 },
        { id: 1, book: "Winter in Tokyo", tpinjam: "12 Januari 2025", wpinjam: "10.00", tkembali: '', wkembali: '', statusbuku: 0 },
        { id: 1, book: "Winter in Tokyo", tpinjam: "12 Januari 2025", wpinjam: "10.00", tkembali: '', wkembali: '', statusbuku: 1 },
    ]);

    //goto
    const goto = useNavigate();

    const [profileData, setProfileData] = useState({
        name: "Loading...",
        username: "Loading...",
        role: "Admin",
    });
    //dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [chartData, setChartData] = useState({
        lineChart: null
    });

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

    const [visitors, setVisitors] = useState([]);

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
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("🔑 Token from localStorage:", token);

            if (!token) {
                console.warn("⚠️ No token found in localStorage!");
                return;
            }

            const response = await fetch("http://localhost:8080/api/landing/landingpagechart?year=2025", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("📊 Chart data fetched:", data);

            setChartData({
                lineChart: {
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Kunjungan per Bulan',
                            data: data.data,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        },
                    ],
                }
            });

        } catch (error) {
            console.error('❌ Error fetching chart data:', error);
        }
    };

    return (
        <main className="font-jakarta bg-[#F9FAFB] min-h-screen">

            <div className="flex">
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out 
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                lg:translate-x-0 lg:static`}>

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
                            <a href="/dashboard" className={getSidebarItemClass()}>
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
                    <header className="w-full bg-white border-b p-4 flex justify-end relative">
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

                    <div className="flex-1 overflow-y-auto p-8">

                        <div className="flex flex-col md:flex-row w-full mb-4">
                            <p className="font-semibold text-2xl mb-4 px-2 text-[#667790]"> &gt; </p>
                            <p className="font-semibold text-2xl mb-2 px-2 text-[#667790] hover:underline cursor-pointer"
                            onClick={() => goto('/approvalSA')}>Konfirmasi Data</p>
                            <p className="font-semibold text-2xl mb-2 px-2 ">&gt;</p>
                            <p className="font-semibold text-2xl mb-2 px-2 hover:underline cursor-pointer ">Keterangan Data</p>
                        </div>

                        <div className="w-full mx-auto rounded-lg shadow-sm mb-4">
                            <div className="flex flex-col lg:flex-row mx-auto gap-6 rounded-lg w-full">

                                <div className="bg-white w-full lg:w-80 flex flex-col items-center text-center p-6 rounded-xl shadow-md">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center border border-gray-300 mb-3">
                                        <IconUser size={40} className="text-gray-500" />
                                    </div>

                                    <p className="font-bold text-xl">Hoshimi Miyabi</p>
                                    <p className="font-medium text-gray-500 text-sm">1234567</p>
                                </div>


                                <div className="bg-white w-full p-6 flex flex-col rounded-xl shadow-md">
                                    <p className="font-bold text-xl mb-4 text-left">Rincian Informasi</p>


                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">

                                        <div className='ml-5 my-4'>
                                            <p className="text-lg font-medium">Nama</p>
                                            <p className="text-sm">Hoshimi Miyabi</p>
                                        </div>

                                        <div className='ml-5 my-4'>
                                            <p className="text-lg font-medium">NIM</p>
                                            <p className="text-sm">1234567</p>
                                        </div>

                                        <div className='ml-5 my-4'>
                                            <p className="text-lg font-medium">Status Bebas Pustaka</p>
                                            <p className="text-sm">Hoshimi Miyabi</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="mx-auto bg-white rounded-lg w-full mt-7 shadow-md p-4 flex flex-col">

                                {/* KETERANGAN */}
                                <p className="text-lg font-medium mb-4 text-left">
                                    Keterangan
                                </p>

                                {/* TABEL DI BAWAH */}
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full border-collapse ">
                                        <thead>
                                            <tr className="border-b-5 border-gray-300 ">
                                                <th className="text-left px-2 py-2 font-semibold text-center text-xs">Jenis Buku</th>
                                                <th className="text-left px-2 py-2 font-semibold text-center text-xs">Tanggal Peminjaman</th>
                                                <th className="text-left px-2 py-2 font-semibold text-center text-xs">Waktu</th>
                                                <th className="text-left px-2 py-2 font-semibold text-center text-xs">Tanggal Pengembalian</th>
                                                <th className="text-left px-2 py-2 font-semibold text-center text-xs">Waktu</th>
                                                <th className="text-left px-2 py-2 font-semibold text-center text-xs">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((item, index) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b text-xs text-[#616161] hover:text-black border-gray-100 hover:bg-gray-50"
                                                >
                                                    <td className="p-1">{item.book}</td>
                                                    <td className="p-1">{item.tpinjam}</td>
                                                    <td className="p-1">{item.wpinjam}</td>
                                                    <td className="p-1">{item.tkembali}</td>
                                                    <td className="p-1">{item.wkembali}</td>
                                                    <td className={`p-4 font-semibold ${item.statusbuku === 0 ? "text-red-500" : "text-green-600"}`}>
                                                        {item.statusbuku === 0 ? "Belum Dikembalikan" : "Sudah Dikembalikan"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <div className="sticky w-full z-50">
                <AppLayout></AppLayout>
            </div>
        </main>
    );
}

