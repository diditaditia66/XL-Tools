import { useEffect, useState } from "react";
import * as api from "../../api/client";

type AkrabResponse = any; // bisa dibuat lebih ketat kalau mau

export function DashboardAkrab() {
  const [data, setData] = useState<AkrabResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getAkrab();
        setData(res);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !data) {
    return <p>Loading...</p>;
  }

  const status = data.status || data.code || "-";
  const info = data.data || {};
  const memberInfo = info.member_info || {};
  const members = info.members || [];
  const additionalMembers = info.additional_members || [];
  const additionalSlot = info.additional_slot || {};
  const totalAddOn = info.total_add_on || 0;
  const planType = info.plan_type || "-";
  const isRecurring = info.is_recurring ? "Ya" : "Tidak";

  const mainQuota = memberInfo.my_quota || {};
  const myBenefit = mainQuota.benefit_name || "-";
  const myQuotaTotal = mainQuota.total_quota || 0;
  const myQuotaRemaining = mainQuota.remaining_quota || 0;

  const remainingAddSlot = info.remaining_add_chances_additional_slot || 0;

  return (
    <div className="akrab-root">
      {/* Ringkasan plan */}
      <div className="card akrab-summary-card">
        <div>
          <h3>Family Plan / Akrab</h3>
          <p className="akrab-summary-subtitle">
            Status: {status} · Tipe Plan: {planType} · Berulang: {isRecurring}
          </p>
        </div>
        <div className="akrab-summary-badge">
          <span>Tambah slot</span>
          <strong>{remainingAddSlot}</strong>
        </div>
      </div>

      {/* Kuota utama akun ini */}
      <div className="card akrab-quota-card">
        <h4>Kuota Utama Anda</h4>
        <p className="akrab-quota-benefit">{myBenefit}</p>
        <p className="akrab-quota-amount">
          Sisa: {myQuotaRemaining} / {myQuotaTotal}
        </p>
        <p className="akrab-quota-meta">
          Role: {memberInfo.role || "N/A"} · Group ID:{" "}
          {memberInfo.group_id || "-"}
        </p>
      </div>

      {/* Slot tambahan */}
      <div className="akrab-slot-grid">
        <div className="card">
          <h4>Slot Tambahan</h4>
          <p className="akrab-slot-name">
            {additionalSlot.name || "Tidak ada paket tambahan aktif"}
          </p>
          {additionalSlot.package_option_code && (
            <p className="akrab-slot-meta">
              Option code: {additionalSlot.package_option_code}
            </p>
          )}
          {additionalSlot.price != null && (
            <p className="akrab-slot-meta">
              Harga: Rp
              {new Intl.NumberFormat("id-ID").format(
                additionalSlot.price || 0
              )}
            </p>
          )}
          <p className="akrab-slot-meta">
            Total add-on aktif: {totalAddOn}
          </p>
        </div>

        <div className="card">
          <h4>Biaya & Pengaturan</h4>
          <p className="akrab-slot-meta">
            Biaya ganti member: Rp
            {new Intl.NumberFormat("id-ID").format(
              info.change_member_fee || 0
            )}
          </p>
          <p className="akrab-slot-meta">
            Ganti member diizinkan:{" "}
            {info.change_member_fee_enabled ? "Ya" : "Tidak"}
          </p>
        </div>
      </div>

      {/* Daftar member */}
      <div className="card akrab-members-card">
        <div className="akrab-members-header">
          <h4>Anggota Utama</h4>
          <span className="akrab-members-count">
            {members.length} member aktif
          </span>
        </div>

        {members.length === 0 && (
          <p className="akrab-slot-meta">Belum ada member terdaftar.</p>
        )}

        {members.length > 0 && (
          <div className="akrab-members-list">
            {members.map((m: any, idx: number) => (
              <div key={idx} className="akrab-member-item">
                <div>
                  <p className="akrab-member-name">
                    {m.name || m.msisdn || `Member ${idx + 1}`}
                  </p>
                  <p className="akrab-member-meta">
                    MSISDN: {m.msisdn || "-"}
                  </p>
                </div>
                <div className="akrab-member-tags">
                  {m.role && <span className="akrab-tag">{m.role}</span>}
                  {m.quota_used != null && (
                    <span className="akrab-tag secondary">
                      Kuota terpakai: {m.quota_used}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {additionalMembers.length > 0 && (
          <>
            <hr className="akrab-divider" />
            <h5>Anggota Tambahan</h5>
            <div className="akrab-members-list">
              {additionalMembers.map((m: any, idx: number) => (
                <div key={idx} className="akrab-member-item">
                  <p className="akrab-member-name">
                    {m.name || m.msisdn || `Additional ${idx + 1}`}
                  </p>
                  <p className="akrab-member-meta">
                    MSISDN: {m.msisdn || "-"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
