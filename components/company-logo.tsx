interface CompanyLogoProps {
  variant?: "default" | "white"
  className?: string
}

export function CompanyLogo({ variant = "default", className = "" }: CompanyLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 bg-[#1e3a5f] rounded flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 4L8 2L12 4L16 2L20 4V12L16 14L12 12L8 14L4 12V4Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M8 6V10M12 8V12M16 6V10"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 16L8 14L12 16L16 14L20 16V22"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={`text-xl font-bold ${variant === "white" ? "text-white" : "text-foreground"}`}>
        {process.env.NEXT_PUBLIC_COMPANY_NAME}
      </span>
    </div>
  )
}
