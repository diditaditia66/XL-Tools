import { useEffect, useState } from "react";
import * as api from "../../api/client";

export function DashboardHistory() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getHistory();
        setContent(data);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  const list = content?.list || [];

  return (
    <div className="list-container">
      {list.map((t: any, x: number) => (
        <div key={x} className="card list-item">
          <h4>{t.title}</h4>
          <p>
            {t.product_name} | Rp{t.price}
          </p>
          <p>{new Date(t.timestamp * 1000).toLocaleString("id-ID")}</p>
        </div>
      ))}
    </div>
  );
}
