import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirect based on role - this will be handled by middleware
  redirect("/dashboard/agent")
}
