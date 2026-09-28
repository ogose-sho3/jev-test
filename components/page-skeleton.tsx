/** ページ読み込み中の骨組み表示（認証確認中にデータや前ユーザーの情報を出さない） */
export function PageSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className="skeleton" style={{ height: 52, borderRadius: 0 }} />
      <main className="page stack">
        <div className="skeleton" style={{ height: 28, width: 220 }} />
        <div className="skeleton" style={{ height: 240 }} />
        <div className="skeleton" style={{ height: 160 }} />
      </main>
    </div>
  )
}
