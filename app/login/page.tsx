import { LoginPanel } from './_components/login-panel'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const { error: errorParam } = await searchParams
  const errorCode = typeof errorParam === 'string' ? errorParam : null
  return <LoginPanel errorCode={errorCode} />
}
