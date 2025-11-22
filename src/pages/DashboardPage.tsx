import { useEffect, useState } from "react";
import type { ActiveUser, SummaryResponse } from "../api/client";
import {
  fetchFamilies,
  fetchSummary,
  fetchSegments,
  fetchPackages,
  fetchRedeemables,
} from "../api/client";

interface DashboardPageProps {
  user: ActiveUser;
  onLogout: () => void;
}

interface FamilyApiResponse {
  code: string;
  status: string;
  data?: {
    results?: any[];
  };
}

type SectionKey =
  | "summary"
  | "segments"
  | "families"
  | "packages"
  | "redeemables";

const webMenuItems: {
  key: SectionKey;
  cliCode: string;
  label: string;
  description: string;
}[] = [
  {
    key: "summary",
    cliCode: "0",
    label: "Ringkasan akun",
    description: "Menampilkan saldo, masa aktif, dan tier loyalty.",
  },
  {
    key: "segments",
    cliCode: "11",
    label: "Store Segments",
    description:
      "Segmen/personalization yang digunakan untuk rekomendasi paket.",
  },
  {
    key: "families",
    cliCode: "12",
    label: "Store Family List",
    description:
      "Daftar keluarga paket yang tersedia untuk nomor aktif.",
  },
  {
    key: "packages",
    cliCode: "13",
    label: "Store Packages",
    description: "Daftar paket lengkap dari store (raw API).",
  },
  {
    key: "redeemables",
    cliCode: "14",
    label: "Redeemables",
    description: "Voucher / poin / benefit yang bisa diredeem.",
  },
];

const cliOnlyItems = [
  "1. Login/Ganti akun (via OTP – di web sudah di-handle di halaman login)",
  "2. Lihat Paket Saya (my packages – belum kita expose ke API web)",
  "3. Beli Paket 🔥 HOT 🔥 (CLI only)",
  "4. Beli Paket 🔥 HOT-2 🔥 (CLI only)",
  "5. Beli Paket berdasarkan Option Code (CLI only)",
  "6. Beli Paket berdasarkan Family Code (CLI only)",
  "7. Beli semua Paket di Family Code (loop – CLI only, risk tinggi)",
  "8. Riwayat Transaksi (belum di-API-kan ke web)",
  "9. Family Plan/Akrab Organizer (CLI only)",
  "10. Circle (CLI only)",
  "R. Register (dukcapil – CLI only)",
  "N. Notifikasi (CLI only)",
  "V. Validate msisdn (CLI only)",
  "00. Bookmark paket (CLI only)",
  "99. Tutup aplikasi (di web = logout / close tab)",
];

