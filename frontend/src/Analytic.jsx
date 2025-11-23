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
import { data, Link } from 'react-router-dom';

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

    const [tableData, setTableData] = useState(null);

    const [chartDataR, setChartDataR] = useState({
        lineChart: null,
        pieChart: null,
        barChart: null,
    })

    const [chartDataL, setChartDataL] = useState({
        lineChart: null,
        pieChart: null,
        barChart: null,
    })



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
    const [tempYears, setTempYears] = useState([]);
    const [tempType, setTempType] = useState("");

    const [angkatan, setAngkatan] = useState([]);
    const [selectedAngkatan, setSelectedAngkatan] = useState([]);
    const [tempAngkatan, setTempAngkatan] = useState([])
    const [lembaga, setLembaga] = useState([]);
    const [selectedLembaga, setSelectedLembaga] = useState([]);
    const [tempLembaga, setTempLembaga] = useState([]);
    const [prodi, setProdi] = useState({});
    const [selectedProdi, setSelectedProdi] = useState([]);
    const [tempProdi, setTempProdi] = useState([]);

    const [activeProdiR, setActiveProdiR] = useState(false);
    const [tableDataRight, setTableDataRight] = useState(null);

    const [loanHistory, setLoanHistory] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);


    const handleResetFilters = () => {
        setSelectedYears([]);
        setSelectedType("");
        fetchChartDataLeft();
    };

    const handleCancelFilters = () => {
        setSelectedYears(tempYears);
        setSelectedType(tempType);
        setShowFilterL(false);
    };

    const handleResetFiltersRight = () => {
        setSelectedAngkatan([]);
        setSelectedLembaga([]);
        setSelectedProdi([]);
        setTempAngkatan([]);
        setTempLembaga([]);
        setTempProdi([]);
        fetchChartDataRight();
    };
    const handleCancelFiltersRight = () => {
        setSelectedAngkatan(tempAngkatan);
        setSelectedLembaga(tempLembaga);
        setSelectedProdi(tempProdi);
        setShowFilterR(false);
    };


    const autoBuildChartData = (data, selectedType) => {
        const monthLabels = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const getRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgba(${r}, ${g}, ${b}, 0.8)`;
        };

        let baseLabels = [];
        if (selectedType === "monthly") baseLabels = monthLabels;
        else if (selectedType === "yearly") baseLabels = data.years;
        else if (selectedType === "weekly") {
            baseLabels = [...new Set(Object.values(data.data)
                .flat()
                .map(r => r.label))];
        } else if (selectedType === "daily") {
            baseLabels = [...new Set(Object.values(data.data)
                .flat()
                .map(r => r.label))];
        }

        if (selectedType === "monthly") {
            baseLabels = monthLabels.filter(m =>
                Object.values(data.data)
                    .flat()
                    .some(r => String(r.label).startsWith(m))
            );
        }



        const datasets = Object.keys(data.data).map((year) => {
            const yearData = data.data[year];
            const color = getRandomColor();

            const values = baseLabels.map((label) => {
                const found = yearData.find(r => String(r.label).startsWith(label));
                return found ? found.total_visitor : 0;
            });

            return {
                label: `Tahun ${year}`,
                data: values,
                borderColor: color,
                backgroundColor: color.replace("0.8", "0.3"),
                borderWidth: 2,
                tension: 0.3
            };
        });

        return { labels: baseLabels, datasets };
    };
    const handleApplyFiltersLeft = async () => {
        setTempYears(selectedYears);
        setTempType(selectedType);
        setShowFilterL(false);

        try {
            const token = localStorage.getItem("token");
            const query = new URLSearchParams();
            if (selectedYears.length > 0) query.append("year", selectedYears.join(","));
            if (selectedType) query.append("period", selectedType);

            const res = await fetch(`http://localhost:8080/api/dashboard/visitor?${query.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            console.log(selectedYears, selectedType)
            console.log(data)



            const chart = autoBuildChartData(data, selectedType)

            setChartDataL({
                lineChart: chart,
                barChart: chart,
                pieChart: chart,
            });

            setTableData(data)
            fetchAngkatan()
            fetchProdi()
            console.log(angkatan)
            console.log(prodi)
            console.log(years)

        } catch (err) {
            console.error("❌ Error applying filters:", err);
        }
    };


    const autoBuildChartDataRight = (apiResponse) => {
        const { mode, data, years } = apiResponse;

        const generateColors = (count) => {
            const colors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
            ];
            return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
        };

        if (mode === "default_year") {

            const sortedYears = [...years].sort((a, b) => a - b);

            return {
                labels: sortedYears,
                datasets: [{
                    label: "Total Peminjaman",
                    data: sortedYears.map(year => data[year][0].total),
                    backgroundColor: generateColors(sortedYears.length),
                    borderColor: generateColors(sortedYears.length),
                    borderWidth: 1
                }]
            };
        }

        if (mode === "per_lembaga") {
            const sortedYears = [...years].sort((a, b) => a - b);

            const lembagaSet = new Set();
            sortedYears.forEach(year => {
                data[year].forEach(item => lembagaSet.add(item.lembaga));
            });
            const lembagaList = Array.from(lembagaSet);

            return {
                labels: sortedYears,
                datasets: lembagaList.map((lem, idx) => ({
                    label: lem,
                    data: sortedYears.map(year => {
                        const found = data[year].find(item => item.lembaga === lem);
                        return found ? found.total : 0;
                    }),
                    backgroundColor: generateColors(lembagaList.length)[idx],
                    borderColor: generateColors(lembagaList.length)[idx],
                    borderWidth: 1
                }))
            };
        }

        if (mode === "per_program") {
            const sortedYears = [...years].sort((a, b) => a - b);

            const programSet = new Set();
            sortedYears.forEach(year => {
                data[year].forEach(item => programSet.add(item.program));
            });
            const programList = Array.from(programSet);

            return {
                labels: sortedYears,
                datasets: programList.map((prog, idx) => ({
                    label: prog,
                    data: sortedYears.map(year => {
                        const found = data[year].find(item => item.program === prog);
                        return found ? found.total : 0;
                    }),
                    backgroundColor: generateColors(programList.length)[idx],
                    borderColor: generateColors(programList.length)[idx],
                    borderWidth: 1
                }))
            };
        }

        return {
            labels: [],
            datasets: []
        };
    };

    const handleApplyFiltersRight = async () => {
        setTempAngkatan(selectedAngkatan);
        setTempLembaga(selectedLembaga);
        setTempProdi(selectedProdi);
        setShowFilterR(false);

        try {
            const token = localStorage.getItem("token");
            const query = new URLSearchParams();

            if (selectedAngkatan.length > 0) query.append("tahun", selectedAngkatan.join(","));
            if (selectedLembaga.length > 0) query.append("lembaga", selectedLembaga.join(","));
            if (selectedProdi.length > 0) query.append("program", selectedProdi.join(","));

            const res = await fetch(`http://localhost:8080/api/loan/summary?${query.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            console.log("Filter Right Applied:", {
                angkatan: selectedAngkatan,
                lembaga: selectedLembaga,
                prodi: selectedProdi
            });
            console.log("Response data:", data);

            const chart = autoBuildChartDataRight(data);

            setChartDataR({
                lineChart: chart,
                barChart: chart,
                pieChart: chart,
                doughnutChart: chart
            });

            setTableDataRight(data);

        } catch (err) {
            console.error("❌ Error applying right filters:", err);
        }
    };
    function DataTable({ selectedType, data }) {
        if (!data || !data.data) return null;

        const getHeaders = () => {
            switch (selectedType) {
                case "daily":
                    return ["Year", "Date", "Total Visitors"];

                case "weekly":
                    return ["Year", "Week", "Start Date", "End Date", "Total Visitors"];

                case "monthly":
                    return ["Year", "Month", "Total Visitors"];

                case "yearly":
                    return ["Year", "Total Visitors"];

                default:
                    return ["Year", "Label", "Total Visitors"];
            }
        };

        const headers = getHeaders();

        const renderRows = () => {
            return Object.keys(data.data).map((year) =>
                data.data[year].map((item, i) => (
                    <tr key={`${year}-${i}`} className="border-b hover:bg-gray-50">

                        <td className="p-3">{year}</td>

                        {selectedType === "daily" && (
                            <td className="p-3">{item.label}</td>
                        )}

                        {selectedType === "monthly" && (
                            <td className="p-3">{item.label}</td>
                        )}

                        {selectedType === "yearly" && (
                            <td className="p-3">{item.total_visitor}</td>
                        )}

                        {selectedType === "weekly" && (
                            <>
                                <td className="p-3">{item.label}</td>
                                <td className="p-3">{item.start_date}</td>
                                <td className="p-3">{item.end_date}</td>
                                <td className="p-3">{item.total_visitor}</td>
                            </>
                        )}

                        {/* DEFAULT FALLBACK */}
                        {selectedType !== "weekly" && selectedType !== "yearly" && (
                            <td className="p-3">{item.total_visitor}</td>
                        )}

                    </tr>
                ))
            );
        };


        return (
            <div className="bg-white p-6 mt-8 rounded-xl shadow">
                <h3 className="font-semibold text-lg mb-4 capitalize">
                    {selectedType} Visitor Data
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th key={idx} className="p-3 border font-medium text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{renderRows()}</tbody>
                    </table>
                </div>
            </div>
        );
    }

    function DataTableRight({ data }) {
        if (!data || !data.data) return null;

        const { mode, years, lembaga } = data;

        const getHeaders = () => {
            switch (mode) {
                case "default_year":
                    return ["Tahun", "Total Peminjaman"];
                case "per_lembaga":
                    return ["Tahun", "Lembaga", "Total Peminjaman"];
                case "per_program":
                    return ["Tahun", "Lembaga", "Program Studi", "Total Peminjaman"];
                default:
                    return ["Tahun", "Info", "Total"];
            }
        };

        const headers = getHeaders();

        const renderRows = () => {
            const sortedYears = [...years].sort((a, b) => b - a);

            if (mode === "default_year") {
                return sortedYears.map((year) => (
                    <tr key={year} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">{year}</td>
                        <td className="p-3">{data.data[year][0].total.toLocaleString()}</td>
                    </tr>
                ));
            }

            if (mode === "per_lembaga") {
                return sortedYears.map((year) =>
                    data.data[year].map((item, i) => (
                        <tr key={`${year}-${i}`} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-semibold">{year}</td>
                            <td className="p-3">{item.lembaga}</td>
                            <td className="p-3">{item.total.toLocaleString()}</td>
                        </tr>
                    ))
                );
            }

            if (mode === "per_program") {
                return sortedYears.map((year) =>
                    data.data[year].map((item, i) => (
                        <tr key={`${year}-${i}`} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-semibold">{year}</td>
                            <td className="p-3">{item.lembaga}</td> {/* ✅ TAMBAH Kolom Lembaga */}
                            <td className="p-3">{item.program}</td>
                            <td className="p-3">{item.total.toLocaleString()}</td>
                        </tr>
                    ))
                );
            }

            return null;
        };

        const getTitle = () => {
            switch (mode) {
                case "default_year":
                    return "Data Peminjaman Per Tahun";
                case "per_lembaga":
                    return "Data Peminjaman Per Lembaga";
                case "per_program":
                    return "Data Peminjaman Per Program Studi";
                default:
                    return "Data Peminjaman";
            }
        };

        return (
            <div className="bg-white p-6 mt-8 rounded-xl shadow">
                <h3 className="font-semibold text-lg mb-4">{getTitle()}</h3>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th key={idx} className="p-3 border font-medium text-left">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{renderRows()}</tbody>
                    </table>
                </div>
            </div>
        );
    }




    const renderChartL = () => {
        if (!chartDataL.lineChart || !chartDataL.pieChart || !chartDataL.barChart) {
            return <p>Loading chart...</p>;
        }
        switch (activeChartL) {
            case "Line":
                return (
                    <Line
                        data={chartDataL.lineChart}
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
                return (<Pie data={chartDataL.pieChart} options={{
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
                    <Bar data={chartDataL.barChart} options={{
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
        if (!chartDataR.lineChart || !chartDataR.pieChart || !chartDataR.barChart) {
            return <p>Loading chart...</p>;
        }
        switch (activeChartR) {
            case "Line":
                return (
                    <Line
                        data={chartDataR.lineChart}
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
                return (<Pie data={chartDataR.pieChart} options={{
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
                    <Bar data={chartDataR.barChart} options={{
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
        fetchChartDataLeft();
        fetchChartDataRight();
        fetchAngkatan();
        fetchLoanHistory(1);
        fetchLembaga();

    }, []);

    useEffect(() => {
        if (selectedLembaga.length > 0) {
            fetchProdi(selectedLembaga);
        } else {
            setProdi({});
            setSelectedProdi([]);
        }
    }, [selectedLembaga]);

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

    const fetchAngkatan = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/loan/angkatan", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            setAngkatan(data);
        }
        catch (err) {
            console.log("gagal mengambil tahun angkatan")
        }
    }

    const fetchLembaga = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/loan/lembaga", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }

            });
            const data = await res.json();
            setLembaga(data);
        } catch (err) {
            console.log("gagal mengambil lembaga")
        }
    }

    const fetchLoanHistory = async (page = 1) => {
        const res = await fetch(
            `http://localhost:8080/api/loan/loanHistory?page=${page}&limit=${limit}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const result = await res.json();
        setLoanHistory(result.data);
        setPage(result.page);
    };
    ;

    const fetchProdi = async (lembagaList) => {
        if (lembagaList.length === 0) {
            setProdi({});
            setSelectedProdi([]);
            return;
        }

        const query = new URLSearchParams();
        query.append("lembaga", lembagaList.join(","));

        const res = await fetch(`http://localhost:8080/api/loan/program?${query}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        const data = await res.json();

        setProdi(data);

        const allValiProdi = Object.values(data).flat();
        setSelectedProdi((prev) =>
            prev.filter((ps) => allValiProdi.includes(ps))
        )
    }


    const fetchChartDataLeft = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/landing/landingpagechart?year=2025`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const mockData = await res.json();

            setChartDataL({
                lineChart: {
                    labels: mockData.labels,
                    datasets: [
                        {
                            label: 'Kunjungan per Bulan tahun 2025',
                            data: mockData.data,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        },
                    ],
                },
                pieChart: {
                    labels: mockData.labels,
                    datasets: [
                        {
                            label: "Kunjungan",
                            data: mockData.data,
                            backgroundColor: [
                                '#537FF1',
                                '#8979FF',
                                '#A8B5CB',
                                '#667790',
                            ]
                        }
                    ]
                },
                barChart: {
                    labels: mockData.labels,
                    datasets: [
                        {
                            label: 'Kunjungan per Bulan',
                            data: mockData.data,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        },
                    ],
                }
            });

            const tableDataFormat = {
                years: [2025],
                data: {
                    2025: mockData.labels.map((label, index) => ({
                        label: label,
                        total_visitor: mockData.data[index]
                    }))
                }
            };

            setTableData(tableDataFormat);
            setSelectedType("monthly");

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
            setChartDataL({ lineChart: fallbackData });
        }
    };

    const fetchChartDataRight = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/loan/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            const chart = autoBuildChartDataRight(data);

            setChartDataR({
                lineChart: chart,
                barChart: chart,
                pieChart: chart,
                doughnutChart: chart
            });

            setTableDataRight(data);
        } catch (err) {
            console.error("❌ Error fetching right chart data:", err);
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

                                            <p className='font-normal text-[#023048] mt-4'>Tipe</p>
                                            <div className="gap-4 flex flex-col mt-2">
                                                {["daily", "weekly", "monthly", "yearly"].map((type) => (
                                                    <label
                                                        key={type}
                                                        className="cursor-pointer flex items-center gap-2 font-thin"
                                                    >
                                                        <input
                                                            type='radio'
                                                            name='type'
                                                            value={type}
                                                            checked={selectedType === type}
                                                            onChange={() => setSelectedType(type)}
                                                            className="accent-blue-600 w-[12px] h-[12px] cursor-pointer"
                                                        />
                                                        <span
                                                            className={
                                                                selectedType === type
                                                                    ? "underline text-[#023048]"
                                                                    : "text-gray-600"
                                                            }
                                                        >
                                                            {type}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
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

                                            <div className="flex justify-between mt-6 border-t pt-3">
                                                <button
                                                    onClick={handleResetFilters}
                                                    className="text-sm text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={handleCancelFilters}
                                                    className="text-sm text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleApplyFiltersLeft}
                                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                >
                                                    Apply
                                                </button>
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

                                    {showFilterR && (
                                        <div className="absolute top-0 right-0 p-4 bg-white border w-64 z-20">
                                            <p className="font-thin mb-2">Filter</p>
                                            <p className="font-normal text-[#023048]">Kategori Akademik</p>

                                            {/* Tahun Masuk */}
                                            <p className={`cursor-pointer text-black transition-all ${activeR ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"}`}
                                                onClick={() => setActiveR(!activeR)}>
                                                Tahun Masuk
                                            </p>
                                            <div className='gap-5'>
                                                {angkatan.length > 0 ? (
                                                    angkatan.map((item) => (
                                                        <label key={item} className="cursor-pointer flex items-center gap-2 font-thin">
                                                            <input
                                                                type="checkbox"
                                                                value={item}
                                                                checked={selectedAngkatan.includes(item)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedAngkatan([...selectedAngkatan, item]);
                                                                    } else {
                                                                        setSelectedAngkatan(selectedAngkatan.filter((y) => y !== item));
                                                                    }
                                                                }}
                                                                className="accent-blue-600 w-[12px] h-[12px] cursor-pointer"
                                                            />
                                                            <span className={selectedAngkatan.includes(item) ? "underline text-[#023048]" : "text-gray-600"}>
                                                                {item}
                                                            </span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm">Memuat tahun...</p>
                                                )}
                                            </div>

                                            {/* Lembaga */}
                                            <p className={`cursor-pointer text-black transition-all ${actJurusanR ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"}`}
                                                onClick={() => setActJurusanR(!actJurusanR)}>
                                                Lembaga
                                            </p>
                                            <div className="gap-5">
                                                {lembaga.length > 0 && (
                                                    lembaga.map((item) => (
                                                        <label key={item} className="cursor-pointer flex items-center gap-2 font-thin">
                                                            <input
                                                                type="checkbox"
                                                                value={item}
                                                                checked={selectedLembaga.includes(item)}
                                                                onChange={(e) => {
                                                                    let updated;
                                                                    if (e.target.checked) {
                                                                        updated = [...selectedLembaga, item];
                                                                    } else {
                                                                        updated = selectedLembaga.filter((l) => l !== item);
                                                                    }
                                                                    setSelectedLembaga(updated);
                                                                    fetchProdi(updated);
                                                                }}
                                                                className="accent-blue-600 w-[12px] h-[12px] cursor-pointer"
                                                            />
                                                            <span className={selectedLembaga.includes(item) ? "underline text-[#023048]" : "text-gray-600"}>
                                                                {item}
                                                            </span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>


                                            <p className={`cursor-pointer text-black transition-all ${activeProdiR ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"}`}
                                                onClick={() => setActiveProdiR(!activeProdiR)}>
                                                Program Studi
                                            </p>
                                            {Object.keys(prodi).map((lem) => (
                                                <div key={lem} className="mt-2">
                                                    <p className="font-semibold text-[#023048]">{lem}</p>
                                                    {prodi[lem].map((ps) => (
                                                        <label key={ps} className="flex items-center gap-2 ml-4 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                value={ps}
                                                                checked={selectedProdi.includes(ps)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedProdi([...selectedProdi, ps]);
                                                                    } else {
                                                                        setSelectedProdi(selectedProdi.filter((p) => p !== ps));
                                                                    }
                                                                }}
                                                            />
                                                            <span className={selectedProdi.includes(ps) ? "underline text-[#023048]" : "text-gray-600"}>
                                                                {ps}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ))}

                                            <p className="font-normal text-[#023048] mt-3">Kategori Diagram</p>
                                            <div className='gap-4 mb-4 pb-4'>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartR === "circle" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"}`}
                                                    onClick={() => setActiveChartR("circle")}>
                                                    Diagram Lingkaran
                                                </p>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartR === "Line" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"}`}
                                                    onClick={() => setActiveChartR("Line")}>
                                                    Diagram Garis
                                                </p>
                                                <p className={`cursor-pointer text-black transition-all ${activeChartR === "Bar" ? "bg-[#A8B5CB]" : "text-[#9A9A9A]"}`}
                                                    onClick={() => setActiveChartR("Bar")}>
                                                    Diagram Batang
                                                </p>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <button onClick={handleResetFiltersRight} className="px-3 py-1 bg-gray-300 rounded">
                                                    Reset
                                                </button>
                                                <button onClick={handleCancelFiltersRight} className="px-3 py-1 bg-gray-500 text-white rounded">
                                                    Batal
                                                </button>
                                                <button onClick={handleApplyFiltersRight} className="px-3 py-1 bg-blue-600 text-white rounded">
                                                    Terapkan
                                                </button>
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
                                    {tableData && (
                                        <DataTable selectedType={selectedType} data={tableData} />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='mt-5'>
                            <div className="mb-4 h-[32px]"></div>
                            <div className="bg-white p-6">
                                <div className="relative">

                                    <div className="overflow-x-auto">
                                        {tableDataRight && (
                                            <div className="xl:col-span-2">
                                                <DataTableRight data={tableDataRight} />
                                            </div>
                                        )}
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
                                            {loanHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center p-4">Tidak ada data</td>
                                                </tr>
                                            ) : (
                                                loanHistory.map((item, index) => (
                                                    <tr key={item.loan_id} className="border-b hover:bg-gray-50">
                                                        <td className="p-4">{index + 1}</td>
                                                        <td className="p-4">{item.member_id}</td>
                                                        <td className="p-4">{item.loan_date || "-"}</td>
                                                        <td className="p-4">{item.due_date || "-"}</td>
                                                        <td className="p-4">{item.return_date || "-"}</td>
                                                        <td
                                                            className={`p-4 font-semibold ${item.is_return === 0 ? "text-red-500" : "text-green-600"
                                                                }`}
                                                        >
                                                            {item.is_return === 0 ? "Belum Dikembalikan" : "Sudah Dikembalikan"}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>


                                    </table>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded"
                                            onClick={() => page > 1 && fetchLoanHistory(page - 1)}
                                        >
                                            Prev
                                        </button>

                                        <span className="px-4 py-2">Page {page}</span>

                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded"
                                            onClick={() => fetchLoanHistory(page + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </main>
            </div >

            < footer className='bg-[#023048] text-white py-6 text-center' >
                <div className="ml-64">
                    <p className="text-sm">blalaalS</p>
                </div>
            </footer >
        </div >
    );
}

export default Dashboard;