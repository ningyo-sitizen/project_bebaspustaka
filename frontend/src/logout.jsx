import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Hapus semua session
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect ke login
    navigate("/login");
  }, []);

  return null;
}
