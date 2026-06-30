// Reusable Card container.
export default function Card({ title, action, children, className = "", bodyClass = "" }) {
  return (
    <div className={`card ${className}`.trim()}>
      <div className={`card-body ${bodyClass}`.trim()}>
        {(title || action) && (
          <div className="between mb-2">
            {title && <div className="card-title">{title}</div>}
            {action}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
