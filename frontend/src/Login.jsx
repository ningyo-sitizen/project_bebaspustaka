import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        alert(data.message || "Login gagal");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan server");
    }
  };

  return (
    <div className="font-jakarta bg-[url('https://cdn.designfast.io/image/2025-10-18/d3e331c2-2f93-43e5-a22f-8c39337d6546.png')] bg-cover bg-center h-screen">
      <div className="absolute bg-[url('https://cdn.designfast.io/image/2025-10-18/84339f05-ea02-4915-b50a-d8b112bc50c4.png')] bg-cover bg-no-repeat bg-center w-36 h-36 left-[270px] top-[150px]" />

      <div className="absolute w-[600px] h-[640px] bg-white right-0 top-0">
        <form
          onSubmit={handleLogin}
          className="relative top-[80px] right-[20px] mt-3 flex flex-col items-center text-center space-y-7"
        >
          <div className="bg-[url('https://cdn.designfast.io/image/2025-10-19/9f6cb104-d72a-4896-9da2-cb9a9213df42.png')] bg-cover bg-no-repeat bg-center w-24 h-24" />

          <div className="m-5">
            <h2 className="text-xl font-semibold text-[#023048]">LOGIN ADMIN</h2>
            <h2 className="text-base font-normal text-[#9A9A9A] m-3">
              Silakan login untuk mengakses akun Anda!
            </h2>
          </div>

          {/* Username */}
          <div className="inline-flex items-center border border-gray-300 rounded-lg p-2 w-[300px] focus-within:ring-2 focus-within:ring-[#023048]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400 mr-2"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
              <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </svg>

            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="outline-none w-full"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-gray-300 rounded-lg p-2 w-[300px] focus-within:ring-2 focus-within:ring-[#023048]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400 mr-2"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
              <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
            </svg>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="outline-none w-full"
              required
            />
          </div>

          {/* Remember */}
          <div className="flex justify-between items-center w-[300px] text-sm text-[#023048] mt-3">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="accent-[#023048]" />
              <span>Remember me</span>
            </label>
            <a href="#" className="hover:underline hover:text-[#034d66]">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="bg-[#023048] text-white w-80 h-12 rounded-lg hover:bg-[#034d66] transition duration-200 font-semibold"
          >
            LOGIN
          </button>
        </form>
      </div>

      <div className="absolute text-[#023048] m-3 mt-20 top-[250px] pl-4 left-[60px] w-[530px]">
        <h1 className="text-3xl text-center font-semibold">
          SELAMAT DATANG
        </h1>
        <h1 className="text-2xl text-center font-medium mt-4">
          Di Website Sistem Bebas Pustaka PNJ
        </h1>
        <h1 className="text-lg text-center font-thin mt-7">
          Cek status Bebas Pustaka Anda dengan cepat dan mudah.
          Proses pengajuan hingga verifikasi kini dalam genggaman Anda.
        </h1>
      </div>
    </div>
  );
}

export default Login;
