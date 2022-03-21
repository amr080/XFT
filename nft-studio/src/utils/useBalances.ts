import { useCentrifugeQuery } from './useCentrifugeQuery'

export function useBalances(address?: string) {
  const [result] = useCentrifugeQuery(['balances', address], (cent) => cent.pools.getBalances([address!]), {
    enabled: !!address,
  })

  return result
}
