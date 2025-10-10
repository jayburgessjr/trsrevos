import type { Metadata } from "next"

import LoginScreen from "@/components/ui/login-1"

export const metadata: Metadata = {
  title: "Login",
  description: "Access your TRS Revos workspace with email or Google login.",
}

export default function LoginPage() {
  return <LoginScreen />
}
