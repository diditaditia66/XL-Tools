// src/pages/dashboard/DashboardNotif.tsx
import { useEffect, useState } from "react";
import * as api from "../../api/client";

type XlNotification = {
  notification_id?: string;
  brief_message?: string;
  full_message?: string;
  title?: string;
  message?: string;
  is_read?: boolean;
  timestamp?: string;
  category?: string;
};

const READ_IDS_KEY = "xl_read_notification_ids";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // abaikan kalau storage penuh / tidak ada akses
  }
}

export function DashboardNotif() {
  const [content, setContent] = useState<any>(null);
  const [notifList, setNotifList] = useState<XlNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const extractList = (data: any): XlNotification[] => {
    // Struktur real: { code, status, data: { inbox: [...] } }
    let raw: any = data?.data?.inbox;

    // fallback kalau nanti struktur bergeser
    if (!Array.isArray(raw) && Array.isArray(data?.data?.notification?.data)) {
      raw = data.data.notification.data;
    }
    if (!Array.isArray(raw) && Array.isArray(data?.notifications)) {
      raw = data.notifications;
    }
    if (!Array.isArray(raw) && Array.isArray(data?.data)) {
      raw = data.data;
    }
    if (!Array.isArray(raw) && Array.isArray(data)) {
      raw = data;
    }

    return Array.isArray(raw) ? (raw as XlNotification[]) : [];
  };

  const applyReadOverride = (base: XlNotification[]): XlNotification[] => {
    const readIds = loadReadIds();
    return base.map((n) => {
      const id = n.notification_id || "";
      if (id && readIds.has(id)) {
        return { ...n, is_read: true };
      }
      return n;
    });
  };

  const load = async () => {
    setLoading(true);
    setErrorMsg(null);
    setActionMsg(null);
    try {
      const data = await api.getNotif();
      setContent(data);
      const baseList = extractList(data);
      const withOverride = applyReadOverride(baseList);
      setNotifList(withOverride);
      console.log("RAW NOTIF RESPONSE", data);
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal mengambil notifikasi.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  const totalCount = notifList.length;
  const unreadCount = notifList.filter((n) => !n.is_read).length;

  const handleMarkAll = async () => {
    if (!unreadCount) return;

    try {
      setMarking(true);
      setActionMsg(null);

      // Panggil endpoint backend kalau memang melakukan sesuatu
      try {
        await api.markAllNotifRead();
      } catch (err) {
        console.warn("markAllNotifRead gagal / tidak mengubah data", err);
      }

      // Di sisi frontend, simpan semua ID sebagai sudah dibaca
      const readIds = loadReadIds();
      notifList.forEach((n) => {
        if (!n.is_read && n.notification_id) {
          readIds.add(n.notification_id);
        }
      });
      saveReadIds(readIds);

      // Update tampilan lokal supaya langsung berubah
      setNotifList((prev) =>
        prev.map((n) =>
          !n.is_read && n.notification_id && readIds.has(n.notification_id)
            ? { ...n, is_read: true }
            : n
        )
      );

      setActionMsg(`Ditandai dibaca: ${unreadCount} notifikasi.`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="list-container">
      {/* Header & ringkasan */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div>
            <h3>Notifikasi</h3>
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
              Ringkasan notifikasi dari dashboard MyXL, mengikuti logika CLI.
            </p>
            <p style={{ fontSize: "0.8rem", opacity: 0.8, marginTop: 4 }}>
              Total: {totalCount} · Belum dibaca: {unreadCount}
            </p>
            {errorMsg && (
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.9,
                  color: "#fecaca",
                  marginTop: 4,
                }}
              >
                {errorMsg}
              </p>
            )}
            {actionMsg && !errorMsg && (
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.9,
                  marginTop: 4,
                }}
              >
                {actionMsg}
              </p>
            )}
          </div>
          <button
            onClick={handleMarkAll}
            disabled={marking || !unreadCount}
          >
            {marking ? "Memproses..." : "Tandai Semua Dibaca"}
          </button>
        </div>
      </div>

      {/* Kalau tidak ada notif */}
      {!errorMsg && !notifList.length && (
        <div className="card">
          <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
            Tidak ada notifikasi yang tersedia saat ini.
          </p>
        </div>
      )}

      {/* Daftar notifikasi */}
      {notifList.map((n, idx) => {
        const isRead = !!n.is_read;
        const status = isRead ? "READ" : "UNREAD";
        const statusColor = isRead ? "#4ade80" : "#f97373";
        const timeStr = n.timestamp
          ? new Date(n.timestamp).toLocaleString("id-ID")
          : "-";
        const title = n.brief_message || n.title || "(Tanpa judul)";
        const body = n.full_message || n.message || "";
        const category = n.category || "others";

        return (
          <div key={idx} className="card list-item">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <h4 style={{ margin: 0 }}>
                {idx + 1}. [{status}] {title}
              </h4>
              <span
                style={{
                  padding: "0.15rem 0.55rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  fontSize: "0.75rem",
                  color: statusColor,
                }}
              >
                {status}
              </span>
            </div>

            {body && (
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.8,
                  marginBottom: 4,
                }}
              >
                {body}
              </p>
            )}

            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.8,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span>Time: {timeStr}</span>
              {category && <span>Category: {category}</span>}
              {n.notification_id && (
                <span>ID: {n.notification_id}</span>
              )}
            </div>
          </div>
        );
      })}

      {/* JSON mentah untuk debug */}
      {content && (
        <details style={{ marginTop: "0.75rem" }}>
          <summary
            style={{
              fontSize: "0.8rem",
              opacity: 0.8,
              cursor: "pointer",
            }}
          >
            Lihat JSON mentah (debug)
          </summary>
          <pre className="pre-block" style={{ marginTop: "0.4rem" }}>
            {JSON.stringify(content, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
