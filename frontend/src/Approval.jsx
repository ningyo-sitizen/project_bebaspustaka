import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { data, Link } from 'react-router-dom';
import "./App.css";

import axios from "axios";



function Approval() {
    const [data, setData] = useState([
        { id: 1, name: "Hoshimi Miyabi", nim: "1234", pengembalian: 1, status: 0, statusbebaspustakanya: 0 },
        { id: 2, name: "Jane Doe", nim: "5678", pengembalian: 0, status: 0, statusbebaspustakanya: 0 },
        { id: 3, name: "Zahra Byanka Anggrita Widagdo", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 4, name: "Zuriel Joseph Jowy Mone", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 5, name: "Zahrah Purnama Alam", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 6, name: "Oscar Pramudyas Astra Ozora", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 7, name: "Dwi Aryo Prakoso Rahardjo", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 8, name: "MOHAMAD MUGHNI HAUNAN", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 9, name: "ZAHRAN PURNAMA ALAM", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 10, name: "Asaba Harumasa", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 11, name: "Yixuan", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 12, name: "Evelyn Chevalier", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 13, name: "MUHAMMAD FAIQ AJI ALGHIFARI", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 14, name: "AZKIA INTAN SAHILA", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
        { id: 15, name: "Echa Sativa Audrey", nim: "2307412035", pengembalian: 1, status: 1, statusbebaspustakanya: 1 },
    ]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    //ceklis
    const [checkedItems, setCheckedItems] = useState({});
    const [approvedAll, setApprovedAll] = useState(false);
    const cekAll = () => {
        const newValue = !approvedAll;
        setApprovedAll(newValue);

        const newChecked = {};
        data.forEach(item => {
            newChecked[item.id] = newValue;
        });

        setCheckedItems(newChecked);
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
    const [search, setSearch] = useState("");
    const filteredData = data.filter(
        item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.nim.toLowerCase().includes(search.toLowerCase())
    );

    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pageNumbers = [];
    const maxVisible = 5; // jumlah angka yang mau ditampilin

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
    }

    //next page
    const goto = useNavigate();
    const [alertBebasPustaka, setAlertBebasPustaka] = useState(false);

    const [alertBebasPustakaAll, setAlertBebasPustakaAll] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [urutkanBy, setUrutkanBy] = useState(false);


    const sortAZ = () => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setData(sorted);
    };
    const sortZA = () => {
        const sorted = [...data].sort((a, b) => b.name.localeCompare(a.name));
        setData(sorted);
    };

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

    const SetujuiBepus = async () => {
        setAlertBebasPustaka(false);

        //sisanya tar taro UPDATE status bebas pustaka ya
    };

    const SortByDate = async () => {
        setShowFilter(false);

        //sisanya tar taro UPDATE status bebas pustaka ya
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);


    return (
        <div className="font-jakarta bg-[#EDF1F3] w-full min-h-screen">

            <header className="fixed bg-white bg-cover bg-no-repeat bg-center w-full h-20 top-0 z-50">
                <div className="absolute inline-flex m-2 right-24">
                    <div className="inline-flex items-center">
                        <p>Hai,&nbsp;</p>
                        {/* ini nanti terhubung sama database akun pustakawan */}
                        <p className="mr-3">misal sini Zahra</p>
                    </div>
                    <div className="bg-[url('https://cdn.designfast.io/image/2025-10-28/0b728be1-b553-4462-b4c9-41c894ee5f79.jpeg')] 
                   bg-cover bg-center rounded-full w-16 h-16">
                    </div>
                </div>
            </header>

            <div className="flex pt-20 min-h-screen">
                {/* intinya ini sidebar */}
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
                                <path d="M4 20h14" />
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
                                <path d="M15 19l2 2l4-4" />
                            </svg>
                        <Link to="/approval">
                            <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                                Konfirmasi Data
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
                            <path d="M18 15l3-3" />
                        </svg>

                        <h2 className="ml-2 font-semibold transition-all duration-200 text-[#667790] group-hover:text-white group-focus:text-white">
                            Keluar
                        </h2>
                    </div>
                </aside>


                {/* TABLE APPROVAL */}
                <main className="ml-64 flex-1 p-8">

                    <p className="font-semibold text-2xl text-black mb-8"> Konfirmasi Data Bebas Pustaka </p>
                    <div className="inline-flex items-center font-medium text-lg text-[#9A9A9A]">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-users"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                        </svg>
                        {/* mainin db ini */}
                        <p className="ml-1">xxxx &nbsp;</p>
                        <p className="mr-3">permohonan bebas pustaka</p>
                    </div>

                    <div className="flex justify-between items-center mt-4 relative">
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


                        <div className="flex items-center gap-3 relative">
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
                                Filter
                            </button>


                            {showFilter && (
                                <div className="absolute top-10 left-0 -translate-x-[175px] bg-[#F9FAFB] p-3 rounded-sm shadow z-50 max-w-[300px]">
                                    <p className="text-xs font-light">Filter</p>
                                    <div className="w-full h-[2px] mt-3 bg-gray-300"></div>

                                    <div className="w-60 h-52 mt-3 p-0 inline-block">
                                        <DayPicker
                                            mode="range"
                                            selected={range}
                                            onSelect={handleRangeChange}
                                            className="text-xs scale-75"
                                        />
                                    </div>
                                    <div className="w-full h-[2px] mt-3 bg-gray-300"></div>

                                    <div className="mt-3 text-xs">
                                        <label className="block mb-1 font-semibold">
                                            Tanggal Mulai<span className="text-[#FF1515]">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={handleStartInput}
                                            className="border px-2 py-1 rounded-sm text-sm w-full"
                                        />
                                    </div>

                                    <div className="mt-3 text-xs">
                                        <label className="block mb-1 font-semibold">
                                            Tanggal Selesai<span className="text-[#FF1515]">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={handleEndInput}
                                            className="border px-2 py-1 rounded-sm text-sm w-full block"
                                        />
                                    </div>
                                    <p className="text-[10px] font-normal mt-2"> Rentang : &nbsp;</p>
                                    <p className="text-[10px] font-normal text-[#9A9A9A] mt-2">{rangeText}</p>
                                    <div className="relative flex mt-3 gap-2 text-xs font-normal justify-end">
                                        <button className='cursor-pointer flex relative items-center p-2 rounded border border-[#757575] text-[#757575] active:scale-90 transition-transform duration-200'
                                            onClick={() => setShowFilter(false)}>Batalkan</button>
                                        <button className='cursor-pointer flex relative items-center p-2 rounded border border-[#757575] bg-[#023048] text-white active:scale-90 transition-transform duration-200'
                                            onClick={SortByDate}>Cari Data</button>
                                    </div>
                                </div>

                            )}


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
                                <div className="absolute top-10 right-44 flex flex-col gap-2 bg-[#F9FAFB] rounded-sm shadow z-50 w-40">
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

                        <div className="overflow-x-auto relative bottom-0">
                            <table className="w-full border-collapse mt-7">
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
                                    {currentRows.map((item, index) => ( //ssesuain sama db
                                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}>
                                            <td className="p-4">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedItems[item.id] || false}
                                                        onChange={() => handleSingleCheck(item.id)}
                                                        className="absolute w-4 h-4 opacity-0 cursor-pointer"
                                                    />
                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${checkedItems[item.id]
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
                                            <td className="p-4 whitespace-nowrap overflow-x-auto">{item.name}</td>
                                            <td className="p-4 whitespace-nowrap overflow-x-auto">{item.nim}</td>

                                            {/* status pengembalian dan bebas pustaka

                                        
                                        1.
                                        ${namadb.pengembalian === 1 ? "text-[#4ABC4C]" : "text-[#FF1515]"} 
                                        {namadb.pengembalian === 1 ? "Sudah Dikembalikan" : "Belum Dikembalikan" 
                                        
                                        2. 
                                        ${namadb.status === 1 ? "text-[#4ABC4C]" : "text-[#FF1515]"} 
                                        {namadb.status === 1 ? "Bebas Pustaka" : "Tidak Bebas Pustaka"*/}

                                            <td className={`p-4 whitespace-nowrap overflow-x-auto ${item.pengembalian === 1 ? "text-[#4ABC4C]" : "text-[#FF1515]"}`}>
                                                {item.pengembalian === 1 ? "Sudah Dikembalikan" : "Belum Dikembalikan"}
                                            </td>

                                            <td className={`p-4 whitespace-nowrap overflow-x-auto ${item.status === 1 ? "text-[#4ABC4C]" : "text-[#FF1515]"}`}>
                                                {item.status === 1 ? "Bebas Pustaka" : "Tidak Bebas Pustaka"}
                                            </td>
                                            <td className="p-4 text-[#4ABC4C] whitespace-nowrap overflow-x-auto">
                                                {/* kolom tergantung status bebas pustaka di db. uncomment aja yg dibawah*/}


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
                                                    onClick={() => goto('/keterangan')}
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
                    <button className='cursor-pointer flex relative items-center p-2 top-4 my-5 rounded-lg border border-[#757575] bg-[#023048] text-white active:scale-90 transition-transform duration-200'
                        onClick={''}>Cetak ke PDF
                    </button>

                    <div className="flex gap-2 justify-center mt-4 items-center">
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


                </main>

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

export default Approval;