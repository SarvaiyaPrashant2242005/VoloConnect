import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/Login/Auth";
import Landingpage from "./components/Landing Page/Landing-page";


function App() {
  return (
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    // <Auth/>

  );
}

export default App;
