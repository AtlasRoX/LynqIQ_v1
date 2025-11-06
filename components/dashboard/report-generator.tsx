"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Loader2, Sparkles, AlertTriangle } from "lucide-react"
import { useState } from "react"
import type { Sale, Cost, Product, Customer, DashboardMetrics } from "@/lib/types"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Textarea } from "@/components/ui/textarea" // Import Textarea

interface ReportGeneratorProps {
  timeFrame: string
  sales: Sale[]
  costs: Cost[]
  products: Product[]
  customers: Customer[]
  metrics: DashboardMetrics
}

// --- Casting metrics to 'any' to access all properties from analytics-utils ---
type Metrics = DashboardMetrics & {
  topCustomers?: any[]
  profitPerProduct?: any[]
  worstSellingProducts?: Product[]
  salesByCategory?: Record<string, number>
  salesByChannel?: Record<string, number>
}

export function ReportGenerator({ timeFrame, sales, costs, products, customers, metrics: rawMetrics }: ReportGeneratorProps) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [aiError, setAiError] = useState("")
  
  const metrics = rawMetrics as Metrics // Cast to our extended type

  // --- HELPER: Formats to Taka, but uses 'en' logic for consistency ---
  const formatTaka = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      amount = 0;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // --- NEW: Step 1 - Generate AI Summary ---
  const handleGenerateSummary = async () => {
    setSummaryLoading(true)
    setAiError("")
    setAiSummary("")
    try {
      const response = await fetch("/api/generate-ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics, sales, costs, products, customers }),
      })

      // Try to get JSON regardless of status, as errors are also JSON
      const data = await response.json()

      if (!response.ok) {
        // If response is not OK, throw an error using the server's message
        throw new Error(data.details || data.error || "Failed to get AI insights. The server responded with an error.")
      }
      
      if (!data.insights) {
        throw new Error("No insights were returned from the AI.")
      }

      setAiSummary(data.insights)

    } catch (error: any) {
      console.error("Error generating AI summary:", error)
      // The error.message will now be the detailed one from the server
      setAiError(error.message) 
    } finally {
      setSummaryLoading(false)
    }
  }
  
  // --- NEW: Step 2 - Generate Premium PDF ---
  const generatePDF = () => {
    setPdfLoading(true)
    try {
      const doc = new jsPDF()
      const pageHeight = doc.internal.pageSize.height
      const pageWidth = doc.internal.pageSize.width
      const pageMargin = 18 // Standard margin
      let cursor = 0

      // --- PREMIUM DESIGN CONSTANTS ---
      const COLOR_PRIMARY = "#004A4E" // Dark Teal
      const COLOR_ACCENT = "#D4AF37" // Muted Gold
      const COLOR_TEXT_DARK = "#222222"
      const COLOR_TEXT_LIGHT = "#555555"
      const COLOR_BACKGROUND = "#F8F8F8"
      const FONT_HEADING = "Helvetica"
      const FONT_BODY = "Times-Roman"

      // --- HELPER: Draws a header on each page ---
      const addPageHeader = (title: string) => {
        doc.setFont(FONT_HEADING, "normal")
        doc.setFontSize(9)
        doc.setTextColor(COLOR_TEXT_LIGHT)
        doc.text("LynqIQ Premium Business Report", pageMargin, pageMargin)
        doc.text(title, pageWidth - pageMargin, pageMargin, { align: "right" })
        doc.setDrawColor(COLOR_ACCENT)
        doc.setLineWidth(0.5)
        doc.line(pageMargin, pageMargin + 4, pageWidth - pageMargin, pageMargin + 4)
        cursor = pageMargin + 20 // Set cursor below header
      }

      // --- HELPER: Draws a footer on each page ---
      const addPageFooter = () => {
        const pageCount = (doc.internal.pages.length - 1).toString()
        for (let i = 1; i <= parseInt(pageCount, 10); i++) {
          doc.setPage(i)
          doc.setFont(FONT_BODY, "normal")
          doc.setFontSize(9)
          doc.setTextColor(COLOR_TEXT_LIGHT)
          doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth - pageMargin,
            pageHeight - 15,
            { align: "right" }
          )
          doc.text(
            `© ${new Date().getFullYear()} LynqIQ & team Algoverse`,
            pageMargin,
            pageHeight - 15
          )
        }
      }
      
      // --- HELPER: Draws a "Stat Box" ---
      const drawStatBox = (x: number, y: number, w: number, title: string, value: string) => {
        doc.setFillColor(COLOR_BACKGROUND)
        doc.setDrawColor(COLOR_PRIMARY)
        doc.setLineWidth(0.2)
        doc.roundedRect(x, y, w, 28, 3, 3, "FD")
        
        doc.setFont(FONT_BODY, "normal")
        doc.setFontSize(10)
        doc.setTextColor(COLOR_TEXT_LIGHT)
        doc.text(title, x + 5, y + 10)

        doc.setFont(FONT_HEADING, "bold")
        doc.setFontSize(18)
        doc.setTextColor(COLOR_PRIMARY)
        doc.text(value, x + 5, y + 20)
      }
      
      // --- ENGLISH DATE ---
      const reportDate = new Date().toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // --- 1. TITLE PAGE (PREMIUM DESIGN) ---
      doc.setFillColor(COLOR_PRIMARY)
      doc.rect(0, 0, pageWidth / 2.8, pageHeight, "F") // Dark sidebar

      doc.setFont(FONT_HEADING, "bold")
      doc.setFontSize(40)
      doc.setTextColor("#FFFFFF")
      doc.text("LynqIQ", 25, 120)

      doc.setFont(FONT_HEADING, "normal")
      doc.setFontSize(12)
      doc.setTextColor("#FFFFFF")
      doc.text("Intelligent Business Management", 25, 130)

      const titleX = (pageWidth / 2.8) + 20
      doc.setFont(FONT_HEADING, "normal")
      doc.setFontSize(28)
      doc.setTextColor(COLOR_TEXT_DARK)
      doc.text("Business Performance", titleX, 120)
      doc.text("Report", titleX, 132)

      doc.setFont(FONT_BODY, "normal")
      doc.setFontSize(12)
      doc.setTextColor(COLOR_TEXT_LIGHT)
      doc.text(`Report Period: ${timeFrame}`, titleX, 150)
      doc.text(`Generated: ${reportDate}`, titleX, 157)
      
      doc.setFont(FONT_BODY, "italic")
      doc.setFontSize(12)
      doc.setTextColor(COLOR_TEXT_DARK)
      doc.text("Prepared by team Algoverse", titleX, 164)

      // --- 2. AI-GENERATED EXECUTIVE SUMMARY ---
      doc.addPage()
      addPageHeader("Executive Summary")
      
      doc.setFont(FONT_HEADING, "bold")
      doc.setFontSize(12)
      doc.setTextColor(COLOR_PRIMARY)
      doc.text("AI-Generated Summary", pageMargin, cursor)
      cursor += 8
      
      doc.setFont(FONT_BODY, "normal")
      doc.setFontSize(11)
      doc.setTextColor(COLOR_TEXT_DARK)
      const summaryLines = doc.splitTextToSize(aiSummary, pageWidth - (pageMargin * 2))
      doc.text(summaryLines, pageMargin, cursor)
      cursor += summaryLines.length * 5 + 10 // Add spacing

      // --- 3. KEY METRICS (Stat Box Dashboard) ---
      doc.addPage()
      addPageHeader("Financial Snapshot")

      const boxW = (pageWidth - (pageMargin * 2) - 10) / 2 // 2 boxes per row
      drawStatBox(pageMargin, cursor, boxW, "Total Revenue", formatTaka(metrics.totalRevenue))
      drawStatBox(pageMargin + boxW + 10, cursor, boxW, "Net Profit", formatTaka(metrics.netProfit))
      cursor += 38
      drawStatBox(pageMargin, cursor, boxW, "Profit Margin", `${(metrics.profitMargin || 0).toFixed(1)}%`)
      drawStatBox(pageMargin + boxW + 10, cursor, boxW, "Total Expenses", formatTaka(metrics.totalExpenses))
      cursor += 38
      drawStatBox(pageMargin, cursor, boxW, "Customer Lifetime Value (CLV)", formatTaka(metrics.clv))
      drawStatBox(pageMargin + boxW + 10, cursor, boxW, "Customer Acquisition Cost (CAC)", formatTaka(metrics.cac))
      cursor += 38
      drawStatBox(pageMargin, cursor, boxW, "Business Health Score", `${metrics.healthScore || 0}/100`)
      drawStatBox(pageMargin + boxW + 10, cursor, boxW, "Retention Rate", `${(metrics.retentionRate || 0).toFixed(1)}%`)


      // --- 4. TOP CUSTOMERS TABLE ---
      doc.addPage()
      addPageHeader("Customer & Product Insights")

      doc.setFont(FONT_HEADING, "bold")
      doc.setFontSize(14)
      doc.setTextColor(COLOR_TEXT_DARK)
      doc.text("Top 10 Customers by Revenue", pageMargin, cursor)
      cursor += 8

      autoTable(doc, {
        startY: cursor,
        head: [["Rank", "Customer Name", "Total Spent", "Total Orders"]],
        body: (metrics.topCustomers || []).slice(0, 10).map((c: any, idx: number) => [
          idx + 1,
          c.name,
          formatTaka(c.total_spent),
          c.total_orders,
        ]),
        theme: "striped",
        headStyles: { fillColor: COLOR_PRIMARY, textColor: "#FFFFFF" },
        didDrawPage: (data) => { if (data.cursor) cursor = data.cursor.y }
      })

      // --- 5. TOP PRODUCTS TABLE ---
      cursor += 15
      doc.setFont(FONT_HEADING, "bold")
      doc.setFontSize(14)
      doc.setTextColor(COLOR_TEXT_DARK)
      doc.text("Top 5 Profitable Products", pageMargin, cursor)
      cursor += 8

      autoTable(doc, {
        startY: cursor,
        head: [["Product Name", "Total Profit"]],
        body: (metrics.profitPerProduct || []).slice(0, 5).map((p: any) => [
          p.name,
          formatTaka(p.profit)
        ]),
        theme: "striped",
        headStyles: { fillColor: COLOR_PRIMARY, textColor: "#FFFFFF" },
        didDrawPage: (data) => { if (data.cursor) cursor = data.cursor.y }
      })

      // --- 6. SALES BY CATEGORY (Simulated Bar Chart) ---
      doc.addPage()
      addPageHeader("Sales Breakdown")

      doc.setFont(FONT_HEADING, "bold")
      doc.setFontSize(14)
      doc.setTextColor(COLOR_TEXT_DARK)
      doc.text("Sales by Category", pageMargin, cursor)
      cursor += 10
      
      const categoryData = Object.entries(metrics.salesByCategory || {}).sort(([, a], [, b]) => (b as number) - (a as number))
      const maxCategoryValue = Math.max(...categoryData.map(([, v]) => v as number))
      const chartWidth = pageWidth - (pageMargin * 2) - 50 // Width of the chart area
      
      doc.setFont(FONT_BODY, "normal")
      doc.setFontSize(10)
      
      for (const [name, value] of categoryData) {
        if (cursor > pageHeight - 40) { // Check for page break
          doc.addPage()
          addPageHeader("Sales Breakdown (cont.)")
        }
        const barWidth = (value as number / maxCategoryValue) * chartWidth
        doc.setTextColor(COLOR_TEXT_DARK)
        doc.text(name, pageMargin, cursor + 6)
        
        // Draw the bar
        doc.setFillColor(COLOR_ACCENT)
        doc.rect(pageMargin + 50, cursor, barWidth, 8, "F")
        
        doc.setTextColor(COLOR_TEXT_LIGHT)
        doc.text(formatTaka(value as number), pageMargin + 55 + barWidth, cursor + 6)
        
        cursor += 15
      }

      // --- 7. KEY RECOMMENDATIONS ---
      doc.addPage()
      addPageHeader("Key Recommendations")
      
      const recommendations = generateRecommendations(metrics, sales, costs, products, customers)
      
      for (const rec of recommendations) {
        if (cursor > pageHeight - 40) { // Check for page break
          doc.addPage()
          addPageHeader("Key Recommendations (cont.)")
        }
        
        doc.setFont(FONT_HEADING, "bold")
        doc.setFontSize(14)
        doc.setTextColor(COLOR_PRIMARY)
        doc.text("•", pageMargin, cursor)
        
        doc.setFont(FONT_BODY, "normal")
        doc.setFontSize(11)
        doc.setTextColor(COLOR_TEXT_DARK)
        const splitText = doc.splitTextToSize(rec, pageWidth - pageMargin - pageMargin - 8)
        doc.text(splitText, pageMargin + 8, cursor)
        
        cursor += (splitText.length * 5) + 8 // Add spacing for next bullet
      }

      // --- FINAL STEP: ADD FOOTERS & SAVE ---
      addPageFooter()
      doc.save(`LynqIQ_Premium_Report_${new Date().toISOString().split('T')[0]}.pdf`)

    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Premium AI Report</CardTitle>
              <CardDescription>Generate a multi-page PDF with AI-powered insights</CardDescription>
            </div>
          </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- STEP 1: AI SUMMARY --- */}
        <div className="space-y-3">
          <label className="font-semibold text-sm">Step 1: Generate AI Summary</label>
          <p className="text-sm text-muted-foreground">
            Click to generate an AI-powered executive summary based on your current data.
          </p>
          <Button onClick={handleGenerateSummary} disabled={summaryLoading} className="w-full gap-2">
            {summaryLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Data...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Summary
              </>
            )}
          </Button>
          
          {aiError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {/* This will now show the detailed server error */}
              <p className="break-all">{aiError}</p>
            </div>
          )}
          
          {aiSummary && (
            <Textarea
              className="mt-2 h-36"
              value={aiSummary}
              readOnly
              placeholder="AI Summary will appear here..."
            />
          )}
        </div>
        
        {/* --- STEP 2: DOWNLOAD PDF --- */}
        <div className="space-y-3">
          <label className="font-semibold text-sm">Step 2: Download PDF Report</label>
          <p className="text-sm text-muted-foreground">
            Once the summary is generated, you can download the full premium report.
          </p>
          <Button 
            onClick={generatePDF} 
            disabled={!aiSummary || pdfLoading || summaryLoading} 
            className="w-full gap-2"
          >
            {pdfLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Building PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Premium PDF
              </>
            )}
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}

