import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Analytic from "./Analytic.jsx";
import Approval from "./Approval.jsx";
import Profile from "./Profile.jsx";
import EditProfile from "./Editprofile.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />}/>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytic" element={<Analytic />}></Route>
      <Route path="/approval" element={<Approval />} />
      <Route path="/profile" element = {<Profile />}/>
      <Route path="/editprovile" element = {<EditProfile/>}/>
    </Routes>
  );
}
