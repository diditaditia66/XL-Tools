// src/pages/dashboard/DashboardManual.tsx
import { useEffect, useState } from "react";
import * as api from "../../api/client";

type ManualMode = "option" | "family" | null;
type ManualStep = 1 | 2 | 3 | 4;

type SelectedManualPkg = {
  optionCode: string;
  price: number;
  name: string;
  order?: number;
};

export function DashboardManual() {
  const [manualMode, setManualMode] = useState<ManualMode>(null);
  const [manualStep, setManualStep] = useState<ManualStep>(1);

  const [manualId, setManualId] = useState("");
  const [manualFamilyCode, setManualFamilyCode] = useState("");
  const [manualFamilyData, setManualFamilyData] = useState<any | null>(null);
  const [selectedManualPkg, setSelectedManualPkg] =
    useState<SelectedManualPkg | null>(null);

  const [loopFamilyCode, setLoopFamilyCode] = useState("");
  const [loopStartOrder, setLoopStartOrder] = useState(1);
  const [loopDelay, setLoopDelay] = useState(0);
  const [looping, setLooping] = useState(false);

  // Reset ketika pertama kali mount
  useEffect(() => {
    setManualMode(null);
    setManualStep(1);
    setManualId("");
    setManualFamilyCode("");
    setManualFamilyData(null);
    setSelectedManualPkg(null);
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
      if (res.qris_url) window.open(res.qris_url, "_blank");
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
    } catch (e: any) {
      alert(e.message);
    }
  };

  const stepTitle =
    manualStep === 1
      ? "Pilih Mode Input"
      : manualStep === 2
      ? manualMode === "option"
        ? "Masukkan Option Code"
        : "Masukkan Family Code"
      : manualStep === 3
      ? manualMode === "family"
        ? "Pilih Paket dari Family Code"
        : "Pilih Metode Pembayaran"
      : "Pilih Metode Pembayaran";

  // --- render ---

  return (
    <div className="list-container">
      <div className="card">
        <h3>{stepTitle}</h3>
      </div>

      {/* STEP 1 */}
      {manualStep === 1 && (
        <div className="card">
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setManualMode("option");
                setManualStep(2);
              }}
            >
              Input Option Code
            </button>
            <button
              onClick={() => {
                setManualMode("family");
                setManualStep(2);
              }}
            >
              Input Family Code
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 - OPTION */}
      {manualStep === 2 && manualMode === "option" && (
        <div className="card">
          <input
            placeholder="Option code (package_option_code)"
            value={manualId}
            onChange={(e) => setManualId(e.target.value.trim())}
            style={{ padding: 10, width: "100%", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setManualStep(1)}>Kembali</button>
            <button
              onClick={() => {
                if (!manualId) {
                  alert("Isi option code terlebih dahulu.");
                  return;
                }
                setSelectedManualPkg({
                  optionCode: manualId,
                  price: 0,
                  name: `Option ${manualId}`,
                });
                setManualStep(3);
              }}
            >
              Lanjut
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 - FAMILY */}
      {manualStep === 2 && manualMode === "family" && (
        <div className="card">
          <input
            placeholder="Family code (mis. FAM_xxx)"
            value={manualFamilyCode}
            onChange={(e) => setManualFamilyCode(e.target.value.trim())}
            style={{ padding: 10, width: "100%", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setManualStep(1)}>Kembali</button>
            <button
              onClick={async () => {
                if (!manualFamilyCode) {
                  alert("Isi family code terlebih dahulu.");
                  return;
                }
                try {
                  const res = await api.getFamilyDetail(manualFamilyCode);
                  setManualFamilyData(res);
                  setSelectedManualPkg(null);
                  setManualStep(3);
                } catch (e: any) {
                  alert(e.message);
                }
              }}
            >
              Load Paket
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 - pilih paket FAMILY */}
      {manualStep === 3 && manualMode === "family" && manualFamilyData && (
        <div className="card">
          {(manualFamilyData.package_variants || []).flatMap(
            (v: any, idx: number) =>
              (v.package_options || []).map((opt: any, j: number) => {
                const optionCode = opt.package_option_code;
                const price = opt.price;
                const name = `${v.name} - ${opt.name}`;
                return (
                  <div
                    key={`${idx}-${j}`}
                    className="card list-item"
                    onClick={() => {
                      setSelectedManualPkg({
                        optionCode,
                        price,
                        name,
                        order: opt.order,
                      });
                      setManualStep(4);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <h4>{name}</h4>
                    <p>
                      Order: {opt.order} | Option code: {optionCode}
                    </p>
                    <p>
                      Rp{new Intl.NumberFormat("id-ID").format(price)}
                    </p>
                  </div>
                );
              })
          )}
          <button style={{ marginTop: 8 }} onClick={() => setManualStep(2)}>
            Kembali ke input Family Code
          </button>
        </div>
      )}

      {/* STEP 3 - METODE utk OPTION */}
      {manualStep === 3 && manualMode === "option" && selectedManualPkg && (
        <div className="card">
          <h4>{selectedManualPkg.name}</h4>
          <p>Option code: {selectedManualPkg.optionCode}</p>
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
                handleBuyBalanceMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "normal"
                )
              }
            >
              Pulsa
            </button>
            <button
              onClick={() =>
                handleBuyBalanceMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "decoy_v1"
                )
              }
            >
              Pulsa + Decoy
            </button>
            <button
              onClick={() =>
                handleBuyBalanceMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "decoy_v2"
                )
              }
            >
              Pulsa + Decoy V2
            </button>
            <button
              onClick={() =>
                handleBuyEwallet(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price
                )
              }
            >
              E-Wallet
            </button>
            <button
              onClick={() =>
                handleBuyQrisMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "normal"
                )
              }
            >
              QRIS
            </button>
            <button
              onClick={() =>
                handleBuyQrisMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "qris"
                )
              }
            >
              QRIS + Decoy
            </button>
            <button
              onClick={() =>
                handleBuyQrisMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "qris0"
                )
              }
            >
              QRIS + Decoy V2
            </button>
            <button
              onClick={() =>
                handleBuyRepeat(
                  selectedManualPkg.optionCode,
                )
              }
            >
              Pulsa N kali
            </button>
          </div>
          <button style={{ marginTop: 8 }} onClick={() => setManualStep(2)}>
            Kembali ke input Option Code
          </button>
        </div>
      )}

      {/* STEP 4 - METODE utk FAMILY */}
      {manualStep === 4 && manualMode === "family" && selectedManualPkg && (
        <div className="card">
          <h4>{selectedManualPkg.name}</h4>
          <p>
            Order: {selectedManualPkg.order} | Option code:{" "}
            {selectedManualPkg.optionCode}
          </p>
          <p>
            Harga default: Rp
            {new Intl.NumberFormat("id-ID").format(selectedManualPkg.price)}
          </p>
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
                handleBuyBalanceMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "normal"
                )
              }
            >
              Pulsa
            </button>
            <button
              onClick={() =>
                handleBuyBalanceMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "decoy_v1"
                )
              }
            >
              Pulsa + Decoy
            </button>
            <button
              onClick={() =>
                handleBuyBalanceMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "decoy_v2"
                )
              }
            >
              Pulsa + Decoy V2
            </button>
            <button
              onClick={() =>
                handleBuyEwallet(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price
                )
              }
            >
              E-Wallet
            </button>
            <button
              onClick={() =>
                handleBuyQrisMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "normal"
                )
              }
            >
              QRIS
            </button>
            <button
              onClick={() =>
                handleBuyQrisMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "qris"
                )
              }
            >
              QRIS + Decoy
            </button>
            <button
              onClick={() =>
                handleBuyQrisMode(
                  selectedManualPkg.optionCode,
                  selectedManualPkg.price,
                  "qris0"
                )
              }
            >
              QRIS + Decoy V2
            </button>
            <button
              onClick={() =>
                handleBuyRepeat(
                  selectedManualPkg.optionCode,
                )
              }
            >
              Pulsa N kali
            </button>
          </div>
          <button style={{ marginTop: 8 }} onClick={() => setManualStep(3)}>
            Kembali ke pilih paket
          </button>
        </div>
      )}

      {/* Looping family – utilitas tambahan, tetap 1 kartu pendek */}
      <div className="card">
        <h3>Looping Semua Paket di Family Code</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Family code</label>
            <input
              placeholder="Family code"
              value={loopFamilyCode}
              onChange={(e) => setLoopFamilyCode(e.target.value.trim())}
            />
          </div>
          <div className="form-group">
            <label>Mulai dari option (order)</label>
            <input
              type="number"
              min={1}
              value={loopStartOrder}
              onChange={(e) =>
                setLoopStartOrder(parseInt(e.target.value || "1", 10))
              }
            />
          </div>
          <div className="form-group">
            <label>Delay antar pembelian (detik)</label>
            <input
              type="number"
              min={0}
              value={loopDelay}
              onChange={(e) =>
                setLoopDelay(parseInt(e.target.value || "0", 10))
              }
            />
          </div>
        </div>
        <button
          onClick={async () => {
            if (!loopFamilyCode) {
              alert("Isi family code terlebih dahulu.");
              return;
            }
            setLooping(true);
            try {
              const res = await api.purchaseFamilyLoop(
                loopFamilyCode,
                loopStartOrder,
                loopDelay
              );
              alert(
                `Selesai.\nBerhasil: ${res.success_count}/${res.total_attempted}`
              );
            } catch (e: any) {
              alert(e.message);
            } finally {
              setLooping(false);
            }
          }}
          disabled={looping}
        >
          {looping ? "Memproses..." : "Mulai Looping"}
        </button>
      </div>
    </div>
  );
}
