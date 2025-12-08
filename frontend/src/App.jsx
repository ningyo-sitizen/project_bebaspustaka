import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Analytic from "./Analytic.jsx";
// import Approval from "./Approval.jsx";
// import Profile from "./Profile.jsx";
import EditProfile from "./Editprofile.jsx";
import DashboardSA from "./DashboardSA.jsx";
import AnalyticSA from "./AnalyticSA.jsx";
import ApprovalSA from "./ApprovalSA.jsx";
import Approval from "./Approval.jsx";
import Profile from "./ProfileSA.jsx";
import ProfileSA from "./ProfileSA.jsx";
import EditProfileSA from "./EditprofileSA.jsx";
import UserControlSA from "./UserControlSA.jsx";
import HistorySA from "./HistorySA.jsx";
import Logout from "./logout.jsx";
import Keterangan from "./Keterangan.jsx";
import KeteranganSA from "./KeteranganSA.jsx";
import {NotificationProvider } from "./NotificationContext.jsx";

export default function App() {
  return (
  <NotificationProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />}/>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytic" element={<Analytic />}></Route>
      <Route path="/Approval" element={<Approval/>} />
      <Route path="/profile" element = {<Profile />}/>
      <Route path="/edit-profile" element = {<EditProfile/>}/>
      <Route path="/dashboardSA" element={<DashboardSA />} />
      <Route path="/Keterangan" element={<Keterangan />} />
      <Route path="/analyticSA" element={<AnalyticSA />}></Route>
      <Route path="/approvalSA" element={<ApprovalSA />} />
      <Route path="/profileSA" element = {<ProfileSA />}/>
      <Route path="/edit-profileSA" element = {<EditProfileSA/>}/>
      <Route path="/usercontrolSA" element = {<UserControlSA/>}/>
      <Route path="/historySA" element = {<HistorySA/>}/>
      <Route path="/logout" element = {<Logout/>}/>
      <Route path="/KeteranganSA/:nim" element={<KeteranganSA />} />
    </Routes>
    </NotificationProvider>
  );
}
