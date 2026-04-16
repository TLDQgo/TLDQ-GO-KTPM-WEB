import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import Header from "./components/layout/Header";
import Register from "./pages/Register";
import Login from "./pages/Login";
import RoutesUser from "./routes/RoutesUser";
function App() {
  return (
    <Router>
      <div className="p-0 w-full h-full ">
        <Routes>{RoutesUser()}</Routes>
      </div>
      <ToastContainer autoClose={1500} />
    </Router>
  );
}

export default App;
