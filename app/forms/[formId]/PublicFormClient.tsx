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
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E] p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <svg
                className="h-8 w-8 text-emerald-500"
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
            <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
            <p className="text-lg text-gray-300 mb-2">
              Your submission has been received.
            </p>
            <p className="text-sm text-gray-400">
              We'll review your information and get back to you within 24 hours.
            </p>
            <p className="mt-6 text-xs text-gray-500">
              Check your email for a confirmation and next steps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E] p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{formConfig.title}</h1>
          <p className="text-gray-300">{formConfig.description}</p>
        </div>

        <Card className="border-gray-800 bg-[#0F1729]">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {formConfig.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-white text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>

                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full bg-[#1A2332] border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                ) : field.type === 'select' && field.options ? (
                  <Select
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full bg-[#1A2332] border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="" className="bg-[#1A2332]">Select...</option>
                    {field.options.map((option) => (
                      <option key={option} value={option} className="bg-[#1A2332]">
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
                    className="w-full bg-[#1A2332] border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Form'}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Your information is secure and will only be used to provide you with our services.
            </p>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
