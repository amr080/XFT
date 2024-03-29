import Centrifuge, { CurrencyBalance, findCurrency } from '@centrifuge/centrifuge-js'
import { Firestore } from '@google-cloud/firestore'
import { ApiPromise, WsProvider } from '@polkadot/api'
import Keyring from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import BN from 'bn.js'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
import { firstValueFrom } from 'rxjs'

dotenv.config()

const URL = process.env.COLLATOR_WSS_URL ?? 'wss://fullnode.algol.cntrfg.com/public-ws'

const AUSD_KEY = { foreignAsset: 2 }

const MAX_API_REQUESTS_PER_WALLET = 100
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

const firestore = new Firestore({
  projectId: 'peak-vista-185616',
})
const wsProvider = new WsProvider(URL)

const centrifugeDomains = [
  /^(https:\/\/.*cntrfg\.com)/,
  /^(https:\/\/.*centrifuge\.io)/,
  /^(https:\/\/.*altair\.network)/,
  /^(https:\/\/.*k-f\.dev)/,
]

const centrifuge = new Centrifuge({
  centrifugeWsUrl: URL,
})

function hexToBN(value: string | number) {
  if (typeof value === 'number') return new BN(value)
  return new BN(value.toString().substring(2), 'hex')
}

async function faucet(req: Request, res: Response) {
  console.log('faucet running')

  const origin = req.get('origin') || ''
  const isCentrifugeDomain = centrifugeDomains.some((regex) => regex.test(origin))
  const isLocalhost = /^(http:\/\/localhost:)./.test(origin)
  if (isCentrifugeDomain || isLocalhost) {
    res.set('Access-Control-Allow-Origin', origin)
    res.set('Access-Control-Allow-Methods', ['GET'])
  } else {
    return res.status(405).send('Not allowed')
  }

  try {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET')
      res.set('Access-Control-Allow-Headers', 'Content-Type')
      res.set('Access-Control-Max-Age', '3600')
      return res.status(204).send('')
    }
    const { address, poolId } = req.query

    if (!address || !poolId) {
      return res.status(400).send('Invalid address param')
    }

    const api = await ApiPromise.create({ provider: wsProvider })

    const currencies = await firstValueFrom(centrifuge.pools.getCurrencies())
    const pools = await firstValueFrom(centrifuge.pools.getPools())
    const pool = pools.find((p) => p.id === poolId)
    if (!pool) {
      throw new Error('Pool not found')
    }
    const currency = findCurrency(currencies, pool.currency.key)
    if (!currency) {
      throw new Error('Currency not found')
    }

    // check DEVEL and aUSD balances
    const [nativeBalanceResponse, currencyBalanceResponse] = await Promise.all([
      api.query.system.account(address),
      api.query.ormlTokens.accounts(address, currency?.key ?? AUSD_KEY),
    ])
    const nativeBalance = hexToBN((nativeBalanceResponse?.toJSON() as any)?.data?.free || 0)
    const currencyBalance = hexToBN((currencyBalanceResponse?.toJSON() as any)?.free || 0)

    if (
      currencyBalance.gte(CurrencyBalance.fromFloat(100, currency.decimals)) ||
      nativeBalance.gte(CurrencyBalance.fromFloat(10, 18))
    ) {
      api.disconnect()
      return res.status(400).send('Wallet already has sufficient aUSD/DEVEL balances')
    }

    const dripRef = firestore.collection('drips').doc(`${address}`)
    const doc = await dripRef.get()
    const data = doc.data()

    if (doc.exists && data?.address !== address) {
      const twentyFourHourFreeze = new Date(data?.timestamp).getTime() + TWENTY_FOUR_HOURS
      // allow access once every 24 hours
      if (new Date().getTime() < twentyFourHourFreeze) {
        api.disconnect()
        return res.status(400).send('Faucet can only be used once in 24 hours')
      }

      if (data?.count > MAX_API_REQUESTS_PER_WALLET) {
        api.disconnect()
        return res.status(400).send('Maximum claims exceeded')
      }
    }

    await firestore
      .collection('drips')
      .doc(address as string)
      .set({
        address,
        timestamp: Date.now(),
        currency: currency?.key ?? AUSD_KEY,
        count: (doc.data()?.count ?? 0) + 1,
      })

    const txBatch = api.tx.utility.batchAll([
      api.tx.tokens.transfer(address, { Native: true }, CurrencyBalance.fromFloat(1000, 18).toString()),
      api.tx.tokens.transfer(
        address,
        currency?.key ?? AUSD_KEY,
        CurrencyBalance.fromFloat(10000, currency.decimals).toString()
      ),
    ])
    await cryptoWaitReady()
    const keyring = new Keyring({ type: 'sr25519' })
    console.log('signing and sending tx')
    const hash = URL.includes('development')
      ? await txBatch.signAndSend(keyring.addFromUri('//Alice'))
      : await txBatch.signAndSend(keyring.addFromUri(process.env.SEED_HEX as string))

    console.log('signed and sent tx with hash', hash)
    api.disconnect()
    return res.status(200).json({ hash })
  } catch (e) {
    console.error('Error', e)
    return res.status(500).send(e)
  }
}

exports.faucet = faucet
