import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
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

export default function DashboardSA(){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
        const getSidebarItemClass = (isActive = false) => {
        const baseClasses =
            "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
        return isActive
            ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold`
            : `${baseClasses} text-[#667790] hover:bg-gray-100`;
    };
      const [profileData, setProfileData] = useState({
        name: "Loading...",
        username: "Loading...",
        role: "Admin",
      });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [chartData, setChartData] = useState({
        lineChart: null
    });

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const [visitors, setVisitors] = useState([]);

    useEffect(() => {
    const fetchProfile = async () => {
      const user = JSON.parse(localStorage.getItem('user'))
      const user_id = user.user_id;
      const token = localStorage.getItem('token')
      try {
        // Ganti URL sesuai endpoint backend Anda
        const response = await axios.get(`http://localhost:8080/api/profile/userInfo?user_id=${user_id}`,{
          headers : {
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
        <main className="font-jakarta bg-[#EDF1F3] w-screen min-h-screen">

            <header className="w-full bg-white border-b p-4 flex justify-end relative">

                <div
                    className="flex items-center gap-2 cursor-pointer pr-4 relative"
                    onClick={toggleDropdown}
                >
                    <IconChevronDown size={18} className="text-gray-600" />

                    <p className="font-semibold text-sm text-[#023048] select-none">
                        <p>Hai,&nbsp;</p>
                        {profileData.username}
                    </p>

                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                        <IconUser size={24} className="text-gray-500" />
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-4 top-full mt-2 w-64 bg-white rounded-md shadow-lg border z-10">

                        {/* Header Profile Dropdown (Default/Putih) */}
                        <div className="flex items-center gap-3 p-4 border-b">
                            <IconUser size={24} className="text-gray-500" />
                            <div>
                                <p className="font-semibold text-sm text-[#023048]">
                                {profileData.username}
                                </p>
                                <p className="text-xs text-gray-500">{profileData.role}</p>
                            </div>
                        </div>

                        {/* Menu Dropdown */}
                        <div className="p-2 space-y-1">
                            <a
                                href="/profileSA"
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

            <div className="flex pt-20 min-h-screen">
                {/* intinya ini sidebar */}
                <aside className="fixed flex flex-col top-0 left-0 w-64 md:w-64 sm:w-52 h-screen bg-white border-[2px] border-black-2 z-50">

                    <div className="flex items-center ml-4">
                        <div className="bg-[url('https://cdn.designfast.io/image/2025-10-28/d0d941b0-cc17-46b2-bf61-d133f237b449.png')] 
                      w-[29px] h-[29px] bg-cover bg-center m-4"></div>
                        <div className="text-[#023048]">Bebas Pustaka</div>
                    </div>

                    <div className="w-40 h-[2px] mt-[20px] bg-gray-200 mx-auto"></div>

                    <div className="flex-1 py-6">

                        <div className="group flex items-center justify-start cursor-pointer rounded-md bg-white hover:bg-[#667790] w-[200px] h-[39px] mb-5 ml-10 mt-5 px-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#667790"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-[25px] h-[25px] transition-all duration-200 group-hover:stroke-white group-focus:stroke-white"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                                <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                                <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
                            </svg>
                            <Link to="/dashboardSA">
                                <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                                    Dashboard
                                </h2>
                            </Link>
                        </div>

                        <div className="group flex items-center justify-start cursor-pointer rounded-md bg-white hover:bg-[#667790] w-[200px] h-[39px] mb-5 ml-10 mt-5 px-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#667790"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-[25px] h-[25px] transition-all duration-200 group-hover:stroke-white group-focus:stroke-white"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                <path d="M9 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                <path d="M15 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
                                <path d="M4 20h14" />
                            </svg>
                            <Link to="/analyticSA">
                                <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                                    Data Analitik
                                </h2>
                            </Link>
                        </div>

                        <div className="group flex items-center justify-start cursor-pointer rounded-md bg-white hover:bg-[#667790] w-[200px] h-[39px] mb-5 ml-10 mt-5 px-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#667790"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-[25px] h-[25px] transition-all duration-200 group-hover:stroke-white group-focus:stroke-white"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M11.5 17h-7.5a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3c.016 .129 .037 .256 .065 .382" />
                                <path d="M9 17v1a3 3 0 0 0 2.502 2.959" />
                                <path d="M15 19l2 2l4 -4" />
                            </svg>

                            <Link to="/approvalSA">
                                <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                                    Konfirmasi Data
                                </h2>
                            </Link>

                        </div>
                        <div className="group flex items-center justify-start cursor-pointer rounded-md bg-white hover:bg-[#667790] w-[200px] h-[39px] mb-5 ml-10 mt-5 px-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#667790"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-[25px] h-[25px] transition-all duration-200 group-hover:stroke-white group-focus:stroke-white"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M11.5 17h-7.5a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3c.016 .129 .037 .256 .065 .382" />
                                <path d="M9 17v1a3 3 0 0 0 2.502 2.959" />
                                <path d="M15 19l2 2l4 -4" />
                            </svg>

                            <Link to="/usercontrolSA">
                                <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                                    user control
                                </h2>
                            </Link>

                        </div>
                        <div className="group flex items-center justify-start cursor-pointer rounded-md bg-white hover:bg-[#667790] w-[200px] h-[39px] mb-5 ml-10 mt-5 px-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#667790"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-[25px] h-[25px] transition-all duration-200 group-hover:stroke-white group-focus:stroke-white"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M11.5 17h-7.5a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3c.016 .129 .037 .256 .065 .382" />
                                <path d="M9 17v1a3 3 0 0 0 2.502 2.959" />
                                <path d="M15 19l2 2l4 -4" />
                            </svg>

                            <Link to="/historySA">
                                <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                                    history
                                </h2>
                            </Link>

                        </div>
                    </div>



                    <div className="group flex items-center justify-start cursor-pointer rounded-md bg-white hover:bg-[#667790] w-[200px] h-[39px] mb-5 ml-10 mt-auto px-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#667790"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-[25px] h-[25px] transition-all duration-200 group-hover:stroke-white group-focus:stroke-white"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                            <path d="M9 12h12l-3 -3" />
                            <path d="M18 15l3 -3" />
                        </svg>

                        <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                            Keluar
                        </h2>
                    </div>
                </aside>



                <main className="ml-64 flex-1 p-8">

                    <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-sm mb-8">
                        <div className="w-full pb-[25%] bg-[url('https://cdn.designfast.io/image/2025-10-30/db2f71c9-29cb-42eb-a2eb-47ec9e3bdb1c.png')] bg-contain bg-no-repeat bg-center">
                        </div>
                    </div>

                    <p className="font-semibold text-2xl text-left text-black mb-8">
                        Silakan cek data yang ingin anda lihat di sini!
                    </p>

                    {/* ini chart */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        <div className="flex flex-col">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <h3 className="font-semibold text-lg mb-2 sm:mb-0">Data Analitik Mahasiswa</h3>
                                <p className="font-light text-[#9A9A9A] cursor-pointer hover:underline">
                                    Lihat data &gt;
                                </p>
                            </div>

                            <div className=" bg-white p-6">

                                {chartData.lineChart && (
                                    <div className="w-full aspect-[2/1]">
                                        <Line
                                            data={chartData.lineChart}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                        labels: {
                                                            font: {
                                                                family: '"Plus Jakarta Sans", sans-serif',
                                                            }
                                                        }
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: [
                                                            'Data kunjungan mahasiswa ke perpustakaan',
                                                            'mencatat jumlah dan frekuensi kehadiran mereka.'
                                                        ],
                                                        color: '#616161',
                                                        font: {
                                                            family: '"Plus Jakarta Sans", sans-serif',
                                                            size: 14,
                                                            weight: '300',
                                                        },
                                                        padding: {
                                                            top: 10,
                                                            bottom: 20,
                                                        },
                                                        align: 'center',
                                                    },
                                                },
                                                scales: {
                                                    x: {
                                                        grid: {
                                                            display: false
                                                        }
                                                    },
                                                    y: {
                                                        grid: {
                                                            color: '#f3f4f6'
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>



                            {/* tabel kanan */}
                        <div className="flex flex-col">

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <h3 className="font-semibold text-lg mb-2 sm:mb-0">Setujui Data Bebas Pustaka</h3>
                                <p className="font-light text-[#9A9A9A] cursor-pointer hover:underline">
                                    Lihat data &gt;
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm p-6">

                                <div className='text-[#616161] text-sm font-light text-center mb-6'>
                                    <p>Data bebas pustaka mencatat status pengajuan</p>
                                    <p>yang telah di-approve oleh admin.</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                                <th className="text-left p-4 font-semibold text-gray-600">Nama</th>
                                                <th className="text-left p-4 font-semibold text-gray-600">Nim</th>
                                                <th className="text-left p-4 font-semibold text-gray-600">Jurusan</th>
                                                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                                                <th className="text-left p-4 font-semibold text-gray-600">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4">John Doe</td>
                                                <td className="p-4">12345678</td>
                                                <td className="p-4">Teknik Informatika</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                        Pending
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'>
                                                        Setuju
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4">Jane Smith</td>
                                                <td className="p-4">87654321</td>
                                                <td className="p-4">Sistem Informasi</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        Disetujui
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button className='px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm' disabled>
                                                        Selesai
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                            
                        </div>
                    </div>
                    
                </main>
            </div>

            {/* Footer */}
            <footer className='bg-[#023048] text-white py-6 text-center'>
                <div className="ml-64">
                    <p className="text-sm">© 2024 Bebas Pustaka - Sistem Manajemen Perpustakaan</p>
                </div>
            </footer>
        </main>
    );
}

