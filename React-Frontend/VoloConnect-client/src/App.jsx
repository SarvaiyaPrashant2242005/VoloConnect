import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Login/Auth";
import Landingpage from "./components/Landing Page/Landing-page";
import Homepage from "./components/Dashboard/Homepage";
import CreateEvent from "./components/Dashboard/CreateEvent";
import ContactUs from "./components/Dashboard/ContactUs";
import Events from "./components/Dashboard/Events";
import Certificates from "./components/Dashboard/Certificates";
import Profile from "./components/Dashboard/Profile";


function App() {
  return (
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/homepage" element={<Homepage/>} />
        <Route path="/newEve" element={<CreateEvent/>} />
        <Route path="/ContactUs" element={<ContactUs/>} />
        <Route path="/events" element={<Events/>} />
        <Route path="/certificates" element={<Certificates/>} />
        <Route path="/profile" element={<Profile />}/>
        

      </Routes>



  );
}

export default App;
