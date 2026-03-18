import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import CustomerOrders from "./pages/CustomerOrders";
import Dashboard from "./pages/Dashboard";
import DashboardConfig from "./pages/DashboardConfig";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">🚀 Custom Dashboard Builder</div>
          <nav className="nav-links">
            <Link to="/orders">Customer Orders</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/dashboard-config">Configure Dashboard</Link>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<CustomerOrders />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-config" element={<DashboardConfig />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
