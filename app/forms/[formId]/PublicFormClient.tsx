'use client'

import { useState } from 'react'
import { Button } from '@/ui/button'
import { Card, CardContent } from '@/ui/card'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'

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

// Define form steps
const STEPS = [
  {
    id: 1,
    title: 'Your Info',
    description: 'Let\'s start with the basics',
    fields: ['clientName', 'contactName', 'contactEmail', 'contactPhone']
  },
  {
    id: 2,
    title: 'About Your Business',
    description: 'Tell us about your company',
    fields: ['industry', 'monthlyRevenue', 'teamSize']
  },
  {
    id: 3,
    title: 'Current Challenges',
    description: 'What\'s holding you back?',
    fields: ['painPoints', 'tried', 'urgency']
  },
  {
    id: 4,
    title: 'Your Vision',
    description: 'Where do you want to be?',
    fields: ['goals', 'timeline', 'budget', 'dataAccess', 'blockers']
  }
]

export default function PublicFormClient({ formConfig }: PublicFormClientProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, string | string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleMultiSelect = (name: string, value: string) => {
    const current = (formData[name] as string[]) || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    handleChange(name, updated)
  }

  const validateStep = (step: number) => {
    const currentStepFields = STEPS[step - 1].fields
    const stepFields = formConfig.fields.filter(field => currentStepFields.includes(field.name))

    for (const field of stepFields) {
      if (field.required && !formData[field.name]) {
        setError(`Please fill in: ${field.label}`)
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
      setError(null)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(currentStep)) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Format arrays as comma-separated strings for submission
      const submissionData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(', ') : value
        return acc
      }, {} as Record<string, string>)

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: formConfig.id,
          data: submissionData,
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

  const currentStepData = STEPS[currentStep - 1]
  const progress = (currentStep / STEPS.length) * 100

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#015e32] p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#fd8216] shadow-lg shadow-[#fd8216]/50 animate-in zoom-in duration-500">
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-[#fd8216]" />
              You&apos;re All Set!
            </h1>
            <p className="text-lg text-white/90 mb-2">
              Your submission has been received.
            </p>
            <p className="text-sm text-white/70">
              We&apos;ll analyze your information and reach out within 24 hours with actionable insights.
            </p>
            <p className="mt-6 text-xs text-white/50">
              Check your email for confirmation and next steps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentFields = formConfig.fields.filter(field =>
    currentStepData.fields.includes(field.name)
  )

  return (
    <div className="min-h-screen bg-[#015e32] p-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-[#fd8216]/20 border-2 border-[#fd8216]">
            <Sparkles className="h-4 w-4 text-[#fd8216]" />
            <span className="text-sm font-medium text-white">Revenue Growth Assessment</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{formConfig.title}</h1>
          <p className="text-white/90">{formConfig.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300
                    ${currentStep > step.id ? 'bg-[#fd8216] text-white shadow-lg shadow-[#fd8216]/30' :
                      currentStep === step.id ? 'bg-white text-[#015e32] shadow-lg' :
                      'bg-white/20 text-white/50'}
                  `}>
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors duration-300 hidden sm:block
                    ${currentStep === step.id ? 'text-white' : 'text-white/70'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step.id ? 'bg-[#fd8216]' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-[#fd8216] bg-white shadow-2xl overflow-hidden" style={{ borderWidth: '5px', borderColor: '#fd8216' }}>
          <CardContent className="p-8 bg-white">
            {/* Step Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#015e32] mb-1">
                Step {currentStep}: {currentStepData.title}
              </h2>
              <p className="text-[#015e32]/70">{currentStepData.description}</p>
            </div>

            {/* Form Fields */}
            <form onSubmit={(e) => {
              e.preventDefault()
              if (currentStep === STEPS.length) {
                handleSubmit(e)
              } else {
                handleNext()
              }
            }} className="space-y-6">
              {currentFields.map((field) => (
                <div key={field.name} className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                  <Label htmlFor={field.name} className="text-[#015e32] text-base font-semibold">
                    {field.label}
                    {field.required && <span className="text-[#fd8216] ml-1">*</span>}
                  </Label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      value={(formData[field.name] as string) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#015e32]/30 bg-[#004d28] text-[#f8f8f6] placeholder:text-[#f8f8f6]/50 focus:border-[#fd8216] focus:ring-2 focus:ring-[#fd8216]/20 transition-all outline-none"
                    />
                  ) : field.type === 'select' && field.options ? (
                    <select
                      id={field.name}
                      value={(formData[field.name] as string) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#015e32]/30 bg-[#004d28] text-[#f8f8f6] focus:border-[#fd8216] focus:ring-2 focus:ring-[#fd8216]/20 transition-all outline-none"
                    >
                      <option value="" className="bg-[#004d28]">Select an option...</option>
                      {field.options.map((option) => (
                        <option key={option} value={option} className="bg-[#004d28]">
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'radio' && field.options ? (
                    <div className="space-y-3">
                      {field.options.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData[field.name] === option
                              ? 'border-[#fd8216] bg-[#fd8216]/10'
                              : 'border-[#015e32]/30 hover:border-[#fd8216]/50 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name={field.name}
                            value={option}
                            checked={formData[field.name] === option}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            className="w-5 h-5 text-[#fd8216] focus:ring-[#fd8216]"
                          />
                          <span className="text-[#015e32] font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === 'checkbox' && field.options ? (
                    <div className="space-y-3">
                      {field.options.map((option) => {
                        const isChecked = (formData[field.name] as string[] || []).includes(option)
                        return (
                          <label
                            key={option}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isChecked
                                ? 'border-[#fd8216] bg-[#fd8216]/10'
                                : 'border-[#015e32]/30 hover:border-[#fd8216]/50 bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={option}
                              checked={isChecked}
                              onChange={() => handleMultiSelect(field.name, option)}
                              className="w-5 h-5 text-[#fd8216] rounded focus:ring-[#fd8216]"
                            />
                            <span className="text-[#015e32] font-medium">{option}</span>
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <input
                      id={field.name}
                      type={field.type}
                      value={(formData[field.name] as string) || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#015e32]/30 bg-[#004d28] text-[#f8f8f6] placeholder:text-[#f8f8f6]/50 focus:border-[#fd8216] focus:ring-2 focus:ring-[#fd8216]/20 transition-all outline-none"
                    />
                  )}
                </div>
              ))}

              {error && (
                <div className="rounded-lg border-2 border-[#fd8216] bg-[#fd8216]/10 p-4 text-sm text-[#015e32] font-medium animate-in shake">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 py-6 text-[#015e32] border-2 border-[#015e32]/20 hover:bg-[#015e32]/5 font-semibold text-lg"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-6 bg-gradient-to-r from-[#fd8216] to-[#ff9a3c] hover:from-[#ff9a3c] hover:to-[#fd8216] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all ${
                    currentStep === 1 ? 'w-full' : ''
                  }`}
                >
                  {isSubmitting ? (
                    'Processing...'
                  ) : currentStep === STEPS.length ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Submit Application
                    </>
                  ) : (
                    <>
                      Next Step
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-[#015e32]/60 pt-4">
                Your information is secure and will only be used to provide you with our services.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
