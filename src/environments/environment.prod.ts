export const environment = {
  production: true,
  api: {
    baseUrl: 'http://192.168.50.98:8080/api',
    timeout: 30000, // 30 seconds
  },
  assets: {
    lottieAnimations: {
      success: 'https://lottie.host/4d6e93e8-7333-4a5e-9c89-6c5c9c5c5c5c/animation.json',
      error: 'https://lottie.host/8b2f6a1c-4d8f-4c3b-9a7e-1e2f3g4h5i6j/animation.json',
      warning: 'https://lottie.host/1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6/animation.json',
      info: 'https://lottie.host/6f7g8h9i-0j1k-2l3m-4n5o-p6q7r8s9t0u1/animation.json'
    }
  },
  features: {
    enableLogging: false, // Disable console logging in production
    enableDebugMode: false,
    enableOfflineSync: true,
    enablePushNotifications: true
  },
  app: {
    name: 'OLLO Lifestyle WebApp',
    version: '1.0.0'
  }
};