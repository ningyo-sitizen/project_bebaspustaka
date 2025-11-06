import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
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

function Dashboard() {
    // ini default line chart ya
    const [chartData, setChartData] = useState({
        lineChart: null
    });

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            
            const mockData = {
                monthlyVisits: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                    values: [65, 59, 80, 81, 56, 55]
                }
            };

            setChartData({
                lineChart: {
                    labels: mockData.monthlyVisits.labels,
                    datasets: [
                        {
                            label: 'Kunjungan per Bulan',
                            data: mockData.monthlyVisits.values,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        },
                    ],
                }
            });
        } catch (error) {
            console.error('Error fetching chart data:', error);

           
            const fallbackData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                datasets: [
                    {
                        label: 'Kunjungan per Bulan',
                        data: [65, 59, 80, 81, 56, 55],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    },
                ],
            };
            setChartData({ lineChart: fallbackData });
        }
    };
    return (
        <body className="font-jakarta bg-[#EDF1F3] w-full min-h-screen">

            <header className="fixed bg-white bg-cover bg-no-repeat bg-center w-full h-20 top-0 z-50">
                <div class="absolute inline-flex m-2 right-24">
                    <div className="inline-flex items-center">
                        <p>Hai,&nbsp;</p>
                        {/* ini nanti terhubung sama database akun pustakawan */}
                        <p class="mr-3">misal sini Zahra</p>
                    </div>
                    <div className="bg-[url('https://cdn.designfast.io/image/2025-10-28/0b728be1-b553-4462-b4c9-41c894ee5f79.jpeg')] 
                   bg-cover bg-center rounded-full w-16 h-16">
                    </div>
                </div>
            </header>
            {/* intinya ini sidebar */}
            <aside className="fixed flex flex-col top-0 left-0 w-64 h-screen bg-white border-[2px] border-black-2 z-50">
                <div className="flex items-center ml-4">
                    <div className="bg-[url('https://cdn.designfast.io/image/2025-10-28/d0d941b0-cc17-46b2-bf61-d133f237b449.png')] 
                      w-[29px] h-[29px] bg-cover bg-center m-4"></div>
                    <div className="text-[#023048]">Bebas Pustaka</div>
                </div>

                <div className="w-40 h-[2px] mt-[20px] bg-gray-200 mx-auto"></div>

                <div className="relative top-[20px] flex flex-col gap-4">
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

                        <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                            Dashboard
                        </h2>
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

                        <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                            Data Analitik
                        </h2>

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

                        <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                            Konfirmasi Data
                        </h2>

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
            <div
                className="absolute w-[80vw] h-[38vh] left-[15vw] top-[150px] bg-[length:80%_auto] bg-[url('https://cdn.designfast.io/image/2025-10-30/db2f71c9-29cb-42eb-a2eb-47ec9e3bdb1c.png')] bg-no-repeat bg-center rounded-2xl">
            </div>
            <p className="absolute font-semibold text-2xl text-black m-3 left-[22vw] top-[420px]">Silakan cek data yang ingin anda
                lihat di sini!</p>

            {/* nih baru dah visualisasinya */}
            <div className="relative inline-block left-[23vw] top-[500px] whitespace-nowrap">

                <div className='inline-block'>

                    {/* <!-- chart --> */}
                    <div className="w-[495px] flex justify-between">
                        <h3 className="font-semibold">Data Analitik Mahasiswa</h3>
                        <p className="font-thin text-[#9A9A9A]">Lihat data &gt;</p>
                    </div>

                    {/* <!-- body chart --> */}
                    <div className="absolute bg-white w-[495px] top-[39px]">
                        <div className="p-4">
                            {/* ini contohnya sih, keknya gmn berubahnya tuh mainin di backend nya ya */}
                            {chartData.lineChart && (
                                <div className="mb-4 w-full h-[150px] md:h-[300px]">
                                    <Line
                                        data={chartData.lineChart}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
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
                                                        style: 'normal',
                                                    },
                                                    padding: {
                                                        top: 10,
                                                        bottom: 0,
                                                    },
                                                    align: 'center',

                                                },
                                            },
                                        }}
                                    />
                                </div>
                            )}

                            {/* Bar Chart */}
                            {/* {chartData.barChart && (
                                <div className="mb-4">
                                    <Bar
                                        data={chartData.barChart}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            )} */}

                            {/* Pie Chart */}
                            {/* {chartData.pieChart && (
                                <div className="mb-4">
                                    <Pie
                                        data={chartData.pieChart}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            )} */}
                        </div>
                    </div>

                </div>
                <div className="relative inline-block left-[25px]">
                    <div className="w-[495px] flex justify-between">
                        <h3 className="font-semibold">Setujui Data Bebas Pustaka</h3>
                        <p className="font-thin text-[#9A9A9A]">Lihat data &gt;</p>
                    </div>

                    <div className="absolute bg-white w-[495px] top-[39px]">
                        <div className=' text-[#616161] text-[14px] font-light text-center'>
                            <p>Data bebas pustaka mencatat status pengajuan</p>
                            <p>yang telah di-approve oleh admin.</p>
                        </div>

                        {/* tabel sementara */}
                        <div className="overflow-x-auto">
                            <table className="border-collapse border border-gray-300 min-w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2">Nama</th>
                                        <th className="border p-2">Email</th>
                                        <th className="border p-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border p-2">Vyn</td>
                                        <td className="border p-2">vyn@example.com</td>
                                        <td className="border p-2">Edit</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    )
}

export default Dashboard
