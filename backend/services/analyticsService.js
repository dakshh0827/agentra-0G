import prisma from '../lib/prisma.js'

class AnalyticsService {
  _toWei(value) {
    if (value === null || value === undefined || value === '') return 0n
    try {
      return BigInt(value)
    } catch {
      return 0n
    }
  }

  calculateScore(agent) {
    const voteFactor = Math.min(100, agent.upvotes || 0) * 0.35
    const usageFactor = Math.min(100, (agent.calls || 0) / 1000) * 0.3

    const revenueNum = Number(agent.revenue || '0') / 1e18
    const revenueFactor = Math.min(100, revenueNum / 100) * 0.2

    const purchaseFactor = Math.min(100, (agent.purchaseCount || 0) / 100) * 0.05

    const successFactor = (agent.successRate || 0) * 0.1

    return parseFloat((voteFactor + usageFactor + revenueFactor + purchaseFactor + successFactor).toFixed(2))
  }

  async updateLeaderboardScores() {
    const agents = await prisma.agent.findMany({
      where: { status: { not: 'inactive' } },
    }) 
 
    const updates = agents.map(agent => {
      const score = this.calculateScore(agent)

      return prisma.agent.update({
        where: { id: agent.id },
        data: { score },
      })
    })

    await prisma.$transaction(updates)
    console.log(`[ANALYTICS] Updated scores for ${updates.length} agents`)
    return updates.length
  }

