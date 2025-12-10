import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotif } from "./NotificationContext"

function Login() {
  const { showNotif } = useNotif();
  const [name, setName] = useState("");
  const [failedLogin, setFailedLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      setFailedLogin("*Harap input username dan password");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        setFailedLogin("");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const userk = JSON.parse(localStorage.getItem('user'))
        console.log("LOCALSTORAGE USER:", localStorage.getItem("user"));
        console.log("PARSED:", JSON.parse(localStorage.getItem("user")));
        const user_name = userk.username || userk.name;
        const role = userk.role;
        const user_action = "user malakukan login"
        const action_status = "berhasil"

        //token if login
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
          body: JSON.stringify({ user_name, role, user_action, action_status, time })


        })
        const logger = await res.json();
        console.log(logger);

        if (data.user.role == "super admin") {
          showNotif("success", `selamat datang di sistem! ${user_name}`);
          navigate("/dashboardSA")

        } else {
          showNotif("success", `selamat datang di sistem! ${user_name}`);
          navigate("/dashboard");
        }
        fetch("http://localhost:8080/api/summary/sync", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }).catch(err => {
          console.log("SYNC ERROR (diabaikan):", err);
        });
      } else {
        setFailedLogin("*Maaf, Username/Password yang anda masukan salah, silahkan coba lagi!");
      }

    } catch (err) {
      console.error("Error:", err);
      setFailedLogin("*Maaf, Username/Password yang anda masukan salah, silahkan coba lagi!");
    }
  };

  return (
    <main className="bg-white w-full min-h-screen font-jakarta mx-auto">
      <div className="relative flex flex-col lg:flex-row min-h-screen overflow-hidden">

        {/* LEFT CONTENT */}
        <section className="flex-1 flex flex-col justify-center items-center lg:items-start text-center">
          <div className="hidden lg:block absolute inset-0 overflow-visible pointer-events-none">

            <div className="absolute top-1/2 -translate-x-[40%] -translate-y-1/2 w-[72vw] h-[73vw] rounded-full bg-[#EDF1F3]">
            </div>

            <div className="absolute top-1/2 -translate-x-[40%] -translate-y-1/2 w-[75vw] h-[73vw] rounded-full border-4 border-[#EDF1F3]">
            </div>
          </div>

          {/* Logo besar kiri */}
          <div className="flex flex-col items-center justify-center mb-8 ml-16 py-2 z-10">

            <div className="w-[350px] h-[300px] bg-[length:400px_200px] bg-[url('https://cdn.designfast.io/image/2025-12-09/8d95b9bd-3314-46ce-8e32-6f8c410dd604.png')] bg-contain bg-no-repeat bg-center"></div>

            {/* Text */}
            <div className="max-w-lg space-y-4 z-10 gap-4 py-3 mx-10">
              <h1 className="text-2xl lg:text-3xl font-semibold text-[#023048]">
                SELAMAT DATANG
              </h1>
              <h2 className="text-lg lg:text-xl font-medium text-[#023048]">
                Di Website Sistem Bebas Pustaka PNJ
              </h2>
            </div>
          </div>

        </section>

        {/* RIGHT CONTENT - LOGIN FORM */}
        <section className="flex-1 flex justify-start lg:justify-start items-center bg-white min-h-screen ml-40 z-10">

          <form onSubmit={handleLogin}
            className="w-full max-w-sm lg:max-w-md space-y-8 bg-white">

            {/* Logo kecil */}
            <div className="flex justify-center">
              <div
                className="w-24 h-24 bg-[url('https://cdn.designfast.io/image/2025-10-19/9f6cb104-d72a-4896-9da2-cb9a9213df42.png')] 
              bg-cover bg-center"
              ></div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#023048]">LOGIN ADMIN</h2>
              <p className="text-sm text-[#9A9A9A] mt-1">
                Silakan login untuk mengakses akun Anda!
              </p>
            </div>

            {/* Username */}
            <div className="flex items-center border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#023048]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="27"
                className="text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
              </svg>
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            {/* Password */}
            <div className="flex items-center border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#023048]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="27"
                className="text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
                <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none"
              />
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm text-[#023048]">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#023048]" />
                <span>Remember me</span>
              </label>
              {/* <a href="#" className="hover:text-[#034d66] hover:underline">
                Forgot Password?
              </a> */}
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full h-12 bg-[#023048] text-white rounded-lg font-semibold hover:bg-[#034d66] transition"
            >
              LOGIN
            </button>

            {/* Error */}
            {failedLogin && (

              <p className="text-[#FF1515] text-sm">{failedLogin}</p>
            )}
          </form>

        </section>

      </div>
    </main>
  );

}

export default Login;
