import { Request, Response } from 'express'
import { InferType, object, string } from 'yup'
import { IndividualUser, OnboardingUser, userCollection, validateAndWriteToFirestore } from '../../database'
import { HttpsError } from '../../utils/httpsError'
import { shuftiProRequest } from '../../utils/shuftiProRequest'
import { validateInput } from '../../utils/validateInput'

const kycInput = object({
  name: string().required(),
  dateOfBirth: string().required(),
  countryOfCitizenship: string().required(),
  poolId: string(),
  trancheId: string(),
})

export const startKycController = async (req: Request<any, any, InferType<typeof kycInput>>, res: Response) => {
  try {
    const { walletAddress, body } = req
    await validateInput(req.body, kycInput)

    const userDoc = await userCollection.doc(walletAddress).get()
    const userData = userDoc.data() as OnboardingUser

    if (!userDoc.exists && (!body.poolId || !body.trancheId)) {
      throw new HttpsError(400, 'trancheId and poolId required for individual kyc')
    }

    if (
      userData.investorType === 'entity' &&
      !userData.steps.verifyEmail.completed &&
      !userData.steps.verifyBusiness.completed &&
      !userData.steps.confirmOwners.completed
    ) {
      throw new HttpsError(400, 'Entities must complete verifyEmail, verifyBusiness, confirmOwners before starting KYC')
    }

    if (userData.steps.verifyIdentity.completed) {
      throw new HttpsError(400, 'Identity already verified')
    }

    const kycReference = `KYC_${Math.random()}`
    if (body.poolId && body.trancheId) {
      const updatedUserData: IndividualUser = {
        investorType: 'individual',
        wallet: {
          address: walletAddress,
          network: 'polkadot',
        },
        kycReference,
        name: body.name,
        dateOfBirth: body.dateOfBirth,
        countryOfCitizenship: body.countryOfCitizenship,
        steps: {
          verifyIdentity: {
            completed: false,
            timeStamp: null,
          },
          verifyAccreditation: { completed: false, timeStamp: null },
          verifyTaxInfo: { completed: false, timeStamp: null },
          signAgreements: {
            [body.poolId]: {
              [body.trancheId]: {
                signedDocument: false,
                transactionInfo: {
                  extrinsicHash: null,
                  blockNumber: null,
                },
              },
            },
          },
        },
        email: null,
        onboardingStatus: {
          [body.poolId]: {
            [body.trancheId]: {
              status: null,
              timeStamp: null,
            },
          },
        },
      }
      await validateAndWriteToFirestore(walletAddress, updatedUserData, 'individual')
    } else {
      const updatedUser = {
        name: body.name,
        countryOfCitizenship: body.countryOfCitizenship,
        dateOfBirth: body.dateOfBirth,
        kycReference,
      }
      await validateAndWriteToFirestore(walletAddress, updatedUser, 'entity', [
        'name',
        'countryOfCitizenship',
        'dateOfBirth',
        'kycReference',
      ])
    }

    const payloadKYC = {
      reference: kycReference,
      callback_url: '',
      email: userData.email ?? '',
      country: body.countryOfCitizenship,
      language: 'EN',
      redirect_url: '',
      verification_mode: 'any',
      allow_offline: '1',
      show_feedback_form: '0',
      ttl: 1800, // 30 minutes: time in seconds for the verification url to stay active
      face: {
        proof: '',
        allow_offline: '1', // TODO: disable once we go live
        check_duplicate_request: '0', // TODO: enable once we go live
      },
      document: {
        proof: '',
        supported_types: ['id_card', 'passport', 'driving_license'],
        dob: body.dateOfBirth,
        name: {
          full_name: body.name,
        },
      },
      address: {
        proof: '',
        supported_types: ['any'],
        name: {
          full_name: body.name,
        },
        address_fuzzy_match: '1',
        show_ocr_form: '1',
      },
    }
    const kyc = await shuftiProRequest(req, payloadKYC)
    return res.send({ ...kyc })
  } catch (error) {
    if (error instanceof HttpsError) {
      console.log(error.message)
      return res.status(error.code).send(error.message)
    }
    console.log(error)
    return res.status(500).send('An unexpected error occured')
  }
}