import { useEffect, useState } from "react";
import { reviewApi } from "../lib/api";
import { formatDate } from "../lib/format";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import StarRating from "./ui/StarRating";

// Public application reviews (Level 1). Guests may submit without checkout.
// Comments are rendered as plain text via JSX, so any HTML/script in the input
// is escaped by React and cannot execute (basic XSS safety; hardened in L7).
export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function load() {
    setReviews(await reviewApi.list());
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setOk(false);
    try {
      await reviewApi.add({ name, rating, comment });
      setName("");
      setComment("");
      setRating(5);
      setOk(true);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section id="reviews" className="mt-3">
      <div className="section-head">
        <h2>Ulasan Aplikasi</h2>
        <span className="muted text-sm">{reviews.length} ulasan</span>
      </div>
      <p className="muted mb-2">
        Ceritakan pengalamanmu memakai aplikasi SEAPEDIA — tanpa perlu belanja
        atau transaksi terlebih dahulu.
      </p>

      <div className="grid" style={{ gridTemplateColumns: "360px 1fr", alignItems: "start" }}>
        <Card title="Tulis Ulasan">
          <form className="stack" onSubmit={submit}>
            <Input
              label="Nama"
              name="name"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
            <div className="field">
              <label>Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <Input
              label="Komentar"
              as="textarea"
              name="comment"
              rows={3}
              placeholder="Bagaimana pengalamanmu?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
            />
            {error && <div className="alert error">{error}</div>}
            {ok && <div className="alert success">Terima kasih atas ulasannya! 🙌</div>}
            <Button type="submit">Kirim Ulasan</Button>
          </form>
        </Card>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {reviews.length === 0 && (
            <div className="empty">
              <div className="emoji">📝</div>
              Belum ada ulasan. Jadilah yang pertama!
            </div>
          )}
          {reviews.map((r) => (
            <Card key={r.id}>
              <div className="between">
                <strong>{r.name}</strong>
                <StarRating value={r.rating} />
              </div>
              {/* Rendered as text — React escapes any HTML automatically */}
              <p className="mt-1">{r.comment}</p>
              <div className="text-xs muted mt-1">{formatDate(r.createdAt)}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
