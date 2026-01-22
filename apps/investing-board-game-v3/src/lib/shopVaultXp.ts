const VAULT_PURCHASE_XP_MIN = 25
const VAULT_PURCHASE_XP_RATE = 0.05

export const getVaultPurchaseXp = (price: number) => {
  return Math.max(VAULT_PURCHASE_XP_MIN, Math.ceil(price * VAULT_PURCHASE_XP_RATE))
}
