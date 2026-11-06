import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;