export function DashboardPage({ user }: DashboardPageProps) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [families, setFamilies] = useState<FamilyApiResponse | null>(null);
  const [segments, setSegments] = useState<any | null>(null);
  const [packages, setPackages] = useState<any | null>(null);
  const [redeemables, setRedeemables] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("summary");

  const remaining =
    (summary as any)?.balance?.remaining !== undefined
      ? (summary as any).balance.remaining
      : undefined;

  const expiredAt =
    (summary as any)?.balance?.expired_at !== undefined
      ? (summary as any).balance.expired_at
      : undefined;

  const tierName =
    (summary as any)?.tiering?.data?.tier_name ??
    (summary as any)?.tiering?.tier ??
    "Tidak ada";

  const familyCount =
    families?.data?.results && Array.isArray(families.data.results)
      ? families.data.results.length
      : 0;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sum, fam, seg, pkg, red] = await Promise.all([
        fetchSummary(),
        fetchFamilies(),
        fetchSegments(),
        fetchPackages(),
        fetchRedeemables(),
      ]);
      setSummary(sum);
      setFamilies(fam as FamilyApiResponse);
      setSegments(seg);
      setPackages(pkg);
      setRedeemables(red);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <section className="page">
        <div className="page-panel">
          <p>Memuat data akun dan paket…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <div className="page-panel">
          <h2>Dashboard</h2>
          <p className="message error">{error}</p>
          <button onClick={loadData}>Coba lagi</button>
        </div>
      </section>
    );
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case "summary":
        return (
          <>
            <section className="section-card">
              <div className="section-header">
                <h3>Detail balance (raw)</h3>
              </div>
              <pre className="pre-block">
                {JSON.stringify(summary?.balance ?? {}, null, 2)}
              </pre>
            </section>

            <section className="section-card">
              <div className="section-header">
                <h3>Tiering (raw)</h3>
              </div>
              <pre className="pre-block">
                {JSON.stringify(summary?.tiering ?? {}, null, 2)}
              </pre>
            </section>
          </>
        );
      case "segments":
        return (
          <section className="section-card section-wide">
            <div className="section-header">
              <h3>Store Segments (raw)</h3>
            </div>
            <pre className="pre-block">
              {JSON.stringify(segments ?? {}, null, 2)}
            </pre>
          </section>
        );
      case "families":
        return (
          <section className="section-card section-wide">
            <div className="section-header">
              <h3>Store Family List (raw)</h3>
            </div>
            <pre className="pre-block">
              {JSON.stringify(families ?? {}, null, 2)}
            </pre>
          </section>
        );
      case "packages":
        return (
          <section className="section-card section-wide">
            <div className="section-header">
              <h3>Store Packages (raw)</h3>
            </div>
            <pre className="pre-block">
              {JSON.stringify(packages ?? {}, null, 2)}
            </pre>
          </section>
        );
      case "redeemables":
        return (
          <section className="section-card section-wide">
            <div className="section-header">
              <h3>Redeemables (raw)</h3>
            </div>
            <pre className="pre-block">
              {JSON.stringify(redeemables ?? {}, null, 2)}
            </pre>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <section className="page">
      <div className="page-panel">
        <div className="panel-header">
          <div>
            <h2>Dashboard</h2>
            <p className="page-description">
              Ringkasan cepat dan akses ke menu utama versi web, yang
              kurang-lebih merepresentasikan menu di CLI.
            </p>
          </div>
          <button className="ghost-button" onClick={loadData}>
            Refresh
          </button>
        </div>

        {/* Stat cards atas */}
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Sisa kuota / pulsa</span>
            <span className="stat-value">
              {remaining !== undefined ? remaining : "-"}
            </span>
            <span className="stat-caption">
              expired_at: {expiredAt !== undefined ? expiredAt : "-"}
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Tipe langganan</span>
            <span className="stat-value">
              {user.subscription_type || "Tidak diketahui"}
            </span>
            <span className="stat-caption">
              Nomor: <span className="mono">{user.number}</span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Tier loyalty</span>
            <span className="stat-value">{tierName}</span>
            <span className="stat-caption">
              Sumber: <span className="mono">get_tiering_info</span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total family paket</span>
            <span className="stat-value">{familyCount}</span>
            <span className="stat-caption">
              Status API: {families?.status || "-"}
            </span>
          </div>
        </div>

        {/* Menu utama (mapping dari menu CLI) */}
        <div className="section-card section-wide" style={{ marginBottom: "1rem" }}>
          <div className="section-header">
            <div>
              <h3>Menu utama (versi web)</h3>
              <p className="section-subtitle">
                Kode di kiri adalah kode menu di CLI. Klik salah satu kartu
                untuk menampilkan datanya.
              </p>
            </div>
          </div>

          <div className="menu-grid">
            {webMenuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`menu-card ${
                  activeSection === item.key ? "menu-card-active" : ""
                }`}
                onClick={() => setActiveSection(item.key)}
              >
                <span className="menu-code">[{item.cliCode}]</span>
                <span className="menu-label">{item.label}</span>
                <span className="menu-desc">{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Konten sesuai menu yang dipilih */}
        <div className="section-grid section-grid-single">
          {renderSectionContent()}
        </div>

        {/* Menu lain yang hanya ada di CLI */}
        <div className="section-card section-wide" style={{ marginTop: "1rem" }}>
          <div className="section-header">
            <div>
              <h3>Menu lain (hanya tersedia di CLI)</h3>
              <p className="section-subtitle">
                Daftar ini diambil dari repo asli. Beberapa menu sengaja tidak
                dihadirkan di web demi keamanan & menghindari penyalahgunaan
                (misalnya pembelian massal otomatis).
              </p>
            </div>
          </div>
          <ul className="cli-list">
            {cliOnlyItems.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
