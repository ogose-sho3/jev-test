'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { appErrors } from '@/models/errors'
import { jevLimits, jevModels, questionTemplates } from '@/models/jev'
import { jevService } from '@/services/clientService'
import type { EvaluateFailure, EvaluateStatus, TemplateKey } from '@/types/evaluate-ui'
import type { EvaluateResponse } from '@/types/jev-api'
import type { ValidationIssue } from '@/types/validation'

const defaultQuestions = JSON.stringify(
  { ...questionTemplates.noul, ...questionTemplates.choice, ...questionTemplates.score },
  null,
  2,
)

function isValidationIssue(value: unknown): value is ValidationIssue {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { path?: unknown }).path === 'string' &&
    typeof (value as { message?: unknown }).message === 'string'
  )
}

/** 質問 JSON の構文だけを入力中に確認する（内容の検証はサーバーで行う） */
function checkQuestionsSyntax(questions: string): string | null {
  if (questions.trim().length === 0) {
    return '質問を入力してください。'
  }
  try {
    const parsed: unknown = JSON.parse(questions)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return '「質問ID: 質問」のオブジェクトで入力してください。'
    }
    return null
  } catch {
    return 'JSON の構文が正しくありません。'
  }
}

export function useEvaluate() {
  const [text, setText] = useState('')
  const [textAsJson, setTextAsJson] = useState(false)
  const [file, setFileState] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [questions, setQuestions] = useState(defaultQuestions)
  const [model, setModel] = useState<string>(jevModels[0])
  const [status, setStatus] = useState<EvaluateStatus>('idle')
  const [evaluation, setEvaluation] = useState<EvaluateResponse | null>(null)
  const [failure, setFailure] = useState<EvaluateFailure | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const questionsSyntaxError = useMemo(() => checkQuestionsSyntax(questions), [questions])
  const hasStateInput = text.trim().length > 0 || file !== null
  const canSubmit = status !== 'running' && hasStateInput && questionsSyntaxError === null && fileError === null

  const setFile = useCallback((nextFile: File | null) => {
    if (nextFile && nextFile.size > jevLimits.maxFileBytes) {
      setFileState(null)
      setFileError(`ファイルサイズは ${jevLimits.maxFileBytes / 1024 / 1024}MB 以下にしてください。`)
      return
    }
    setFileError(null)
    setFileState(nextFile)
  }, [])

  const applyTemplate = useCallback((templateKey: TemplateKey) => {
    const template =
      templateKey === 'all'
        ? { ...questionTemplates.noul, ...questionTemplates.choice, ...questionTemplates.score }
        : questionTemplates[templateKey]
    setQuestions(JSON.stringify(template, null, 2))
  }, [])

  const formatQuestions = useCallback(() => {
    try {
      setQuestions(JSON.stringify(JSON.parse(questions), null, 2))
    } catch {
      // 構文エラー時は整形しない（エラー表示は questionsSyntaxError が担う）
    }
  }, [questions])

  const submit = useCallback(async () => {
    if (!canSubmit) {
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // 前回の結果を残したまま新しい結果と混同しないよう、実行開始時に消す
    setStatus('running')
    setEvaluation(null)
    setFailure(null)

    const evaluateResult = await jevService.evaluate({ text, textAsJson, questions, model, file }, controller.signal)
    if (controller.signal.aborted) {
      return
    }
    if (evaluateResult.ok) {
      setEvaluation(evaluateResult.data)
      setStatus('success')
      return
    }

    const { data: errorData, status: httpStatus } = evaluateResult
    const issues = Array.isArray(errorData.details) ? errorData.details.filter(isValidationIssue) : []
    const detail = typeof errorData.details === 'string' ? errorData.details : null
    setFailure({
      message: httpStatus >= 500 && !errorData.type.startsWith('Jev') ? appErrors.internalServerError.message : errorData.message,
      issues,
      detail,
    })
    setStatus('error')
  }, [canSubmit, text, textAsJson, questions, model, file])

  return {
    input: { text, textAsJson, file, fileError, questions, model },
    setText,
    setTextAsJson,
    setFile,
    setQuestions,
    setModel,
    applyTemplate,
    formatQuestions,
    submit,
    canSubmit,
    hasStateInput,
    questionsSyntaxError,
    status,
    evaluation,
    failure,
  }
}
