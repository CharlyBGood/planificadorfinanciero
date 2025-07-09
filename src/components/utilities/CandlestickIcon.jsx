// SVG de velas tipo trading (candlestick)
export default function CandlestickIcon({ className = "", size = 64 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="14" y="10" width="6" height="44" rx="3" fill="#6366F1"/>
      <rect x="29" y="22" width="6" height="32" rx="3" fill="#22d3ee"/>
      <rect x="44" y="18" width="6" height="36" rx="3" fill="#f59e42"/>
      <rect x="17" y="4" width="2" height="10" rx="1" fill="#6366F1"/>
      <rect x="32" y="4" width="2" height="18" rx="1" fill="#22d3ee"/>
      <rect x="47" y="4" width="2" height="14" rx="1" fill="#f59e42"/>
      <rect x="17" y="54" width="2" height="6" rx="1" fill="#6366F1"/>
      <rect x="32" y="54" width="2" height="6" rx="1" fill="#22d3ee"/>
      <rect x="47" y="54" width="2" height="6" rx="1" fill="#f59e42"/>
    </svg>
  )
}
