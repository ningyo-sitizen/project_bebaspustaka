import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, Minus, Users, BookOpen, Calendar } from 'lucide-react';

function InfoCards() {
  const [infoData, setInfoData] = useState({
    todayVisitors: null,
    borrowedBooks: null,
    weeklyComparison: null,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchInfoData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const [todayRes, borrowedRes, weeklyRes] = await Promise.all([
        fetch("http://localhost:8080/api/infoCard/todayVisitorCount", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/api/infoCard/BorrowedBookList", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("http://localhost:8080/api/infoCard/ThisWeekAndLast", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const todayData = await todayRes.json();
      const borrowedData = await borrowedRes.json();
      const weeklyData = await weeklyRes.json();

      const newData = {
        todayVisitors: todayData.count || 0,
        borrowedBooks: borrowedData.count || 0,
        weeklyComparison: {
          thisWeek: weeklyData.thisWeek || 0,
          lastWeek: weeklyData.lastWeek || 0,
          difference: (weeklyData.thisWeek || 0) - (weeklyData.lastWeek || 0)
        },
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('dashboardInfoData', JSON.stringify(newData));
      setInfoData(newData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching info data:", err);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cachedData = localStorage.getItem('dashboardInfoData');

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const lastUpdated = new Date(parsed.lastUpdated);
      const now = new Date();
      const diffMinutes = (now - lastUpdated) / 1000 / 60;

      if (diffMinutes < 5) {
        setInfoData(parsed);
        setIsLoading(false);
      } else {

        fetchInfoData();
      }
    } else {
      fetchInfoData();
    }
  }, [fetchInfoData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchInfoData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchInfoData]);

  const getWeeklyIndicator = () => {
    if (!infoData.weeklyComparison) return null;

    const { difference } = infoData.weeklyComparison;

    if (difference > 0) {
      return {
        icon: <ArrowUp className="w-5 h-5" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        text: `+${difference} dari minggu lalu`
      };
    } else if (difference < 0) {
      return {
        icon: <ArrowDown className="w-5 h-5" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        text: `${difference} dari minggu lalu`
      };
    } else {
      return {
        icon: <Minus className="w-5 h-5" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        text: "Sama dengan minggu lalu"
      };
    }
  };

  const weeklyIndicator = getWeeklyIndicator();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1: Kunjungan Hari Ini */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-black font-semibold">Data Kunjungan Mahasiswa</h3>
          <div className="bg-[#EDF1F3] p-1 rounded-lg">
            <div className="bg-[#bg-[#667790]]">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-eye-search">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M12 18c-.328 0 -.652 -.017 -.97 -.05c-3.172 -.332 -5.85 -2.315 -8.03 -5.95c2.4 -4 5.4 -6 9 -6c3.465 0 6.374 1.853 8.727 5.558" />
              <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              <path d="M20.2 20.2l1.8 1.8" />
            </svg>
            </div>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {infoData.todayVisitors?.toLocaleString() || '0'}
        </p>
        <p className="text-xs text-gray-500 text-left">
          Data ini menunjukkan bahwa jumlah pengunjung perpustakaan pada hari ini
        </p>
      </div>

      {/* Card 2: Kunjungan Mingguan (dengan perbandingan) */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-black font-semibold">Data jumlah pengunjung perpustakaan minggu ini</h3>
          <div className="bg-purple-50 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {infoData.weeklyComparison?.thisWeek?.toLocaleString() || '0'}
        </p>

        {weeklyIndicator && (
          <div className={`flex items-center gap-2 ${weeklyIndicator.bgColor} px-3 py-1.5 rounded-lg`}>
            <span className={weeklyIndicator.color}>
              {weeklyIndicator.icon}
            </span>
            <span className={`text-sm font-medium ${weeklyIndicator.color}`}>
              {weeklyIndicator.text}
            </span>
          </div>
        )}
      </div>

      {/* Card 3: Buku yang Dipinjam */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-black font-semibold text-left">jumlah buku yang belum dikembalikan</h3>
          <div className="bg-orange-50 p-3 rounded-lg">
            <BookOpen className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {infoData.borrowedBooks?.toLocaleString() || '0'}
        </p>
        <p className="text-xs text-gray-500 text-left">
          
        </p>
      </div>

      {/* Info Update Terakhir */}
      {infoData.lastUpdated && (
        <div className="col-span-1 md:col-span-3 text-right">
          <p className="text-xs text-gray-400">
            Terakhir diperbarui: {new Date(infoData.lastUpdated).toLocaleString('id-ID')}
          </p>
        </div>
      )}
    </div>
  );
}

export default InfoCards;