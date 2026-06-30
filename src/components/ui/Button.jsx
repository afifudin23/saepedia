// Reusable Button. variant: primary | secondary | ghost | danger | accent
export default function Button({
  variant = "primary",
  size,
  block,
  className = "",
  as: Comp = "button",
  children,
  ...props
}) {
  const classes = [
    "btn",
    variant !== "primary" ? variant : "",
    size === "sm" ? "sm" : "",
    block ? "block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Comp className={classes} {...props}>
      {children}
    </Comp>
  );
}
