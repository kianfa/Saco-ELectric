export const manualCheckoutConfig = {
  telegram: {
    username: "YOUR_TELEGRAM_USERNAME",
    phone: "09XX XXX XXXX",
    url: "https://t.me/YOUR_TELEGRAM_USERNAME",
  },
  bale: {
    username: "YOUR_BALE_USERNAME",
    phone: "09XX XXX XXXX",
    url: "https://ble.ir/YOUR_BALE_USERNAME",
  },
} as const

export type ManualCheckoutConfig = typeof manualCheckoutConfig
