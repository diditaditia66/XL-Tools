// src/pages/dashboard/DashboardRedeem.tsx
import { useEffect, useState } from "react";
import * as api from "../../api/client";

type RedeemItem = {
  name: string;
  subtitle?: string;
  points?: number;
  validUntil?: Date | null;
  actionType?: string;
  actionParam?: string;
  imageUrl?: string;
};

type RedeemCategory = {
  code: string;
  name: string;
  headerDesc?: string;
  items: RedeemItem[];
};

export function DashboardRedeem() {
  const [categories, setCategories] = useState<RedeemCategory[]>([]);
  const [raw, setRaw] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await api.getRedeem();

        setRaw(data);

        // Bentuk umum respons: { code, status, data: { categories: [...] } }
        const cats = (data?.data?.categories ||
          data?.categories ||
          []) as any[];

        const mapped: RedeemCategory[] = cats.map((cat: any, idx: number) => {
          const items: RedeemItem[] = (cat.redeemables || []).map(
            (r: any): RedeemItem => {
              const ts = r.valid_until ?? r.validUntil ?? null;
              const valid =
                typeof ts === "number" && ts > 0
                  ? new Date(ts * 1000)
                  : null;
              return {
                name: r.name || r.title || "(Tanpa nama)",
                subtitle: r.subtitle || r.caption || "",
                points:
                  r.required_point ??
                  r.required_points ??
                  r.point ??
                  undefined,
                validUntil: valid,
                actionType: r.action_type || r.actionType,
                actionParam: r.action_param || r.actionParam,
                imageUrl:
                  r.image_url ||
                  r.image ||
                  r.icon_url ||
                  r.thumbnail_url,
              };
            }
          );

          return {
            code: cat.category_code || cat.code || `CAT_${idx}`,
            name: cat.category_name || cat.name || "Kategori",
            headerDesc: cat.header_desc || cat.description || "",
            items,
          };
        });

        setCategories(mapped);
      } catch (e: any) {
        setErrorMsg(e.message || "Gagal mengambil data redeemables.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="list-container">
      <div className="card">
        <h3>Redeemables</h3>
        <p
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: "0.6rem",
          }}
        >
          Daftar reward / benefit yang bisa kamu redeem dari akun ini.
        </p>

        {errorMsg && (
          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.9,
              color: "#fecaca",
              marginBottom: "0.5rem",
            }}
          >
            {errorMsg}
          </p>
        )}

        {!errorMsg && categories.length === 0 && (
          <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
            Belum ada item redeemable yang tersedia saat ini.
          </p>
        )}

        {/* Daftar kategori */}
        {categories.map((cat) => (
          <div
            key={cat.code}
            className="card"
            style={{
              marginTop: "0.75rem",
              background: "rgba(15,23,42,0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                alignItems: "center",
                marginBottom: "0.4rem",
              }}
            >
              <div>
                <h4>{cat.name}</h4>
                {cat.headerDesc && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      opacity: 0.8,
                      marginTop: 2,
                    }}
                  >
                    {cat.headerDesc}
                  </p>
                )}
              </div>
              <span
                style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.5)",
                  fontSize: "0.75rem",
                  opacity: 0.85,
                  whiteSpace: "nowrap",
                }}
              >
                {cat.items.length} item
              </span>
            </div>

            {cat.items.length === 0 && (
              <p
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.8,
                  marginTop: "0.25rem",
                }}
              >
                Tidak ada item yang bisa di‑redeem di kategori ini.
              </p>
            )}

            {cat.items.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                {cat.items.map((item, idx) => (
                  <div
                    key={`${cat.code}_${idx}`}
                    style={{
                      padding: "0.7rem 0.8rem",
                      borderRadius: "0.75rem",
                      border:
                        "1px solid rgba(30,64,175,0.5)",
                      background:
                        "radial-gradient(circle at top left, rgba(59,130,246,0.22), rgba(15,23,42,0.95))",
                      fontSize: "0.8rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.9rem",
                        marginBottom: 2,
                      }}
                    >
                      {item.name}
                    </p>
                    {item.subtitle && (
                      <p
                        style={{
                          opacity: 0.85,
                          marginBottom: 4,
                        }}
                      >
                        {item.subtitle}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginTop: 4,
                        marginBottom: 4,
                      }}
                    >
                      {item.points !== undefined && (
                        <span
                          style={{
                            padding:
                              "0.15rem 0.45rem",
                            borderRadius: "999px",
                            border:
                              "1px solid rgba(250,204,21,0.6)",
                            fontSize: "0.75rem",
                          }}
                        >
                          Poin: {item.points}
                        </span>
                      )}
                      {item.actionType && (
                        <span
                          style={{
                            padding:
                              "0.15rem 0.45rem",
                            borderRadius: "999px",
                            border:
                              "1px solid rgba(148,163,184,0.5)",
                            fontSize: "0.75rem",
                          }}
                        >
                          Action: {item.actionType}
                        </span>
                      )}
                    </div>

                    {item.validUntil && (
                      <p
                        style={{
                          opacity: 0.8,
                          marginTop: 2,
                        }}
                      >
                        Berlaku sampai:{" "}
                        {item.validUntil.toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    )}

                    {item.actionParam && (
                      <p
                        style={{
                          opacity: 0.75,
                          marginTop: 2,
                          wordBreak: "break-all",
                        }}
                      >
                        Param:{" "}
                        <code>{item.actionParam}</code>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* JSON mentah opsional untuk debug */}
        {raw && (
          <details style={{ marginTop: "0.9rem" }}>
            <summary
              style={{
                fontSize: "0.8rem",
                opacity: 0.8,
                cursor: "pointer",
              }}
            >
              Lihat JSON mentah (debug)
            </summary>
            <pre
              className="pre-block"
              style={{ marginTop: "0.5rem" }}
            >
              {JSON.stringify(raw, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
