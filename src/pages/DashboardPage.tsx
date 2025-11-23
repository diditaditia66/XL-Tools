import { useState } from "react";
import type { ActiveUser } from "../api/client";

import { DashboardHome } from "./dashboard/DashboardHome";
import { DashboardMyPackages } from "./dashboard/DashboardMyPackages";
import { DashboardHot1 } from "./dashboard/DashboardHot1";
import { DashboardHot2 } from "./dashboard/DashboardHot2";
import { DashboardStore } from "./dashboard/DashboardStore";
import { DashboardManual } from "./dashboard/DashboardManual";
import { DashboardHistory } from "./dashboard/DashboardHistory";
import { DashboardAkrab } from "./dashboard/DashboardAkrab";
import { DashboardCircle } from "./dashboard/DashboardCircle";
import { DashboardTools } from "./dashboard/DashboardTools";
import { DashboardRedeem } from "./dashboard/DashboardRedeem";
import { DashboardNotif } from "./dashboard/DashboardNotif";
import { DashboardQuotaSearch } from "./dashboard/DashboardQuotaSearch";


const MENUS = [
  { k: "home", l: "Beranda" },
  { k: "mypkg", l: "Paket Saya" },
  { k: "hot1", l: "HOT 1" },
  { k: "hot2", l: "HOT 2" },
  { k: "store", l: "Semua Paket" },
  { k: "manual", l: "Input Manual" },
  { k: "hist", l: "Riwayat" },
  { k: "qsearch", l: "Cari Kode Kuota" },
  { k: "akrab", l: "Akrab" },
  { k: "circ", l: "Circle" },
  { k: "tools", l: "Tools" },
  { k: "redeem", l: "Redeem" },
  { k: "notif", l: "Notifikasi" },
];

interface DashboardProps {
  user: ActiveUser;
  onLogout: () => void;
}

export function DashboardPage({ user, onLogout }: DashboardProps) {
  const [tab, setTab] = useState<string>("home");

  const renderTab = () => {
    switch (tab) {
      case "home":
        return <DashboardHome user={user} />;
      case "mypkg":
        return <DashboardMyPackages />;
      case "hot1":
        return <DashboardHot1 />;
      case "hot2":
        return <DashboardHot2 />;
      case "store":
        return <DashboardStore />;
      case "manual":
        return <DashboardManual />;
      case "hist":
        return <DashboardHistory />;
      case "akrab":
        return <DashboardAkrab />;
      case "qsearch":
        return <DashboardQuotaSearch />;
      case "circ":
        return <DashboardCircle />;
      case "tools":
        return <DashboardTools />;
      case "redeem":
        return <DashboardRedeem />;
      case "notif":
        return <DashboardNotif />;
      default:
        return null;
    }
  };

  return (
    <section className="page dashboard">
      <div className="sidebar">
        {MENUS.map((m) => (
          <button
            key={m.k}
            className={`menu-item ${tab === m.k ? "active" : ""}`}
            onClick={() => setTab(m.k)}
          >
            {m.l}
          </button>
        ))}
        <div className="spacer" />
        <button className="menu-item logout" onClick={onLogout}>
          Keluar
        </button>
      </div>
      <div className="content-area">
        <div className="content-header">
          <h2>{MENUS.find((m) => m.k === tab)?.l}</h2>
        </div>
        {renderTab()}
      </div>
    </section>
  );
}
