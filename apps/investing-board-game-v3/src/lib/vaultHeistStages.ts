import { VAULT_HEIST_ALARM_WEIGHTS } from './vaultHeistRewards'

export type VaultHeistStageId = 1 | 2 | 3

export interface VaultHeistStage {
  id: VaultHeistStageId
  name: string
  description: string
  alarmWeight: number
  rewardMultiplier: number
  alarmRiskLabel: 'Low' | 'Medium' | 'High'
}

export const VAULT_HEIST_STAGES: VaultHeistStage[] = [
  {
    id: 1,
    name: 'Soft Entry',
    description: 'Higher safety, lighter payout.',
    alarmWeight: VAULT_HEIST_ALARM_WEIGHTS[1],
    rewardMultiplier: 1,
    alarmRiskLabel: 'Low',
  },
  {
    id: 2,
    name: 'Deeper Cut',
    description: 'Balanced risk with better loot.',
    alarmWeight: VAULT_HEIST_ALARM_WEIGHTS[2],
    rewardMultiplier: 1.25,
    alarmRiskLabel: 'Medium',
  },
  {
    id: 3,
    name: 'High Stakes',
    description: 'Big rewards, highest alarm chance.',
    alarmWeight: VAULT_HEIST_ALARM_WEIGHTS[3],
    rewardMultiplier: 1.5,
    alarmRiskLabel: 'High',
  },
]

export const getVaultHeistStage = (picksUsed: number): VaultHeistStage => {
  const index = Math.min(picksUsed, VAULT_HEIST_STAGES.length - 1)
  return VAULT_HEIST_STAGES[index]
}
