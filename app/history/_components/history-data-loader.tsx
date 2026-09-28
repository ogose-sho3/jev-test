import { AppHeader } from '@/components/app-header'
import { LoadError } from '@/components/load-error'
import { redirectOnAuthError } from '@/lib/auth/redirect-on-auth-error'
import { executionServerService, meServerService } from '@/services/serverService'
import { HistoryContent } from './history-content'

export async function HistoryDataLoader() {
  const [meResult, executionsResult] = await Promise.all([meServerService.get(), executionServerService.list()])
  if (!meResult.ok) {
    redirectOnAuthError(meResult.status)
    return <LoadError message={meResult.data.message} />
  }
  if (!executionsResult.ok) {
    redirectOnAuthError(executionsResult.status)
  }
  return (
    <>
      <AppHeader email={meResult.data.email} current="history" />
      {executionsResult.ok ? (
        <HistoryContent executions={executionsResult.data.executions} />
      ) : (
        <LoadError message={executionsResult.data.message} />
      )}
    </>
  )
}
