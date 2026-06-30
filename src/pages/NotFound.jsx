import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="page container">
      <div className="empty">
        <div className="emoji">🧭</div>
        <h2>Halaman tidak ditemukan</h2>
        <p className="muted mb-2">Mungkin halaman ini belum tersedia di level saat ini.</p>
        <Button as={Link} to="/">Kembali ke Beranda</Button>
      </div>
    </div>
  );
}
