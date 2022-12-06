import type { AccountData } from '@cardinal/common'
import type {
  CardinalRewardsCenter,
  IdlAccountData,
} from '@cardinal/rewards-center'
import type { RewardDistributorData } from '@cardinal/staking/dist/cjs/programs/rewardDistributor'
import { BN } from '@project-serum/anchor'
import type {
  AllAccountsMap,
  IdlTypes,
  TypeDef,
} from '@project-serum/anchor/dist/cjs/program/namespace/types'
import { PublicKey } from '@solana/web3.js'
import { REWARD_QUERY_KEY } from 'handlers/useHandleClaimRewards'
import { useQuery } from 'react-query'

import { useRewardDistributorDataV1 } from './useRewardDistributorDataV1'
import { useRewardDistributorDataV2 } from './useRewardDistributorDataV2'
import { useStakePoolId } from './useStakePoolId'

export const useRewardDistributorData = () => {
  const stakePoolId = useStakePoolId()
  const rewardDistributorDataV1 = useRewardDistributorDataV1()
  const rewardDistributorDataV2 = useRewardDistributorDataV2()

  return useQuery<
    Pick<IdlAccountData<'rewardDistributor'>, 'pubkey' | 'parsed'> | undefined
  >(
    [REWARD_QUERY_KEY, 'useRewardDistributorData', stakePoolId?.toString()],
    async () => {
      if (!stakePoolId) return
      if (rewardDistributorDataV1.data) {
        return {
          pubkey: rewardDistributorDataV1.data.pubkey,
          parsed: rewardDistributorDataToV2(
            rewardDistributorDataV1.data.parsed
          ),
        }
      }
      return rewardDistributorDataV2.data
    },
    {
      enabled:
        !!rewardDistributorDataV1.isFetched &&
        !!rewardDistributorDataV2.isFetched,
    }
  )
}

export const isRewardDistributorV2 = (
  rewardDistributorData: (
    | RewardDistributorData
    | TypeDef<
        AllAccountsMap<CardinalRewardsCenter>['rewardDistributor'],
        IdlTypes<CardinalRewardsCenter>
      >
  ) & { type?: string }
): boolean => rewardDistributorData.type === 'v2'

export const rewardDistributorDataToV2 = (
  rewardDistributorData:
    | RewardDistributorData
    | TypeDef<
        AllAccountsMap<CardinalRewardsCenter>['rewardDistributor'],
        IdlTypes<CardinalRewardsCenter>
      >
): TypeDef<
  AllAccountsMap<CardinalRewardsCenter>['rewardDistributor'],
  IdlTypes<CardinalRewardsCenter>
> & { type: string } => {
  if (!isRewardDistributorV2(rewardDistributorData)) {
    const rwdData = rewardDistributorData as RewardDistributorData
    return {
      bump: rwdData.bump,
      stakePool: rwdData.stakePool,
      kind: rwdData.kind,
      authority: rwdData.authority,
      identifier: new BN(0),
      rewardMint: rwdData.rewardMint,
      rewardAmount: rwdData.rewardAmount,
      rewardDurationSeconds: rwdData.rewardDurationSeconds,
      rewardsIssued: rwdData.rewardsIssued,
      defaultMultiplier: rwdData.defaultMultiplier,
      multiplierDecimals: rwdData.multiplierDecimals,
      claimRewardsPaymentInfo: PublicKey.default,
      maxRewardSecondsReceived: rwdData.maxRewardSecondsReceived,
      type: 'v1',
    }
  }
  return rewardDistributorData as TypeDef<
    AllAccountsMap<CardinalRewardsCenter>['rewardDistributor'],
    IdlTypes<CardinalRewardsCenter>
  > & { type: 'v2' }
}

export const rewardDistributorDataToV1 = (
  rewardDistributorData:
    | AccountData<RewardDistributorData>
    | Pick<IdlAccountData<'rewardDistributor'>, 'pubkey' | 'parsed'>
): AccountData<RewardDistributorData> => {
  if (!rewardDistributorData.parsed) throw 'No parsed reward distributor data'
  if (isRewardDistributorV2(rewardDistributorData.parsed)) {
    return {
      pubkey: rewardDistributorData.pubkey,
      parsed: {
        bump: rewardDistributorData.parsed.bump,
        stakePool: rewardDistributorData.parsed.stakePool,
        kind: rewardDistributorData.parsed.kind,
        authority: rewardDistributorData.parsed.authority,
        rewardMint: rewardDistributorData.parsed.rewardMint,
        rewardAmount: rewardDistributorData.parsed.rewardAmount,
        rewardDurationSeconds:
          rewardDistributorData.parsed.rewardDurationSeconds,
        rewardsIssued: rewardDistributorData.parsed.rewardsIssued,
        maxSupply: null,
        defaultMultiplier: rewardDistributorData.parsed.defaultMultiplier,
        multiplierDecimals: rewardDistributorData.parsed.multiplierDecimals,
        maxRewardSecondsReceived:
          rewardDistributorData.parsed.maxRewardSecondsReceived,
      },
    }
  }
  return rewardDistributorData as AccountData<RewardDistributorData>
}
