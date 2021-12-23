import Centrifuge from '@centrifuge/centrifuge-js'
import { Keyring } from '@polkadot/api'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import BN from 'bn.js'

const Currency = new BN(10).pow(new BN(18))
const Rate = new BN(10).pow(new BN(27))

const run = async () => {
  const keyring = new Keyring({ type: 'sr25519' })
  const AliceAccount = keyring.addFromUri('//Alice')

  const centrifuge = new Centrifuge({
    network: 'centrifuge',
    polkadotWsUrl: 'ws://localhost:9944',
    centrifugeWsUrl: 'ws://localhost:9946',
    signingAddress: AliceAccount,
    printExtrinsics: true,
  })

  const poolId = '481651995861'
  // const poolId = makeId()
  // const loanCollectionId = makeId()
  // const assetCollectionId = makeId()
  // const assetNftId = makeId()
  // console.log(
  //   `poolId: ${poolId}, loanCollectionId: ${loanCollectionId}, assetCollectionId: ${assetCollectionId}, assetNftId: ${assetNftId}`
  // )

  // await centrifuge.pools.createPool([
  //   poolId,
  //   loanCollectionId,
  //   [
  //     [10, 5],
  //     [0, 0],
  //   ],
  //   'Usd',
  //   new BN(1000).mul(Currency),
  // ])

  // // console.log(`Max reserve = ${new BN((await centrifuge.pools.getPool([poolId])).pool.toJSON().maxReserve).toString()}`)
  // console.log(`Pool = ${JSON.stringify(await centrifuge.pools.getPool([poolId]))}`)

  // await centrifuge.pools.approveRole([poolId, 'Borrower', [AliceAccount.address]])
  // await centrifuge.pools.approveRole([poolId, 'RiskAdmin', [AliceAccount.address]])

  // await centrifuge.pools.addWriteOffGroup([poolId, new BN(50).mul(new BN(10).pow(new BN(25))), 1])

  // await centrifuge.nfts.createCollection([
  //   assetCollectionId,
  //   AliceAccount.address,
  //   'QmUTwA6RTUb1FbJCeM1D4G4JaMHAbPehK6WwCfykJixjm3',
  // ])
  // await centrifuge.nfts.mintNft([
  //   assetCollectionId,
  //   assetNftId,
  //   AliceAccount.address,
  //   'QmUTwA6RTUb1FbJCeM1D4G4JaMHAbPehK6WwCfykJixjm3',
  // ])

  // await centrifuge.pools.createLoan([poolId, assetCollectionId, assetNftId])
  const loanId = '1'
  // await centrifuge.pools.priceLoan([
  //   poolId,
  //   loanId,
  //   '1000000003488077118214104515',
  //   'CreditLine',
  //   [Rate.toString(), new BN(100).mul(Currency).toString()],
  // ])

  // await centrifuge.pools.updateInvestOrder([poolId, 1, new BN(100).mul(Currency)])
  // await centrifuge.pools.updateInvestOrder([poolId, 0, new BN(100).mul(Currency)])
  // await centrifuge.pools.closeEpoch([poolId])
  // console.log(`Pool = ${JSON.stringify(await centrifuge.pools.getPool([poolId]))}`)

  // await centrifuge.pools.financeLoan([poolId, loanId, new BN(50).mul(Currency)])
  console.log(`NAV = ${((await centrifuge.pools.getPool([poolId])) as any).nav!.latestNav}`)

  const writeOffGroupId = 0
  await centrifuge.pools.adminWriteOff([poolId, loanId, writeOffGroupId])

  console.log(`NAV = ${((await centrifuge.pools.getPool([poolId])) as any).nav!.latestNav}`)
}

cryptoWaitReady().then(() => {
  run()
})

const makeId = (): string => {
  const min = 1
  const max = 10 ** 12
  return Math.round(Math.random() * (max - min) + min).toString()
}