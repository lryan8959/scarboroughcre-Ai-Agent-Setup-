import { LoginForm } from "@/components/auth/login-form"
import { CompanyLogo } from "@/components/company-logo"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary/30" />
        </div>
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <CompanyLogo variant="white" />
          <div>
            <h1 className="text-4xl font-bold mb-4 text-balance">{"Manage Your Commercial Real Estate Listings"}</h1>
            <p className="text-lg text-white/90">
              {"Professional listing management platform for agents and administrators"}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <CompanyLogo />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
