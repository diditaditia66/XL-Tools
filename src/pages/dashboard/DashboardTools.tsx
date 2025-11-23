// src/pages/dashboard/DashboardTools.tsx
import { useState } from "react";
import * as api from "../../api/client";

type RegState = {
  msisdn: string;
  nik: string;
  kk: string;
};

type ValInfo = {
  msisdn: string;
  status: string;
  subscriptionType: string;
  isRegistered: boolean;
  hasFamilyPlan: boolean;
  familyPlanRole: string;
  planType: string;
};

export function DashboardTools() {
  const [reg, setReg] = useState<RegState>({
    msisdn: "",
    nik: "",
    kk: "",
  });
  const [valTarget, setValTarget] = useState("");

  const [regResult, setRegResult] = useState<string | null>(null);
  const [valResult, setValResult] = useState<string | null>(null);
  const [regRaw, setRegRaw] = useState<any | null>(null);
  const [valRaw, setValRaw] = useState<any | null>(null);
  const [valInfo, setValInfo] = useState<ValInfo | null>(null);

  const [loadingReg, setLoadingReg] = useState(false);
  const [loadingVal, setLoadingVal] = useState(false);

  const handleRegister = async () => {
    if (!reg.msisdn || !reg.nik || !reg.kk) {
      setRegResult("Mohon lengkapi semua field (MSISDN, NIK, KK).");
      setRegRaw(null);
      return;
    }
    try {
      setLoadingReg(true);
      setRegResult(null);
      setRegRaw(null);

      const res = await api.regCard(reg);
      const d: any = res || {};
      const code = d.code ?? d.status ?? "";
      const status = d.status ?? "";
      const msg =
        d.message ||
        d.data?.message ||
        d.data?.response_message ||
        "Permintaan registrasi terkirim.";
      const extra =
        d.data?.response_code || d.data?.result_code
          ? ` (resp: ${d.data?.response_code || d.data?.result_code})`
          : "";

      setRegResult(
        `Status: ${status || code || "OK"}${extra} · ${msg}`.trim()
      );
      setRegRaw(res);
    } catch (e: any) {
      setRegResult(`Error: ${e.message}`);
      setRegRaw(null);
    } finally {
      setLoadingReg(false);
    }
  };

  const handleValidate = async () => {
    if (!valTarget) {
      setValResult("Mohon isi MSISDN yang akan dicek.");
      setValRaw(null);
      setValInfo(null);
      return;
    }
    try {
      setLoadingVal(true);
      setValResult(null);
      setValRaw(null);
      setValInfo(null);

      const res = await api.valNum(valTarget);
      const d: any = res || {};
      const data = d.data || {};
      const code = d.code ?? d.status ?? "";
      const status = d.status ?? "";
      const msg =
        d.message ||
        data.message ||
        data.msisdn_status ||
        "Validasi nomor berhasil diproses.";
      const extra =
        data.response_code || data.result_code
          ? ` (resp: ${data.response_code || data.result_code})`
          : "";

      setValResult(
        `Status: ${status || code || "OK"}${extra} · ${msg}`.trim()
      );
      setValRaw(res);

      setValInfo({
        msisdn: data.msisdn ?? "",
        status: data.status ?? "",
        subscriptionType: data.subscription_type ?? "",
        isRegistered: !!data.is_registered,
        hasFamilyPlan: !!data.has_family_plan,
        familyPlanRole: data.family_plan_role ?? "",
        planType: data.plan_type ?? "",
      });
    } catch (e: any) {
      setValResult(`Error: ${e.message}`);
      setValRaw(null);
      setValInfo(null);
    } finally {
      setLoadingVal(false);
    }
  };

  return (
    <div className="list-container">
      {/* Register Kartu */}
      <div className="card">
        <h3>Register Kartu (Dukcapil)</h3>
        <p
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: "0.6rem",
          }}
        >
          Input data pelanggan untuk registrasi kartu ke Dukcapil.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) auto",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            placeholder="MSISDN 628xxx"
            value={reg.msisdn}
            onChange={(e) =>
              setReg((prev) => ({
                ...prev,
                msisdn: e.target.value.trim(),
              }))
            }
          />
          <input
            placeholder="NIK"
            value={reg.nik}
            onChange={(e) =>
              setReg((prev) => ({
                ...prev,
                nik: e.target.value.trim(),
              }))
            }
          />
          <input
            placeholder="KK"
            value={reg.kk}
            onChange={(e) =>
              setReg((prev) => ({
                ...prev,
                kk: e.target.value.trim(),
              }))
            }
          />
          <button onClick={handleRegister} disabled={loadingReg}>
            {loadingReg ? "Memproses..." : "Daftar"}
          </button>
        </div>
        <p
          style={{
            fontSize: "0.75rem",
            opacity: 0.7,
            marginTop: "0.5rem",
          }}
        >
          Pastikan format nomor sudah diawali 628 dan data NIK/KK sesuai
          Dukcapil.
        </p>
        {regResult && (
          <p
            style={{
              fontSize: "0.8rem",
              marginTop: "0.4rem",
              opacity: 0.9,
            }}
          >
            {regResult}
          </p>
        )}
        {regRaw && (
          <details style={{ marginTop: "0.4rem" }}>
            <summary
              style={{
                fontSize: "0.8rem",
                opacity: 0.8,
                cursor: "pointer",
              }}
            >
              Lihat detail lengkap (JSON)
            </summary>
            <pre className="pre-block" style={{ marginTop: "0.4rem" }}>
              {JSON.stringify(regRaw, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Validate MSISDN */}
      <div className="card">
        <h3>Validate MSISDN</h3>
        <p
          style={{
            fontSize: "0.85rem",
            opacity: 0.8,
            marginBottom: "0.6rem",
          }}
        >
          Cek status nomor sebelum melakukan proses lain.
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            maxWidth: 500,
          }}
        >
          <input
            placeholder="628xxx"
            value={valTarget}
            onChange={(e) => setValTarget(e.target.value.trim())}
          />
          <button onClick={handleValidate} disabled={loadingVal}>
            {loadingVal ? "Memproses..." : "Cek"}
          </button>
        </div>
        {valResult && (
          <p
            style={{
              fontSize: "0.8rem",
              marginTop: "0.4rem",
              opacity: 0.9,
            }}
          >
            {valResult}
          </p>
        )}

        {/* CARD RINGKASAN HASIL VALIDASI */}
        {valInfo && (
          <div
            style={{
              marginTop: "0.6rem",
              padding: "0.75rem 0.9rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(30,64,175,0.6)",
              background:
                "radial-gradient(circle at top left, rgba(59,130,246,0.25), rgba(15,23,42,0.95))",
              fontSize: "0.8rem",
            }}
          >
            <p style={{ fontSize: "0.85rem", marginBottom: 4 }}>
              MSISDN: <code>{valInfo.msisdn || valTarget}</code>
            </p>
            <p style={{ marginBottom: 2 }}>
              Status: <strong>{valInfo.status || "-"}</strong>
            </p>
            <p style={{ marginBottom: 2 }}>
              Subscription type:{" "}
              <strong>{valInfo.subscriptionType || "-"}</strong>
            </p>
            <p style={{ marginBottom: 2 }}>
              Terdaftar Dukcapil:{" "}
              <strong>{valInfo.isRegistered ? "Ya" : "Tidak"}</strong>
            </p>
            <p style={{ marginBottom: 2 }}>
              Punya Family Plan:{" "}
              <strong>{valInfo.hasFamilyPlan ? "Ya" : "Tidak"}</strong>
            </p>
            <p style={{ marginBottom: 2 }}>
              Role di Family Plan:{" "}
              <strong>{valInfo.familyPlanRole || "-"}</strong>
            </p>
            <p>
              Plan type: <strong>{valInfo.planType || "-"}</strong>
            </p>
          </div>
        )}

        {/* JSON mentah untuk debug opsional */}
        {valRaw && (
          <details style={{ marginTop: "0.6rem" }}>
            <summary
              style={{
                fontSize: "0.8rem",
                opacity: 0.8,
                cursor: "pointer",
              }}
            >
              Lihat detail lengkap (JSON)
            </summary>
            <pre className="pre-block" style={{ marginTop: "0.4rem" }}>
              {JSON.stringify(valRaw, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
