import { NextResponse } from 'next/server'
import { runPlanningCycle } from '@/lib/agent/orchestrator'

export async function POST() {
  let lastError: any = null

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await runPlanningCycle('manual')
      return NextResponse.json({
        success: true,
        message: attempt === 1 ? 'Planning cycle completed' : `Planning cycle completed after ${attempt} attempts`,
        ...result,
      })
    } catch (error: any) {
      lastError = error
      console.error(`Agent run attempt ${attempt} failed:`, error.message)
      const isRetryable = error.message?.includes('invalid plan structure') || error.message?.includes('Failed to parse JSON') || error.message?.includes('ZodError')
      if (!isRetryable || attempt === 2) break
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  }

  return NextResponse.json({ success: false, error: lastError?.message || 'Failed to run planning cycle', hint: 'The agent had trouble generating valid output. This can happen with complex context. Try again in a moment.' }, { status: 500 })
}
