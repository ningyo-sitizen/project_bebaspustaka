import React, { useState, useEffect } from "react";;
import axios from "axios";
import {
  IconUsers,
  IconHistory,
  IconHome,
  IconChartBar,
  IconBell,
  IconLogout,
  IconUser,
  IconChevronDown,
  IconPencil,
  IconEye,
  IconEyeOff,
  IconMenu2,

} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  // --- STATE MANAGEMENT ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State untuk data formulir


    const [profileData, setProfileData] = useState({
      name: "Loading...",
      username: "Loading...",
      role: "Loading...",
    });

      const [formData, setFormData] = useState({
      name: `${profileData.name}`,
      username: "zhrahprnm",
      role : "",
      newPassword: "",
     confirmPassword: "",
  });

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

      }
    };
    
    fetchProfile();
  }, []);

  useEffect(() => {
  if (profileData && profileData.name !== "Loading...") {
    setFormData(prev => ({
      ...prev,
      name: profileData.name,
      username: profileData.username,
      role: profileData.role
    }));
  }
}, [profileData]);

  const navigate = useNavigate();

  // --- HANDLERS ---

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validasi password
  if (formData.newPassword !== formData.confirmPassword) {
    alert("Password baru dan konfirmasi tidak cocok!");
    return;
  }

  if (formData.newPassword && formData.newPassword.length < 8) {
    alert("Password minimal 8 karakter");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.user_id;

    const response = await axios.put(
      "http://localhost:8080/api/profile/editProfile",
      {
        id: userId,
        name: formData.name,
        username: formData.username,
        newPassword: formData.newPassword || ""
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    // ===== SUCCESS =====
    if (response.status === 200) {
      alert("Profil berhasil diperbarui!");
      const newUser = response.data.user;

      // === Jika password berubah → Logout wajib ===
      if (formData.newPassword) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return; // STOP eksekusi, jangan lanjut
      }

      // === Jika TIDAK ubah password → update localStorage saja ===
      

      // Update UI
      setFormData(prev => ({
        ...prev,
        name: newUser.name,
        username: newUser.username,
        newPassword: "",
        confirmPassword: ""
      }));

      navigate("/profileSA");
    }

  } catch (error) {
    // ===== ERROR HANDLING =====
    const errorMessage = error.response?.data?.message || "Terjadi kesalahan server.";
    alert("Gagal memperbarui profil: " + errorMessage);
  }
};


  // --- UTILITY CLASS ---
  const getSidebarItemClass = () => {
    const baseClasses =
      "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
    return `${baseClasses} text-[#667790] hover:bg-gray-100`;
  };

  // --- RENDER COMPONENT ---
  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">

      {/* SIDEBAR (RESPONSIVE) */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:static lg:h-auto`}
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
                        <a href="/konfirmasiSA" className={getSidebarItemClass()}>
                            <IconBell size={20} />
                            Konfirmasi Data
                        </a>
                        <a href="/usercontrolSA" className={getSidebarItemClass(true)}>
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

      {/* Overlay untuk Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 lg:ml-0">

        {/* NAVBAR (RESPONSIVE) */}
        <header className="w-full bg-white border-b p-4 flex justify-between lg:justify-end relative z-20">

          {/* Tombol Menu untuk Mobile */}
          <button
            className="lg:hidden text-[#023048]"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <IconMenu2 size={24} />
          </button>

          {/* Profil Dropdown Trigger */}
          <div
            className="flex items-center gap-2 cursor-pointer pr-4 relative"
            onClick={toggleDropdown}
          >
            <IconChevronDown size={18} className="text-gray-600" />
            <p className="font-semibold text-sm text-[#023048] select-none hidden sm:block">
              Hai, {formData.name.split(" ")[0]}
            </p>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
              <IconUser size={24} className="text-gray-500" />
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-4 top-full mt-2 w-64 bg-white rounded-md shadow-lg border z-30">
              <div className="flex items-center gap-3 p-4 border-b">
                <IconUser size={24} className="text-gray-500" />
                <div>
                  <p className="font-semibold text-sm text-[#023048]">
                    {formData.name}
                  </p>
                  <p className="text-xs text-gray-500">{profileData.role}</p>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <button
                  onClick={() => navigate("/profileSA")}
                  className="flex items-center gap-3 p-2 w-full text-left text-sm bg-[#667790] text-white rounded-md"
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

        {/* CONTENT */}
        <div className="p-4 sm:p-8">

          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-4 sm:mb-6 flex items-center">
            <span className="text-gray-400 mr-2 hidden sm:inline">&gt;</span>

            {/* Navigasi Breadcrumb */}
            <button
              onClick={() => navigate("/profile")}
              className="text-[#667790] text-lg sm:text-2xl font-semibold hover:underline"
            >
              Profile
            </button>

            <span className="mx-2 text-gray-400">&gt;</span>
            <span className="text-[#023048] font-semibold text-lg sm:text-2xl">
              Edit Profile
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border">
            {/* Header Card */}
            <div className="flex items-center gap-4 pb-4 sm:pb-5 flex-wrap sm:flex-nowrap">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <IconUser size={40} className="text-gray-500 sm:size={50}" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#023048]">
                  {formData.name}
                </h2>
                <p className="text-sm text-gray-500">{profileData.role}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 sm:gap-8 border-b overflow-x-auto whitespace-nowrap">

              {/* Navigasi Tabs */}
              <button
                onClick={() => navigate("/profile")}
                className="pb-2 text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
              >
                Rincian Saya
              </button>

              <span className="pb-2 border-b-2 border-[#023048] text-[#023048] font-medium text-xs sm:text-sm">
                Edit Profile
              </span>
            </div>

            {/* FORMULIR */}
            <form onSubmit={handleSubmit}>
              <div className="mt-6 space-y-6 sm:space-y-8">

                {/* Edit Profile Utama */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-[#023048]">
                    Edit Profile Utama
                  </h3>

                  <div className="space-y-4">
                    {/* Nama */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Nama<span className="text-[#FF1515]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048] text-sm"
                        />
                        <IconPencil
                          size={16}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Peran */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Peran
                      </label>
                      <input
                        type="text"
                        readOnly
                        Value={profileData.role}
                        className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600 text-sm"
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">
                        Username<span className="text-[#FF1515]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048] text-sm"
                        />
                        <IconPencil
                          size={16}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Password */}
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-[#023048]">
                    Edit Password
                  </h3>

                  {/* Password Baru */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Password Baru<span className="text-[#FF1515]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048] text-sm"
                      />
                      {showPassword ? (
                        <IconEyeOff
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <IconEye
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                          onClick={togglePasswordVisibility}
                        />
                      )}
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Konfirmasi Password<span className="text-[#FF1515]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#023048] focus:border-[#023048] text-sm"
                      />
                      {showPassword ? (
                        <IconEyeOff
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <IconEye
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                          onClick={togglePasswordVisibility}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* BUTTON */}
                <div className="pt-4 sm:pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-5">
                  <button
                    onClick={() => navigate("/profile")}
                    type="button"
                    className="px-4 py-2 sm:px-6 sm:py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 sm:px-6 sm:py-2 bg-[#023048] text-white rounded-md hover:bg-[#023048]/90 text-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};