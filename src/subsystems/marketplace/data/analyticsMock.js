// Mock data for analytics dashboard
export const analytics = {
  org: { 
    name: 'QCU Computer Society (QCS)', 
    location: 'AWS IK Building, Basement, Booth No. 3' 
  },
  period: { 
    label: 'Nov 1 – Nov 7, 2026', 
    start: '2026-11-01', 
    end: '2026-11-07' 
  },

  kpis: {
    grossRevenue: 58420,
    netRevenue: 52150,
    revenueChangePct: 14.2,
    completedOrders: 142,
    ordersChangePct: 8.5,
    avgOrderValue: 411.4,
    conversionRatePct: 7.7,
    conversionChangePct: 0.8,
    uniqueVisitors: 1840,
  },

  criticalStock: {
    productName: 'QCU CCS Official Org Hoodie',
    unitsLeft: 8,
    note: 'High velocity line',
  },

  weeklySales: [
    { id: 'w1', label: 'W1 (Nov 1-7)',   tag: 'Current Week',  revenue: 11400 },
    { id: 'w2', label: 'W2 (Oct 25-31)',  tag: 'Last Week',     revenue: 13950 },
    { id: 'w3', label: 'W3 (Oct 18-24)', tag: 'Regular',      revenue: 14870 },
    { id: 'w4', label: 'W4 (Oct 11-17)', tag: 'Promo Week', revenue: 18200 },
  ],
  projectedNovember: 62000,

  topProducts: [
    { 
      id: 'hoodie',   
      name: 'QCU CCS Official Org Hoodie', 
      unit: 'units', 
      sold: 54, 
      marginPct: 42.5, 
      revenue: 35100, 
      stockLabel: '8 left (Low)', 
      tone: 'amber',   
      dot: 'bg-[#0091FF]' 
    },
    { 
      id: 'lanyard',  
      name: 'Tech Summit 2024 Lanyard',    
      unit: 'packs', 
      sold: 68, 
      marginPct: 51.0, 
      revenue: 12240, 
      stockLabel: 'High Volume',  
      tone: 'blue',    
      dot: 'bg-cyan-500' 
    },
    { 
      id: 'stickers', 
      name: 'CS Programmer Sticker Sheet', 
      unit: 'packs', 
      sold: 45, 
      marginPct: 68.2, 
      revenue: 6525,  
      stockLabel: 'Safe Buffer',  
      tone: 'emerald', 
      dot: 'bg-amber-400' 
    },
  ],

  traffic: {
    total: 1840,
    channels: [
      { 
        id: 'qr',     
        label: 'Campus QR Codes (Flyers & Booths)', 
        visits: 846, 
        color: 'bg-[#0091FF]', 
        dot: 'bg-[#0091FF]' 
      },
      { 
        id: 'social', 
        label: 'Org Socials (Facebook & Discord)',  
        visits: 625, 
        color: 'bg-cyan-500',  
        dot: 'bg-cyan-500' 
      },
      { 
        id: 'direct', 
        label: 'Booth Walk-in & Direct URL',        
        visits: 369, 
        color: 'bg-slate-400', 
        dot: 'bg-slate-400' 
      },
    ],
    insight: 'Physical QR posters placed at IK Building basement & lobby.',
  },

  actions: [
    { 
      id: 'restock',  
      severity: 'urgent', 
      title: 'Hoodie Re-order Required',
      body: 'Only 8 units in stock. Estimated stockout in 48 hours based on current velocity.',
      cta: 'Order Restock', 
      to: '/inventory', 
      variant: 'primary' 
    },
    { 
      id: 'lanyards', 
      severity: 'info',   
      title: 'Tech Summit Lanyard Pre-orders',
      body: 'Peak velocity on Wednesdays (+380 visits). Open second batch ordering.',
      cta: 'Manage Batch', 
      to: '/orders', 
      variant: 'secondary' 
    },
  ],

  nextReview: 'Nov 4, 2024',
}
