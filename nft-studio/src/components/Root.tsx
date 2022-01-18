import { GlobalStyle as FabricGlobalStyle } from '@centrifuge/fabric'
import centrifugeLight from '@centrifuge/fabric/dist/theme/centrifugeLight'
import { OverlayProvider } from '@react-aria/overlays'
import * as React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { DefaultTheme, ThemeProvider } from 'styled-components'
import { AccountNFTsPage } from '../pages/AccountNFTs'
import { CollectionPage } from '../pages/Collection'
import { CollectionsPage } from '../pages/Collections'
import { LoanPage } from '../pages/Loan'
import { LoansPage } from '../pages/Loans'
import { MintNFTPage } from '../pages/MintNFT'
import { NFTPage } from '../pages/NFT'
import { PoolPage } from '../pages/Pool'
import { PoolFormPage } from '../pages/PoolForm/index'
import { PoolsPage } from '../pages/Pools'
import { TokenPage } from '../pages/Token'
import { TokensPage } from '../pages/Tokens'
import { CentrifugeProvider } from './CentrifugeProvider'
import { GlobalStyle } from './GlobalStyle'
import { LoadBoundary } from './LoadBoundary'
import { TransactionProvider } from './TransactionsProvider'
import { TransactionToasts } from './TransactionToasts'
import { Web3Provider } from './Web3Provider'

const darkTheme: DefaultTheme = {
  ...centrifugeLight,
  sizes: {
    ...centrifugeLight.sizes,
    container: '100%',
    navBarHeight: 72,
    navBarHeightMobile: 64,
    dialog: 564,
  },
  colors: {
    ...centrifugeLight.colors,
    placeholderBackground: centrifugeLight.colors.backgroundSecondary,
  },
  typography: {
    ...centrifugeLight.typography,
    headingLarge: {
      fontSize: [24, 24, 36],
      lineHeight: 1.25,
      fontWeight: 600,
      color: 'textPrimary',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

export const Root: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        <FabricGlobalStyle />
        <OverlayProvider>
          <Web3Provider>
            <CentrifugeProvider>
              <TransactionProvider>
                <TransactionToasts />
                <Router>
                  <LoadBoundary>
                    <Switch>
                      <Route path="/collection/:cid/object/mint">
                        <MintNFTPage />
                      </Route>
                      <Route path="/collection/:cid/object/:nftid">
                        <NFTPage />
                      </Route>
                      <Route path="/collection/:cid">
                        <CollectionPage />
                      </Route>
                      <Route path="/account">
                        <AccountNFTsPage />
                      </Route>
                      <Route path="/nfts">
                        <CollectionsPage />
                      </Route>
                      <Route path="/pools/:pid/assets/:aid">
                        <LoanPage />
                      </Route>
                      <Route path="/pools/:pid">
                        <PoolPage />
                      </Route>
                      <Route path="/pool/new">
                        <PoolFormPage />
                      </Route>
                      <Route path="/issuers/assets">
                        <LoansPage />
                      </Route>
                      <Route path="/investments/tokens/:pid/:tid">
                        <TokenPage />
                      </Route>
                      <Route path="/investments/tokens">
                        <TokensPage />
                      </Route>
                      <Route path="/">
                        <PoolsPage />
                      </Route>
                    </Switch>
                  </LoadBoundary>
                </Router>
              </TransactionProvider>
            </CentrifugeProvider>
          </Web3Provider>
        </OverlayProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
