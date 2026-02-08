export interface VaultHeistModifier {
  id: string
  name: string
  description: string
  alarmWeightDelta: number
  rewardMultiplierDelta: number
}

export interface VaultHeistAdjustedOdds {
  alarmWeight: number
  rewardMultiplier: number
}

export const VAULT_HEIST_CREWS: VaultHeistModifier[] = [
  {
    id: 'none',
    name: 'No Crew',
    description: 'Baseline odds with a solo run.',
    alarmWeightDelta: 0,
    rewardMultiplierDelta: 0,
  },
  {
    id: 'ghosts',
    name: 'Ghosts',
    description: 'Silent entry lowers risk but trims the take.',
    alarmWeightDelta: -2,
    rewardMultiplierDelta: -0.1,
  },
  {
    id: 'hackers',
    name: 'Hackers',
    description: 'Smart hacks reduce alarms with a modest boost.',
    alarmWeightDelta: -1,
    rewardMultiplierDelta: 0.05,
  },
  {
    id: 'muscle',
    name: 'Muscle',
    description: 'Loud entry raises alarms for bigger payouts.',
    alarmWeightDelta: 1,
    rewardMultiplierDelta: 0.15,
  },
]

export const VAULT_HEIST_GEAR: VaultHeistModifier[] = [
  {
    id: 'none',
    name: 'Standard Kit',
    description: 'No special gear adjustments.',
    alarmWeightDelta: 0,
    rewardMultiplierDelta: 0,
  },
  {
    id: 'silent-drill',
    name: 'Silent Drill',
    description: 'Quieter tools cut alarms and add a small bonus.',
    alarmWeightDelta: -1,
    rewardMultiplierDelta: 0.05,
  },
  {
    id: 'signal-jammer',
    name: 'Signal Jammer',
    description: 'Jams alerts for safer cracks.',
    alarmWeightDelta: -2,
    rewardMultiplierDelta: 0,
  },
  {
    id: 'thermal-lance',
    name: 'Thermal Lance',
    description: 'Fast cuts with higher risk and higher payoff.',
    alarmWeightDelta: 2,
    rewardMultiplierDelta: 0.2,
  },
]

export const getVaultHeistCrew = (crewId: string): VaultHeistModifier => {
  return VAULT_HEIST_CREWS.find(crew => crew.id === crewId) ?? VAULT_HEIST_CREWS[0]
}

export const getVaultHeistGear = (gearId: string): VaultHeistModifier => {
  return VAULT_HEIST_GEAR.find(gear => gear.id === gearId) ?? VAULT_HEIST_GEAR[0]
}

export const applyVaultHeistModifiers = (
  alarmWeight: number,
  rewardMultiplier: number,
  crew: VaultHeistModifier,
  gear: VaultHeistModifier,
): VaultHeistAdjustedOdds => {
  const adjustedAlarmWeight = Math.max(1, alarmWeight + crew.alarmWeightDelta + gear.alarmWeightDelta)
  const adjustedRewardMultiplier = Math.max(
    0.5,
    rewardMultiplier + crew.rewardMultiplierDelta + gear.rewardMultiplierDelta,
  )

  return {
    alarmWeight: adjustedAlarmWeight,
    rewardMultiplier: adjustedRewardMultiplier,
  }
}
