import { NavLink } from "react-router-dom";

// Shared private-dashboard layout: a side navigation + content area.
// `links` = [{ to, label, icon, end }]
export default function DashboardShell({ title, subtitle, links = [], children }) {
  return (
    <div className="page container">
      <div className="mb-2">
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="dash">
        <aside className="dash-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </aside>
        <section className="stack">{children}</section>
      </div>
    </div>
  );
}
