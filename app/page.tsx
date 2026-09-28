import { Suspense } from 'react'
import { PageSkeleton } from '@/components/page-skeleton'
import { EvaluateDataLoader } from './_components/evaluate-data-loader'

export default function EvaluatePage() {
  return (
    <Suspense fallback={<PageSkeleton label="読み込み中" />}>
      <EvaluateDataLoader />
    </Suspense>
  )
}
