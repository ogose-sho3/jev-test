import { Suspense } from 'react'
import { PageSkeleton } from '@/components/page-skeleton'
import { HistoryDataLoader } from './_components/history-data-loader'

export default function HistoryPage() {
  return (
    <Suspense fallback={<PageSkeleton label="実行履歴を読み込み中" />}>
      <HistoryDataLoader />
    </Suspense>
  )
}
