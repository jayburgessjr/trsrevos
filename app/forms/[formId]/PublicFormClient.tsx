'use client'

import { useState } from 'react'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Select } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

type FieldConfig = {
  name: string
  label: string
  type: string
  required: boolean
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
}

type FormConfig = {
  id: string
  title: string
  description: string
  fields: FieldConfig[]
}

type PublicFormClientProps = {
  formConfig: FormConfig
}

export default function PublicFormClient({ formConfig }: PublicFormClientProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: formConfig.id,
          data: formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again or contact us directly.')
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#015e32] p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#fd8216]/10 border-2 border-[#fd8216]">
              <svg
                className="h-8 w-8 text-[#fd8216]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#f8f8f6] mb-4">Thank You!</h1>
            <p className="text-lg text-[#f8f8f6]/90 mb-2">
              Your submission has been received.
            </p>
            <p className="text-sm text-[#f8f8f6]/70">
              We&apos;ll review your information and get back to you within 24 hours.
            </p>
            <p className="mt-6 text-xs text-[#f8f8f6]/50">
              Check your email for a confirmation and next steps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#015e32] p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#f8f8f6] mb-2">{formConfig.title}</h1>
          <p className="text-[#f8f8f6]/90">{formConfig.description}</p>
        </div>

        <Card className="border-[#f8f8f6]/20 bg-[#015e32]/50 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {formConfig.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-[#f8f8f6] text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-[#fd8216] ml-1">*</span>}
                </Label>

                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full bg-[#004d28] border-[#f8f8f6]/30 text-[#f8f8f6] placeholder:text-[#f8f8f6]/40 focus:border-[#fd8216] focus:ring-[#fd8216]"
                  />
                ) : field.type === 'select' && field.options ? (
                  <Select
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full bg-[#004d28] border-[#f8f8f6]/30 text-[#f8f8f6] focus:border-[#fd8216] focus:ring-[#fd8216]"
                  >
                    <option value="" className="bg-[#004d28]">Select...</option>
                    {field.options.map((option) => (
                      <option key={option} value={option} className="bg-[#004d28]">
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    className="w-full bg-[#004d28] border-[#f8f8f6]/30 text-[#f8f8f6] placeholder:text-[#f8f8f6]/40 focus:border-[#fd8216] focus:ring-[#fd8216]"
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="rounded-lg border border-[#fd8216]/50 bg-[#fd8216]/10 p-4 text-sm text-[#f8f8f6]">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#fd8216] hover:bg-[#fd8216]/90 text-[#f8f8f6] font-medium py-3 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </Button>

            <p className="text-xs text-center text-[#f8f8f6]/60">
              Your information is secure and will only be used to provide you with our services.
            </p>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
