/** jev の質問・回答で使える構造化値（文字列・オブジェクト・配列・null） */
export type JevEntry = string | number | boolean | null | JevEntry[] | { [key: string]: JevEntry }

/** Noul（Yes/No）質問 */
export type JevNoulQuestion = {
  /** 質問種別 */
  type: 'noul'
  /** 質問文（構造化可） */
  instructions: JevEntry
  /** Yes / No が意味する内容（任意） */
  criteria?: { true?: JevEntry; false?: JevEntry } | null
}

/** Choice（選択）質問 */
export type JevChoiceQuestion = {
  /** 質問種別 */
  type: 'choice'
  /** 質問文（構造化可） */
  instructions: JevEntry
  /** 選択肢名 → 説明（説明不要なら null） */
  criteria: Record<string, JevEntry>
}

/** Score（段階評価）質問 */
export type JevScoreQuestion = {
  /** 質問種別 */
  type: 'score'
  /** 質問文（構造化可） */
  instructions: JevEntry
  /** 低い順に並べた段階の説明 */
  criteria: JevEntry[]
}

/** jev の質問 */
export type JevQuestion = JevNoulQuestion | JevChoiceQuestion | JevScoreQuestion

/** 質問ID → 質問 */
export type JevQuestions = Record<string, JevQuestion>

/** Noul 回答 */
export type JevNoulAnswer = {
  /** 回答種別 */
  type: 'noul'
  /** Yes である確率（0〜1） */
  noul: number
}

/** Choice 回答 */
export type JevChoiceAnswer = {
  /** 回答種別 */
  type: 'choice'
  /** 最も確率の高い選択肢 */
  choice: string
  /** 選択肢ごとの確率 */
  probabilities: Record<string, number>
  /** 確信度（0〜1） */
  confidence: number
}

/** Score 回答 */
export type JevScoreAnswer = {
  /** 回答種別 */
  type: 'score'
  /** 確率で重み付けした段階値（段階の間の値もとりうる） */
  score: number
  /** 段階番号 → 段階の説明 */
  legend: Record<string, JevEntry>
  /** 段階番号ごとの確率 */
  probabilities: Record<string, number>
  /** 確信度（0〜1） */
  confidence: number
}

/** 形式が判別できない回答（将来の回答種別追加などに備えた生データ） */
export type JevUnknownAnswer = {
  /** 回答種別（不明） */
  type: 'unknown'
  /** 受信した回答そのもの */
  raw: unknown
}

/** jev の回答 */
export type JevAnswer = JevNoulAnswer | JevChoiceAnswer | JevScoreAnswer | JevUnknownAnswer

/** 入力ファイルの種別 */
export type InputFileKind = 'text' | 'json' | 'pdf' | 'docx'
