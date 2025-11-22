const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
        message = data.detail;
      }
    } catch (_) {
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
};

export type SummaryResponse = {
  number: number;
  subscription_type?: string;
  profile: any;
  balance: any;
  tiering: any;
};

// ---- API functions ----

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

export async function fetchSummary(): Promise<SummaryResponse> {
  return request("/me/summary");
}

export async function fetchFamilies(): Promise<any> {
  return request("/store/families");
}

export async function fetchPackages(): Promise<any> {
  return request("/store/packages");
}

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

export async function fetchSegments(): Promise<any> {
  return request("/store/segments");
}

export async function fetchRedeemables(): Promise<any> {
  return request("/store/redeemables");
}
