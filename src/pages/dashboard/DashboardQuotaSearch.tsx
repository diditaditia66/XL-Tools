// src/pages/dashboard/DashboardQuotaSearch.tsx
import { useEffect, useMemo, useState } from "react";
import * as api from "../../api/client";

type StoreItem = {
  title: string;
  family_name?: string;
  validity?: string;
  price: number;
  option_code: string; // quota code / package option code
  raw: any;
  source: "STORE" | "FAMILY";
};

export function DashboardQuotaSearch() {
  const [allPkgs, setAllPkgs] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<StoreItem | null>(null);

  const [famCode, setFamCode] = useState("");
  const [loadedFamilies, setLoadedFamilies] = useState<string[]>([]);

  // ---- Load awal dari XL Store (/store/packages) ----
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = (await api.getStorePkgs()) as any;
        // Struktur respons: res.data.results_price_only
        const raw =
          res?.data?.results_price_only ||
          res?.data?.results ||
          [];

        const list: StoreItem[] = (raw as any[]).map((p: any) => {
          const original = p.original_price || 0;
          const disc = p.discounted_price || 0;
          const price = disc > 0 ? disc : original;

          return {
            title: p.title,
            family_name: p.family_name,
            validity: p.validity,
            price,
            option_code: p.action_param, // quota code / package option code
            raw: p,
            source: "STORE",
          };
        });

        setAllPkgs(list);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };

    load();
  }, []);

  // ---- Tambah referensi dari family_code (/search/family-quotas) ----
  const handleAddFamily = async () => {
    const code = famCode.trim();
    if (!code) return;
    if (loadedFamilies.includes(code)) {
      alert("Family code ini sudah dimuat.");
      return;
    }

    try {
      setLoading(true);
      const res = (await api.searchFamilyQuotas(code)) as any;

      const items: StoreItem[] = (res.packages || []).map((p: any) => ({
        title: p.title,
        family_name: p.family_name,
        validity: p.validity,
        price: p.price,
        option_code: p.option_code,
        raw: p,
        source: "FAMILY",
      }));

      setAllPkgs((prev) => [...prev, ...items]);
      setLoadedFamilies((prev) => [
        ...prev,
        res.family_code || code,
      ]);
      alert(`Berhasil menambahkan ${items.length} paket dari ${code}.`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- Filter berdasarkan keyword (quota code / nama paket) ----
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return [];
    return allPkgs.filter((p) => {
      const code = p.option_code || "";
      const name = p.title || "";
      return (
        code.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [keyword, allPkgs]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="list-container">
      {/* Panel input utama */}
      <div className="card">
        <h3>Cari Kode Kuota</h3>
        <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Ketik sebagian kode kuota (action_param) atau nama paket, lalu
          klik salah satu hasil untuk melihat detailnya.
        </p>
        <input
          type="text"
          placeholder="Contoh: UON, SSY, XTRA..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setSelected(null);
          }}
          style={{
            marginTop: "0.6rem",
            width: "100%",
            padding: "0.5rem 0.7rem",
            borderRadius: "0.5rem",
            border: "1px solid rgba(148,163,184,0.5)",
            background: "rgba(15,23,42,0.9)",
            color: "inherit",
          }}
        />
        <p style={{ fontSize: "0.8rem", opacity: 0.75 }}>
          Ditemukan {filtered.length} paket.
        </p>

        {/* Input optional untuk tambah referensi dari family code */}
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            Tambah referensi dari Family code (opsional):
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Contoh: FAM_SOCMED_WHATSAPP"
              value={famCode}
              onChange={(e) => setFamCode(e.target.value)}
              style={{
                flex: 1,
                padding: "0.4rem 0.7rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(148,163,184,0.5)",
                background: "rgba(15,23,42,0.9)",
                color: "inherit",
              }}
            />
            <button onClick={handleAddFamily}>Tambah</button>
          </div>
          {loadedFamilies.length > 0 && (
            <p
              style={{
                fontSize: "0.75rem",
                opacity: 0.75,
                marginTop: 4,
              }}
            >
              Family yang sudah dimuat: {loadedFamilies.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Daftar hasil pencarian */}
      {filtered.length > 0 && (
        <div className="card">
          <h4>Hasil</h4>
          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              marginTop: 8,
            }}
          >
            {filtered.map((p, idx) => (
              <div
                key={idx}
                className="list-item"
                style={{
                  padding: "0.35rem 0",
                  borderBottom: "1px solid rgba(31,41,55,0.7)",
                  cursor: "pointer",
                }}
                onClick={() => setSelected(p)}
              >
                <div style={{ fontSize: "0.9rem" }}>{p.title}</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.8,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{p.family_name || "-"}</span>
                  <span>Kode: {p.option_code}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  Sumber:{" "}
                  {p.source === "STORE" ? "XL Store" : "Family code"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {keyword.trim() !== "" && filtered.length === 0 && (
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          Tidak ada paket yang cocok dengan kata kunci tersebut.
        </p>
      )}

      {/* Panel detail paket terpilih */}
      {selected && (
        <div className="card">
          <h4>Detail Paket</h4>
          <p style={{ fontSize: "0.95rem" }}>{selected.title}</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.9 }}>
            Family: {selected.family_name || "-"} · Valid:{" "}
            {selected.validity || "-"}
          </p>
          <p style={{ marginTop: 4 }}>
            Kode kuota:{" "}
            <code>{selected.option_code || "(tidak tersedia)"}</code>
          </p>
          <p>
            Harga: Rp{" "}
            {new Intl.NumberFormat("id-ID").format(selected.price || 0)}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.75,
              marginTop: 6,
            }}
          >
            Sumber data:{" "}
            {selected.source === "STORE"
              ? "XL Store (api/v9/xl-stores/options/search)"
              : "Detail family (/search/family-quotas)"}
          </p>
        </div>
      )}
    </div>
  );
}
