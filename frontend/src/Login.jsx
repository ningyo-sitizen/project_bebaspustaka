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
        const userk = JSON.parse(localStorage.getItem('user'))
        console.log("LOCALSTORAGE USER:", localStorage.getItem("user"));
        console.log("PARSED:", JSON.parse(localStorage.getItem("user")));
        const user_name = userk.username || userk.name;
        const user_action = "user malakukan login"
        const action_status = "berhasil"
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, "0");
        const token = localStorage.getItem('token');
        const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const timePart = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const time = `${datePart} ${timePart}`;   

        const res = await fetch("http://localhost:8080/api/logger/logging", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ user_name, user_action, action_status, time })


        })
        const logger = await res.json();
        console.log(logger);

        if (data.user.role == "super admin") {
          navigate("/dashboardSA")

        } else {
          navigate("/dashboard");
        }
      } else {
        alert(data.message || "Login gagal");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan server");
    }
  };

  return (
    <main className="bg-black w-full min-h-screen font-jakarta">
      <div className="bg-[url('https://cdn.designfast.io/image/2025-10-18/d3e331c2-2f93-43e5-a22f-8c39337d6546.png')] bg-cover bg-center min-h-screen w-full flex flex-col lg:flex-row">

        {/* Kiriiiiiiiii*/}
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-justify lg:text-center px-6 lg:px-16 py-10">

          <div className="flex justify-center w-full mb-6 lg:mb-8">

            <div className="bg-[url('https://cdn.designfast.io/image/2025-10-18/84339f05-ea02-4915-b50a-d8b112bc50c4.png')] 
                    bg-cover bg-no-repeat bg-center 
                    w-36 h-36">
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:max-w-lg lg:mx-0">

            <h1 className="text-2xl lg:text-3xl text-[#023048] font-semibold">SELAMAT DATANG</h1>
            <h2 className="text-lg lg:text-xl font-medium mt-4 text-[#023048]">Di Website Sistem Bebas Pustaka PNJ</h2>
            <p className="text-lg lg:text-xl font-thin mt-7 text-[#023048]">
              Cek status Bebas Pustaka Anda dengan cepat dan mudah.
              Proses pengajuan hingga verifikasi kini dalam genggaman Anda.
            </p>

          </div>
        </div>


        {/* Kanannnnnnnn */}
        <div className="flex-1 flex justify-center items-center bg-white min-h-screen">

          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center space-y-7 w-full max-w-md px-6 py-10"
          >
            <div className="bg-[url('https://cdn.designfast.io/image/2025-10-19/9f6cb104-d72a-4896-9da2-cb9a9213df42.png')] bg-cover bg-no-repeat bg-center w-24 h-24" />

            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#023048]">LOGIN ADMIN</h2>
              <p className="text-base font-normal text-[#9A9A9A] mt-2">
                Silakan login untuk mengakses akun Anda!
              </p>
            </div>

            {/* Username */}
            <div className="flex items-center border border-gray-300 rounded-lg p-2 w-full focus-within:ring-2 focus-within:ring-[#023048]">
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
            <div className="flex items-center border border-gray-300 rounded-lg p-2 w-full focus-within:ring-2 focus-within:ring-[#023048]">
              <svg xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 mr-2"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
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

            <div className="hidden relative w-[400px] text-[#FF1515] ">*Maaf, Username/Password yang anda masukan salah, silahkan coba lagi!</div>
          </form>
        </div>

      </div>
    </main>

  );
}

export default Login;
