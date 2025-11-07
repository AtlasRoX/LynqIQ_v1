import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// This will now correctly load from your .env.local file after a server restart
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: Request) {
  const { sales, costs, products, customers, metrics } = await request.json()

  const prompt = `
    You are an expert business analyst. Analyze the following business data and provide a concise, professional executive summary.

    **Business Data Summary:**
    - **Key Metrics:** ${JSON.stringify(metrics, null, 2)}
    - **Sample Sales:** ${JSON.stringify(sales.slice(0, 5), null, 2)} (first 5 sales)
    - **Sample Costs:** ${JSON.stringify(costs.slice(0, 5), null, 2)} (first 5 costs)

    **Instructions:**
    Write a 3-paragraph executive summary in plain text.
    1.  Start with a general overview of the business health (Net Profit, Revenue, and Health Score).
    2.  Identify the single biggest opportunity or strength (e.g., "Strong customer retention") and the single biggest risk (e.g., "High expenses").
    3.  Conclude with a key actionable recommendation.
    
    Speak in a professional, direct, and analytical tone. Do not use markdown, backticks, or any formatting. Just return the raw text summary.
  `

  try {
    // This model will be found and authenticated correctly
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = await response.text()

    return NextResponse.json({ insights: text })
  } catch (error: any) {
    console.error('Error generating AI insights:', error.message)
    return NextResponse.json(
      {
        error: 'Failed to generate AI insights from model',
        details: error.message || 'Unknown server error',
      },
      { status: 500 },
    )
  }
}