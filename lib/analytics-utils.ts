import type { Sale, Cost, Product, Customer } from "./types"

// Calculate various metrics from business data
export function calculateMetrics(sales: Sale[], costs: Cost[], products: Product[], customers: Customer[]) {
  // Total Revenue - sum of all completed sales
  const totalRevenue = sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.total_amount, 0)

  // Total Expenses - sum of all costs
  const totalExpenses = costs.reduce((sum, c) => sum + c.amount, 0)

  // Gross Profit - revenue minus cost of goods sold
  const costOfGoodsSold = sales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => {
      const product = products.find((p) => p.id === s.product_id)
      return sum + (product ? product.cost_price * s.quantity : 0)
    }, 0)
  const grossProfit = totalRevenue - costOfGoodsSold

  // Net Profit - revenue - all expenses
  const netProfit = grossProfit - totalExpenses

  // Profit Margin % - (Revenue - Costs) / Revenue * 100
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  // ROI - (Profit / Total Investment) * 100
  const totalInvestment = totalExpenses + costOfGoodsSold
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0

  // Total Sales - count of completed sales
  const totalSales = sales.filter((s) => s.status === "completed").length

  // Total Customers - unique customers with completed sales
  const totalCustomers = new Set(sales.filter((s) => s.status === "completed").map((s) => s.customer_id)).size

  // Average Order Value - total revenue / number of orders
  const aov = totalSales > 0 ? totalRevenue / totalSales : 0

  // Top Product - product with most revenue
  const productRevenue: Record<string, number> = {}
  sales.forEach((s) => {
    if (s.status === "completed") {
      productRevenue[s.product_id] = (productRevenue[s.product_id] || 0) + s.total_amount
    }
  })
  const topProductId = Object.entries(productRevenue).sort(([, a], [, b]) => b - a)[0]?.[0]
  const topProduct = topProductId ? products.find((p) => p.id === topProductId) : undefined

  // Business Health Score - weighted index (0-100)
  // Factors: profit margin (40%), growth trend (30%), customer retention (20%), cost efficiency (10%)
  const profitMarginScore = Math.min(profitMargin + 50, 100) // Normalize to 0-100
  const growthTrendScore = calculateGrowthTrend(sales) * 100
  const customerRetentionScore =
    customers.length > 0 ? (customers.filter((c) => c.total_orders > 1).length / customers.length) * 100 : 0
  const costEfficiencyScore = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0

  const healthScore =
    profitMarginScore * 0.4 +
    growthTrendScore * 0.3 +
    customerRetentionScore * 0.2 +
    Math.min(costEfficiencyScore, 100) * 0.1

  const clv = calculateCLV(sales, customers)
  const cac = calculateCAC(costs, customers)
  const churnRate = calculateChurnRate(sales, customers)
  const retentionRate = calculateRetentionRate(sales, customers)

  const salesByCategory = calculateSalesByCategory(sales, products)
  const salesByChannel = calculateSalesByChannel(sales)
  const topCustomers = getTopCustomers(customers)
  const worstSellingProducts = getWorstSellingProducts(sales, products)
  
  // --- ADDED THIS LINE (it was missing) ---
  const profitPerProduct = calculateProfitPerProduct(sales, products)

  return {
    totalRevenue,
    totalExpenses,
    grossProfit,
    netProfit,
    profitMargin,
    roi,
    totalSales,
    totalCustomers,
    aov,
    topProduct,
    healthScore: Math.round(healthScore),
    clv,
    cac,
    churnRate,
    retentionRate,
    salesByCategory,
    salesByChannel,
    topCustomers,
    worstSellingProducts,
    profitPerProduct, // <-- ADDED THIS PROPERTY
  }
}

// Calculate growth trend (simplistic: compare last 7 days with previous 7 days)
function calculateGrowthTrend(sales: Sale[]): number {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const recentSales = sales.filter((s) => {
    const saleDate = new Date(s.date)
    return saleDate >= sevenDaysAgo && s.status === "completed"
  })

  const previousSales = sales.filter((s) => {
    const saleDate = new Date(s.date)
    return saleDate >= fourteenDaysAgo && saleDate < sevenDaysAgo && s.status === "completed"
  })

  const recentTotal = recentSales.reduce((sum, s) => sum + s.total_amount, 0)
  const previousTotal = previousSales.reduce((sum, s) => sum + s.total_amount, 0)

  if (previousTotal === 0) return 0
  return Math.min((recentTotal - previousTotal) / previousTotal, 1) // Cap at 1 (100%)
}