  async getLeaderboard(limit = 50) {
    return prisma.agent.findMany({
      where: { status: { not: 'inactive' } },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        metrics: true,
      },
    })
  }

  async getDashboard(walletAddress) {
    const wallet = walletAddress.toLowerCase()

    const [agents, transactions, recentInteractions, globalStats] = await prisma.$transaction([
      prisma.agent.findMany({
        where: { ownerWallet: wallet },
        include: { metrics: true },
      }),
      prisma.transaction.findMany({
        where: {
          ownerWallet: wallet,
          status: { in: ['confirmed', 'pending'] },
          type: { in: ['purchase_access', 'agent_to_agent', 'call'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 300,
      }),
      prisma.interaction.findMany({
        where: {
          agent: { ownerWallet: wallet },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { agent: { select: { name: true, agentId: true } } },
      }),
      prisma.globalStats.findUnique({ where: { id: 'global' } }),
    ])

    const txRevenueWei = (tx) => this._toWei(tx.creatorAmount || tx.totalAmount || '0')

    const totalRevenueWei = transactions.reduce((s, t) => s + txRevenueWei(t), 0n)

    const callCounts = await prisma.interaction.groupBy({
      by: ['agentId'],
      where: {
        agentId: { in: agents.map(a => a.agentId) },
      },
      _count: { agentId: true },
    })

    const callCountMap = callCounts.reduce((acc, row) => {
      acc[row.agentId] = row._count.agentId
      return acc
    }, {})

    const purchaseCounts = await prisma.agentPurchase.groupBy({
      by: ['agentId'],
      where: {
        agentId: { in: agents.map(a => a.agentId) },
      },
      _count: { agentId: true },
    })

    const purchaseCountMap = purchaseCounts.reduce((acc, row) => {
      acc[row.agentId] = row._count.agentId
      return acc
    }, {})

    const totalRevenue = Number(totalRevenueWei) / 1e18
    const totalCalls = agents.reduce((s, a) => s + (callCountMap[a.agentId] ?? a.calls ?? 0), 0)
    const totalPurchases = agents.reduce((s, a) => s + (purchaseCountMap[a.agentId] ?? a.purchaseCount ?? 0), 0)
    const avgSuccessRate = agents.length > 0
      ? agents.reduce((s, a) => s + a.successRate, 0) / agents.length
      : 0

    const revenueByDay = this._groupRevenueSeries(transactions, 14)

    // Agent performance chart data
    const agentPerf = agents.map(a => ({
      name: a.name.length > 10 ? a.name.slice(0, 10) + '…' : a.name,
      calls: callCountMap[a.agentId] ?? a.calls ?? 0,
      revenue: parseFloat((Number(a.revenue || '0') / 1e18).toFixed(4)),
    }))

    const activityFeed = [
      ...recentInteractions.map(i => ({
        createdAt: i.createdAt,
        kind: 'interaction',
        text: `${i.agent?.name || 'Agent'} executed${i.callerWallet ? ` by ${i.callerWallet.slice(0, 8)}...` : ''}`,
      })),
      ...transactions.map(tx => ({
        createdAt: tx.createdAt,
        kind: 'transaction',
        text: `${tx.type === 'purchase_access' ? 'Purchase' : tx.type === 'agent_to_agent' ? 'Agent-to-agent call' : 'Call'} ${tx.ownerWallet ? `for ${tx.ownerWallet.slice(0, 8)}...` : ''}`,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)

    return {
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(6)),
        totalCalls,
        totalPurchases,
        agentCount: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        successRate: parseFloat(avgSuccessRate.toFixed(2)),
      },
      agents,
      revenueData: revenueByDay,
      agentPerf,
      activityFeed,
      globalStats,
    }
  }

  async getGlobalStats() {
    const [stats, agentCounts, topCategory] = await prisma.$transaction([
      prisma.globalStats.findUnique({ where: { id: 'global' } }),
      prisma.agent.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.agent.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ])

    return {
      ...stats,
      agentsByStatus: agentCounts.reduce((acc, row) => {
        acc[row.status] = row._count.id
        return acc
      }, {}),
      topCategories: topCategory.map(row => ({
        category: row.category,
        count: row._count.id,
      })),
    }
  }

  async getAgentMetrics(agentId) {
    const normalized = String(agentId || '').trim()
    const isContractAgentId = /^\d+$/.test(normalized)

    const agent = await prisma.agent.findFirst({
      where: isContractAgentId
        ? { OR: [{ id: normalized }, { agentId: normalized }, { contractAgentId: Number(normalized) }] }
        : { OR: [{ id: normalized }, { agentId: normalized }] },
      include: {
        metrics: true,
      },
    })

    if (!agent) throw Object.assign(new Error('Agent not found'), { status: 404 })

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const recentInteractions = await prisma.interaction.findMany({
      where: { agentId: agent.agentId, createdAt: { gte: yesterday } },
      orderBy: { createdAt: 'desc' },
      select: { latency: true, status: true, createdAt: true },
    })

    const latencies = recentInteractions
      .filter(i => i.latency)
      .map(i => i.latency)

    const p50 = this._percentile(latencies, 50)
    const p95 = this._percentile(latencies, 95)
    const p99 = this._percentile(latencies, 99)

    return {
      agent,
      votes: {
        upvotes: agent.upvotes,
        downvotes: 0,
        total: agent.upvotes,
      },
      latencyPercentiles: { p50, p95, p99 },
      last24h: {
        calls: recentInteractions.length,
        successRate: recentInteractions.length
          ? (
              (recentInteractions.filter(i => i.status === 'success').length /
                recentInteractions.length) *
              100
            ).toFixed(2)
          : 100,
      },
    }
  }

  _groupRevenueSeries(transactions, days = 14) {
    const sorted = [...transactions]
      .filter(tx => tx?.createdAt)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    const end = new Date()
    end.setHours(0, 0, 0, 0)

    const start = new Date(end)
    start.setDate(start.getDate() - (days - 1))

    const dayMap = new Map()
    for (const tx of sorted) {
      const day = new Date(tx.createdAt)
      day.setHours(0, 0, 0, 0)

      if (day < start || day > end) continue

      const key = day.toISOString().split('T')[0]
      const amountWei = this._toWei(tx.creatorAmount || tx.totalAmount || '0')
      const current = dayMap.get(key) || { revenueWei: 0n, transactions: 0 }
      dayMap.set(key, {
        revenueWei: current.revenueWei + amountWei,
        transactions: current.transactions + 1,
      })
    }

    const result = []

    for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const dayKey = cursor.toISOString().split('T')[0]
      const dayInfo = dayMap.get(dayKey) || { revenueWei: 0n, transactions: 0 }

      result.push({
        label: cursor.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        day: cursor.toLocaleDateString('en', { weekday: 'short' }),
        date: dayKey,
        eth: parseFloat((Number(dayInfo.revenueWei) / 1e18).toFixed(6)),
        transactions: dayInfo.transactions,
      })
    }

    return result
  }

  _percentile(arr, p) {
    if (!arr.length) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)]
  }
}

export default new AnalyticsService()