// Reusable labelled Input / Textarea / Select field.
export default function Input({
  label,
  hint,
  error,
  as = "input",
  className = "",
  id,
  children,
  ...props
}) {
  const fieldId = id || props.name;
  const Comp = as;
  const base = as === "select" ? "select" : "input";
  return (
    <div className="field">
      {label && <label htmlFor={fieldId}>{label}</label>}
      <Comp
        id={fieldId}
        className={`${base} ${error ? "invalid" : ""} ${className}`.trim()}
        {...props}
      >
        {children}
      </Comp>
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
