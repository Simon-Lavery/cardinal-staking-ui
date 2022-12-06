import type { AccountData } from '@cardinal/common'
import type { StakePoolData } from '@cardinal/staking/dist/cjs/programs/stakePool'
import { getStakePool } from '@cardinal/staking/dist/cjs/programs/stakePool/accounts'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'
import { useQuery } from 'react-query'

import { useStakePoolId } from './useStakePoolId'

export const useStakePoolDataV1 = () => {
  const stakePoolId = useStakePoolId()
  const { secondaryConnection } = useEnvironmentCtx()

  return useQuery<AccountData<StakePoolData> | undefined>(
    ['stakePoolDataV1', stakePoolId?.toString()],
    async () => {
      if (!stakePoolId) return
      return getStakePool(secondaryConnection, stakePoolId)
    }
  )
}
