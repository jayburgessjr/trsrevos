"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import type { ChangeEvent, FormEvent } from "react"

import { createClient } from "@/lib/supabase/client"

interface FormState {
  email: string
  password: string
}

export default function LoginScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormState>({ email: "", password: "" })
  const [authError, setAuthError] = useState<string | null>(null)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setAuthError(null)
    setAuthMessage(null)
    setIsSubmitting(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          throw error
        }

        setAuthMessage("Signed in successfully.")
        // Redirect to the original page or home
        const redirectTo = searchParams.get('redirectTo') || '/'
        router.replace(redirectTo)
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          throw error
        }

        setAuthMessage("Account created. Check your email to confirm your address.")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error"
      setAuthError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    setAuthMessage(null)
    setIsSubmitting(true)

    try {
      const redirectTo = searchParams.get('redirectTo') || '/'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error"
      setAuthError(message)
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleMode = () => {
    setIsLogin((prev) => !prev)
    setFormData({ email: "", password: "" })
    setShowPassword(false)
    setAuthError(null)
    setAuthMessage(null)
  }

  return (
    <div className="w-full min-h-screen flex bg-[#015e32]">
      {/* Left side - Hero section with green background */}
      <div className="flex-1 bg-gradient-to-br from-[#004d28] via-[#015e32] to-[#124f2e] flex items-center justify-center p-12 relative">
        {/* Background image with 30% opacity */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/data-science-background.png"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>

        <div className="text-white max-w-lg relative z-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fd8216]">TRS</p>
            <p className="text-2xl font-semibold text-white mt-1">RevOS</p>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            &ldquo;The secret of getting ahead is getting started.&rdquo;
          </h1>
          <p className="text-white/80 text-lg">
            Revenue Operations Execution Layer
          </p>
        </div>
      </div>

      {/* Right side - Login form with green background */}
      <div className="flex-1 bg-[#004d28] flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/trs-logo.png"
              alt="TRS Logo"
              width={175}
              height={175}
              className="h-[175px] w-[175px] mx-auto mb-4"
              priority
            />
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Join Us Today"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Your email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#1b8f50] bg-[#013c21] text-white placeholder:text-white/50 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216] outline-none transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                {isLogin ? "Password" : "Create new password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-[#1b8f50] bg-[#013c21] text-white placeholder:text-white/50 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216] outline-none transition-all"
                  placeholder={isLogin ? "Enter your password" : "Create a secure password"}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {authError && (
              <div className="rounded-lg border border-red-400 bg-red-900/20 px-3 py-2 text-sm text-red-200">
                {authError}
              </div>
            )}

            {authMessage && (
              <div className="rounded-lg border border-[#fd8216] bg-[#fd8216]/20 px-3 py-2 text-sm text-white">
                {authMessage}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#fd8216] border-[#1b8f50] bg-[#013c21] rounded focus:ring-[#fd8216]"
                  />
                  <span className="ml-2 text-sm text-white/80">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-[#fd8216] hover:text-[#f27403] font-medium"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#fd8216] hover:bg-[#f27403] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#fd8216] focus:ring-offset-2 focus:ring-offset-[#004d28] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : isLogin
                  ? "Sign In"
                  : "Create a new account"}
            </button>

            <div className="text-center">
              <span className="text-white/80">
                {isLogin ? "Don't have an account?" : "Already have account?"}
              </span>{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-[#fd8216] hover:text-[#f27403] font-semibold"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1b8f50]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#004d28] text-white/60">Or continue with</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center px-4 py-2 border border-[#1b8f50] bg-[#013c21] text-white rounded-lg hover:bg-[#015e32] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285f4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fbbc05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-[#1b8f50] bg-[#013c21] text-white/50 rounded-lg transition-colors"
              disabled
            >
              <svg className="w-5 h-5 mr-2" fill="#1877f2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
