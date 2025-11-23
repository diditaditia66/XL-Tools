import { useEffect, useState } from "react";
import * as api from "../../api/client";

type BenefitObj = {
  id?: string;
  name?: string;
  datatype?: string; // DATA / VOICE / TEXT / dll
  remaining?: number;
  total?: number;
  remaining_str?: string;
  total_str?: string;
};

type MyPackage = {
  name?: string;
  product_subscription_type?: string;
  product_domain?: string;

  // tambahan dari backend
  family_code?: string;
  familycode?: string;
  group_name?: string;
  groupname?: string;
  benefit_infos?: string[]; // kalau backend kirim sudah dalam bentuk string
  benefits?: (BenefitObj | string)[];
};

export function DashboardMyPackages() {
  const [packages, setPackages] = useState<MyPackage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getMyPackages();
        const list = Array.isArray(data?.packages) ? data.packages : [];
        setPackages(list);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const formatDataBytes = (bytes: number): string => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0";
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;
    if (bytes >= gb) return `${(bytes / gb).toFixed(2)} GB`;
    if (bytes >= mb) return `${(bytes / mb).toFixed(2)} MB`;
    if (bytes >= kb) return `${(bytes / kb).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const normalizeBenefits = (p: MyPackage): string[] => {
    // 1) Kalau backend sudah kirim benefit_infos: langsung pakai
    if (Array.isArray(p.benefit_infos) && p.benefit_infos.length > 0) {
      return p.benefit_infos.map((x) => String(x));
    }

    const raw = p.benefits;
    if (!Array.isArray(raw)) return [];

    // 2) Kalau benefits berupa string[]
    if (typeof raw[0] === "string") {
      return (raw as string[]).map((x) => String(x));
    }

    // 3) Kalau benefits berupa objek { name, datatype, remaining, total }
    return (raw as BenefitObj[]).map((b, idx) => {
      const label = b.name || `Benefit ${idx + 1}`;
      const type = (b.datatype || "").toUpperCase();
      // kalau backend sudah kasih *_str, pakai itu
      const remainingStr =
        b.remaining_str ??
        (type === "DATA" && b.remaining != null
          ? formatDataBytes(b.remaining)
          : b.remaining != null
          ? String(b.remaining)
          : "-");
      const totalStr =
        b.total_str ??
        (type === "DATA" && b.total != null
          ? formatDataBytes(b.total)
          : b.total != null
          ? String(b.total)
          : "-");

      let unit = "";
      if (type === "VOICE") unit = "menit";
      else if (type === "TEXT") unit = "SMS";

      return `${label}: ${remainingStr}/${totalStr}${unit ? " " + unit : ""}`;
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="my-packages-root">
      <div className="my-packages-header card">
        <div>
          <h3>Paket Saya</h3>
          <p className="my-packages-subtitle">
            Daftar paket aktif yang terdaftar pada nomor ini
          </p>
        </div>
        <div className="my-packages-count">
          <span>{packages.length}</span>
          <span className="my-packages-count-label">paket aktif</span>
        </div>
      </div>

      {packages.length === 0 && (
        <p className="my-packages-empty">
          Tidak ada paket aktif atau data belum tersedia.
        </p>
      )}

      <div className="list-container">
        {packages.map((p: MyPackage, idx: number) => {
          const subs = p.product_subscription_type || "REC";
          const domain = p.product_domain || "DATA";
          const name = p.name || `Paket ${idx + 1}`;
          const familyCode = p.family_code || p.familycode || "-";
          const groupName = p.group_name || p.groupname || "";
          const benefits = normalizeBenefits(p);

          return (
            <div key={idx} className="card my-package-card">
              <div className="my-package-header">
                <div>
                  <h4 className="my-package-title">{name}</h4>
                  {groupName && (
                    <p className="my-package-group">{groupName}</p>
                  )}
                </div>
                <div className="my-package-chips">
                  <span className="my-package-chip">{subs}</span>
                  <span className="my-package-chip secondary">
                    Domain: {domain}
                  </span>
                </div>
              </div>

              <div className="my-package-body">
                <div className="my-package-row">
                  <span className="my-package-label">Family Code</span>
                  <span className="my-package-family">{familyCode}</span>
                </div>

                {benefits.length > 0 && (
                  <div className="my-package-row" style={{ marginTop: 8 }}>
                    <span className="my-package-label">
                      Rincian Kuota & Sisa
                    </span>
                    <ul className="my-package-benefits">
                      {benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
