import { useEffect, useState } from "react";
import * as api from "../../api/client";

export function DashboardNotif() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getNotif();
      setContent(data);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  const list =
    content?.data?.notification?.data ||
    content?.notifications ||
    content ||
    [];

  return (
    <div className="list-container">
      <div className="card">
        <button
          onClick={async () => {
            try {
              const res = await api.markAllNotifRead();
              alert(
                `Ditandai dibaca: ${res.updated_ids.length} notifikasi`
              );
              load();
            } catch (e: any) {
              alert(e.message);
            }
          }}
        >
          Tandai Semua Dibaca
        </button>
      </div>
      {Array.isArray(list) &&
        list.map((n: any, x: number) => (
          <div key={x} className="card list-item">
            <h4>{n.brief_message || n.title}</h4>
            <p>{n.full_message || n.message}</p>
            <p>Status: {n.is_read ? "READ" : "UNREAD"}</p>
          </div>
        ))}
      {!Array.isArray(list) && (
        <pre className="pre-block">
          {JSON.stringify(content, null, 2)}
        </pre>
      )}
    </div>
  );
}
