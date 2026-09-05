// Bulk cost split calculator + transport share allocation + demand forecasting.
// Fulfills hackathon requirement: calculating each person's material cost and fair transport share,
// with Buy-Alone vs Group-Buy comparison and quotation validity.

export function splitCost(totalQuantity, pricePerUnit, requests, transportCharge = 0) {
  const materialTotal = totalQuantity * pricePerUnit
  const transportTotal = Number(transportCharge) || 0
  const grandTotal = materialTotal + transportTotal

  const perArtisan = requests.map((r) => {
    const share = totalQuantity > 0 ? Number(r.quantity) / totalQuantity : 0
    const materialCost = Math.round(share * materialTotal)
    const transportShare = Math.round(share * transportTotal)
    const totalCost = materialCost + transportShare
    return {
      artisanId: r.artisanId,
      quantity: Number(r.quantity),
      share,
      materialCost,
      transportShare,
      cost: totalCost, // maintained for backward compatibility
      totalCost,
    }
  })

  return {
    materialTotal: Math.round(materialTotal),
    transportTotal: Math.round(transportTotal),
    totalCost: Math.round(grandTotal),
    perArtisan,
  }
}

// Standalone "Buy Alone" pricing comparison helper
export function compareSoloVsGroup(quantity, bulkPricePerUnit, soloPricePerUnit = null, bulkTransportCharge = 0, requests = []) {
  // Solo purchase: typically 20-25% higher retail price per unit + full individual transport charge
  const retailPrice = soloPricePerUnit || Math.round(bulkPricePerUnit * 1.22)
  const soloTransport = Math.round(bulkTransportCharge * 0.85) || 300 // single trip transport
  const soloMaterialCost = quantity * retailPrice
  const soloTotal = soloMaterialCost + soloTransport

  // Group share for this artisan:
  const groupTotalQty = requests.reduce((sum, r) => sum + Number(r.quantity), 0) || quantity
  const share = groupTotalQty > 0 ? quantity / groupTotalQty : 1
  const groupMaterialCost = Math.round(quantity * bulkPricePerUnit)
  const groupTransportShare = Math.round(share * bulkTransportCharge)
  const groupTotal = groupMaterialCost + groupTransportShare

  const savings = Math.max(0, soloTotal - groupTotal)
  const savingsPct = soloTotal > 0 ? Math.round((savings / soloTotal) * 100) : 0

  return {
    solo: {
      unitPrice: retailPrice,
      materialCost: soloMaterialCost,
      transport: soloTransport,
      total: soloTotal,
    },
    group: {
      unitPrice: bulkPricePerUnit,
      materialCost: groupMaterialCost,
      transportShare: groupTransportShare,
      total: groupTotal,
    },
    savings,
    savingsPct,
  }
}

function seededRandom(seedStr) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) {
    h = (h << 5) - h + seedStr.charCodeAt(i)
    h |= 0
  }
  return (dayOffset) => {
    const x = Math.sin(h + dayOffset * 999) * 10000
    return x - Math.floor(x)
  }
}

// Returns a 4-day outlook: { day, pricePct, demand, availability }
export function forecastOutlook(materialKey) {
  const rand = seededRandom(materialKey)
  const days = ['Today', 'Day 2', 'Day 3', 'Day 4']
  let runningPct = 0
  return days.map((label, i) => {
    const r = rand(i)
    const swing = Math.round((r - 0.5) * 18) // -9% .. +9% per step
    runningPct += swing
    const demandScore = r
    const demand = demandScore > 0.66 ? 'High' : demandScore > 0.33 ? 'Steady' : 'Low'
    const availability = runningPct > 6 ? 'Tight' : runningPct < -6 ? 'Plentiful' : 'Moderate'
    return {
      day: label,
      pricePct: runningPct,
      demand,
      availability,
    }
  })
}
