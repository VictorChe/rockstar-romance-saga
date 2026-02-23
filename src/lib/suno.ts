/**
 * Suno API — генерация трека по названию, жанру, теме и тексту песни.
 * Ключ хранится в .env как VITE_SUNO_API_KEY (не коммитить .env).
 */

const SUNO_BASE = 'https://api.sunoapi.org';
const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 60; // ~5 min

function getApiKey(): string {
  const key = import.meta.env.VITE_SUNO_API_KEY;
  if (!key || key === 'your_suno_api_key_here') {
    throw new Error('Добавьте VITE_SUNO_API_KEY в файл .env (см. .env.example)');
  }
  return key;
}

export interface SunoGenerateParams {
  title: string;
  genre: string;
  theme: string;
  lyrics: string;
}

export interface SunoTrack {
  id: string;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
  title: string;
  tags: string;
  duration: number;
}

export interface SunoGenerateResult {
  taskId: string;
  tracks: SunoTrack[];
}

export interface SunoError {
  code: number;
  msg: string;
}

/** Запуск генерации трека в Suno */
export async function startSunoGenerate(params: SunoGenerateParams): Promise<{ taskId: string } | SunoError> {
  const apiKey = getApiKey();
  const style = `${params.genre}, ${params.theme}`.slice(0, 200);
  const title = params.title.slice(0, 80);
  const prompt = params.lyrics.slice(0, 5000);

  const res = await fetch(`${SUNO_BASE}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      customMode: true,
      instrumental: false,
      prompt,
      style,
      title,
      model: 'V4_5',
      callBackUrl: 'https://example.com/callback',
    }),
  });

  const data = await res.json();
  if (data.code !== 200) {
    return { code: data.code ?? 500, msg: data.msg ?? 'Ошибка Suno API' };
  }
  if (!data.data?.taskId) {
    return { code: 500, msg: 'Нет taskId в ответе Suno' };
  }
  return { taskId: data.data.taskId };
}

/** Получить статус и результат генерации */
export async function getSunoTaskStatus(taskId: string): Promise<
  | { status: 'PENDING' | 'TEXT_SUCCESS' | 'FIRST_SUCCESS' }
  | { status: 'SUCCESS'; tracks: SunoTrack[] }
  | { status: 'ERROR'; message: string }
  | SunoError
> {
  const apiKey = getApiKey();
  const res = await fetch(`${SUNO_BASE}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();

  if (data.code !== 200) {
    return { code: data.code ?? 500, msg: data.msg ?? 'Ошибка запроса статуса' };
  }

  const status = data.data?.status ?? 'PENDING';
  const failStatuses = ['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'];
  if (failStatuses.includes(status)) {
    return { status: 'ERROR', message: data.data?.errorMessage ?? status };
  }
  if (status === 'SUCCESS' && data.data?.response?.sunoData) {
    const tracks: SunoTrack[] = data.data.response.sunoData.map((s: {
      id: string;
      audioUrl?: string;
      streamAudioUrl?: string;
      imageUrl?: string;
      title?: string;
      tags?: string;
      duration?: number;
    }) => ({
      id: s.id,
      audioUrl: s.audioUrl ?? '',
      streamAudioUrl: s.streamAudioUrl ?? '',
      imageUrl: s.imageUrl ?? '',
      title: s.title ?? '',
      tags: s.tags ?? '',
      duration: s.duration ?? 0,
    }));
    return { status: 'SUCCESS', tracks };
  }
  return { status: status as 'PENDING' | 'TEXT_SUCCESS' | 'FIRST_SUCCESS' };
}

/** Запустить генерацию и дождаться готовых треков (опрос статуса) */
export async function generateSunoTrack(params: SunoGenerateParams): Promise<SunoGenerateResult | SunoError> {
  const start = await startSunoGenerate(params);
  if ('code' in start) return start;
  const { taskId } = start;

  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const status = await getSunoTaskStatus(taskId);
    if ('code' in status) return status;
    if (status.status === 'SUCCESS') return { taskId, tracks: status.tracks };
    if (status.status === 'ERROR') return { code: 500, msg: status.message };
  }
  return { code: 408, msg: 'Превышено время ожидания генерации. Попробуйте позже.' };
}
