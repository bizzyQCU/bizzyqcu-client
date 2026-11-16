export default function Footer({ textClassName = 'text-slate-300' }) {
  return (
    <footer className="w-full shrink-0 pb-3 pt-1.5 text-center">
      <p className={`text-xs ${textClassName}`}>
        © {new Date().getFullYear()} Quezon City University • SBIT-3D SET A
      </p>
    </footer>
  )
}
