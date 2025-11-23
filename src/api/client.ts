// src/api/client.ts

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) {
        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json();
}

// ---- Types ----

export type ActiveUser = {
  number: number;
  subscription_type?: string;
  tokens?: any;
};

export type SummaryResponse = {
  number: number;
  subscription_type?: string;
  profile: any;
  balance: any;
  tiering: any;
};

export type PurchaseResponse = {
  success: boolean;
  result: any;
};

export type RegistrationBody = {
  msisdn: string;
  nik: string;
  kk: string;
};

// ---- AUTH (Menu 1) ----

export async function requestOtp(msisdn: string) {
  return request<{ success: boolean; subscriber_id: string }>(
    "/auth/request-otp",
    {
      method: "POST",
      body: JSON.stringify({ msisdn }),
    }
  );
}

export async function submitOtp(
  msisdn: string,
  otp: string
): Promise<{ success: boolean; active_user: ActiveUser }> {
  return request("/auth/submit-otp", {
    method: "POST",
    body: JSON.stringify({ msisdn, otp }),
  });
}

// ---- USERS (multi akun) ----

export async function fetchUsers(): Promise<
  { number: number; subscription_type?: string; is_active: boolean }[]
> {
  return request("/users");
}

export async function selectUser(number: number) {
  return request<{ success: boolean; active_user: ActiveUser }>(
    "/users/select",
    {
      method: "POST",
      body: JSON.stringify({ number }),
    }
  );
}

// ---- DASHBOARD / HOME (menu 0: summary) ----

export async function getSummary(): Promise<SummaryResponse> {
  return request("/me/summary");
}

// ---- MY PACKAGES (menu 2) ----

export async function getMyPackages(): Promise<{
  raw: any;
  packages: any[];
}> {
  return request("/me/packages");
}

// ---- STORE (menu 11–14) ----

export async function getStoreSegments(): Promise<any> {
  return request("/store/segments");
}

export async function getFamilies(
  subsType = "PREPAID",
  isEnterprise = false
): Promise<any> {
  return request(
    `/store/families?subs_type=${encodeURIComponent(
      subsType
    )}&is_enterprise=${isEnterprise}`
  );
}

export async function getStorePkgs(
  subsType = "PREPAID",
  isEnterprise = false
): Promise<any> {
  return request<any>(
    `/store/packages?subs_type=${encodeURIComponent(
      subsType
    )}&is_enterprise=${isEnterprise}`
  );
}


export async function getFamilyDetail(
  familyCode: string,
  isEnterprise = false
): Promise<any> {
  const q = `?is_enterprise=${isEnterprise}`;
  return request(`/store/family/${encodeURIComponent(familyCode)}${q}`);
}

export async function getRedeem(): Promise<any> {
  return request("/store/redeemables");
}

// ---- HOT 1 & HOT 2 (menu 3 & 4) ----
// File JSON disajikan dari sisi frontend (public/hot_data/*), persis seperti CLI
// membaca hot_data/hot.json dan hot_data/hot2.json.
export async function getHot1(): Promise<any> {
  return request("/hot1");
}

export async function getHot2(): Promise<any> {
  return request("/hot2");
}

export async function purchaseHot2(
  index: number,
  method: "BALANCE" | "EWALLET" | "QRIS"
): Promise<any> {
  return request(`/hot2/purchase`, {
    method: "POST",
    body: JSON.stringify({ index, method }),
  });
}
export async function purchaseHot2Ewallet(
  index: number,
  paymentMethod: "DANA" | "SHOPEEPAY" | "GOPAY" | "OVO",
  walletNumber?: string
) {
  return request("/hot2/ewallet", {
    method: "POST",
    body: JSON.stringify({
      index,
      payment_method: paymentMethod,
      wallet_number: walletNumber || null,
    }),
  });
}

// ---- PEMBELIAN paket via option_code ----

