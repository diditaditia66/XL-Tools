import { useEffect, useState } from "react";
import * as api from "../../api/client";
import type { ActiveUser, SummaryResponse } from "../../api/client";

interface Props {
  user: ActiveUser;
}

export function DashboardHome({ user }: Props) {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getSummary();
        setData(res);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !data) {
    return <p>Loading...</p>;
  }

  const balance = data.balance || {};
  const tier = data.tiering || {};
  const profile = data.profile || {};

  const balanceValue = balance.remaining || 0;

  // Format masa aktif: kalau angka / string angka → anggap epoch detik
  const rawExpiry = balance.expired_at as any;
  let expiryText = "-";
  if (rawExpiry) {
    if (typeof rawExpiry === "number") {
      expiryText = new Date(rawExpiry * 1000).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else if (typeof rawExpiry === "string" && /^\d+$/.test(rawExpiry)) {
      const ts = parseInt(rawExpiry, 10);
      expiryText = new Date(ts * 1000).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else if (typeof rawExpiry === "string") {
      expiryText = rawExpiry;
    }
  }

  const formatRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <div className="home-root">
      {/* Header ringkas: pakai judul lain supaya tidak ganda dengan h2 "Beranda" di atas */}
      <div className="home-header">
        <div>
          <p className="home-subtitle">Ringkasan nomor aktif dan profil Anda</p>
        </div>
        <div className="home-number-pill">
          <span>{user.number}</span>
          <span className="home-number-type">
            {user.subscription_type || "PREPAID"}
          </span>
        </div>
      </div>

      {/* Saldo utama */}
      <div className="home-balance-card">
        <div>
          <p className="home-balance-label">Sisa Pulsa</p>
          <p className="home-balance-value">{formatRupiah(balanceValue)}</p>
        </div>
        <div className="home-balance-meta">
          <span>Masa aktif</span>
          <span>{expiryText}</span>
        </div>
      </div>

      {/* Statistik singkat */}
      <div className="home-stat-grid">
        <div className="home-stat-card">
          <p className="home-stat-label">Nomor</p>
          <p className="home-stat-value">{user.number}</p>
        </div>
        <div className="home-stat-card">
          <p className="home-stat-label">Tipe Kartu</p>
          <p className="home-stat-value">{user.subscription_type || "-"}</p>
        </div>
        <div className="home-stat-card">
          <p className="home-stat-label">Point / Tier</p>
          <p className="home-stat-value">
            {tier.current_point != null ? tier.current_point : "-"}
          </p>
          <p className="home-stat-extra">
            {tier.tier ? `Tier: ${tier.tier}` : ""}
          </p>
        </div>
      </div>

      {/* Profil ringkas – TANPA JSON mentah */}
      <div className="card home-profile-card">
        <div className="home-profile-header">
          <div>
            <h3>Profil Pelanggan</h3>
            <p className="home-profile-subtitle">
              Data utama sesuai informasi XL
            </p>
          </div>
        </div>

        <div className="home-profile-grid">
          <div className="home-profile-row">
            <span className="home-profile-label">Nama</span>
            <span className="home-profile-value">
              {profile.name || "-"}
            </span>
          </div>
          <div className="home-profile-row">
            <span className="home-profile-label">MSISDN</span>
            <span className="home-profile-value">
              {profile.msisdn || user.number}
            </span>
          </div>
          <div className="home-profile-row">
            <span className="home-profile-label">Tipe Langganan</span>
            <span className="home-profile-value">
              {profile.subscription_type || user.subscription_type || "-"}
            </span>
          </div>
          <div className="home-profile-row">
            <span className="home-profile-label">Email</span>
            <span className="home-profile-value">
              {profile.login_email || profile.email || "-"}
            </span>
          </div>
          <div className="home-profile-row">
            <span className="home-profile-label">Alamat</span>
            <span className="home-profile-value">
              {profile.registered_address || "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
