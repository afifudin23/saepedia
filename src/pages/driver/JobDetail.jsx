import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { driverApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/DashboardShell";
import { DRIVER_LINKS } from "../../lib/navConfig";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import OrderTimeline from "../../components/OrderTimeline";
import { formatIDR } from "../../lib/format";
import { ORDER_STATUS } from "../../lib/status";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [msg, setMsg] = useState("");

  function load() {
    driverApi.getJob(id).then(setJob).catch((e) => setMsg(e.message));
  }
  useEffect(load, [id]);

  async function take() {
    try {
      await driverApi.takeJob(user.id, id);
      navigate("/driver");
    } catch (e) {
      setMsg(e.message);
      load();
    }
  }
  async function complete() {
    try {
      await driverApi.completeJob(user.id, id);
      navigate("/driver");
    } catch (e) {
      setMsg(e.message);
    }
  }

  if (!job)
    return <DashboardShell title="Detail Job" links={DRIVER_LINKS}><div className="empty">{msg || "Memuat…"}</div></DashboardShell>;

  return (
    <DashboardShell
      title="Detail Job"
      subtitle={<Link to="/driver/jobs" className="nav-link">← Kembali</Link>}
      links={DRIVER_LINKS}
    >
      {msg && <div className="alert error">{msg}</div>}
      <Card>
        <div className="between">
          <div>
            <div className="bold">🏪 {job.storeName}</div>
            <div className="text-xs muted">{job.id} · {job.deliveryLabel}</div>
          </div>
          <span className="badge">{job.status}</span>
        </div>
        <div className="text-sm mt-2">
          <div className="bold">Alamat tujuan</div>
          <div className="muted">{job.address.recipient} · {job.address.phone}</div>
          <div className="muted">{job.address.full}</div>
        </div>
        <div className="mt-2">Penghasilan: <strong>{formatIDR(job.earning)}</strong></div>
      </Card>

      <Card title="Item">
        <div className="stack" style={{ gap: 6 }}>
          {job.items.map((it) => (
            <div key={it.productId} className="between text-sm">
              <span>{it.emoji} {it.name} × {it.qty}</span>
              <span>{formatIDR(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Status">
        <OrderTimeline order={job} />
      </Card>

      <div className="row">
        {job.status === ORDER_STATUS.WAITING_DRIVER && !job.driverId && (
          <Button onClick={take}>Ambil Job</Button>
        )}
        {job.status === ORDER_STATUS.SHIPPING && job.driverId === user.id && (
          <Button onClick={complete}>✅ Konfirmasi Selesai</Button>
        )}
      </div>
    </DashboardShell>
  );
}
