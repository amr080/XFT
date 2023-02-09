import { Stack } from '@centrifuge/fabric'
import * as React from 'react'
import { useParams } from 'react-router'
import { LoadBoundary } from '../../../components/LoadBoundary'
import { PageWithSideBar } from '../../../components/PageWithSideBar'
import { useIsPoolAdmin } from '../../../utils/usePermissions'
import { IssuerPoolHeader } from '../Header'
import { PoolManagers } from './PoolManagers'
import { ThirdPartyPricing } from './ThirdPartyPricing'

export const IssuerPoolAccessPage: React.FC = () => {
  return (
    <PageWithSideBar>
      <IssuerPoolHeader />
      <LoadBoundary>
        <IssuerPoolAccess />
      </LoadBoundary>
    </PageWithSideBar>
  )
}

const IssuerPoolAccess: React.FC = () => {
  const { pid: poolId } = useParams<{ pid: string }>()
  const isPoolAdmin = useIsPoolAdmin(poolId)

  return (
    <Stack>
      {isPoolAdmin && (
        <>
          <ThirdPartyPricing />
          <PoolManagers />
        </>
      )}
    </Stack>
  )
}
