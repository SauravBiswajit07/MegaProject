import "./App.css";
import {Routes,Route} from "react-router-dom";
import Home from "./pages/Home"
import Navbar from "./components/Common/Navbar"


// Components
// import Navbar from "./components/Common/Navbar"

// pages 
import Login from "./pages/Login"
import Signup from "./pages/Signup"

import OpenRoute from "./components/core/Auth/OpenRoute"
import ForgotPassword from "./pages/ForgotPassword"
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About"
import Contact from "./pages/Contact"




function App() {
  return (
    <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
      <Navbar />
      <Routes> 
      <Route path="/" element={<Home/>} />
      <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      {/* <Home/> */}
      
      
    </div>

  );
}

export default App;
