import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { driverApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { DRIVER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatIDR, formatDate } from "../../lib/format";

export default function DriverJobs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [msg, setMsg] = useState("");

  function load() {
    driverApi.availableJobs().then(setJobs);
  }
  useEffect(load, []);

  async function take(id) {
    setMsg("");
    try {
      await driverApi.takeJob(user.id, id);
      navigate("/driver");
    } catch (e) {
      setMsg(e.message);
      load();
    }
  }

  return (
    <DashboardShell title="Cari Job" subtitle="Hanya pesanan berstatus Menunggu Pengirim." links={DRIVER_LINKS}>
      <div className="alert info text-sm">
        Job muncul hanya setelah Seller memproses pesanan (status
        <strong> Menunggu Pengirim</strong>). Satu order hanya boleh diambil satu driver.
      </div>
      {msg && <div className="alert error">{msg}</div>}

      {jobs.length === 0 ? (
        <div className="empty"><div className="emoji">🔍</div>Belum ada job tersedia saat ini.</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {jobs.map((j) => (
            <Card key={j.id}>
              <div className="between">
                <strong className="text-sm">🏪 {j.storeName}</strong>
                <span className="badge orange">{j.deliveryLabel}</span>
              </div>
              <div className="text-xs muted mt-1">{j.address.recipient} · {j.address.full}</div>
              <div className="text-sm mt-1">{formatDate(j.createdAt)}</div>
              <div className="between mt-2">
                <span>Penghasilan: <strong>{formatIDR(j.earning)}</strong></span>
                <div className="row" style={{ gap: 6 }}>
                  <Button size="sm" variant="secondary" as={Link} to={`/driver/jobs/${j.id}`}>Detail</Button>
                  <Button size="sm" onClick={() => take(j.id)}>Ambil Job</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
