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
import { Link } from 'react-router-dom';

// Register ChartJS components
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

    const [user, setUser] = useState(null);
    const [visitors, setVisitors] = useState([]);

    const [chartData, setChartData] = useState({
        lineChart: null,
        pieChart: null,
        barChart: null,
    });

    const [showFilterR, setShowFilterR] = useState(false);
    const [showFilterL, setShowFilterL] = useState(false);

    const [activeR, setActiveR] = useState(false);
    const [activeL, setActiveL] = useState(false);

    const [actJurusanR, setActJurusanR] = useState(false);
    const [actJurusanL, setActJurusanL] = useState(false);

    const [activeChartR, setActiveChartR] = useState("Line");
    const [activeChartL, setActiveChartL] = useState("Line");


    const [cekA, setCekA] = useState(false);
    const [cekB, setCekB] = useState(false);
    const [cekC, setCekC] = useState(false);

    const [cekA1, setCekA1] = useState(false);
    const [cekB2, setCekB2] = useState(false);
    const [cekC2, setCekC2] = useState(false);

    const [years, setYears] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedType, setSelectedType] = useState("");



    const renderChartL = () => {
        if (!chartData.lineChart || !chartData.pieChart || !chartData.barChart) {
            return <p>Loading chart...</p>;
        }
        switch (activeChartL) {
            case "Line":
                return (
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
                );
            case "circle":
                return (<Pie data={chartData.pieChart} options={{
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
                }} />
                );
            case "Bar":
                return (
                    <Bar data={chartData.barChart} options={{
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
                    }} />
                );
        }
    };

    const renderChartR = () => {
        if (!chartData.lineChart || !chartData.pieChart || !chartData.barChart) {
            return <p>Loading chart...</p>;
        }
        switch (activeChartR) {
            case "Line":
                return (
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
                );
            case "circle":
                return (<Pie data={chartData.pieChart} options={{
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
                }} />
                );
            case "Bar":
                return (
                    <Bar data={chartData.barChart} options={{
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
                    }} />
                );
        }
    };

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        fetchYears();
        fetchChartData();
    }, []);

    const fetchYears = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/dashboard/years", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            setYears(data);
        } catch (err) {
            console.log("xd", err);
        }
    }

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
                },
                pieChart: {
                    labels: ['Teknik Informatika', 'Teknik Multimedia & Jaringan', 'Teknik Multimedia', 'Teknik Komputer & Jaringan'],
                    datasets: [
                        {
                            label: 'Angkatan',
                            data: [120, 90, 70, 40],
                            backgroundColor: [
                                '#537FF1',
                                '#8979FF',
                                '#A8B5CB',
                                '#667790',
                            ],
                        }
                    ]
                },
                barChart: {
                    labels: mockData.monthlyVisits.labels,
                    datasets: [
                        {
                            label: 'Kunjungan per Bulan',
                            data: mockData.monthlyVisits.values,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
        <div className="font-jakarta bg-[#EDF1F3] w-full min-h-screen">

            <header className="fixed bg-white bg-cover bg-no-repeat bg-center w-full h-20 top-0 z-50">
                <div class="absolute inline-flex m-2 right-24">
                    <div className="inline-flex items-center">
                        <p>Hai,&nbsp;</p>
                        {user ? (
                            <p className="mr-3 font-semibold">{user.name}</p>
                        ) : (
                            <p className="mr-3 text-gray-500">Loading...</p>
                        )}
                    </div>
                    <div className="bg-[url('https://cdn.designfast.io/image/2025-10-28/0b728be1-b553-4462-b4c9-41c894ee5f79.jpeg')] 
                   bg-cover bg-center rounded-full w-16 h-16">
                    </div>
                </div>
            </header>

            <div className="flex pt-20 min-h-screen">
                <aside className="fixed flex flex-col top-0 left-0 w-64 h-screen bg-white border-[2px] border-black-2 z-50">
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
                            <Link to="/dashboard">
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
                            <Link to="/analytic">
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



                <main className="ml-64 flex-1 p-8">

                    <div className="w-full h-48 bg-[url('https://cdn.designfast.io/image/2025-10-30/db2f71c9-29cb-42eb-a2eb-47ec9e3bdb1c.png')] 
                                bg-cover bg-center rounded-2xl mb-8 shadow-sm">
                    </div>

                    <p className="font-semibold text-2xl text-black mb-8">
                        Silakan cek data yang ingin anda lihat di sini!
                    </p>


                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                        <div>
                            <div className="flex justify-between items-center mb-4 w-full">
                                <h3 className="font-semibold text-lg">Data Analitik Mahasiswa</h3>
                                <p className="font-light text-[#9A9A9A] cursor-pointer hover:underline"
                                    onClick={() => setShowFilterL(!showFilterL)}>
                                    Filter &gt;
                                </p>
                            </div>

                            <div className=" bg-white p-6">
                                <div className="relative">
                                    {showFilterL && (
                                        <div className="absolute top-0 right-0 p-4 bg-white border w-64 z-20">
                                            <p className="font-thin mb-2">Filter </p>
                                            <p className="font-nomral text-[#023048]">Kategori Akademik</p>

                                            <p className={`cursor-pointer text-black transition-all ${activeL ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                }`}
                                                onClick={() => setActiveL(!activeL)}>Tahun Masuk
                                            </p>
                                            <div className='gap-5'>
                                                {years.length > 0 ? (
                                                    years.map((year) => (
                                                        <label
                                                            key={year}
                                                            className="cursor-pointer flex items-center gap-2 font-thin"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                value={year}
                                                                checked={selectedYears.includes(year)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedYears([...selectedYears, year]);
                                                                    } else {
                                                                        setSelectedYears(selectedYears.filter((y) => y !== year));
                                                                    }
                                                                }}
                                                                className="accent-blue-600 w-[12px] h-[12px] cursor-pointer"
                                                            />
                                                            <span
                                                                className={
                                                                    selectedYears.includes(year)
                                                                        ? "underline text-[#023048]"
                                                                        : "text-gray-600"
                                                                }
                                                            >
                                                                {year}
                                                            </span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm">Memuat tahun...</p>
                                                )}


                                            </div>

                                            <p className={`cursor-pointer text-black transition-all ${actJurusanL ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                }`}
                                                onClick={() => setActJurusanL(!actJurusanL)}>Jurusan
                                            </p>
                                            <p className="font-nomral text-[#023048] mt-3">Kategori Diagram</p>
                                            <div className='gap-4 mb-4 pb-4'>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartL === "circle" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                    }`}
                                                    onClick={() => setActiveChartL("circle")}>Diagram Lingkaran
                                                </p>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartL === "Line" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                    }`}
                                                    onClick={() => setActiveChartL("Line")}>Diagram Garis
                                                </p>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartL === "Bar" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                    }`}
                                                    onClick={() => setActiveChartL("Bar")}>Diagram Batang
                                                </p>
                                            </div>

                                        </div>
                                    )}
                                    <div className="overflow-x-auto">
                                        <div className="w-full h-80">
                                            {renderChartL()}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">Setujui Data Bebas Pustaka</h3>
                                <p className="font-light text-[#9A9A9A] cursor-pointer hover:underline"
                                    onClick={() => setShowFilterR(!showFilterR)}>
                                    Filter &gt;
                                </p>

                            </div>

                            <div className="bg-white p-6">
                                <div className="relative">

                                    <div className="overflow-x-auto">
                                        <div className="w-full h-80">
                                            {renderChartR()}
                                        </div>
                                    </div>

                                    {/* filtering */}
                                    {showFilterR && (
                                        <div className="absolute top-0 right-0 p-4 bg-white border w-64 z-20">
                                            <p className="font-thin mb-2">Filter </p>
                                            <p className="font-nomral text-[#023048]">Kategori Akademik</p>

                                            <p className={`cursor-pointer text-black transition-all ${activeR ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                }`}
                                                onClick={() => setActiveR(!activeR)}>Tahun Masuk
                                            </p>
                                            <div className='gap-5'>
                                                <label className="cursor-pointer flex items-center gap-2 font-thin">
                                                    <input
                                                        type="checkbox"
                                                        checked={cekA1}
                                                        onChange={() => setCekA1(!cekA1)}
                                                        className="accent-blue-600 w-[10px] h-[10px] cursor-pointer"
                                                    />
                                                    <span className={cekA1 ? "underline" : "text-gray-600"}>
                                                        2021
                                                    </span>
                                                </label>
                                                <label className="cursor-pointer flex items-center gap-2 font-thin">
                                                    <input
                                                        type="checkbox"
                                                        checked={cekB2}
                                                        onChange={() => setCekB2(!cekB2)}
                                                        className="accent-blue-600 w-[10px] h-[10px] cursor-pointer"
                                                    />
                                                    <span className={cekB2 ? "underline" : "text-gray-600"}>
                                                        2022
                                                    </span>
                                                </label>
                                                <label className="cursor-pointer flex items-center gap-2 font-thin">
                                                    <input
                                                        type="checkbox"
                                                        checked={cekC2}
                                                        onChange={() => setCekC2(!cekC2)}
                                                        className="accent-blue-600 w-[10px] h-[10px] cursor-pointer"
                                                    />
                                                    <span className={cekC2 ? "underline" : "text-gray-600"}>
                                                        2023
                                                    </span>
                                                </label>
                                            </div>

                                            <p className={`cursor-pointer text-black transition-all ${actJurusanR ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                }`}
                                                onClick={() => setActJurusanR(!actJurusanR)}>Jurusan
                                            </p>
                                            <p className="font-nomral text-[#023048] mt-3">Kategori Diagram</p>
                                            <div className='gap-4 mb-4 pb-4'>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartR === "circle" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                    }`}
                                                    onClick={() => setActiveChartR("circle")}>Diagram Lingkaran
                                                </p>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartR === "Line" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                    }`}
                                                    onClick={() => setActiveChartR("Line")}>Diagram Garis
                                                </p>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartR === "Bar" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"
                                                    }`}
                                                    onClick={() => setActiveChartR("Bar")}>Diagram Batang
                                                </p>
                                            </div>

                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        <div className='mt-5'>
                            <div className="relative inline-flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-lg">Ringkasan</h3>
                            </div>

                            <div className="bg-white p-6">
                                <div className="relative">

                                    <div className="overflow-x-auto">
                                        <div className="font-semibold font-black">Data Kunjungan Mahasiswa</div>
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b-2 border-black">
                                                    <th className="text-left p-4 font-normal text-gray-600">No</th>
                                                    <th className="text-left p-4 font-normal text-gray-600">Jurusan</th>
                                                    <th className="text-left p-4 font-normal text-gray-600">Program Studi</th>
                                                    <th className="text-left p-4 font-normal text-gray-600">Tahun Masuk</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-black hover:bg-gray-50">
                                                    <td className="p-4">1</td>
                                                    <td className="p-4">Teknik Informatika & Komputer</td>
                                                    <td className="p-4">D4 Teknik Informatika</td>
                                                    <td className="p-4">2025</td>

                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-5'>
                            <div className="mb-4 h-[32px]"></div>
                            <div className="bg-white p-6">
                                <div className="relative">

                                    <div className="overflow-x-auto">
                                        <div className="font-semibold font-black">Data Bebas Pustaka</div>
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b-2 border-black">
                                                    <th className="text-left p-4 font-normal text-gray-600">No</th>
                                                    <th className="text-left p-4 font-normal text-gray-600">Jurusan</th>
                                                    <th className="text-left p-4 font-normal text-gray-600">Program Studi</th>
                                                    <th className="text-left p-4 font-normal text-gray-600">Tahun Masuk</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-black hover:bg-gray-50">
                                                    <td className="p-4">1</td>
                                                    <td className="p-4">Teknik Informatika & Komputer</td>
                                                    <td className="p-4">D4 Teknik Informatika</td>
                                                    <td className="p-4">2025</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 '>
                        <div className="relative inline-flex justify-between items-center mt-32 mb-4    ">
                            <h3 className="font-semibold text-lg">Data Peminjaman Buku</h3>
                        </div>

                        <div className="bg-white p-6">
                            <div className="relative bottom-0">

                                <div className="overflow-x-auto">
                                    <div className="font-semibold font-black">Data Bebas Pustaka</div>
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b-2 border-black">
                                                <th className="text-left p-4 font-normal text-gray-600">No</th>
                                                <th className="text-left p-4 font-normal text-gray-600">Member ID</th>
                                                <th className="text-left p-4 font-normal text-gray-600">Tanggal Pinjam</th>
                                                <th className="text-left p-4 font-normal text-gray-600">Deadline</th>
                                                <th className="text-left p-4 font-normal text-gray-600">Tanggal di kembalikan</th>
                                                <th className="text-left p-4 font-normal text-gray-600">Status Buku</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-black hover:bg-gray-50">
                                                <td className="p-4">1</td>
                                                <td className="p-4">#24324323</td>
                                                <td className="p-4">29/09/2025</td>
                                                <td className="p-4">7 Hari</td>
                                                <td className="p-4">01/10/2025</td>
                                                <td className="p-4 text-[#4ABC4C]">Sudah Dikembalikan</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                </main>
            </div >

            {/* Footer */}
            < footer className='bg-[#023048] text-white py-6 text-center' >
                <div className="ml-64">
                    <p className="text-sm">blalaalS</p>
                </div>
            </footer >
        </div >
    );
}

export default Dashboard;