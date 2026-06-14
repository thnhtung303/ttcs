import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Products from "./pages/Products";
import Stock from "./pages/Stock"; 
import Customer from "./pages/Customer"; 
import Supplier from "./pages/Supplier"; 
import Import from "./pages/Import";
import Export from "./pages/Export";

const getAuthUser = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) return null;
  try { return JSON.parse(user); } catch { return null; }
};

function App() {
  const [loggedInUser, setLoggedInUser] = useState(getAuthUser());

  useEffect(() => { setLoggedInUser(getAuthUser()); }, []);

  return (
    <Router>
      <TopBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />
      <div className="wrap">
        <div className="main">
          {loggedInUser && <Sidebar loggedInUser={loggedInUser} />}
          <div className="content">
            <Routes>
              {!loggedInUser ? (
                <>
                  <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" element={<Dashboard loggedInUser={loggedInUser} />} />
                  <Route path="/report" element={<Report loggedInUser={loggedInUser} />} />
                  <Route path="/products" element={<Products loggedInUser={loggedInUser} />} />
                  <Route path="/stock" element={<Stock loggedInUser={loggedInUser} />} />
                  <Route path="/customer" element={<Customer loggedInUser={loggedInUser} />} />
                  <Route path="/supplier" element={<Supplier loggedInUser={loggedInUser} />} />
                  <Route path="/import" element={<Import loggedInUser={loggedInUser} />} />
                  <Route path="/export" element={<Export loggedInUser={loggedInUser} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
              )}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;