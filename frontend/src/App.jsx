import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Analytic from "./Analytic.jsx";
import Approval from "./Approval.jsx";
import Profile from "./Profile.jsx";
import EditProfile from "./Editprofile.jsx";
import DashboardSA from "./DashboardSA.jsx";
import AnalyticSA from "./AnalyticSA.jsx";
import ApprovalSA from "./ApprovalSA.jsx";
import ProfileSA from "./ProfileSA.jsx";
import EditProfileSA from "./EditprofileSA.jsx";
import UserControlSA from "./UserControlSA.jsx";
import HistorySA from "./HistorySA.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />}/>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytic" element={<Analytic />}></Route>
      <Route path="/approval" element={<Approval />} />
      <Route path="/profile" element = {<Profile />}/>
      <Route path="/edit-profile" element = {<EditProfile/>}/>
      <Route path="/dashboardSA" element={<DashboardSA />} />
      <Route path="/analyticSA" element={<AnalyticSA />}></Route>
      <Route path="/approvalSA" element={<ApprovalSA />} />
      <Route path="/profileSA" element = {<ProfileSA />}/>
      <Route path="/edit-profileSA" element = {<EditProfileSA/>}/>
      <Route path="/usercontrolSA" element = {<UserControlSA/>}/>
      <Route path="/historySA" element = {<HistorySA/>}/>
    </Routes>
  );
}