// We need this function here, as the API route is gone.
function generateRecommendations(
  metrics: DashboardMetrics,
  sales: Sale[],
  costs: Cost[],
  products: Product[],
  customers: Customer[],
): string[] {
  const recommendations: string[] = []
  
  if (!metrics) return ["No metrics available to generate recommendations."];

  // Profit recommendations
  if (metrics.netProfit < 0) {
    recommendations.push("URGENT: Business is operating at a loss. Reduce expenses immediately or increase prices.")
  } else if (metrics.profitMargin < 10) {
    recommendations.push("Profit margin is below 10%. Consider pricing optimization or cost reduction strategies.")
  } else if (metrics.profitMargin > 30) {
    recommendations.push("Strong profit margins. Consider reinvesting in business growth and marketing.")
  }

  // Revenue recommendations
  if (sales.filter((s) => s.status === "completed").length < 10) {
    recommendations.push("Build sales momentum. Focus on customer acquisition and marketing campaigns.")
  } else if (sales.filter((s) => s.status === "completed").length > 100) {
    recommendations.push("Strong sales performance. Optimize operations to maintain quality while scaling.")
  }

  // Expense recommendations
  if (metrics.totalRevenue > 0) {
    const expenseRatio = metrics.totalExpenses / metrics.totalRevenue
    if (expenseRatio > 0.6) {
      recommendations.push("Expenses are too high relative to revenue. Audit all spending categories for optimization.")
    } else if (expenseRatio < 0.3) {
      recommendations.push("Low expense ratio indicates efficiency. Ensure you're not under-investing in growth.")
    }
  } else if (metrics.totalExpenses > 0) {
      recommendations.push("You have expenses but no revenue. Investigate revenue generation immediately.")
  }

  // Customer recommendations
  const totalCustomers = customers.length
  if (totalCustomers > 0) {
      const repeatCustomers = customers.filter((c: Customer) => c.total_orders > 1).length
      const retentionRate = repeatCustomers / totalCustomers
      if (retentionRate < 0.3) {
          recommendations.push("Low customer retention rate. Implement loyalty programs and improve customer experience.")
      } else if (retentionRate > 0.6) {
          recommendations.push("Excellent customer loyalty. Leverage this for upselling and premium offerings.")
      }
  } else {
      recommendations.push("No customer data available. Focus on acquiring your first customers.")
  }

  // Product recommendations
  const lowMarginProducts = products.filter((p: Product) => {
    if (p.sell_price === 0) return false;
    const margin = ((p.sell_price - p.cost_price) / p.sell_price) * 100
    return margin < 15
  })

  if (lowMarginProducts.length > 0) {
    recommendations.push(
      `Review pricing strategy for ${lowMarginProducts.length} low-margin products. Consider price increases or bundling.`,
    )
  }

  // Growth recommendation
  if (recommendations.length < 5) {
    recommendations.push("Monitor market trends and consider product diversification for sustainable growth.")
  }
  
  if (recommendations.length === 0) {
    return ["Business data looks stable. Continue monitoring key metrics and customer feedback."]
  }

  return recommendations
}