import { useEffect, useState } from "react";
import * as api from "../../api/client";

export function DashboardCircle() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getCircle();
        setContent(data);
      } catch (e: any) {
        alert(e.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card">
      <h3>Circle</h3>
      <pre className="pre-block">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}
