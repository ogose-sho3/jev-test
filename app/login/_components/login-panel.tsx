import { ALLOWED_EMAIL_DOMAIN, loginErrorMessages } from '@/models/auth'
import { routes } from '@/models/routes'
import styles from './login-panel.module.css'

export function LoginPanel({ errorCode }: { errorCode: string | null }) {
  const errorMessage = errorCode ? (loginErrorMessages[errorCode] ?? null) : null
  return (
    <main className={styles.wrap}>
      <div className={`card ${styles.panel}`}>
        <h1 className={styles.title}>jev Evaluator</h1>
        <p className={styles.lead}>@{ALLOWED_EMAIL_DOMAIN} の Google アカウントでログインしてください。</p>
        {errorMessage ? (
          <p className={`alert alert-error ${styles.error}`} role="alert">
            {errorMessage}
          </p>
        ) : null}
        <form action={routes.auth.login} method="post">
          <button type="submit" className={`button button-primary ${styles.googleButton}`}>
            Google でログイン
          </button>
        </form>
      </div>
    </main>
  )
}
