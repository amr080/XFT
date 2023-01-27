import { Request, Response } from 'express'
import { bool, InferType, object } from 'yup'
import { OnboardingUser, userCollection, validateAndWriteToFirestore } from '../../database'
import { HttpsError } from '../../utils/httpsError'
import { shuftiProRequest } from '../../utils/shuftiProRequest'
import { Subset } from '../../utils/types'

const setVerifiedIdentityInput = object({
  dryRun: bool().optional(),
})

export const setVerifiedIdentityController = async (
  req: Request<any, any, InferType<typeof setVerifiedIdentityInput>>,
  res: Response
) => {
  try {
    const { dryRun } = { ...req.body }
    const userDoc = await userCollection.doc(req.walletAddress).get()
    const user = userDoc.data() as OnboardingUser

    if (!user || user.steps.verifyIdentity.completed) {
      throw new HttpsError(400, 'Unable to process request')
    }

    const status = await shuftiProRequest(req, { reference: user.kycReference }, { path: 'status', dryRun })
    if (user && status.event === 'verification.accepted') {
      const updatedUser: Subset<OnboardingUser> = {
        steps: {
          ...user.steps,
          verifyIdentity: {
            completed: true,
            timeStamp: new Date().toISOString(),
          },
        },
      }
      await validateAndWriteToFirestore(user.wallet.address, updatedUser, 'entity', ['steps'])
      const freshUserData = (await userCollection.doc(user.wallet.address).get()).data()
      return res.status(200).send({ ...freshUserData })
    }
    throw new HttpsError(400, `Failed because ${status.reference} is in "${status.event}" state`)
  } catch (error) {
    if (error instanceof HttpsError) {
      console.log(error.message)
      return res.status(error.code).send(error.message)
    }
    console.log(error)
    return res.status(500).send('An unexpected error occured')
  }
}
