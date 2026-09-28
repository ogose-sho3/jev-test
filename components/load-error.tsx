/** データ取得失敗時の表示 */
export function LoadError({ message }: { message: string }) {
  return (
    <main className="page">
      <p className="alert alert-error" role="alert">
        {message}
      </p>
    </main>
  )
}
