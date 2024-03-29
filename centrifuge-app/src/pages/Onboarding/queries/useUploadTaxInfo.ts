import { useMutation } from 'react-query'
import { useOnboardingAuth } from '../../../components/OnboardingAuthProvider'
import { useOnboarding } from '../../../components/OnboardingProvider'

export const useUploadTaxInfo = () => {
  const { authToken } = useOnboardingAuth()
  const { refetchOnboardingUser, nextStep } = useOnboarding()

  const mutation = useMutation(
    async (taxInfo?: File) => {
      if (taxInfo) {
        const formData = new FormData()
        formData.append('taxInfo', taxInfo)

        const response = await fetch(`${import.meta.env.REACT_APP_ONBOARDING_API_URL}/uploadTaxInfo`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          credentials: 'include',
        })

        if (response.status !== 200) {
          throw new Error()
        }

        const json = await response.json()

        if (!json.globalSteps?.verifyTaxInfo?.completed) {
          throw new Error()
        }
      }
    },
    {
      onSuccess: () => {
        refetchOnboardingUser()
        nextStep()
      },
    }
  )

  return mutation
}
