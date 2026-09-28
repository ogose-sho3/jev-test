/** アプリケーションエラー定義（status / type / ユーザー向けメッセージ） */
export const appErrors = {
  badRequest: {
    status: 400,
    type: 'BadRequest',
    title: 'Bad Request',
    message: 'リクエストの内容が不正です。',
  },
  unauthorized: {
    status: 401,
    type: 'Unauthorized',
    title: 'Unauthorized',
    message: '認証が必要です。ログインしてください。',
  },
  forbiddenDomain: {
    status: 403,
    type: 'ForbiddenDomain',
    title: 'Forbidden',
    message: 'このアカウントでは利用できません。',
  },
  payloadTooLarge: {
    status: 413,
    type: 'PayloadTooLarge',
    title: 'Content Too Large',
    message: '入力サイズが上限を超えています。',
  },
  unsupportedFile: {
    status: 415,
    type: 'UnsupportedFile',
    title: 'Unsupported Media Type',
    message: '対応していないファイル形式です。',
  },
  fileExtractionFailed: {
    status: 422,
    type: 'FileExtractionFailed',
    title: 'Unprocessable Content',
    message: 'ファイルからテキストを読み取れませんでした。',
  },
  jevRejected: {
    status: 422,
    type: 'JevRejected',
    title: 'Unprocessable Content',
    message: 'jev が入力内容を受け付けませんでした。質問やテキストの内容・長さを確認してください。',
  },
  jevRateLimited: {
    status: 429,
    type: 'JevRateLimited',
    title: 'Too Many Requests',
    message: 'jev の利用上限に達しました。しばらく時間をおいてお試しください。',
  },
  internalServerError: {
    status: 500,
    type: 'InternalServerError',
    title: 'Internal Server Error',
    message: 'サーバーエラーが発生しました。しばらく時間をおいてお試しください。',
  },
  jevUnavailable: {
    status: 502,
    type: 'JevUnavailable',
    title: 'Bad Gateway',
    message: 'jev の呼び出しに失敗しました。しばらく時間をおいてお試しください。',
  },
  jevTimeout: {
    status: 504,
    type: 'JevTimeout',
    title: 'Gateway Timeout',
    message: 'jev の応答がタイムアウトしました。入力を小さくするか、時間をおいてお試しください。',
  },
} as const
