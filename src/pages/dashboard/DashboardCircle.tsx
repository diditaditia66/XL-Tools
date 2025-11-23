// src/pages/dashboard/DashboardCircle.tsx
import { useEffect, useState } from "react";
import * as api from "../../api/client";

export function DashboardCircle() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getCircle();
        setContent(data);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  const circle = (content || {}) as any;
  const data = circle?.data || {};

  const groupStatus = data.group_status || "UNKNOWN";
  const isActive = groupStatus === "ACTIVE";
  const hasCircle = !!data.group_id;
  const role = data.is_owner ? "Owner" : "Member";

  const invitationExpiredAt = data.invitation_expired_at || 0; // unix ts, kalau ada
  const invitationInfo =
    invitationExpiredAt > 0
      ? new Date(invitationExpiredAt * 1000).toLocaleString("id-ID")
      : null;

  const copyToClipboard = (text: string) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      alert("Disalin ke clipboard.");
    } else {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      alert("Disalin ke clipboard.");
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <h3>Circle</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Ringkasan status Circle dan peran kamu di dalamnya.
          </p>
        </div>
        <span
          style={{
            padding: "0.2rem 0.6rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 500,
            border: "1px solid rgba(148,163,184,0.5)",
            background: isActive
              ? "rgba(22,163,74,0.15)"
              : "rgba(220,38,38,0.15)",
            color: isActive ? "#4ade80" : "#fca5a5",
            whiteSpace: "nowrap",
          }}
        >
          {groupStatus}
        </span>
      </div>

      {!hasCircle && (
        <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
          Kamu belum tergabung di Circle mana pun, atau data Circle tidak
          tersedia dari server.
        </p>
      )}

      {hasCircle && (
        <>
          {/* Ringkasan utama */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.5fr)",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.75rem 0.9rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(30,64,175,0.6)",
                background:
                  "radial-gradient(circle at top left, rgba(59,130,246,0.25), rgba(15,23,42,0.95))",
              }}
            >
              <h4 style={{ marginBottom: "0.35rem" }}>
                {data.group_name || "(Tanpa nama)"}
              </h4>
              <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                Owner: {data.owner_name || "-"}
              </p>
              <p style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: 4 }}>
                Peran kamu: <strong>{role}</strong>
              </p>
              {invitationInfo && (
                <p style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: 4 }}>
                  Undangan berlaku sampai: {invitationInfo}
                </p>
              )}
            </div>

            <div
              style={{
                padding: "0.75rem 0.9rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(30,64,175,0.4)",
                background: "rgba(15,23,42,0.9)",
                fontSize: "0.8rem",
              }}
            >
              <p style={{ opacity: 0.75, marginBottom: 4 }}>Group ID</p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <code
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {data.group_id}
                </code>
                <button
                  onClick={() => copyToClipboard(data.group_id)}
                  style={{ fontSize: "0.7rem" }}
                >
                  Copy
                </button>
              </div>

              <p style={{ opacity: 0.75, marginBottom: 4 }}>Member ID</p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <code
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {data.member_id}
                </code>
                <button
                  onClick={() => copyToClipboard(data.member_id)}
                  style={{ fontSize: "0.7rem" }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Info tambahan */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              fontSize: "0.8rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              Group status: {groupStatus}
            </div>
            <div
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "999px",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              Kamu: {role}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
