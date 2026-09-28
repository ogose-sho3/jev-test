import type { EvaluateFailure } from '@/types/evaluate-ui'

export function EvaluateErrorMessage({ failure }: { failure: EvaluateFailure }) {
  return (
    <div className="alert alert-error" role="alert">
      <div>{failure.message}</div>
      {failure.issues.length > 0 ? (
        <ul>
          {failure.issues.map((issue, index) => (
            <li key={`${issue.path}-${index}`}>
              <code>{issue.path}</code>: {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
      {failure.detail ? (
        <div className="mono" style={{ marginTop: 6 }}>
          {failure.detail}
        </div>
      ) : null}
    </div>
  )
}
