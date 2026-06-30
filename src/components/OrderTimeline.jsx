import { ORDER_FLOW, ORDER_STATUS } from "../lib/status";
import { formatDate } from "../lib/format";

// Visual status tracker. Shows the main lifecycle and marks reached steps using
// the order's statusHistory (with timestamps).
export default function OrderTimeline({ order }) {
  const history = order.statusHistory || [];
  const reachedAt = (status) => history.find((h) => h.status === status)?.at;
  const isReturned = order.status === ORDER_STATUS.RETURNED;

  // Build the steps to display: the main flow, plus "Dikembalikan" if applicable.
  const steps = isReturned
    ? [...ORDER_FLOW.slice(0, 1), ORDER_STATUS.RETURNED]
    : ORDER_FLOW;

  return (
    <ul className="timeline">
      {steps.map((status) => {
        const at = reachedAt(status);
        const done = !!at;
        return (
          <li key={status} className={done ? "done" : ""}>
            <div className="bold">{status}</div>
            <div className="ts">{at ? formatDate(at) : "Belum tercapai"}</div>
          </li>
        );
      })}
    </ul>
  );
}
