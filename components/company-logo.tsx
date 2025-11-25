interface CompanyLogoProps {
  variant?: "default" | "white"
  className?: string
}

export function CompanyLogo({ variant = "default", className = "" }: CompanyLogoProps) {
  return (
    <div className={`block  items-center ${className}`}>
  
      <span className={`text-xl font-bold ${variant === "white" ? "text-white" : "text-foreground"}`}>
        {process.env.NEXT_PUBLIC_COMPANY_NAME}
      </span>
    </div>
  )
}
