export const config = {
  app: {
    name: 'IRLobby Admin',
    version: '1.0.0',
  },
  
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.irlobby.com',
    timeout: 30000,
  },
  
  features: {
    aiAssistant: true,
    analytics: true,
    moderation: true,
    userManagement: true,
  },
  
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
} as const
