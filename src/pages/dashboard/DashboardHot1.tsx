// src/pages/dashboard/DashboardHot1.tsx
import { useEffect, useState } from "react";
import * as api from "../../api/client";

export function DashboardHot1() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getHot1();
        setList(Array.isArray(data) ? data : []);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="list-container">
      {list.map((i: any, x: number) => {
        const price = i.price ?? 0;
        const optionCode = i.option_code;
        return (
          <div key={x} className="card list-item">
            <h4>
              {i.family_name} - {i.variant_name} - {i.option_name}
            </h4>
            <p>
              Family code: {i.family_code} | Order: {i.order} | Enterprise:{" "}
              {String(i.is_enterprise)}
            </p>
            <p>Harga: Rp{price}</p>
            {optionCode ? (
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
                    handleBuyBalanceMode(optionCode, price, "normal")
                  }
                >
                  Pulsa
                </button>
                <button
                  onClick={() =>
                    handleBuyBalanceMode(optionCode, price, "decoy_v1")
                  }
                >
                  Pulsa + Decoy
                </button>
                <button
                  onClick={() =>
                    handleBuyBalanceMode(optionCode, price, "decoy_v2")
                  }
                >
                  Pulsa + Decoy V2
                </button>
                <button onClick={() => handleBuyEwallet(optionCode, price)}>
                  E-Wallet
                </button>
                <button
                  onClick={() => handleBuyQrisMode(optionCode, price, "normal")}
                >
                  QRIS
                </button>
                <button
                  onClick={() => handleBuyQrisMode(optionCode, price, "qris")}
                >
                  QRIS + Decoy
                </button>
                <button
                  onClick={() => handleBuyQrisMode(optionCode, price, "qris0")}
                >
                  QRIS + Decoy V2
                </button>
                <button onClick={() => handleBuyRepeat(optionCode)}>
                  Pulsa N kali
                </button>
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Option code belum berhasil di-resolve dari backend.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
