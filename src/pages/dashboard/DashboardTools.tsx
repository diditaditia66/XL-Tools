import { useState } from "react";
import * as api from "../../api/client";

export function DashboardTools() {
  const [reg, setReg] = useState({ msisdn: "", nik: "", kk: "" });
  const [valTarget, setValTarget] = useState("");

  return (
    <div className="list-container">
      <div className="card">
        <h3>Register Kartu (Dukcapil)</h3>
        <input
          placeholder="MSISDN 628xxx"
          onChange={(e) =>
            setReg({ ...reg, msisdn: e.target.value.trim() })
          }
        />
        <input
          placeholder="NIK"
          onChange={(e) =>
            setReg({ ...reg, nik: e.target.value.trim() })
          }
        />
        <input
          placeholder="KK"
          onChange={(e) => setReg({ ...reg, kk: e.target.value.trim() })}
        />
        <button
          onClick={async () => {
            try {
              const res = await api.regCard(reg);
              alert(JSON.stringify(res, null, 2));
            } catch (e: any) {
              alert(e.message);
            }
          }}
        >
          Daftar
        </button>
      </div>
      <div className="card">
        <h3>Validate MSISDN</h3>
        <input
          placeholder="628xxx"
          onChange={(e) => setValTarget(e.target.value.trim())}
        />
        <button
          onClick={async () => {
            try {
              const res = await api.valNum(valTarget);
              alert(JSON.stringify(res, null, 2));
            } catch (e: any) {
              alert(e.message);
            }
          }}
        >
          Cek
        </button>
      </div>
    </div>
  );
}
