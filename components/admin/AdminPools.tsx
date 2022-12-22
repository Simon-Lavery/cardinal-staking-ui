import { AdminPoolList } from '@/components/admin/admin-pool-list/AdminPoolList'
import { shortPubKey } from '@cardinal/common'
import { LoadingSpinner } from 'common/LoadingSpinner'
import { withCluster } from 'common/utils'
import type { StakePool } from 'hooks/useAllStakePools'
import { useStakePoolsByAuthority } from 'hooks/useStakePoolsByAuthority'
import { useStakePoolsMetadatas } from 'hooks/useStakePoolsMetadata'
import { useWalletId } from 'hooks/useWalletId'
import { useRouter } from 'next/router'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'

export const AdminPools = () => {
  const walletId = useWalletId()
  const { environment } = useEnvironmentCtx()
  const stakePoolsByAuthority = useStakePoolsByAuthority()
  const stakePoolsMetadata = useStakePoolsMetadatas(
    stakePoolsByAuthority.data?.map((s) => s.pubkey)
  )
  const [stakePoolsWithMetadata, stakePoolsWithoutMetadata] = (
    stakePoolsByAuthority.data || []
  ).reduce(
    (acc, stakePoolData) => {
      const stakePoolMetadata = (stakePoolsMetadata.data || {})[
        stakePoolData.pubkey.toString()
      ]
      if (stakePoolMetadata) {
        return [[...acc[0], { stakePoolMetadata, stakePoolData }], acc[1]]
      }
      return [acc[0], [...acc[1], { stakePoolData }]]
    },
    [[] as StakePool[], [] as StakePool[]]
  )

  const allPools = stakePoolsWithMetadata.concat(stakePoolsWithoutMetadata)
  return (
    <div className="">
      {!walletId ? (
        <div className="my-16 flex items-center justify-center text-gray-500">
          Wallet not connected...
        </div>
      ) : !stakePoolsByAuthority.isFetched ? (
        <div className="my-16 flex items-center justify-center text-gray-500">
          <LoadingSpinner />
        </div>
      ) : allPools.length === 0 ? (
        <div className="my-16 flex items-center justify-center text-gray-500">
          No stake pools found...
        </div>
      ) : (
        <AdminPoolList allPools={allPools} />
      )}
    </div>
  )
}
