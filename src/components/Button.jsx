const variants = {
  primary: "bg-primary text-white hover:bg-primary-deep",
  secondary: "bg-white text-primary-deep border-[1.5px] border-tint hover:bg-tint/10",
  ghost: "bg-transparent text-ink hover:bg-line/60",
};

export default function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-[3px] focus:ring-tint/35 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
