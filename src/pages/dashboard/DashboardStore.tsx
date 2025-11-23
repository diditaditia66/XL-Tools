import { useEffect, useState } from "react";
import * as api from "../../api/client";

type Step = 1 | 2 | 3;

type StorePkg = {
  name: string;
  price: number;
  optionCode: string;
  familyName?: string;
  validity?: string;
};

export function DashboardStore() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [families, setFamilies] = useState<any[]>([]);
  const [selectedFamilyCode, setSelectedFamilyCode] = useState<string | null>(
    null
  );
  const [selectedFamilyName, setSelectedFamilyName] = useState<string | null>(
    null
  );

  const [familyPkgs, setFamilyPkgs] = useState<StorePkg[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<StorePkg | null>(null);

  // --- Helper override nominal ---
  const askOverride = (defaultPrice: number): number | undefined => {
    const ans = window.prompt(
      "Nominal override (kosongkan untuk harga normal paket)",
      defaultPrice > 0 ? String(defaultPrice) : ""
    );
    if (!ans || ans.trim() === "") return undefined;
    const n = parseInt(ans, 10);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Nominal tidak valid.");
      return undefined;
    }
    return n;
  };

  // --- Metode pembayaran (reuse dari Input Manual / HOT 1) ---

  const handleBuyBalanceMode = async (
    optionCode: string,
    price: number,
    mode: "normal" | "decoy_v1" | "decoy_v2"
  ) => {
    if (!optionCode) {
      alert("Option code kosong.");
      return;
    }
    const label =
      mode === "normal"
        ? "Pulsa"
        : mode === "decoy_v1"
        ? "Pulsa + Decoy"
        : "Pulsa + Decoy V2";

    if (!window.confirm(`Metode: ${label}\nLanjutkan?`)) return;
    const override = askOverride(price);

    try {
      await api.purchaseBalanceWithMode(optionCode, price, mode, override);
      alert(`Pembelian dengan ${label} berhasil.`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBuyEwallet = async (optionCode: string, price: number) => {
    const method = window
      .prompt("Metode e-wallet (DANA/SHOPEEPAY/GOPAY/OVO):", "DANA")
      ?.toUpperCase() as "DANA" | "SHOPEEPAY" | "GOPAY" | "OVO" | undefined;
    if (!method) return;

    let wallet: string | undefined;
    if (method === "DANA" || method === "OVO") {
      wallet = window.prompt("Nomor e-wallet (08xxxx):") || undefined;
      if (!wallet) return;
    }

    const override = askOverride(price);

    try {
      await api.purchaseWithEwallet(optionCode, method, wallet, price, override);
      alert(`Pembelian via ${method} berhasil.`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBuyQrisMode = async (
    optionCode: string,
    price: number,
    mode: "normal" | "qris" | "qris0"
  ) => {
    const label =
      mode === "normal"
        ? "QRIS"
        : mode === "qris"
        ? "QRIS + Decoy"
        : "QRIS + Decoy V2";

    const override = askOverride(price);

    try {
      const res = await api.purchaseQrisWithMode(
        optionCode,
        price,
        mode,
        override
      );
      if (res.qris_url) {
        window.open(res.qris_url, "_blank");
      } else if (res.qris_code) {
        alert(`QRIS code:\n${res.qris_code}`);
      }
      alert(`Transaksi ${label} dibuat, silakan scan QR.`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBuyRepeat = async (optionCode: string) => {
    const nStr = window.prompt("Beli berapa kali? (Pulsa)", "2");
    if (!nStr) return;
    const n = parseInt(nStr, 10);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Input jumlah tidak valid.");
      return;
    }
    try {
      const res = await api.purchaseRepeatBalance(optionCode, n, 0, false, 0);
      alert(`Selesai.\nBerhasil: ${res.success_count}/${res.times}`);
      console.log(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // --- Step 1: load families ---

  useEffect(() => {
    const loadFamilies = async () => {
      setLoading(true);
      try {
        const data = await api.getFamilies();
        const list = data?.data?.results || [];
        setFamilies(list);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    if (step === 1) {
      loadFamilies();
      setSelectedFamilyCode(null);
      setSelectedFamilyName(null);
      setFamilyPkgs([]);
      setSelectedPkg(null);
    }
  }, [step]);

  // --- Step 2: load packages in family ---

  const loadFamilyPkgs = async (familyCode: string, familyName?: string) => {
    setLoading(true);
    try {
      const res = await api.getFamilyDetail(familyCode);
      const variants = res?.package_variants || [];
      const pkgs: StorePkg[] = [];
      variants.forEach((v: any) => {
        (v.package_options || []).forEach((opt: any) => {
          pkgs.push({
            name: `${v.name} - ${opt.name}`,
            price: opt.price,
            optionCode: opt.package_option_code,
            familyName: res?.family_name || familyName || "",
            validity: opt.validity || v.validity,
          });
        });
      });
      setFamilyPkgs(pkgs);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  // --- Render ---

  if (loading) return <p>Loading...</p>;

  // STEP 1 – pilih family
  if (step === 1) {
    return (
      <div className="list-container">
        <div className="card">
          <h3>Pilih Family Paket</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Langkah 1 dari 3: pilih brand / family terlebih dahulu
          </p>
        </div>
        {families.map((f: any, idx: number) => {
          const code = f.id || f.code;
          const name = f.label || f.name;
          return (
            <div
              key={idx}
              className="card list-item"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedFamilyCode(code);
                setSelectedFamilyName(name);
                loadFamilyPkgs(code, name);
                setStep(2);
              }}
            >
              <h4>{name}</h4>
              <p>Family code: {code}</p>
            </div>
          );
        })}
      </div>
    );
  }

  // STEP 2 – pilih paket di family
  if (step === 2 && selectedFamilyCode) {
    return (
      <div className="list-container">
        <div className="card">
          <h3>Pilih Paket</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Family: {selectedFamilyName} ({selectedFamilyCode}) – langkah 2 dari
            3
          </p>
          <button onClick={() => setStep(1)}>Kembali ke pilih Family</button>
        </div>

        {familyPkgs.map((p, idx) => (
          <div
            key={idx}
            className="card list-item"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedPkg(p);
              setStep(3);
            }}
          >
            <h4>{p.name}</h4>
            <p>
              Family: {p.familyName} | Valid: {p.validity || "-"}
            </p>
            <p>
              Harga: Rp{new Intl.NumberFormat("id-ID").format(p.price || 0)}
            </p>
            <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
              (Klik untuk pilih paket dan lanjut ke metode pembayaran)
            </p>
          </div>
        ))}
        {familyPkgs.length === 0 && (
          <p>Paket untuk family ini belum tersedia.</p>
        )}
      </div>
    );
  }

  // STEP 3 – pilih metode pembayaran
  if (step === 3 && selectedPkg) {
    const p = selectedPkg;
    return (
      <div className="list-container">
        <div className="card">
          <h3>Metode Pembayaran</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Langkah 3 dari 3 – pilih cara bayar untuk paket berikut:
          </p>
        </div>

        <div className="card">
          <h4>{p.name}</h4>
          <p>
            Family: {p.familyName} | Harga: Rp{" "}
            {new Intl.NumberFormat("id-ID").format(p.price || 0)}
          </p>
          <p>Option code: {p.optionCode}</p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 8,
            }}
          >
            <button
              onClick={() =>
                handleBuyBalanceMode(p.optionCode, p.price, "normal")
              }
            >
              Pulsa
            </button>
            <button
              onClick={() =>
                handleBuyBalanceMode(p.optionCode, p.price, "decoy_v1")
              }
            >
              Pulsa + Decoy
            </button>
            <button
              onClick={() =>
                handleBuyBalanceMode(p.optionCode, p.price, "decoy_v2")
              }
            >
              Pulsa + Decoy V2
            </button>
            <button onClick={() => handleBuyEwallet(p.optionCode, p.price)}>
              E-Wallet
            </button>
            <button
              onClick={() => handleBuyQrisMode(p.optionCode, p.price, "normal")}
            >
              QRIS
            </button>
            <button
              onClick={() => handleBuyQrisMode(p.optionCode, p.price, "qris")}
            >
              QRIS + Decoy
            </button>
            <button
              onClick={() => handleBuyQrisMode(p.optionCode, p.price, "qris0")}
            >
              QRIS + Decoy V2
            </button>
            <button onClick={() => handleBuyRepeat(p.optionCode)}>
              Pulsa N kali
            </button>
          </div>

          <button style={{ marginTop: 8 }} onClick={() => setStep(2)}>
            Kembali ke pilih Paket
          </button>
        </div>
      </div>
    );
  }

  // fallback
  return <p>Data tidak tersedia.</p>;
}
