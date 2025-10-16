import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ASSISTANT_ID = 'asst_i5vAHTLNd8ktgpUYPEEzGmDw'

export async function POST(request: NextRequest) {
  try {
    const { message, threadId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create a new thread if one doesn't exist
    let currentThreadId = threadId
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create()
      currentThreadId = thread.id
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: message,
    })

    // Run the assistant
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: ASSISTANT_ID,
    })

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
      thread_id: currentThreadId,
    })

    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
        return NextResponse.json(
          { error: `Run ${runStatus.status}`, threadId: currentThreadId },
          { status: 500 }
        )
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000))
      runStatus = await openai.beta.threads.runs.retrieve(run.id, {
        thread_id: currentThreadId,
      })
    }

    // Get the assistant's messages
    const messages = await openai.beta.threads.messages.list(currentThreadId)

    // Get the latest assistant message
    const assistantMessage = messages.data.find(
      (msg) => msg.role === 'assistant' && msg.run_id === run.id
    )

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from assistant', threadId: currentThreadId },
        { status: 500 }
      )
    }

    // Extract text content
    const textContent = assistantMessage.content.find((content) => content.type === 'text')
    const responseText = textContent && textContent.type === 'text' ? textContent.text.value : ''

    return NextResponse.json({
      response: responseText,
      threadId: currentThreadId,
    })
  } catch (error: any) {
    console.error('OpenAI API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get response from assistant' },
      { status: 500 }
    )
  }
}
