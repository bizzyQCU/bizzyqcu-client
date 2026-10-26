export default function Logo({ className = 'h-10 sm:h-11 w-auto transition-transform group-hover:scale-105' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" className={className}>
      <g transform="translate(4, 4)">
        <ellipse cx="28" cy="18" rx="14" ry="9" transform="rotate(-30 28 18)" fill="#BAE6FD" opacity="0.85" stroke="#0284C7" strokeWidth="2" />
        <ellipse cx="36" cy="15" rx="12" ry="7.5" transform="rotate(-15 36 15)" fill="#E0F2FE" opacity="0.75" stroke="#0284C7" strokeWidth="1.8" />
        <ellipse cx="28" cy="34" rx="20" ry="16" fill="#FBBF24" stroke="#0F172A" strokeWidth="2.5" />
        <path d="M 23 18.5 C 24 28, 24 40, 23 49.5" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M 32 18.5 C 33 28, 33 40, 32 49.5" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="30" r="2.8" fill="#0F172A" />
        <circle cx="15.2" cy="29" r="0.9" fill="#FFF" />
        <path d="M 12 36 Q 16 40 19 36" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx="12" cy="36" rx="2" ry="1.2" fill="#F87171" opacity="0.6" />
        <path d="M 19 20 C 16 12 11 13 10 16" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="10" cy="16" r="2.2" fill="#F59E0B" />
        <path d="M 23 19 C 22 10 27 9 29 12" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="29" cy="12" r="2.2" fill="#F59E0B" />
        <polygon points="48,34 53,32 48,36" fill="#0F172A" />
      </g>
      <g transform="translate(68, 42)">
        <text fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="28" fontWeight="800" letterSpacing="-0.5px">
          <tspan fill="#1E3A8A">Bizzy</tspan>
          <tspan fill="#F59E0B">QCU</tspan>
        </text>
      </g>
    </svg>
  )
}
