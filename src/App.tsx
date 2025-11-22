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
            <p className="app-subtitle">
              Internal dashboard untuk akun XL pribadi
            </p>
          </div>
        </div>
        {activeUser && (
          <div className="app-header-right">
            <div className="user-pill">
              <span className="user-label">Nomor aktif</span>
              <span className="user-number">{activeUser.number}</span>
              {activeUser.subscription_type && (
                <span className="user-type">
                  {activeUser.subscription_type}
                </span>
              )}
            </div>
            <button className="ghost-button" onClick={handleLogout}>
              Keluar
            </button>
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

      <footer className="app-footer">
        <span>⚠️ Hanya untuk penggunaan pribadi. Jangan dibagikan ke umum.</span>
      </footer>
    </div>
  );
}

export default App;
