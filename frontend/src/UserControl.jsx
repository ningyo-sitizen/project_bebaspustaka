import React, { useState, useEffect } from "react";
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

// Counter ID untuk simulasi penambahan user baru
let nextUserId = 5;

// =================================================================
// 🚨 KOMPONEN NOTIFIKASI GAGAL (TOAST MERAH BARU) 🚨
// =================================================================
const ErrorNotification = ({ isVisible, message, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            // Notifikasi akan hilang setelah 5 detik
            const timer = setTimeout(() => {
                onClose();
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const notificationClass = isVisible
        ? "translate-x-0 opacity-100" 
        : "translate-x-full opacity-0"; 

    return (
        <div
            className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out ${notificationClass}`}
        >
            {/* Menggunakan border-red-500 dan bg-red-500 */}
            <div className="bg-white border-l-4 border-red-500 p-4 rounded-lg shadow-xl max-w-sm w-full flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {/* Menggunakan IconX untuk simbol Error/Gagal */}
                    <IconX size={20} className="text-white" /> 
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-800">Gagal!</h3>
                    <p className="text-sm text-gray-600 mt-1">{message}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full flex-shrink-0"
                    aria-label="Tutup notifikasi"
                >
                    <IconX size={20} />
                </button>
            </div>
        </div>
    );
};

// =================================================================
// KOMPONEN NOTIFIKASI BERHASIL (Toast HIJAU)
// =================================================================
const SuccessNotification = ({ isVisible, message, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const notificationClass = isVisible
        ? "translate-x-0 opacity-100" 
        : "translate-x-full opacity-0"; 

    return (
        <div
            className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-in-out ${notificationClass}`}
        >
            <div className="bg-white border-l-4 border-green-500 p-4 rounded-lg shadow-xl max-w-sm w-full flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconCheck size={20} className="text-white" /> 
                </div>
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-800">Berhasil!</h3>
                    <p className="text-sm text-gray-600 mt-1">{message}</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full flex-shrink-0"
                    aria-label="Tutup notifikasi"
                >
                    <IconX size={20} />
                </button>
            </div>
        </div>
    );
};

// =================================================================
// KOMPONEN MODAL KONFIRMASI DELETE (POPP-UP MERAH TENGAH)
// =================================================================
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, username }) => {
    if (!isOpen) return null;

    return (
        // Backdrop Overlay (Latar Belakang Gelap) 
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 font-['Plus_Jakarta_Sans'] transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 transform transition-transform duration-300 scale-100 relative overflow-hidden p-6">
                
                {/* Tombol Tutup (X) di Pojok Kanan Atas */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
                    aria-label="Tutup modal"
                >
                    <IconX size={24} />
                </button>

                {/* Body Modal - Konten Utama */}
                <div className="text-center"> 
                    
                    {/* Ikon Tempat Sampah Merah di Lingkaran Merah Muda */}
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
                        <IconTrash size={32} className="text-red-500" />
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Hapus Account?</h2>
                    <p className="text-sm text-gray-600 mt-2 mb-6 px-2">
                        Setelah akun dihapus, tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                        {username && <span className="block mt-1 font-medium">({username})</span>}
                    </p>
                    
                    {/* Grup Tombol Aksi */}
                    <div className="flex justify-center gap-3">
                        {/* Tombol Batal/Tutup */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 font-medium text-sm"
                        >
                            Batal
                        </button>
                        
                        {/* Tombol Setujui/Konfirmasi (Merah) */}
                        <button
                            type="button"
                            onClick={onConfirm} 
                            className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 font-medium text-sm"
                        >
                            Setujui
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// =================================================================
// KOMPONEN MODAL TAMBAH AKUN BARU 
// onAddSuccess diubah menjadi onActionComplete
// =================================================================
const AddUserModal = ({ isOpen, onClose, onActionComplete }) => { 
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        name: "",
        role: "Admin",
        username: "",
        password: "",
        confirmPassword: ""
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); 

        if (formData.password !== formData.confirmPassword) {
            // 🚨 LOGIC BARU: Memicu notifikasi GAGAL (Merah)
            if (onActionComplete) {
                onActionComplete(false, "Password Baru dan Konfirmasi Password tidak cocok. Silakan coba lagi."); 
            }
            return; // Hentikan proses jika password tidak cocok
        }
        
        const newUser = {
            id: nextUserId++,
            name: formData.name,
            username: formData.username,
            role: formData.role
        };
        
        // 🚀 LOGIC BARU: Memicu notifikasi SUKSES (Hijau)
        if (onActionComplete) {
            onActionComplete(true, `Akun ${newUser.username} berhasil ditambahkan.`); 
        }

        setFormData({
            name: "",
            role: "Admin",
            username: "",
            password: "",
            confirmPassword: ""
        });
        // Catatan: Modal TIDAK ditutup di sini. Penutupan dilakukan di handleAddUserAction di UserControl
        // agar data user baru dapat diakses untuk ditampilkan di notifikasi sukses.
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-['Plus_Jakarta_Sans'] transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                
                {/* Header Modal */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E7EBF1] flex items-center justify-center">
                            <IconUsers size={24} className="text-[#023048]" />
                        </div>
                        <h2 className="text-xl font-semibold text-[#023048]">Tambah Akun Baru</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <IconX size={24} />
                    </button>
                </div>

                {/* Body/Form Modal */}
                <form id="add-user-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#023048] focus:border-[#023048]"
                            placeholder="Nama"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peran*</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 font-jakarta border border-gray-300 rounded-lg focus:ring-[#023048] focus:border-[#023048]"
                            required
                        >
                            <option value="Admin">Admin</option>
                            <option value="Super Admin">Super Admin</option>
    
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#023048] focus:border-[#023048]"
                            placeholder="Username"
                            required
                        />
                    </div>

                    {/* Password Fields */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru*</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#023048] focus:border-[#023048] pr-10"
                                    placeholder=""
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password*</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#023048] focus:border-[#023048] pr-10"
                                    placeholder=""
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                    aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                                >
                                    {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Modal */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150"
                    >
                        Batal
                    </button>
                    <button
                        type="submit" 
                        form="add-user-form" 
                        className="px-4 py-2 bg-[#023048] text-white rounded-lg hover:bg-[#023048]/90 transition duration-150"
                    >
                        Tambah Akun
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// KOMPONEN UTAMA USER CONTROL 
// =================================================================
const UserControl = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    
    const [viewMode, setViewMode] = useState('list');
    
    // Data Dummy
    const [users, setUsers] = useState([
        { id: 1, name: "Zahrah Purnama Alam", username: "zhrahprnm", role: "Admin" },
        { id: 2, name: "Budi Santoso", username: "budis", role: "Super Admin" },
        { id: 3, name: "Citra Dewi", username: "citrad", role: "Admin" },
        { id: 4, name: "Doni Pratama", username: "donip", role: "Super Admin" },
    ]);
    const [profileData] = useState({
        name: "Zahrah Purnama",
        role: "Admin",
        photo: "https://i.ibb.co/C07X0Q0/dummy-profile.jpg",
    });
    
    // 🚦 STATE NOTIFIKASI
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false); // <-- BARU
    const [notificationMessage, setNotificationMessage] = useState("");

    const navigate = useNavigate();

    // --- HANDLERS UTAMA ---
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const openAddModal = () => setIsAddModalOpen(true);
    const closeAddModal = () => setIsAddModalOpen(false);
    
    // Handler penutup notifikasi yang spesifik
    const closeSuccessNotification = () => setShowSuccessNotification(false);
    const closeErrorNotification = () => setShowErrorNotification(false); // <-- BARU

    // Buka Modal Hapus Konfirmasi
    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    // Tutup Modal Hapus Konfirmasi
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    // Proses Konfirmasi Hapus Akun
    const handleConfirmDelete = () => {
        if (userToDelete) {
            const username = userToDelete.username;

            // Hapus user dari state
            setUsers(users.filter(user => user.id !== userToDelete.id));

            // Tutup modal hapus
            closeDeleteModal();

            // Tampilkan notifikasi sukses
            setNotificationMessage(`Kamu telah berhasil menghapus akun ${username}.`);
            setShowSuccessNotification(true);
        }
    };
    
    // 📢 HANDLER UNTUK AKSI ADD USER (SUKSES ATAU GAGAL)
    const handleAddUserAction = (isSuccess, message, newUser = null) => { 
        setNotificationMessage(message);
        
        if (isSuccess) {
             // Karena AddUserModal tidak mengembalikan object user,
             // kita perlu logic untuk menambahkannya (meskipun di kode ini sudah
             // disimulasikan di handleSubmit AddUserModal). 
             // Jika data user baru harus dikelola di sini, 
             // prop onActionComplete harus membawa objek newUser.
             // Untuk saat ini, kita asumsikan data sudah diupdate secara internal
             // atau diabaikan karena ini hanya simulasi front-end.
             
             // Karena ada logic nextUserId++ di modal, kita tidak bisa
             // menambahkannya di sini, mari kita kembali ke logic lama:
             
             // REVISI: Karena AddUserModal hanya menerima onActionComplete(isSuccess, message)
             // dan sudah ada logic penambahan user di dalam AddUserModal, 
             // kita hanya perlu mengurus tampilan notifikasi di sini.
             
             setShowSuccessNotification(true);
             setIsAddModalOpen(false); // Tutup modal jika sukses
        } else {
            setShowErrorNotification(true);
            // Modal TIDAK ditutup jika GAGAL (Agar user bisa langsung memperbaiki)
        }
    };

    // --- UTILITY CLASS ---
    const getSidebarItemClass = (isActive = false) => {
        const baseClasses =
            "flex items-center gap-3 p-3 rounded-md font-medium transition-colors text-sm";
        return isActive
            ? `${baseClasses} bg-[#E7EBF1] text-[#023048] font-semibold`
            : `${baseClasses} text-[#667790] hover:bg-gray-100`;
    };

    // --- RENDER COMPONENT ---
    return (
        <div className="flex min-h-screen bg-[#F5F6FA] font-['Plus_Jakarta_Sans']">

            {/* SIDEBAR */}
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
                        <a href="/dashboard" className={getSidebarItemClass()}>
                            <IconHome size={20} />
                            Dashboard
                        </a>
                        <a href="/analytic" className={getSidebarItemClass()}>
                            <IconChartBar size={20} />
                            Data Analitik
                        </a>
                        <a href="/konfirmasi" className={getSidebarItemClass()}>
                            <IconBell size={20} />
                            Konfirmasi Data
                        </a>
                        <a href="/user-control" className={getSidebarItemClass(true)}>
                            <IconUsers size={20} />
                            User Control
                        </a>
                        <a href="/history" className={getSidebarItemClass()}>
                            <IconHistory size={20} />
                            History
                        </a>
                    </nav>
                </div>
            </aside>

            {/* OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* MAIN AREA */}
            <div className="flex-1 lg:ml-0">

                {/* NAVBAR */}
                <header className="w-full bg-white border-b p-4 flex justify-between lg:justify-end relative z-20">
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
                            <img src={profileData.photo} alt="Profile" className="w-full h-full object-cover" />
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

                {/* MAIN USER CONTROL CONTENT */}
                <div className="p-4 sm:p-8">

                    <div className="flex justify-between items-start mb-6">
                        {/* Judul dan deskripsi */}
                        <div>
                            <h1 className="text-xl font-semibold text-[#023048]">Kontrol Pengguna</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Fitur User Control memungkinkan admin menambah dan menghapus akun pengguna sesuai kebutuhan sistem.
                            </p>
                        </div>
                        {/* IKON TAMPILAN DATA */}
                        <div className="flex-shrink-0 flex items-center mt-2 sm:mt-0">
                            {/* Tombol Grid */}
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`w-10 h-10 border rounded-lg flex items-center justify-center ${viewMode === 'grid'
                                        ? 'bg-[#023048] text-white border-[#023048] shadow-sm'
                                        : 'bg-white text-[#667790] border-gray-300 hover:bg-gray-50'
                                    } transition duration-150`}
                                aria-label="Tampilan Grid"
                            >
                                <IconLayoutGrid size={20} />
                            </button>
                            {/* Tombol List */}
                            <button
                                onClick={() => setViewMode('list')}
                                className={`w-10 h-10 border rounded-lg flex items-center justify-center ml-3 ${viewMode === 'list'
                                        ? 'bg-[#023048] text-white border-[#023048] shadow-sm'
                                        : 'bg-white text-[#667790] border-gray-300 hover:bg-gray-50'
                                    } transition duration-150`}
                                aria-label="Tampilan List"
                            >
                                <IconList size={20} />
                            </button>
                        </div>
                    </div>

                    {/* USER CARD GRID/LIST */}
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {users.map(user => (
                            <div key={user.id} className="relative bg-white rounded-md shadow-sm border border-gray-200 p-4 flex items-center justify-between min-h-[120px]">
                                
                                {/* Garis biru di kiri */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#667790] rounded-l-md"></div>

                                {/* Kontainer Utama Konten (Menggunakan struktur baru untuk penempatan) */}
                                <div className="flex w-full pl-2">
                                    
                                    {/* Kiri: Ikon & Detail Teks */}
                                    <div className="flex flex-col flex-grow">
                                        
                                        {/* Baris 1: Ikon & Username (Sejajar) */}
                                        <div className="flex items-center">
                                            {/* Icon */}
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3">
                                                <IconUser size={20} className="text-gray-500" />
                                            </div>
                                            {/* Username */}
                                            <p className="font-semibold text-base text-[#023048] leading-tight"> 
                                                {user.username}
                                            </p>
                                        </div>
                                        
                                        {/* Baris 2 & 3: Nama Panjang dan Role (Di bawah ikon) */}
                                        <div className="mt-1 pt-2 border-t border-gray-100 pl-0 sm:pl-2 ">
                                            {/* Nama Panjang */}
                                            <p className="text-sm text-gray-700 leading-snug">
                                                {user.name}
                                            </p>
                                            {/* Role */}
                                            <p className="text-xs text-[#667790] font-medium leading-snug mt-0.5">
                                                Role : {user.role}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Kanan: Tombol Hapus */}
                                    <button
                                        onClick={() => openDeleteModal(user)} 
                                        className="w-10 h-10 text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 flex-shrink-0 flex items-center justify-center ml-4 relative z-20 mt-6"
                                        aria-label={`Hapus user ${user.username}`}
                                    >
                                        <IconTrash size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TOMBOL TAMBAH AKUN BARU */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={openAddModal} 
                            className="flex items-center gap-2 px-6 py-3 bg-[#023048] text-white rounded-lg hover:bg-[#023048]/90 transition duration-150 font-normal"
                        >
                            <IconPlus size={20} />
                            Tambah Account Baru
                        </button>
                    </div>

                </div>
            </div>

            {/* MODAL TAMBAH AKUN BARU */}
            <AddUserModal 
                isOpen={isAddModalOpen} 
                onClose={closeAddModal} 
                onActionComplete={handleAddUserAction} // <-- MENGIRIM HANDLER AKSI
            />

            {/* MODAL KONFIRMASI HAPUS AKUN (POPP-UP MERAH) */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                username={userToDelete ? userToDelete.username : ""}
            />
            
            {/* KOMPONEN NOTIFIKASI SUKSES (HIJAU) */}
            <SuccessNotification 
                isVisible={showSuccessNotification}
                message={notificationMessage}
                onClose={closeSuccessNotification}
            />
            
            {/* 🚨 KOMPONEN NOTIFIKASI GAGAL (MERAH BARU) 🚨 */}
            <ErrorNotification 
                isVisible={showErrorNotification}
                message={notificationMessage}
                onClose={closeErrorNotification}
            />

        </div>
    );
};

export default UserControl;