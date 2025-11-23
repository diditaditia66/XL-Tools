import { useState } from "react";
import "./App.css";
import type { ActiveUser } from "./api/client";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);

  const handleLogout = () => {
    setActiveUser(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <div className="logo-dot" />
          <div>
            <h1 className="app-title">XL Tools Web</h1>
          </div>
        </div>
        {activeUser && (
          <div className="app-header-right">
            <span className="user-pill">
              {activeUser.number}
            </span>
          </div>
        )}
      </header>

      <main className="app-main">
        {!activeUser ? (
          <LoginPage onLoggedIn={setActiveUser} />
        ) : (
          <DashboardPage user={activeUser} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

export default App;