export function calculateCustomerSegments(customers: Customer[]) {
  const segments = {
    highSpenders: customers.filter((c) => c.total_spent > 10000).sort((a, b) => b.total_spent - a.total_spent),
    frequentBuyers: customers.filter((c) => c.total_orders > 5).sort((a, b) => b.total_orders - a.total_orders),
    oneTimeBuyers: customers.filter((c) => c.total_orders === 1),
    newCustomers: customers.filter((c) => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    byAge: {
      '18-25': customers.filter((c) => c.age !== undefined && c.age >= 18 && c.age <= 25),
      '26-35': customers.filter((c) => c.age !== undefined && c.age >= 26 && c.age <= 35),
      '36-45': customers.filter((c) => c.age !== undefined && c.age >= 36 && c.age <= 45),
      '46+': customers.filter((c) => c.age !== undefined && c.age >= 46),
    },
    byLocation: customers.reduce((acc, c) => {
      if (c.location) {
        acc[c.location] = (acc[c.location] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>),
  }
  return segments
}

export function calculateCLV(sales: Sale[], customers: Customer[]) {
  const completedSales = sales.filter(s => s.status === 'completed');
  if (completedSales.length === 0 || customers.length === 0) return 0;

  const aov = completedSales.reduce((sum, s) => sum + s.total_amount, 0) / completedSales.length
  const totalPurchases = customers.reduce((sum, c) => sum + c.total_orders, 0)
  const purchaseFrequency = totalPurchases / customers.length

  const customerLifespans = customers
    .map((c) => {
      const firstOrder = sales.find((s) => s.customer_id === c.id)
      const lastOrderDate = c.last_order_date ? new Date(c.last_order_date) : null
      
      if (firstOrder && lastOrderDate) {
        const firstOrderDate = new Date(firstOrder.date)
        const lifespanInDays = (lastOrderDate.getTime() - firstOrderDate.getTime()) / (1000 * 3600 * 24);
        if (lifespanInDays <= 0) return 1 / 365; // Min 1 day lifespan
        return lifespanInDays / 365; // in years
      } else if (firstOrder) {
        return 1 / 365; // Default to 1 day if only one order
      }
      return 0
    })
    .filter((lifespan) => lifespan > 0)

  if (customerLifespans.length === 0) return 0; // No valid lifespans

  const averageCustomerLifespan = customerLifespans.reduce((sum, l) => sum + l, 0) / customerLifespans.length

  const clv = aov * purchaseFrequency * averageCustomerLifespan
  return isNaN(clv) ? 0 : clv
}

export function calculateCAC(costs: Cost[], customers: Customer[]) {
  const marketingAndSalesCosts = costs
    .filter((c) => c.category === 'Marketing' || c.category === 'Sales')
    .reduce((sum, c) => sum + c.amount, 0)

  const newCustomers = customers.filter(
    (c) => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  ).length

  const cac = newCustomers > 0 ? marketingAndSalesCosts / newCustomers : 0
  return cac
}

export function calculateRetentionRate(sales: Sale[], customers: Customer[]) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const customersAtStartOfPeriod = customers.filter((c) => new Date(c.created_at) < sixtyDaysAgo).length
  if (customersAtStartOfPeriod === 0) return 0; // Can't retain 0 customers

  const customersAtEndOfPeriod = customers.filter((c) => new Date(c.created_at) < thirtyDaysAgo).length
  
  const newCustomersDuringPeriod = customers.filter(
    (c) => new Date(c.created_at) >= sixtyDaysAgo && new Date(c.created_at) < thirtyDaysAgo,
  ).length

  const retainedCustomers = customersAtEndOfPeriod - newCustomersDuringPeriod
  if (retainedCustomers < 0) return 0; // Cannot be negative

  const retentionRate = (retainedCustomers / customersAtStartOfPeriod) * 100
  return isNaN(retentionRate) ? 0 : retentionRate
}

export function calculateChurnRate(sales: Sale[], customers: Customer[]) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const customersAtStartOfPeriod = customers.filter((c) => new Date(c.created_at) < thirtyDaysAgo).length
  if (customersAtStartOfPeriod === 0) return 0;

  const churnedCustomers = customers.filter((c) => {
    // If created before the period
    if (new Date(c.created_at) < thirtyDaysAgo) {
      // And has no last order date, or last order was > 30 days ago
      if (!c.last_order_date) return true 
      const lastOrderDate = new Date(c.last_order_date)
      return lastOrderDate < thirtyDaysAgo
    }
    return false
  }).length

  const churnRate = (churnedCustomers / customersAtStartOfPeriod) * 100
  return isNaN(churnRate) ? 0 : churnRate
}

export function calculateRevenueGrowthRate(sales: Sale[], timeFrame: string): number {
  let startDate1: Date, endDate1: Date, startDate2: Date, endDate2: Date;
  const now = new Date();

  switch (timeFrame) {
    case "24h":
      endDate1 = now;
      startDate1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      endDate2 = startDate1;
      startDate2 = new Date(startDate1.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "3d":
      endDate1 = now;
      startDate1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      endDate2 = startDate1;
      startDate2 = new Date(startDate1.getTime() - 3 * 24 * 60 * 60 * 1000);
      break;
    case "7d":
      endDate1 = now;
      startDate1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate2 = startDate1;
      startDate2 = new Date(startDate1.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "15d":
      endDate1 = now;
      startDate1 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      endDate2 = startDate1;
      startDate2 = new Date(startDate1.getTime() - 15 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      endDate1 = now;
      startDate1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate2 = startDate1;
      startDate2 = new Date(startDate1.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "6m":
      endDate1 = now;
      startDate1 = new Date(new Date().setMonth(now.getMonth() - 6));
      endDate2 = startDate1;
      startDate2 = new Date(new Date().setMonth(new Date().getMonth() - 12));
      break;
    case "1y":
      endDate1 = now;
      startDate1 = new Date(new Date().setFullYear(now.getFullYear() - 1));
      endDate2 = startDate1;
      startDate2 = new Date(new Date().setFullYear(new Date().getFullYear() - 2));
      break;
    default:
      // Default to 30d
      endDate1 = now;
      startDate1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate2 = startDate1;
      startDate2 = new Date(startDate1.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const recentSales = sales.filter((s) => {
    const saleDate = new Date(s.date);
    return saleDate >= startDate1 && saleDate <= endDate1 && s.status === "completed";
  });

  const previousSales = sales.filter((s) => {
    const saleDate = new Date(s.date);
    return saleDate >= startDate2 && saleDate < endDate2 && s.status === "completed";
  });

  const recentTotal = recentSales.reduce((sum, s) => sum + s.total_amount, 0);
  const previousTotal = previousSales.reduce((sum, s) => sum + s.total_amount, 0);

  if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;
  return ((recentTotal - previousTotal) / previousTotal) * 100;
}

export function calculateSalesByCategory(sales: Sale[], products: Product[]) {
  const salesByCategory: Record<string, number> = {};
  sales.forEach((s) => {
    if (s.status === "completed") {
      const product = products.find((p) => p.id === s.product_id);
      if (product) {
        salesByCategory[product.category] = (salesByCategory[product.category] || 0) + s.total_amount;
      }
    }
  });
  return salesByCategory;
}

export function calculateSalesByRegion(sales: Sale[], customers: Customer[]) {
  const salesByRegion: Record<string, number> = {};
  sales.forEach((s) => {
    if (s.status === "completed") {
      const customer = customers.find((c) => c.id === s.customer_id);
      if (customer && customer.location) {
        salesByRegion[customer.location] = (salesByRegion[customer.location] || 0) + s.total_amount;
      }
    }
  });
  return salesByRegion;
}

export function calculateTotalUnitsSold(sales: Sale[]): number {
  return sales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.quantity, 0);
}

export function calculateProfitPerProduct(sales: Sale[], products: Product[]) {
  const profitPerProduct: Record<string, { name: string; profit: number }> = {};

  sales.forEach((s) => {
    if (s.status === "completed") {
      const product = products.find((p) => p.id === s.product_id);
      if (product) {
        const profit = (s.unit_price - product.cost_price) * s.quantity;
        if (profitPerProduct[product.id]) {
          profitPerProduct[product.id].profit += profit;
        } else {
          profitPerProduct[product.id] = {
            name: product.name,
            profit: profit,
          };
        }
      }
    }
  });

  return Object.values(profitPerProduct).sort((a, b) => b.profit - a.profit);
}

export function calculateSalesByChannel(sales: Sale[]) {
  const salesByChannel: Record<string, number> = {};
  sales.forEach((s) => {
    if (s.status === "completed" && s.sales_channel) {
      salesByChannel[s.sales_channel] = (salesByChannel[s.sales_channel] || 0) + s.total_amount;
    }
  });
  return salesByChannel;
}

export function getTopCustomers(customers: Customer[]) {
  return customers.sort((a, b) => b.total_spent - a.total_spent).slice(0, 10); // Changed to 10 for a better list
}

export function getBestSellingProduct(sales: Sale[], products: Product[]): Product | undefined {
  const productSales: { [key: string]: number } = {};

  sales.forEach(sale => {
    if (sale.status === "completed") {
      productSales[sale.product_id] = (productSales[sale.product_id] || 0) + sale.total_amount;
    }
  });

  let bestSellingProductId: string | null = null;
  let maxRevenue = 0;

  for (const productId in productSales) {
    if (productSales[productId] > maxRevenue) {
      maxRevenue = productSales[productId];
      bestSellingProductId = productId;
    }
  }

  return products.find(product => product.id === bestSellingProductId);
}

export function getWorstSellingProducts(sales: Sale[], products: Product[]): Product[] {
  const productSales: { [key: string]: number } = {};

  sales.forEach(sale => {
    if (sale.status === "completed") {
      productSales[sale.product_id] = (productSales[sale.product_id] || 0) + sale.total_amount;
    }
  });

  const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => a - b);

  const worstSellingProductIds = sortedProducts.slice(0, 5).map(([id]) => id);

  return worstSellingProductIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
}