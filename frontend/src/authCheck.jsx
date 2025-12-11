import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotif } from "./NotificationContext";

export default function authCheck() {
  const navigate = useNavigate();
  const { showNotif } = useNotif();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userk = JSON.parse(localStorage.getItem("user"));
    const user_role = userk?.role;
    
    if (!token) {
      showNotif("error", "Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    // 3. Cek valid token
    fetch("http://localhost:8080/api/landing/landingpagechart?year=2025", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            showNotif("error", "Sesi Anda telah habis.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }
        }
      })
      .catch(() => {
        showNotif("error", "Gagal menghubungi server.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      });
    
          if (user_role === "super admin") {
         showNotif("error", "anda melanggar aturan role-based view mohon login ulang");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login")
      return;
    }

  }, [navigate]);
}
