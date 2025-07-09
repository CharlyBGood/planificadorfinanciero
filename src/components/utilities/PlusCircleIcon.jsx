export default function PlusCircleIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v8m4-4H8" />
    </svg>
  )
}
