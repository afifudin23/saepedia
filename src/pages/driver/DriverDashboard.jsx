import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { driverApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { DRIVER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatIDR, formatDate, DRIVER_EARNING_RATE } from "../../lib/format";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState({ active: [], completed: [], totalEarning: 0 });
  const [msg, setMsg] = useState("");

  function load() {
    driverApi.myJobs(user.id).then(setJobs);
  }
  useEffect(load, [user.id]);

  async function complete(id) {
    setMsg("");
    try {
      await driverApi.completeJob(user.id, id);
      setMsg("Job selesai! Penghasilan ditambahkan.");
      load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <DashboardShell title="Dashboard Driver" subtitle="Job aktif, riwayat, dan penghasilan." links={DRIVER_LINKS}>
      <div className="stats">
        <div className="stat"><div className="label">Job Aktif</div><div className="value">{jobs.active.length}</div></div>
        <div className="stat"><div className="label">Job Selesai</div><div className="value">{jobs.completed.length}</div></div>
        <div className="stat"><div className="label">Total Penghasilan</div><div className="value text-sm">{formatIDR(jobs.totalEarning)}</div></div>
      </div>

      <div className="alert info text-sm">
        Aturan penghasilan: driver menerima <strong>{Math.round(DRIVER_EARNING_RATE * 100)}%</strong> dari ongkos kirim setiap job yang diselesaikan.
      </div>
      {msg && <div className="alert success">{msg}</div>}

      <Card title="Job Aktif" action={<Button as={Link} to="/driver/jobs" size="sm">🔍 Cari Job</Button>}>
        {jobs.active.length === 0 ? (
          <div className="empty">Tidak ada job aktif. <Link to="/driver/jobs">Cari job →</Link></div>
        ) : (
          <div className="stack">
            {jobs.active.map((j) => (
              <div key={j.id} className="between" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: 10 }}>
                <div>
                  <div className="bold text-sm">🏪 {j.storeName} · {j.deliveryLabel}</div>
                  <div className="text-xs muted">{j.address.full}</div>
                  <div className="text-xs">Penghasilan: <strong>{formatIDR(j.earning)}</strong></div>
                </div>
                <Button size="sm" onClick={() => complete(j.id)}>✅ Selesaikan</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Riwayat Job">
        {jobs.completed.length === 0 ? (
          <div className="empty">Belum ada job selesai.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead><tr><th>Order</th><th>Toko</th><th>Metode</th><th className="text-right">Penghasilan</th></tr></thead>
              <tbody>
                {jobs.completed.map((j) => (
                  <tr key={j.id}>
                    <td className="text-xs">{j.id}</td>
                    <td className="text-sm">{j.storeName}</td>
                    <td className="text-sm">{j.deliveryLabel}</td>
                    <td className="text-right bold">{formatIDR(j.earning)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}
