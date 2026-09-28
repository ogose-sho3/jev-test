import { AppHeader } from '@/components/app-header'
import { LoadError } from '@/components/load-error'
import { redirectOnAuthError } from '@/lib/auth/redirect-on-auth-error'
import { meServerService } from '@/services/serverService'
import { EvaluateContent } from './evaluate-content'

export async function EvaluateDataLoader() {
  const meResult = await meServerService.get()
  if (!meResult.ok) {
    redirectOnAuthError(meResult.status)
    return <LoadError message={meResult.data.message} />
  }
  return (
    <>
      <AppHeader email={meResult.data.email} current="evaluate" />
      <EvaluateContent />
    </>
  )
}
