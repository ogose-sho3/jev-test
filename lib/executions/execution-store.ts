import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ExecutionRecord, ExecutionRecordInput, ExecutionStatus } from '@/types/execution'
import type { InputFileKind } from '@/types/jev'

const TABLE = 'jev_executions'
const COLUMNS =
  'id, created_at, status, error_code, http_status, requested_model, resolved_model, question_count, input_text_bytes, input_file_bytes, input_file_kind, request_bytes, response_bytes, jev_duration_ms, total_duration_ms, input_tokens, output_tokens'

/** jev_executions テーブルの行 */
type ExecutionRow = {
  id: string
  created_at: string
  status: ExecutionStatus
  error_code: string | null
  http_status: number | null
  requested_model: string
  resolved_model: string | null
  question_count: number
  input_text_bytes: number
  input_file_bytes: number | null
  input_file_kind: InputFileKind | null
  request_bytes: number
  response_bytes: number | null
  jev_duration_ms: number
  total_duration_ms: number
  input_tokens: number | null
  output_tokens: number | null
}

function toRecord(row: ExecutionRow): ExecutionRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    errorCode: row.error_code,
    httpStatus: row.http_status,
    requestedModel: row.requested_model,
    resolvedModel: row.resolved_model,
    questionCount: row.question_count,
    inputTextBytes: row.input_text_bytes,
    inputFileBytes: row.input_file_bytes,
    inputFileKind: row.input_file_kind,
    requestBytes: row.request_bytes,
    responseBytes: row.response_bytes,
    jevDurationMs: row.jev_duration_ms,
    totalDurationMs: row.total_duration_ms,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
  }
}

/**
 * 実行ログを 1 件追加する。
 * ユーザーのセッションで書き込むため、RLS により本人・許可ドメインの行のみ追加できる。
 */
export async function insertExecution(
  supabase: SupabaseClient,
  userId: string,
  execution: ExecutionRecordInput,
): Promise<boolean> {
  const { error: insertError } = await supabase.from(TABLE).insert({
    user_id: userId,
    status: execution.status,
    error_code: execution.errorCode,
    http_status: execution.httpStatus,
    requested_model: execution.requestedModel,
    resolved_model: execution.resolvedModel,
    question_count: execution.questionCount,
    input_text_bytes: execution.inputTextBytes,
    input_file_bytes: execution.inputFileBytes,
    input_file_kind: execution.inputFileKind,
    request_bytes: execution.requestBytes,
    response_bytes: execution.responseBytes,
    jev_duration_ms: execution.jevDurationMs,
    total_duration_ms: execution.totalDurationMs,
    input_tokens: execution.inputTokens,
    output_tokens: execution.outputTokens,
  })
  if (insertError) {
    console.error('insert jev_executions failed:', insertError)
    return false
  }
  return true
}

/** ログイン中ユーザーの実行ログを新しい順に取得する */
export async function listExecutions(supabase: SupabaseClient, limit: number): Promise<ExecutionRecord[]> {
  const { data: rows, error: selectError } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<ExecutionRow[]>()
  if (selectError) {
    throw new Error(`select jev_executions failed: ${selectError.message}`, { cause: selectError })
  }
  return rows.map(toRecord)
}
