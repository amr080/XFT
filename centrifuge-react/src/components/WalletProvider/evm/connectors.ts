import metamaskLogo from '@subwallet/wallet-connect/evm/predefinedWallet/MetaMaskLogo.svg'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { isMobile } from '../../../utils/device'
import { createConnector, isCoinbaseWallet, isInjected } from './utils'

export type EvmConnectorMeta = {
  id: string
  title: string
  installUrl: string
  logo: {
    src: string
    alt: string
  }
  connector: Connector
  get installed(): boolean
  get shown(): boolean
}

export function getEvmConnectors(
  urls: { [chainId: number]: string[] },
  additionalConnectors?: EvmConnectorMeta[]
): EvmConnectorMeta[] {
  const [metaMask] = createConnector((actions) => new MetaMask({ actions }))
  const [walletConnect] = createConnector(
    (actions) =>
      new WalletConnect({
        actions,
        options: {
          rpc: urls,
        },
      })
  )
  const [coinbase] = createConnector(
    (actions) =>
      new CoinbaseWallet({
        actions,
        options: {
          url: urls[1][0],
          appName: 'Centrifuge',
        },
      })
  )

  return [
    {
      id: 'metamask',
      title: 'MetaMask',
      installUrl: 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
      logo: {
        src: metamaskLogo,
        alt: 'MetaMask',
      },
      connector: metaMask,
      get installed() {
        return isInjected() && !isCoinbaseWallet()
      },
      get shown() {
        return !isMobile() || this.installed
      },
    },
    {
      id: 'walletconnect',
      title: 'WalletConnect',
      installUrl: '',
      logo: {
        src: metamaskLogo,
        alt: 'WalletConnect',
      },
      connector: walletConnect,
      get installed() {
        return true
      },
      get shown() {
        return !isMobile() || !isInjected()
      },
    },
    {
      id: 'coinbase',
      title: 'Coinbase Wallet',
      installUrl: '',
      logo: {
        src: metamaskLogo,
        alt: 'Coinbase Wallet',
      },
      connector: coinbase,
      get installed() {
        return true
      },
      get shown() {
        return true
      },
    },
    ...(additionalConnectors ?? []),
  ]
}
