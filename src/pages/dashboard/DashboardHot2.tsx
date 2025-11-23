// src/pages/dashboard/DashboardHot2.tsx
import { useEffect, useState } from "react";
import * as api from "../../api/client";

type EwalletMethod = "DANA" | "SHOPEEPAY" | "GOPAY" | "OVO";

export function DashboardHot2() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ewalletPickerFor, setEwalletPickerFor] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getHot2();
        setList(Array.isArray(data) ? data : []);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleBuyBalance = async (index: number) => {
    if (!window.confirm("Beli bundle ini dengan Balance/Pulsa?")) return;
    try {
      const res = await api.purchaseHot2(index, "BALANCE");
      alert("Pembelian HOT 2 via Balance diproses.");
      console.log(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBuyQris = async (index: number) => {
    if (!window.confirm("Beli bundle ini dengan QRIS?")) return;
    try {
      const res = await api.purchaseHot2(index, "QRIS");
      if (res?.result?.qris_url) {
        window.open(res.result.qris_url, "_blank");
      } else if (res?.result?.qris_code) {
        alert(`QRIS code:\n${res.result.qris_code}`);
      }
      alert("Pembelian HOT 2 via QRIS diproses.");
      console.log(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleChooseEwallet = async (index: number, method: EwalletMethod) => {
    let wallet: string | undefined;

    if (method === "DANA" || method === "OVO") {
      wallet = window.prompt("Nomor e-wallet (08xxxx):") || undefined;
      if (!wallet) return;
    }

    if (
      !window.confirm(
        `Beli bundle ini dengan ${method}` +
          (wallet ? `\nNomor: ${wallet}` : "") +
          " ?"
      )
    ) {
      return;
    }

    try {
      const res = await api.purchaseHot2Ewallet(index, method, wallet);
      alert(`Pembelian HOT 2 via ${method} diproses.`);
      console.log(res);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEwalletPickerFor(null);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="list-container">
      {list.map((i: any, x: number) => (
        <div key={x} className="card list-item">
          <h4>{i.name}</h4>
          <p>{i.detail}</p>
          <p>Harga total: Rp{i.price}</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => handleBuyBalance(x)}>
              Balance / Pulsa
            </button>

            <button
              onClick={() =>
                setEwalletPickerFor((prev) => (prev === x ? null : x))
              }
            >
              E-Wallet
            </button>

            <button onClick={() => handleBuyQris(x)}>QRIS</button>
          </div>

          {ewalletPickerFor === x && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                fontSize: "0.85rem",
              }}
            >
              <span>Pilih provider:</span>
              <button onClick={() => handleChooseEwallet(x, "DANA")}>
                DANA
              </button>
              <button onClick={() => handleChooseEwallet(x, "SHOPEEPAY")}>
                ShopeePay
              </button>
              <button onClick={() => handleChooseEwallet(x, "GOPAY")}>
                GoPay
              </button>
              <button onClick={() => handleChooseEwallet(x, "OVO")}>OVO</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
