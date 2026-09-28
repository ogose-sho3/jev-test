import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { insertExecution } from '@/lib/executions/execution-store'
import { normalizeAnswers, normalizeUsage } from '@/lib/jev/answer-normalizer'
import { extractFile, FileInputError } from '@/lib/jev/file-extractor'
import { callJev } from '@/lib/jev/jev-gateway'
import { parseQuestions } from '@/lib/jev/questions-validator'
import { buildState } from '@/lib/jev/state-builder'
import { utf8ByteLength } from '@/lib/text/byte-length'
import { appErrors } from '@/models/errors'
import { jevModels } from '@/models/jev'
import type { AppError } from '@/types/api'
import type { AuthenticatedUser } from '@/types/auth'
import type { ExtractedFile } from '@/types/file'
import type { EvaluateResponse } from '@/types/jev-api'

/** 評価処理の結果 */
type EvaluateOutcome =
  | { ok: true; response: EvaluateResponse }
  | { ok: false; appError: AppError; details?: unknown }

function readOptionalString(formData: FormData, name: string): string | null | undefined {
  const value = formData.get(name)
  if (value === null) {
    return undefined
  }
  return typeof value === 'string' ? value : null
}

function readOptionalFile(formData: FormData, name: string): File | null | undefined {
  const value = formData.get(name)
  if (value === null || value === '') {
    return undefined
  }
  if (typeof value === 'string') {
    return null
  }
  // ファイル未選択のまま送信されたフォームは空のファイルになる
  return value.size === 0 && value.name === '' ? undefined : value
}

/**
 * フォーム入力を検証して jev を実行し、実行ログ（メタデータのみ）を記録する。
 * 入力テキスト・ファイル内容・回答は保存しない。
 */
export async function evaluate(
  formData: FormData,
  user: AuthenticatedUser,
  supabase: SupabaseClient,
): Promise<EvaluateOutcome> {
  const startedAt = performance.now()

  const text = readOptionalString(formData, 'text')
  const textAsJson = readOptionalString(formData, 'textAsJson')
  const rawQuestions = readOptionalString(formData, 'questions')
  const rawModel = readOptionalString(formData, 'model')
  const file = readOptionalFile(formData, 'file')
  if (text === null || textAsJson === null || rawQuestions === null || rawModel === null || file === null) {
    return { ok: false, appError: appErrors.badRequest }
  }

  const model = rawModel ?? jevModels[0]
  if (!(jevModels as readonly string[]).includes(model)) {
    return { ok: false, appError: appErrors.badRequest, details: [{ path: 'model', message: '対応していないモデルです。' }] }
  }

  const questionsResult = parseQuestions(rawQuestions)
  if (!questionsResult.ok) {
    return { ok: false, appError: appErrors.badRequest, details: questionsResult.issues }
  }
  const questions = questionsResult.value

  let extractedFile: ExtractedFile | null = null
  if (file) {
    try {
      extractedFile = await extractFile(file)
    } catch (fileError) {
      if (fileError instanceof FileInputError) {
        console.warn('file input rejected:', { reason: fileError.message, cause: fileError.cause })
        return { ok: false, appError: fileError.appError }
      }
      throw fileError
    }
  }

  const stateResult = buildState({ text: text ?? '', textAsJson: textAsJson === 'true', file: extractedFile })
  if (!stateResult.ok) {
    return { ok: false, appError: appErrors.badRequest, details: stateResult.issues }
  }
  const { state, kind: stateKind } = stateResult.value

  const questionIds = Object.keys(questions)
  const requestBytes = utf8ByteLength(JSON.stringify({ state, model, questions }))
  const inputTextBytes = utf8ByteLength(text ?? '')
  const jevResult = await callJev({ model, state, questions })
  const totalDurationMs = Math.round(performance.now() - startedAt)

  const baseRecord = {
    requestedModel: model,
    questionCount: questionIds.length,
    inputTextBytes,
    inputFileBytes: extractedFile?.bytes ?? null,
    inputFileKind: extractedFile?.kind ?? null,
    requestBytes,
    jevDurationMs: jevResult.durationMs,
    totalDurationMs,
  }

  if (!jevResult.ok) {
    await insertExecution(supabase, user.id, {
      ...baseRecord,
      status: 'error',
      errorCode: jevResult.appError.type,
      httpStatus: jevResult.httpStatus,
      resolvedModel: null,
      responseBytes: null,
      inputTokens: null,
      outputTokens: null,
    })
    return {
      ok: false,
      appError: jevResult.appError,
      ...(jevResult.details === undefined ? {} : { details: jevResult.details }),
    }
  }

  const usage = normalizeUsage(jevResult.usage)
  const recorded = await insertExecution(supabase, user.id, {
    ...baseRecord,
    status: 'success',
    errorCode: null,
    httpStatus: 200,
    resolvedModel: jevResult.model,
    responseBytes: jevResult.responseBytes,
    inputTokens: usage?.inputTokens ?? null,
    outputTokens: usage?.outputTokens ?? null,
  })

  return {
    ok: true,
    response: {
      model: jevResult.model,
      stateKind,
      answers: normalizeAnswers(questionIds, jevResult.answers),
      usage,
      metrics: {
        questionCount: questionIds.length,
        inputTextBytes,
        inputFileBytes: extractedFile?.bytes ?? null,
        inputFileKind: extractedFile?.kind ?? null,
        extractedChars: extractedFile?.extractedChars ?? null,
        requestBytes,
        responseBytes: jevResult.responseBytes,
        jevDurationMs: jevResult.durationMs,
        totalDurationMs,
      },
      recorded,
    },
  }
}
