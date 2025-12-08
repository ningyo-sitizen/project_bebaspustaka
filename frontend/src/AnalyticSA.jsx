import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import authCheck from './authCheck';

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
import { useState, useEffect, useCallback } from 'react';
import AppLayout from './AppLayout';
import InfoCards from '../src/infoCards';
import { ArrowUp, ArrowDown, Minus, Users, BookOpen, Calendar } from 'lucide-react';
import { data, Link } from 'react-router-dom';
import { use } from 'react';
import {
    IconHome,
    IconChartBar,
    IconBell,
    IconLogout,
    IconUser,
    IconUsers,
    IconHistory,
    IconMenu2,
    IconChevronDown,
} from "@tabler/icons-react";
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

export default function Dashboard() {
    authCheck()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const yearColors = {};
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toggleSidebar, setToggleSidebar] = useState(false);

    //setup chart
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

    const [isLoadingLeft, setIsLoadingLeft] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);


    const [isClosing, setIsClosing] = useState(false);
    const closeModal = () => {
        setIsClosing(true); // start fade-out animation
        setTimeout(() => {
            setShowFilterL(false); // hide modal beneran
            setIsClosing(false); // reset state
        }, 300); // durasi animation sama kayak CSS transition
    };
    const openModal = () => {
        setIsClosing(false); // pastiin modal buka dengan animasi fade-in
        setShowFilterL(true);
    };

    const [isClosingR, setIsClosingR] = useState(false);
    const closeModalR = () => {
        setIsClosingR(true);
        setTimeout(() => {
            setShowFilterR(false);
            setIsClosingR(false);
        }, 300);
    }

    const [tableData, setTableData] = useState(null);
    const [visitorPage, setVisitorPage] = useState(1);
    const [visitorLimit] = useState(12);

    const [visitorPagination, setVisitorPagination] = useState(null);
    const [showFilterR, setShowFilterR] = useState(false);
    const [showFilterL, setShowFilterL] = useState(false);


    const [activeR, setActiveR] = useState(false);

    const [actJurusanR, setActJurusanR] = useState(false);
    const [actJurusanL, setActJurusanL] = useState(false);

    const [activeChartR, setActiveChartR] = useState("Line");
    const [activeChartL, setActiveChartL] = useState("Line");

    const [years, setYears] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [tempYears, setTempYears] = useState([]);
    const [tempType, setTempType] = useState("");



    const [tablePageLeft, setTablePageLeft] = useState(1);
    const [tableLimitLeft] = useState(50);
    const [tablePaginationLeft, setTablePaginationLeft] = useState(null);
    const [tableDataLeft, setTableDataLeft] = useState(null);


    const [isLoadingR, setIsLoadingR] = useState(false);
    const [angkatan, setAngkatan] = useState([]);
    const [selectedAngkatan, setSelectedAngkatan] = useState([]);
    const [tempAngkatan, setTempAngkatan] = useState([]);
    const [actAngkatan, setActAngkatan] = useState([]);
    const [lembaga, setLembaga] = useState([]);
    const [selectedLembaga, setSelectedLembaga] = useState([]);
    const [tempLembaga, setTempLembaga] = useState([]);
    const [actLembaga, setActLembaga] = useState([]);
    const [prodi, setProdi] = useState({});
    const [selectedProdi, setSelectedProdi] = useState([]);
    const [tempProdi, setTempProdi] = useState([]);
    const [actProdi, setActProdi] = useState([]);

    const [activeProdiR, setActiveProdiR] = useState(false);
    const [tableDataRight, setTableDataRight] = useState(null);
    const [tablePageRight, setTablePageRight] = useState(1);
    const [tableLimitRight] = useState(8);
    const [tablePaginationRight, setTablePaginationRight] = useState(null);

    const [loanHistory, setLoanHistory] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const maxReached = activeChartL === "circle" && selectedYears.length >= 5; //limit buat lingkaran

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const [profileData, setProfileData] = useState({
        name: "Loading...",
        username: "Loading...",
        role: "Admin",
    });
    const getSidebarItemClass = (isActive = false) => {
        const baseClasses =
            "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
        return isActive
            ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-medium`
            : `${baseClasses} text-[#667790] hover:bg-gray-100`;
    };

    const handleResetFilters = () => {
        setSelectedYears([]);
        setSelectedType("");
        fetchChartDataLeft();
    };

    const handleCancelFilters = () => {
        setSelectedYears(tempYears);
        setSelectedType(tempType);
        closeModal(true);
    };

    const handleResetFiltersRight = () => {
        setSelectedAngkatan([]);
        setSelectedLembaga([]);
        setSelectedProdi([]);
        setTempAngkatan([]);
        setTempLembaga([]);
        setTempProdi([]);
        setActAngkatan([]);
        setActLembaga([]);
        setActProdi([]);
        fetchChartDataRight();
    };
    const handleCancelFiltersRight = () => {
        setSelectedAngkatan(tempAngkatan);
        setSelectedLembaga(tempLembaga);
        setSelectedProdi(tempProdi);
        closeModalR(true);
    };

    const getColorForYear = (year) => {
        if (!yearColors[year]) {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            yearColors[year] = `rgba(${r}, ${g}, ${b}, 0.8)`;
        }
        return yearColors[year];
    };

    const buildQueryParams = ({ years = [], type = "", page = 1, limit = 10, tableOnly = false }) => {
        const query = new URLSearchParams();
        if (years.length > 0) query.append("year", years.join(","));
        if (type) query.append("period", type);
        if (page) query.append("page", page);
        if (limit) query.append("limit", limit);
        if (tableOnly) query.append("tableOnly", "true");
        return query.toString();
    };

    let debounceTimer = null;

    const debouncedApplyFiltersLeft = () => {
        closeModal(false);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleApplyFiltersLeft();
        }, 250); // delay 250ms, bisa diubah sesuai selera
    };

    let debounceTimerRight = null;

    const debouncedApplyFiltersRight = () => {
        closeModalR(false);
        if (debounceTimerRight) clearTimeout(debounceTimerRight);
        debounceTimerRight = setTimeout(() => {
            handleApplyFiltersRight();
        }, 250); // delay 250ms, bisa diubah sesuai selera
    };


    //label buaat chart kiri
    const autoBuildChartData = (data, selectedType) => {
        const monthLabels = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

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
            const color = getColorForYear(year);

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

    const fetchTableDataLeft = useCallback(async (pageNum) => {
        try {
            const token = localStorage.getItem("token");
            const query = new URLSearchParams();
            if (selectedYears.length > 0) query.append("year", selectedYears.join(","));
            if (selectedType) query.append("period", selectedType);
            query.append("page", pageNum);
            query.append("limit", tableLimitLeft);
            query.append("tableOnly", "true");

            const res = await fetch(`http://localhost:8080/api/dashboard/visitor?${buildQueryParams({ years: selectedYears, type: selectedType, page: pageNum, limit: tableLimitLeft, tableOnly: true })}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            setTableDataLeft(data);
            setTablePaginationLeft(data.pagination);
            setTablePageLeft(pageNum);
        } catch (err) {
            console.error("Error fetching table data:", err);
        }
    }, [selectedYears, selectedType, tableLimitLeft]);

    const fetchTableDataRight = useCallback(async (pageNum = 1) => {
        try {
            const token = localStorage.getItem("token");
            const query = new URLSearchParams();

            // pake ACTIVE FILTER, bukan selected*
            if (actAngkatan.length) query.append("tahun", actAngkatan.join(","));
            if (actLembaga.length) query.append("lembaga", actLembaga.join(","));
            if (actProdi.length) query.append("program", actProdi.join(","));

            query.append("page", pageNum);
            query.append("limit", tableLimitRight);

            const res = await fetch(
                `http://localhost:8080/api/loan/summary?${query.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const apiData = await res.json();

            // Pagination
            setTablePaginationRight({
                currentPage: apiData.page ?? 1,
                totalPages: apiData.totalPages ?? 1,
                totalItems: apiData.totalRows ?? 0,
                itemsPerPage: apiData.limit ?? tableLimitRight,
                hasPrevPage: (apiData.page ?? 1) > 1,
                hasNextPage: (apiData.page ?? 1) < (apiData.totalPages ?? 1)
            });

            setTablePageRight(pageNum);

            const transformed = transformPagedDataForChart(apiData);

            if (!transformed?.data || !transformed?.years) {
                return setTableDataRight({ mode: "default_year", years: [], data: {} });
            }

            const chart = autoBuildChartDataRight(transformed);
            setChartDataR({
                lineChart: chart,
                barChart: chart,
                pieChart: chart,
                doughnutChart: chart
            });

            setTableDataRight(transformed);

        } catch (err) {
            console.error("❌ Fetch Right Error:", err);
            setTableDataRight({ mode: "default_year", years: [], data: {} });
            setTablePaginationRight(null);
        }


    }, [actAngkatan, actLembaga, actProdi, tableLimitRight]);

    let fetchController = null;

    const handleApplyFiltersLeft = useCallback(async () => {
        const isFilterChanged = (
            JSON.stringify(selectedYears) !== JSON.stringify(tempYears) ||
            selectedType !== tempType
        );
        setTempYears(selectedYears);
        setTempType(selectedType);
        setShowFilterL(false);
        setIsLoadingLeft(true);

        if (fetchController) fetchController.abort();
        fetchController = new AbortController();
        const { signal } = fetchController;

        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const token = localStorage.getItem("token");
            const query = buildQueryParams({ years: selectedYears, type: selectedType });

            const res = await fetch(`http://localhost:8080/api/dashboard/visitor?${query}`, {
                headers: { Authorization: `Bearer ${token}` },
                signal
            });
            const responseData = await res.json();

            requestAnimationFrame(() => {
                const chart = autoBuildChartData(responseData, selectedType, activeChartL);

                setChartDataL({
                    lineChart: chart,
                    barChart: chart,
                    pieChart: chart,
                });

                setTableData(responseData);
                setIsLoadingLeft(false);
            });
            fetchTableDataLeft(isFilterChanged ? 1 : tablePageLeft);

        } catch (err) {
            if (err.name === "AbortError") {
                console.log("Previous fetch aborted due to new filter");
            } else {
                console.error("Error applying filters:", err);
                setIsLoadingLeft(false);
            }
        }

    }, [[selectedYears, selectedType, activeChartL, tempYears, tempType, tablePageLeft]]);



    const autoBuildChartDataRight = (apiResponse) => {
        console.log("📊 Chart Builder Input:", apiResponse);

        if (!apiResponse || !apiResponse.data) {
            console.warn("⚠️ Invalid apiResponse");
            return { labels: [], datasets: [] };
        }

        const { mode, data, years = [] } = apiResponse;

        if (!years || years.length === 0) {
            console.warn("⚠️ No years available");
            return { labels: [], datasets: [] };
        }

        const generateColors = (count) => {
            const baseColors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                '#FF9F40', '#8E44AD', '#E74C3C', '#2ECC71', '#F39C12'
            ];
            return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
        };

        const sortedYears = [...years].sort((a, b) => a - b);
        console.log("📅 Sorted Years:", sortedYears);

        if (mode === "default_year") {
            const chartData = sortedYears.map(year => {
                const yearData = data[year];
                console.log(`📍 Year ${year} data:`, yearData);

                if (!yearData || !Array.isArray(yearData) || yearData.length === 0) {
                    return 0;
                }

                const total = yearData[0].total || yearData[0].total_pinjam || 0;
                console.log(`💰 Year ${year} total:`, total);
                return total;
            });

            console.log("📊 Final Chart Data:", chartData);

            return {
                labels: sortedYears.map(y => String(y)),
                datasets: [{
                    label: "Total Peminjaman",
                    data: chartData,
                    backgroundColor: generateColors(sortedYears.length),
                    borderColor: generateColors(sortedYears.length),
                    borderWidth: 2,
                    tension: 0.3
                }]
            };
        }

        if (mode === "per_lembaga") {
            const lembagaSet = new Set();
            sortedYears.forEach(year => {
                if (data[year] && Array.isArray(data[year])) {
                    data[year].forEach(item => lembagaSet.add(item.lembaga));
                }
            });

            const lembagaList = Array.from(lembagaSet);
            const colors = generateColors(lembagaList.length);

            console.log("🏢 Lembaga found:", lembagaList);

            return {
                labels: sortedYears.map(y => String(y)),
                datasets: lembagaList.map((lem, idx) => ({
                    label: lem,
                    data: sortedYears.map(year => {
                        if (!data[year]) return 0;
                        const found = data[year].find(item => item.lembaga === lem);
                        return found ? (found.total || found.total_pinjam || 0) : 0;
                    }),
                    backgroundColor: colors[idx],
                    borderColor: colors[idx],
                    borderWidth: 2,
                    tension: 0.3
                }))
            };
        }

        if (mode === "per_program") {
            const programSet = new Set();
            sortedYears.forEach(year => {
                if (data[year] && Array.isArray(data[year])) {
                    data[year].forEach(item => programSet.add(item.program));
                }
            });

            const programList = Array.from(programSet);
            const colors = generateColors(programList.length);

            console.log("🎓 Programs found:", programList);

            return {
                labels: sortedYears.map(y => String(y)),
                datasets: programList.map((prog, idx) => ({
                    label: prog,
                    data: sortedYears.map(year => {
                        if (!data[year]) return 0;
                        const found = data[year].find(item => item.program === prog);
                        return found ? (found.total || found.total_pinjam || 0) : 0;
                    }),
                    backgroundColor: colors[idx],
                    borderColor: colors[idx],
                    borderWidth: 2,
                    tension: 0.3
                }))
            };
        }

        return { labels: [], datasets: [] };
    };

    const handleApplyFiltersRight = async () => {
        const setupfilter = {
            angkatan: selectedAngkatan,
            lembaga: selectedLembaga,
            prodi: selectedProdi
        };
        localStorage.setItem("filters_right", JSON.stringify(setupfilter));


        setTempAngkatan(setupfilter.angkatan);
        setTempLembaga(setupfilter.lembaga);
        setTempProdi(setupfilter.prodi);

        setActAngkatan(setupfilter.angkatan);
        setActLembaga(setupfilter.lembaga);
        setActProdi(setupfilter.prodi);
        closeModalR(true);

        setIsLoadingR(true);
        await fetchTableDataRight(1);
        setIsLoadingR(false);

    };
    const transformPagedDataForChart = (pagedData) => {
        console.log("🔄 Transform input:", pagedData);

        if (!pagedData || (!pagedData.data && !pagedData.allData)) {
            console.warn("⚠️ Invalid pagedData structure");
            return {
                mode: "default_year",
                years: [],
                data: {}
            };
        }

        const dataSource = pagedData.allData || pagedData.data;

        if (!Array.isArray(dataSource) || dataSource.length === 0) {
            console.warn("⚠️ No data to transform");
            return {
                mode: "default_year",
                years: [],
                data: {}
            };
        }

        const grouped = {};
        const years = new Set();

        dataSource.forEach(row => {
            const year = row.tahun;
            years.add(year);

            if (!grouped[year]) {
                grouped[year] = [];
            }

            if (row.program && row.lembaga) {
                grouped[year].push({
                    program: row.program,
                    lembaga: row.lembaga,
                    total: row.total_pinjam,
                    total_pinjam: row.total_pinjam
                });
            } else if (row.lembaga) {
                grouped[year].push({
                    lembaga: row.lembaga,
                    total: row.total_pinjam,
                    total_pinjam: row.total_pinjam
                });
            } else {
                grouped[year].push({
                    total: row.total_pinjam,
                    total_pinjam: row.total_pinjam
                });
            }
        });

        let mode = "default_year";
        const firstRow = dataSource[0];
        if (firstRow.program && firstRow.lembaga) {
            mode = "per_program";
        } else if (firstRow.lembaga) {
            mode = "per_lembaga";
        }

        const result = {
            mode,
            years: Array.from(years).sort((a, b) => a - b),
            data: grouped
        };

        console.log("✅ Transform output:", result);
        console.log("✅ Years found:", result.years);
        console.log("✅ Data structure:", Object.keys(result.data));

        return result;
    };
    function DataTable({ selectedType, data, pagination, onPageChange, isLoading }) {
        if (!data || !data.data) {
            return <p className="text-center text-gray-500">No data available</p>;
        }

        const getHeaders = () => {
            switch (selectedType) {
                case "daily":
                    return ["Tahun", "Tanggal", "Total Pengunjung"];
                case "weekly":
                    return ["Tahun", "Minggu", "Tanggal mulai", "Tanggal Akhir", "Total Pengunjung"];
                case "monthly":
                    return ["Tahun", "Bulan", "Total Pengunjung"];
                case "yearly":
                    return ["Tahun", "Total Pengunjung"];
                default:
                    return ["Tahun", "Label", "Total Pengunjung"];
            }
        };

        const headers = getHeaders();

        const renderRows = () => {
            return Object.keys(data.data).map((year) =>
                data.data[year].map((item, i) => (
                    <tr key={`${year}-${i}`} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-regular text-sm">{year}</td>

                        {selectedType === "weekly" ? (
                            <>
                                <td className="p-3 font-regular text-sm">{item.label}</td>
                                <td className="p-3 font-regular text-sm">{item.start_date}</td>
                                <td className="p-3 font-regular text-sm">{item.end_date}</td>
                                <td className="p-3 font-regular text-sm">{item.total_visitor.toLocaleString()}</td>
                            </>
                        ) : selectedType === "yearly" ? (
                            <td className="p-3 font-regular text-sm">{item.total_visitor.toLocaleString()}</td>
                        ) : (
                            <>
                                <td className="p-3 font-regular text-sm">{item.label}</td>
                                <td className="p-3 font-regular text-sm">{item.total_visitor.toLocaleString()}</td>
                            </>
                        )}
                    </tr>
                ))
            );
        };

        return (

            //table kiri visitor
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-base capitalize">
                        {selectedType} Visitor Data
                    </h3>

                    {/* ✅ Info jumlah data per tahun */}
                    {data.recordsPerYear && (
                        <div className="text-sm text-gray-600">
                            {Object.entries(data.recordsPerYear).map(([year, count]) => (
                                <span key={year} className="mr-3">
                                    {year}: {count} records
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto max-h-[600px] border border-gray-100">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        {headers.map((header, idx) => (
                                            <th key={idx} className="p-3 border font-normal text-center">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>{renderRows()}</tbody>
                            </table>
                        </div>

                    </>
                )}
            </div>
        );
    }


    // ini kanan
    function DataTableRight({ data, pagination, onPageChange }) {

        if (!data) {
            return (
                <div className="bg-white p-6 mt-8 rounded-xl shadow">
                    <p className="text-center text-gray-500">No data available</p>
                </div>
            );
        }

        if (!data.data) {
            return (
                <div className="bg-white p-6 mt-8 rounded-xl shadow">
                    <p className="text-center text-gray-500">Invalid data structure</p>
                </div>
            );
        }

        const { mode = "default_year", years = [], lembaga = [] } = data;

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
            if (!years || years.length === 0) {
                return (
                    <tr>
                        <td colSpan={headers.length} className="text-center p-4  text-gray-500">
                            No data available
                        </td>
                    </tr>
                );
            }

            const sortedYears = [...years].sort((a, b) => b - a);

            if (mode === "default_year") {
                return sortedYears.map((year) => {
                    if (!data.data[year] || !data.data[year][0]) return null;

                    return (
                        <tr key={year} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-regular text-sm">{year}</td>
                            <td className="p-3 font-regular text-sm">{data.data[year][0].total.toLocaleString()}</td>
                        </tr>
                    );
                }).filter(Boolean);
            }

            if (mode === "per_lembaga") {
                return sortedYears.flatMap((year) => {
                    if (!data.data[year] || !Array.isArray(data.data[year])) return [];

                    return data.data[year].map((item, i) => (
                        <tr key={`${year}-${i}`} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-regular text-sm">{year}</td>
                            <td className="p-3 font-regular text-sm">{item.lembaga || '-'}</td>
                            <td className="p-3 font-regular text-sm">{(item.total || 0).toLocaleString()}</td>
                        </tr>
                    ));
                });
            }

            if (mode === "per_program") {
                return sortedYears.flatMap((year) => {
                    if (!data.data[year] || !Array.isArray(data.data[year])) return [];

                    return data.data[year].map((item, i) => (
                        <tr key={`${year}-${i}`} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-regular text-sm">{year}</td>
                            <td className="p-3 font-regular text-sm">{item.lembaga || '-'}</td>
                            <td className="p-3 font-regular text-sm">{item.program || '-'}</td>
                            <td className="p-3 font-regular text-sm">{(item.total || 0).toLocaleString()}</td>
                        </tr>
                    ));
                });
            }

            return (
                <tr>
                    <td colSpan={headers.length} className="text-center p-4 text-gray-500">
                        Unknown data mode
                    </td>
                </tr>
            );
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
            <div className="bg-white p-6 rounded-lg border border-gray-300">
                <h3 className="font-semibold text-base mb-4 text-left">{getTitle()}</h3>

                <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-100">
                    <table className="w-full border-collapse ">
                        <thead className="bg-gray-100">
                            <tr>
                                {headers.map((header, idx) => (
                                    <th key={idx} className="p-3 border font-normal text-center">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='overflow-x-auto'>
                            {renderRows()}
                        </tbody>
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
                            },
                            scales: {
                                x: {
                                    grid: { display: false }
                                },
                                y: {
                                    grid: { color: '#f3f4f6' }
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
        fetchChartDataRight();
    }, [actAngkatan, actLembaga, actProdi]);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const fetchProfile = async () => {
            const user = JSON.parse(localStorage.getItem('user'))
            const user_id = user.user_id;
            const token = localStorage.getItem('token')
            try {
                const response = await axios.get(`http://localhost:8080/api/profile/userInfo?user_id=${user_id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                setProfileData(response.data);


            } catch (error) {
                console.error("Gagal mengambil data profil:", error);
                setProfileData({
                    name: "Gagal memuat",
                    username: "N/A",
                    role: "N/A",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        fetchYears();
        fetchChartDataLeft();
        fetchAngkatan();
        fetchLoanHistory(1);
        fetchLembaga();

    }, []);

    useEffect(() => {
        fetchChartDataRight();
    }, [actAngkatan, actLembaga, actProdi, tableLimitRight]);


    useEffect(() => {
        if (selectedYears.length > 1 && (selectedType === "daily" || selectedType === "weekly")) {
            setSelectedType("monthly");
        }
    }, [selectedYears]);

    const fetchYears = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:8080/api/dashboard/years", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            setYears(data);
        } catch (err) {
            console.log("xd", err);
        }
    })

    const fetchAngkatan = useCallback(async () => {
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
    })

    const fetchLembaga = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:8080/api/loan/lembaga", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }

            });
            const data = await res.json();
            setLembaga(data);
        } catch (err) {
            console.log("gagal mengambil lembaga")
        }
    })

    const fetchLoanHistory = useCallback(async (page = 1) => {
        const res = await fetch(
            `http://localhost:8080/api/loan/loanHistory?page=${page}&limit=${limit}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        const result = await res.json();
        setLoanHistory(result.data);
        setPage(result.page);
    });


    const fetchProdi = useCallback(async (lembagaList) => {
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
    })


    const fetchChartDataLeft = useCallback(async () => {
        setIsLoadingLeft(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/landing/landingpagechart?year=2025`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const mockData = await res.json();

            requestAnimationFrame(() => {
                setChartDataL({
                    lineChart: {
                        labels: mockData.labels,
                        datasets: [{
                            label: 'Kunjungan per Bulan tahun 2025',
                            data: mockData.data,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        }]
                    },
                    pieChart: {
                        labels: mockData.labels,
                        datasets: [{
                            label: "Kunjungan",
                            data: mockData.data,
                            backgroundColor: ['#537FF1', '#8979FF', '#A8B5CB', '#667790']
                        }]
                    },
                    barChart: {
                        labels: mockData.labels,
                        datasets: [{
                            label: 'Kunjungan per Bulan',
                            data: mockData.data,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)'
                        }]
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
                setTableDataLeft(tableDataFormat);
                setSelectedType("monthly");
                setIsLoadingLeft(false);
            });
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setIsLoadingLeft(false);
        }
    }, []);

    const fetchChartDataRight = useCallback(async (pageNum = 1) => {
        try {
            const token = localStorage.getItem("token");
            const query = new URLSearchParams();

            if (actAngkatan.length > 0) query.append("tahun", actAngkatan.join(","));
            if (actLembaga.length > 0) query.append("lembaga", actLembaga.join(","));
            if (actProdi.length > 0) query.append("program", actProdi.join(","));

            query.append("page", pageNum);
            query.append("limit", tableLimitRight);

            console.log("🌐 Fetching with filters:", {
                tahun: actAngkatan,
                lembaga: actLembaga,
                program: actProdi
            });

            const res = await fetch(`http://localhost:8080/api/loan/summary?${query.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const apiData = await res.json();
            console.log("📦 API Response:", apiData);

            if (!apiData || !apiData.data) {
                console.error("Invalid API response structure");
                setChartDataR({
                    lineChart: { labels: [], datasets: [] },
                    barChart: { labels: [], datasets: [] },
                    pieChart: { labels: [], datasets: [] }
                });
                return;
            }

            const transformedData = transformPagedDataForChart(apiData);
            console.log("🔄 Transformed Data:", transformedData);

            const chart = autoBuildChartDataRight(transformedData);
            console.log("📊 Built Chart:", chart);

            setChartDataR({
                lineChart: chart,
                barChart: chart,
                pieChart: chart
            });

            setTableDataRight(transformedData);

            if (apiData.totalPages) {
                setTablePaginationRight({
                    currentPage: apiData.page || 1,
                    totalPages: apiData.totalPages,
                    totalItems: apiData.totalRows,
                    itemsPerPage: apiData.limit || tableLimitRight,
                    hasPrevPage: (apiData.page || 1) > 1,
                    hasNextPage: (apiData.page || 1) < apiData.totalPages
                });
            }
        } catch (err) {
            console.error("❌ Error fetching chart data:", err);

            setChartDataR({
                lineChart: { labels: [], datasets: [] },
                barChart: { labels: [], datasets: [] },
                pieChart: { labels: [], datasets: [] }
            });

            setTableDataRight({
                mode: "default_year",
                years: [],
                data: {}
            });
        }
    }, [actAngkatan, actLembaga, actProdi, tableLimitRight]);



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
                            <a href="/dashboardSA" className={getSidebarItemClass()}>
                                <IconHome size={20} />
                                Dashboard
                            </a>
                            <a href="/analyticSA" className={getSidebarItemClass(true)}>
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
                    <header className="w-full bg-white border-b px-8 flex justify-between lg:justify-end relative z-20">
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
                        <div className="relative w-full mx-auto rounded-lg overflow-hidden shadow-sm mb-8 bg-[#033854]">

                            <div className="flex flex-col md:flex-row w-full">
                                <div className="md:w-1/1 p-10 text-white flex flex-col justify-start text-left">
                                    <p className="font-semibold text-3xl mb-4">Selamat Datang!</p>
                                    <p className="font-normal text-lg mb-2">Di Dashboard Analitik Bebas Pustaka</p>
                                    <p className="font-light text-sm">
                                        Dashboard ini menyajikan data kunjungan dan status bebas pustaka secara
                                        terstruktur untuk membantu Admin dalam memantau dan mengelola informasi perpustakaan.
                                    </p>

                                </div>

                                <div className="md:w-1/2 w-1/3 flex items-center justify-end">
                                    <img
                                        src="https://cdn.designfast.io/image/2025-12-03/c0fb8085-f25e-4ce8-8687-24ace6ba9f2e.png"
                                        alt="icon"
                                        className="w-52 h-52  object-none"
                                    />
                                </div>

                            </div>

                        </div>
                        <p className="font-semibold text-xl text-left text-black mb-8 overflow-x-hidden">
                            Ringkasan Analitik
                        </p>
                        {/* kontennya */}
                        <InfoCards />
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                            <div>
                                <div className="flex justify-between items-center mb-4 w-full">
                                    <h3 className="font-semibold text-lg">Data Kunjungan Mahasiswa</h3>
                                    <p className="font-light text-sm text-[#9A9A9A] cursor-pointer hover:underline"
                                        onClick={openModal}>
                                        Filter &gt;
                                    </p>
                                </div>

                                <div className="bg-white p-6 shadow-sm border border-[#EDEDED]">
                                    <div className="relative">

                                        {/* //render filter */}
                                        {showFilterL && (

                                            <div className={`fixed inset-0 bg-[#333333]/60 flex justify-center sm:items-center z-50 p-4 sm:p-0
                                                            transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
                                                onClick={handleApplyFiltersLeft}>

                                                <div className={`bg-white w-full max-w-md sm:max-w-lg md:max-w-xl rounded-lg shadow-lg flex flex-col gap-1
                                                                transform transition-transform duration-300 ${isClosing ? "scale-95" : "scale-100"}`}
                                                    onClick={(e) => e.stopPropagation()}>

                                                    <div className="px-5 pt-5">
                                                        <p className="font-bold text-lg text-left">Filter</p>
                                                        <p className="font-thin text-sm text-left text-[#9A9A9A] mt-1"> Halaman ini berfungsi sebagai filter untuk mempermudah pencarian. </p>
                                                    </div>

                                                    <div className="w-full h-[2px] bg-gray-200 my-4"></div>


                                                    {/* Tahun */}
                                                    <div className="px-5">
                                                        <p className="text-[#616161] font-semibold mb-4 text-left">Tahun Masuk</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {years.length > 0 ? (years.map((year) => {
                                                                const isSelected = selectedYears.includes(year);
                                                                return (<button key={year} onClick={() => isSelected ?
                                                                    setSelectedYears(selectedYears.filter((y) => y !== year))
                                                                    : !maxReached && setSelectedYears([...selectedYears, year])}
                                                                    className={`px-3 py-1 rounded text-sm transition-colors 
                                                                    ${isSelected ? "border border-[#667790] bg-[#EDF1F3] text-[#667790]" : "border border-[#BFC0C0] text-[#616161]"} 
                                                                    ${maxReached && !isSelected ? "opacity-40 cursor-not-allowed" : ""}`} >
                                                                    {year}
                                                                </button>);
                                                            })) :
                                                                (<p className="text-gray-500 text-sm">Memuat tahun...</p>)}
                                                        </div>
                                                    </div>


                                                    {/* Periode */}
                                                    <div className="px-5 mt-5">
                                                        <p className="text-[#616161] font-semibold mb-4 text-left">Periode</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {["daily", "weekly", "monthly", "yearly"].map((type) => {
                                                                const isActive = selectedType === type;
                                                                const isBlocked = selectedYears.length > 1 && (type === "daily" || type === "weekly");
                                                                return (
                                                                    <button
                                                                        key={type}
                                                                        type="button"
                                                                        disabled={isBlocked}
                                                                        onClick={() => !isBlocked && setSelectedType(type)}
                                                                        className={`px-3 py-1 rounded text-sm transition-colors 
                                                                ${isActive ? "border border-[#667790] bg-[#EDF1F3] text-[#667790]" : "border border-[#BFC0C0] text-[#616161] bg-white"} 
                                                                ${isBlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                                                    >
                                                                        {type}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>


                                                    {/* Jenis Diagram */}
                                                    <div className="px-5 mt-5">
                                                        <p className="text-[#616161] font-semibold mb-4 text-left">Jenis Diagram</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {[{ label: "Diagram Lingkaran", value: "circle" },
                                                            { label: "Diagram Garis", value: "Line" },
                                                            { label: "Diagram Batang", value: "Bar" },]
                                                                .map((chart) => {
                                                                    const isActive = activeChartL === chart.value;
                                                                    const isBlocked = selectedYears.length > 1 && chart.value === "circle";
                                                                    return (
                                                                        <button
                                                                            key={chart.value}
                                                                            disabled={isBlocked}
                                                                            onClick={() => !isBlocked && setActiveChartL(chart.value)}
                                                                            className={`px-3 py-1 rounded text-sm transition-colors 
                                                                    ${isActive ? "border border-[#667790] bg-[#EDF1F3] text-[#667790]" : "border border-[#BFC0C0] text-[#616161] bg-white"} 
                                                                    ${isBlocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                                                        >
                                                                            {chart.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>


                                                    {/* Button */}
                                                    <div className="w-full mt-6">
                                                        <div className="h-[1.5px] bg-gray-200 mb-5 mx-5"></div>
                                                        <div className="flex justify-between px-5 pb-5 gap-3">

                                                            <button className="text-sm text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                                                                onClick={handleResetFilters}>
                                                                Atur ulang
                                                            </button>

                                                            <button className="text-sm text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                                                                onClick={handleCancelFilters}>
                                                                Batalkan
                                                            </button>

                                                            <button className="text-sm text-gray-600 border-2 border-gray-400 px-3 py-1 rounded font-medium hover:bg-gray-700 hover:text-white"
                                                                onClick={debouncedApplyFiltersLeft}>
                                                                Filter Data
                                                            </button>

                                                        </div>
                                                    </div>
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
                                    <h3 className="font-semibold text-lg">Data Bebas Pustaka</h3>
                                    <p className="font-light text-sm text-[#9A9A9A] cursor-pointer hover:underline"
                                        onClick={() => setShowFilterR(!showFilterR)}>
                                        Filter &gt;
                                    </p>

                                </div>

                                <div className="bg-white p-6 shadow-sm border border-[#EDEDED]">
                                    <div className="relative">
                                        {showFilterR && (
                                            <div className={`fixed inset-0 bg-[#333333]/60 flex justify-center sm:items-center z-50 p-4 sm:p-0
                                                            transition-opacity duration-300 ${isClosingR ? "opacity-0" : "opacity-100"}`}
                                                onClick={handleApplyFiltersRight}>

                                                <div className={`bg-white w-full max-w-6xl rounded-lg shadow-lg flex flex-col gap-1
                                                                 transform transition-transform duration-300 ${isClosingR ? "scale-95" : "scale-100"}`}
                                                    onClick={(e) => e.stopPropagation()}>

                                                    {/* Header */}
                                                    <div className="px-5 pt-5">
                                                        <p className="font-bold text-lg text-left">Filter</p>
                                                        <p className="font-thin text-sm text-left text-[#9A9A9A] mt-1">
                                                            Halaman ini berfungsi sebagai filter untuk mempermudah pencarian.
                                                        </p>
                                                    </div>

                                                    <div className="w-full h-[2px] bg-gray-200 my-4"></div>
                                                    <div className="max-h-[70vh] overflow-y-auto pb-5">
                                                        {/* Tahun Masuk */}
                                                        <div className="px-5">
                                                            <p className="text-[#616161] font-semibold mb-4 text-left">Tahun Masuk</p>

                                                            <div className="flex gap-2 flex-wrap">
                                                                {angkatan.length > 0 ? (
                                                                    angkatan.map((item) => {
                                                                        const isSelected = selectedAngkatan.includes(item);

                                                                        return (
                                                                            <button
                                                                                key={item}
                                                                                className={`px-3 py-1 rounded ${isSelected ? "border border-[#667790] bg-[#EDF1F3] text-[#667790] text-xs" : "text-xs border border-[#BFC0C0] text-[#616161]"
                                                                                    }`}
                                                                                onClick={() => {
                                                                                    if (isSelected) {
                                                                                        setSelectedAngkatan(selectedAngkatan.filter((y) => y !== item));
                                                                                    } else {
                                                                                        setSelectedAngkatan([...selectedAngkatan, item]);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {item}
                                                                            </button>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <p className="text-gray-500 text-sm">Memuat tahun...</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Lembaga */}
                                                        <div className="px-5 mt-6">
                                                            <p className="text-[#616161] font-semibold mb-4 text-left">Lembaga</p>

                                                            <div className="flex gap-2 flex-wrap">
                                                                {lembaga.length > 0 ? (
                                                                    lembaga.map((item) => {
                                                                        const isSelected = selectedLembaga.includes(item);

                                                                        return (
                                                                            <button
                                                                                key={item}
                                                                                className={`px-3 py-1 rounded ${isSelected ? "border border-[#667790] bg-[#EDF1F3] text-[#667790] text-xs" : "text-xs border border-[#BFC0C0] text-[#616161]"
                                                                                    }`}
                                                                                onClick={() => {
                                                                                    setSelectedLembaga((prev) => {
                                                                                        let updated;

                                                                                        if (prev.includes(item)) {
                                                                                            updated = prev.filter((l) => l !== item);
                                                                                        } else {
                                                                                            updated = [...prev, item];
                                                                                        }
                                                                                        setActiveProdiR(true);
                                                                                        fetchProdi(updated);

                                                                                        return updated;
                                                                                    });
                                                                                }}

                                                                            >
                                                                                {item}
                                                                            </button>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <p className="text-gray-500 text-sm">Memuat tahun...</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Prodi */}
                                                        <div className="px-5 mt-6">
                                                            <p
                                                                className="text-[#616161] font-semibold mb-4 text-left cursor-pointer"
                                                                onClick={() => setActiveProdiR((prev) => !prev)}

                                                            >
                                                                Program Studi
                                                            </p>

                                                            {activeProdiR && (
                                                                <div>
                                                                    {Object.keys(prodi).map((lem) => (
                                                                        <div key={lem} className="mt-3">
                                                                            <p className="font-semibold text-[#023048] text-left ml-5 text-sm mb-4">{lem}</p>

                                                                            <div className="flex gap-2 flex-wrap ml-4">
                                                                                {prodi[lem].map((ps) => {
                                                                                    const isSelected = selectedProdi.includes(ps);

                                                                                    return (
                                                                                        <button
                                                                                            key={ps}
                                                                                            className={`px-3 py-1 rounded text-sm ${isSelected ? "border border-[#667790] bg-[#EDF1F3] text-[#667790] text-xs" : "text-xs border border-[#BFC0C0] text-[#616161]"
                                                                                                }`}
                                                                                            onClick={() => {
                                                                                                if (isSelected) {
                                                                                                    setSelectedProdi(selectedProdi.filter((p) => p !== ps));
                                                                                                } else {
                                                                                                    setSelectedProdi([...selectedProdi, ps]);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {ps}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Jenis Diagram */}
                                                        <div className="px-5 mt-5">
                                                            <p className="text-[#616161] font-semibold mb-4 text-left">Jenis Diagram</p>
                                                            <div className="flex gap-2 flex-wrap">
                                                                {[{ label: "Diagram Lingkaran", value: "circle" },
                                                                { label: "Diagram Garis", value: "Line" },
                                                                { label: "Diagram Batang", value: "Bar" },]
                                                                    .map((chart) => {
                                                                        const isActive = activeChartR === chart.value;
                                                                        return (
                                                                            <button
                                                                                key={chart.value}
                                                                                onClick={() => setActiveChartR(chart.value)}
                                                                                className={`px-3 py-1 rounded text-sm transition-colors 
                                                                                            ${isActive ? "border border-[#667790] bg-[#EDF1F3] text-[#667790] text-xs" : "text-xs border border-[#BFC0C0] text-[#616161]"} 
                                                                                          `}
                                                                            >
                                                                                {chart.label}
                                                                            </button>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between px-5 pb-5 gap-3">

                                                            <button className="text-sm text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                                                                onClick={handleResetFiltersRight}>
                                                                Atur ulang
                                                            </button>

                                                            <button className="text-sm text-gray-600 border px-3 py-1 rounded hover:bg-gray-100"
                                                                onClick={handleCancelFiltersRight}>
                                                                Batalkan
                                                            </button>

                                                            <button className="text-sm text-gray-600 border-2 border-gray-400 px-3 py-1 rounded font-medium hover:bg-gray-700 hover:text-white"
                                                                disabled={isLoadingR}
                                                                onClick={debouncedApplyFiltersRight}>
                                                                Filter Data
                                                            </button>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="overflow-x-auto">
                                            <div className="w-full h-80">
                                                {renderChartR()}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className='mt-5'>
                                <div className="relative mb-6">
                                    <h3 className="font-semibold text-lg text-left">Ringkasan</h3>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-gray-300">
                                    <div className="relative">
                                        {tableDataLeft ? (
                                            <DataTable
                                                selectedType={selectedType}
                                                data={tableDataLeft}
                                                pagination={tablePaginationLeft}
                                                onPageChange={fetchTableDataLeft}
                                                isLoading={false}
                                            />
                                        ) : tableData ? (
                                            <DataTable
                                                selectedType={selectedType}
                                                data={tableData}
                                                pagination={null}
                                                onPageChange={() => { }}
                                                isLoading={isLoadingLeft}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className='mt-5'>
                                <div className="mb-4 h-[32px]"></div>
                                <div className="bg-white rounded-xl">
                                    <div className="relative">
                                        <div className="overflow-x-auto">
                                            {tableDataRight && (
                                                <DataTableRight
                                                    data={tableDataRight}
                                                    pagination={tablePaginationRight}
                                                    onPageChange={fetchTableDataRight}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className='grid grid-cols-1 gap-8 '>
                            <div className="relative inline-flex justify-between items-center mt-20">
                                <h3 className="font-semibold text-lg">Data Peminjaman Buku</h3>
                            </div>

                            <div className="bg-white p-6 ">
                                <div className="relative bottom-0">

                                    <div className="overflow-x-auto">
                                        <div className="font-semibold font-black text-left mb-4">Data Bebas Pustaka</div>
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-[#667790] border-b-2 border-black">
                                                    <th className="text-left p-4 font-normal text-white text-sm">No</th>
                                                    <th className="text-left p-4 font-normal text-white text-sm">loan id</th>
                                                    <th className="text-left p-4 font-normal text-white text-sm">Member ID</th>
                                                    <th className="text-left p-4 font-normal text-white text-sm">item code</th>
                                                    <th className="text-left p-4 font-normal text-white text-sm">Tanggal Pinjam</th>
                                                    <th className="text-left p-4 font-normal text-white text-sm">Deadline</th>
                                                    <th className="text-left p-4 font-normal text-white text-sm">Tanggal di kembalikan</th>
                                                    <th className="text-left p-4 font-normal text-white text-sm">Status Buku</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {isLoadingHistory ? (
                                                    Array.from({ length: limit }).map((_, i) => (
                                                        <tr key={i} className="border-b animate-pulse">
                                                            <td className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                                            <td className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                                            <td className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                                            <td className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                                            <td className="p-4"><div className="h-4 bg-gray-200 text-left rounded"></div></td>
                                                            <td className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                                            <td className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                                            <td className="p-4"><div className="h-4 bg-gray-200 rounded"></div></td>
                                                        </tr>
                                                    ))
                                                ) : loanHistory.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="text-center p-4">Tidak ada data</td>
                                                    </tr>
                                                ) : (
                                                    loanHistory.map((item, index) => (
                                                        <tr key={item.loan_id} className="border-b hover:bg-gray-50">
                                                            <td className="p-3 text-sm">{index + 1}</td>
                                                            <td className="p-3 text-sm">{item.loan_id}</td>
                                                            <td className="p-3 text-sm">{item.member_id}</td>
                                                            <td className="p-3 text-sm">{item.item_code}</td>
                                                            <td className="p-3 text-sm">{item.loan_date || "-"}</td>
                                                            <td className="p-3 text-sm">{item.due_date || "-"}</td>
                                                            <td className="p-3 text-sm">{item.return_date || "-"}</td>
                                                            <td className={`p-3 font-semibold text-sm ${item.is_return === 0 ? "text-red-500" : "text-green-600"}`}>
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
                    </div>
                </div>
            </div>

            <div className="sticky w-full z-50">
                <AppLayout></AppLayout>
            </div>
        </main>
    );
}