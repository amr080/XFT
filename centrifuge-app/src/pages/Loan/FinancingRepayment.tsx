import * as React from 'react'
import { LabelValueStack } from '../../components/LabelValueStack'

export const FinancingRepayment: React.FC<{
  drawDownDate: string | null
  closingDate: string | null
  outstandingPrincipal: string
  outstandingInterest: string
  repaidPrincipal: string
  repaidInterest: string
  repaidUnscheduled: string | null
  isCashValuationMethod: boolean
}> = ({
  drawDownDate,
  closingDate,
  outstandingPrincipal,
  outstandingInterest,
  repaidPrincipal,
  repaidInterest,
  repaidUnscheduled,
  isCashValuationMethod,
}) => {
  return (
    <>
      {!!drawDownDate && <LabelValueStack label="1st drawdown date" value={drawDownDate} />}
      {!!closingDate && <LabelValueStack label="Date closed" value={closingDate} />}
      <LabelValueStack label="Principal outstanding" value={outstandingPrincipal} />
      {!isCashValuationMethod && <LabelValueStack label="Interest outstanding" value={outstandingInterest} />}
      <LabelValueStack label="Principal paid" value={repaidPrincipal} />
      {!isCashValuationMethod && <LabelValueStack label="Interest paid" value={repaidInterest} />}
      {!!repaidUnscheduled && <LabelValueStack label="Unscheduled repayments" value={repaidUnscheduled} />}
    </>
  )
}
