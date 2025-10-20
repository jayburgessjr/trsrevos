import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const MISSING_API_KEY_RESPONSE = NextResponse.json(
  { error: 'OpenAI API key is not configured' },
  { status: 500 }
)

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('OpenAI API key missing during /api/content/generate invocation')
      return MISSING_API_KEY_RESPONSE
    }

    const openai = new OpenAI({
      apiKey,
    })

    const { title, type, instructions, sourceProject } = await request.json()

    if (!title || !instructions) {
      return NextResponse.json(
        { error: 'Title and instructions are required' },
        { status: 400 }
      )
    }

    // Create a prompt based on the content type
    const systemPrompt = `You are a professional content writer for a Revenue Operations consulting firm. Generate high-quality, professional content based on the user's instructions.`

    const userPrompt = `Create a ${type} titled "${title}"${sourceProject ? ` for the project: ${sourceProject}` : ''}.

Instructions:
${instructions}

Please generate complete, polished content that is ready to use. Format it appropriately for a ${type}.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
    })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
