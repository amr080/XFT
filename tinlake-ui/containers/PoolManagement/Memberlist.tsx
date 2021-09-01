import { ITinlake } from '@centrifuge/tinlake-js'
import { Box, Button, FormField, Heading, TextInput } from 'grommet'
import * as React from 'react'
import { connect } from 'react-redux'
import { Card } from '../../components/Card'
import { createTransaction, TransactionProps, useTransactionState } from '../../ducks/transactions'
import { usePool } from '../../utils/usePool'
const web3 = require('web3-utils')

interface Props extends TransactionProps {
  tinlake: ITinlake
}

type Tranche = 'junior' | 'senior'

const getActionName = (tranche: Tranche) => (tranche === 'senior' ? 'updateSeniorMemberList' : 'updateJuniorMemberList')

const ManageMemberlist: React.FC<Props> = (props: Props) => {
  const { data: poolData } = usePool(props.tinlake.contractAddresses.ROOT_CONTRACT)

  const [juniorAddress, setJuniorAddress] = React.useState('')
  const [seniorAddress, setSeniorAddress] = React.useState('')

  const [juniorStatus, , setJuniorTxId] = useTransactionState()
  const [seniorStatus, , setSeniorTxId] = useTransactionState()

  const add = async (tranche: Tranche) => {
    const address = tranche === 'senior' ? seniorAddress : juniorAddress

    const validUntilDate = new Date()
    validUntilDate.setFullYear(validUntilDate.getFullYear() + 100)

    const validUntil = Math.round(validUntilDate.getTime() / 1000)

    const description = `Add ${address.substring(0, 8)}... to ${tranche === 'senior' ? 'DROP' : 'TIN'}`

    const txId = await props.createTransaction(description, getActionName(tranche), [
      props.tinlake,
      address,
      validUntil,
    ])

    if (tranche === 'senior') setSeniorTxId(txId)
    else setJuniorTxId(txId)
  }

  const remove = async (tranche: Tranche) => {
    const address = tranche === 'senior' ? seniorAddress : juniorAddress

    const date = new Date()
    /*
     * minimum delay is 7 days: https://github.com/centrifuge/tinlake/blob/v0.3.0/src/lender/token/memberlist.sol#L23
     * so need to add 8 days from today
     */
    date.setDate(date.getDate() + 8)

    const validUntil = Math.round(date.getTime() / 1000)

    const description = `Remove ${address.substring(0, 8)}... from ${tranche === 'senior' ? 'DROP' : 'TIN'}`

    const txId = await props.createTransaction(description, getActionName(tranche), [
      props.tinlake,
      address,
      validUntil,
    ])

    if (tranche === 'senior') setSeniorTxId(txId)
    else setJuniorTxId(txId)
  }

  React.useEffect(() => {
    if (juniorStatus === 'succeeded') {
      setJuniorAddress('')
    }
  }, [juniorStatus])

  React.useEffect(() => {
    if (seniorStatus === 'succeeded') {
      setSeniorAddress('')
    }
  }, [seniorStatus])

  return (
    <>
      {poolData && (
        <Box direction="row" gap="medium">
          <Card width="400px" p="medium" mb="medium">
            <Box direction="row" margin={{ top: '0', bottom: 'small' }}>
              <Heading level="5" margin={'0'}>
                Add/Remove DROP member
              </Heading>
            </Box>

            <FormField label="Address">
              <TextInput
                value={seniorAddress}
                placeholder="0x..."
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSeniorAddress(event.currentTarget.value)
                }}
              />
            </FormField>

            <Box gap="small" justify="end" direction="row" margin={{ top: 'small' }}>
              <Button
                secondary
                label="Remove"
                onClick={() => {
                  remove('senior')
                }}
                disabled={!seniorAddress || !web3.isAddress(seniorAddress)}
              />
              <Button
                primary
                label="Add"
                onClick={() => {
                  add('senior')
                }}
                disabled={!seniorAddress || !web3.isAddress(seniorAddress)}
              />
            </Box>
          </Card>
          <Card width="400px" p="medium" mb="medium">
            <Box direction="row" margin={{ top: '0', bottom: 'small' }}>
              <Heading level="5" margin={'0'}>
                Add/Remove TIN member
              </Heading>
            </Box>

            <FormField label="Address">
              <TextInput
                value={juniorAddress}
                placeholder="0x..."
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setJuniorAddress(event.currentTarget.value)
                }}
              />
            </FormField>

            <Box gap="small" justify="end" direction="row" margin={{ top: 'small' }}>
              <Button
                secondary
                label="Remove"
                onClick={() => {
                  remove('junior')
                }}
                disabled={!juniorAddress || !web3.isAddress(juniorAddress)}
              />
              <Button
                primary
                label="Add"
                onClick={() => {
                  add('junior')
                }}
                disabled={!juniorAddress || !web3.isAddress(juniorAddress)}
              />
            </Box>
          </Card>
        </Box>
      )}
    </>
  )
}

export default connect((state) => state, { createTransaction })(ManageMemberlist)