// Pulsa biasa (tanpa decoy) – kompatibel dengan kode lama
export async function purchase(
  optionCode: string,
  price: number = 0,
  overwriteAmount?: number
): Promise<PurchaseResponse> {
  const body: any = { option_code: optionCode };
  if (overwriteAmount != null && overwriteAmount > 0) {
    body.overwrite_amount = overwriteAmount;
  } else if (price > 0) {
    // fallback lama: pakai harga paket sebagai overwrite
    body.overwrite_amount = price;
  }
  return request("/purchase/balance/single", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Pulsa dengan mode (normal / decoy v1 / decoy v2)
export async function purchaseBalanceWithMode(
  optionCode: string,
  price: number,
  mode: "normal" | "decoy_v1" | "decoy_v2",
  overwriteAmount?: number
): Promise<PurchaseResponse> {
  const body: any = {
    option_code: optionCode,
  };
  const amt = overwriteAmount != null && overwriteAmount > 0
    ? overwriteAmount
    : price;
  body.overwrite_amount = amt;

  if (mode === "decoy_v1") body.use_decoy_v1 = true;
  if (mode === "decoy_v2") body.use_decoy_v2 = true;

  return request("/purchase/balance/single", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// E-Wallet single option
export async function purchaseWithEwallet(
  optionCode: string,
  paymentMethod: "DANA" | "SHOPEEPAY" | "GOPAY" | "OVO",
  walletNumber?: string,
  price: number = 0,
  overwriteAmount?: number
): Promise<PurchaseResponse> {
  const body: any = {
    option_code: optionCode,
    payment_method: paymentMethod,
  };
  if (walletNumber) body.wallet_number = walletNumber;

  const amt = overwriteAmount != null && overwriteAmount > 0
    ? overwriteAmount
    : price;
  if (amt > 0) body.overwrite_amount = amt;

  return request("/purchase/ewallet/single", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// QRIS: normal / decoy profil qris / qris0
export async function purchaseQrisWithMode(
  optionCode: string,
  price: number,
  mode: "normal" | "qris" | "qris0",
  overwriteAmount?: number
): Promise<{
  success: boolean;
  transaction_id: string;
  qris_code: string;
  qris_b64: string;
  qris_url: string;
}> {
  const body: any = {
    option_code: optionCode,
  };

  const amt = overwriteAmount != null && overwriteAmount > 0
    ? overwriteAmount
    : price;
  if (amt > 0) body.overwrite_amount = amt;

  if (mode === "qris" || mode === "qris0") {
    body.use_decoy = true;
    body.decoy_profile = mode;
  }

  return request("/purchase/qris/single", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Alias QRIS normal
export async function purchaseWithQris(
  optionCode: string,
  price: number,
  overwriteAmount?: number
) {
  return purchaseQrisWithMode(optionCode, price, "normal", overwriteAmount);
}

// Pulsa N kali (tanpa decoy; backend mendukung decoy via flag opsional)
export async function purchaseRepeatBalance(
  optionCode: string,
  times: number,
  delaySeconds: number = 0,
  useDecoy: boolean = false,
  tokenConfirmationIdx: number = 0
): Promise<{
  success: boolean;
  option_code: string;
  times: number;
  delay_seconds: number;
  use_decoy: boolean;
  token_confirmation_idx: number;
  success_count: number;
  results: any[];
}> {
  return request("/purchase/balance/repeat", {
    method: "POST",
    body: JSON.stringify({
      option_code: optionCode,
      times,
      delay_seconds: delaySeconds,
      use_decoy: useDecoy,
      token_confirmation_idx: tokenConfirmationIdx,
    }),
  });
}

// Beli semua paket di 1 family code (loop) via backend
export async function purchaseFamilyLoop(
  familyCode: string,
  startFromOption: number = 1,
  delaySeconds: number = 0
): Promise<{
  success: boolean;
  family_code: string;
  start_from_option: number;
  delay_seconds: number;
  total_attempted: number;
  success_count: number;
  results: any[];
}> {
  return request("/purchase/family/loop", {
    method: "POST",
    body: JSON.stringify({
      family_code: familyCode,
      start_from_option: startFromOption,
      delay_seconds: delaySeconds,
    }),
  });
}

// ---- RIWAYAT TRANSAKSI (menu 8) ----

export async function getHistory(): Promise<any> {
  return request("/transactions/history");
}

// ---- FAMILY PLAN / AKRAB (menu 9) ----

export async function getAkrab(): Promise<any> {
  return request("/famplan/info");
}

export async function valNum(msisdn: string): Promise<any> {
  return request("/famplan/validate-msisdn", {
    method: "POST",
    body: JSON.stringify({ msisdn }),
  });
}

// ---- CIRCLE (menu 10) ----

export async function getCircle(): Promise<any> {
  return request("/circle/status");
}

// ---- NOTIFIKASI (menu N) ----

export async function getNotif(): Promise<any> {
  // ini sudah benar, ambil list notif dari backend
  return request("/notifications");
}

// optional: kalau endpoint ini memang ada dan dipakai tempat lain,
// masih boleh dipertahankan, tapi bukan yang utama untuk logika CLI.
export async function markAllNotifRead(): Promise<{
  success: boolean;
  updated_ids: string[];
}> {
  return request("/notifications/read-all", { method: "POST" });
}

// Wajib: wrapper ke get_notification_detail di backend (CLI memakai ini)
export async function getNotifDetail(
  notificationId: string
): Promise<any> {
  return request(`/notifications/${notificationId}`);
}


// ---- REGISTER (menu R) ----

export async function regCard(data: RegistrationBody): Promise<any> {
  return request("/registration/dukcapil", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---- Helper alias untuk kompatibilitas kode lama ----

export async function fetchFamilies(
  subsType = "PREPAID",
  isEnterprise = false
): Promise<any> {
  return getFamilies(subsType, isEnterprise);
}

export async function fetchPackages(
  subsType = "PREPAID",
  isEnterprise = false
): Promise<any> {
  return getStorePkgs(subsType, isEnterprise);
}

export async function fetchRedeemables(): Promise<any> {
  return getRedeem();
}

export async function searchFamilyQuotas(
  familyCode: string
): Promise<any> {
  return request<any>("/search/family-quotas", {
    method: "POST",
    body: JSON.stringify({ family_code: familyCode }),
  });
}

