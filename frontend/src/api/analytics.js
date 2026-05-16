import api from './axios'

export const analyticsAPI = {
  getLeaderboard: (params) =>
    api.get('/leaderboard', {
      params: {
        ...(params || {}),
        _t: Date.now(),
      },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    }),

  getDashboard: (wallet) =>
    api.get('/analytics/dashboard', {
      params: {
        _t: Date.now(),
      },
      headers: {
        'x-wallet-address': wallet,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    }),

  getGlobalStats: () => api.get('/analytics/global'),

  getLeaderboardStats: () => api.get('/leaderboard/stats'),

  getTopAgents: (n = 10) => api.get(`/leaderboard/top/${n}`),

  getLeaderboardByCategory: (category) =>
    api.get(`/leaderboard/category/${category}`),

  getAgentRank: (id) => api.get(`/leaderboard/agent/${id}/rank`),

  recalculateScores: () => api.post('/leaderboard/recalculate'),
}