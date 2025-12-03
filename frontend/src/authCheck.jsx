import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function authCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token === "" || token === null) {
      navigate("/login");
    }
  }, []);
}
