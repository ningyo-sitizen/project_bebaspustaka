import { Routes, Route } from "react-router-dom";
<<<<<<< Updated upstream
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Analytic from "./Analytic.jsx";
import Approval from "./Approval.jsx";
import Profile from "./Profile.jsx";
import EditProfile from "./Editprofile.jsx";
=======
import UserControl from "./Usercontrol";
// import Login from "./Login.jsx";
// import Dashboard from "./Dashboard.jsx";
// import Analytic from "./Analytic.jsx";
// import Profile from "./Profile";
// import EditProfile from "./Editprofile";
// import Sidebar from "./Sidebar";
>>>>>>> Stashed changes

export default function App() {
  return (
    <Routes>
<<<<<<< Updated upstream
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />}/>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytic" element={<Analytic />}></Route>
      <Route path="/approval" element={<Approval />} />
      <Route path="/profile" element = {<Profile />}/>
      <Route path="/editprovile" element = {<EditProfile/>}/>
=======
      {/* /* <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />}/>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analytic" element={<Analytic />}></Route> */ }
      {/* <Route path="/" element={<Profile />} />
      <Route path="/" element={<EditProfile/>} /> */}
      {/* <Route path="/" element={<Sidebar/>} /> */}
      <Route path="/" element={<UserControl />} />
    
      
>>>>>>> Stashed changes
    </Routes>
  );
}
