// src/pages/LoginPage.tsx
import { useState } from "react";
import { requestOtp, submitOtp } from "../api/client";
import type { ActiveUser } from "../api/client";

type LoginStep = "msisdn" | "otp";

interface LoginPageProps {
  onLoggedIn: (user: ActiveUser) => void;
}

export function LoginPage({ onLoggedIn }: LoginPageProps) {
  const [msisdn, setMsisdn] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("msisdn");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    setError(null);
    setMessage(null);

    if (!msisdn.startsWith("628")) {
      setError("Nomor harus dimulai dengan 628...");
      return;
    }

    setLoading(true);
    try {
      await requestOtp(msisdn);
      setMessage("OTP sudah dikirim. Cek SMS dari XL.");
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOtp = async () => {
    setError(null);
    setMessage(null);

    if (otp.length !== 6) {
      setError("OTP harus 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitOtp(msisdn, otp);
      setMessage("Login berhasil.");
      // API server mengembalikan { success, active_user: {...} }
      onLoggedIn(res.active_user);
    } catch (e: any) {
      setError(e.message || "Gagal verifikasi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page login-page">
      <div className="page-panel">
        <h2>Masuk dengan OTP</h2>
        <p className="page-description">
          Masukkan nomor XL kamu untuk menerima kode OTP.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="msisdn">Nomor XL (format 628…)</label>
            <input
              id="msisdn"
              type="text"
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value)}
              placeholder="62812xxxxxxxx"
              disabled={step === "otp" || loading}
            />
          </div>

          {step === "otp" && (
            <div className="form-group">
              <label htmlFor="otp">Kode OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6 digit"
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="button-row">
          {step === "msisdn" ? (
            <button
              onClick={handleRequestOtp}
              disabled={loading || !msisdn.trim()}
            >
              {loading ? "Mengirim OTP..." : "Kirim OTP"}
            </button>
          ) : (
            <>
              <button
                onClick={handleSubmitOtp}
                disabled={loading || !otp.trim()}
              >
                {loading ? "Verifikasi..." : "Verifikasi OTP"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setStep("msisdn");
                  setOtp("");
                  setMessage(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Ganti nomor
              </button>
            </>
          )}
        </div>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}
      </div>
    </section>
  );
}
