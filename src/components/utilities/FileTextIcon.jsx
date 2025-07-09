export default function FileTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  )
}
