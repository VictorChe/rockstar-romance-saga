/**
 * Прокси для Suno API (бесплатный вариант без Lovable Cloud).
 * Деплой на Vercel → в настройках проекта добавить Environment Variable: SUNO_API_KEY.
 * Ключ в репозиторий не попадает.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUNO_BASE = 'https://api.sunoapi.org';
const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, msg: 'Только POST' });
  }

  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      code: 500,
      msg: 'SUNO_API_KEY не задан. Добавьте в Vercel: Project → Settings → Environment Variables.',
    });
  }

  const { title, genre, theme, lyrics } = (req.body || {}) as {
    title?: string;
    genre?: string;
    theme?: string;
    lyrics?: string;
  };
  if (!title?.trim() || !lyrics?.trim()) {
    return res.status(400).json({ code: 400, msg: 'Нужны title и lyrics' });
  }

  const style = `${genre || ''}, ${theme || ''}`.trim().slice(0, 200) || 'rock';
  const titleClean = String(title).slice(0, 80);
  const prompt = String(lyrics).slice(0, 5000);

  try {
    const startRes = await fetch(`${SUNO_BASE}/api/v1/generate`, {
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
        title: titleClean,
        model: 'V4_5',
        callBackUrl: 'https://example.com/callback',
      }),
    });
    const startData = await startRes.json();
    if (startData.code !== 200 || !startData.data?.taskId) {
      return res.status(200).json({ code: startData.code ?? 500, msg: startData.msg ?? 'Ошибка Suno API' });
    }
    const taskId = startData.data.taskId;

    for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const statusRes = await fetch(
        `${SUNO_BASE}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      const statusData = await statusRes.json();
      if (statusData.code !== 200) {
        return res.status(200).json({ code: statusData.code ?? 500, msg: statusData.msg ?? 'Ошибка статуса' });
      }
      const status = statusData.data?.status ?? 'PENDING';
      const fail = ['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'];
      if (fail.includes(status)) {
        return res.status(200).json({ code: 500, msg: statusData.data?.errorMessage ?? status });
      }
      if (status === 'SUCCESS' && statusData.data?.response?.sunoData) {
        const tracks = statusData.data.response.sunoData.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? ''),
          audioUrl: String(s.audioUrl ?? ''),
          streamAudioUrl: String(s.streamAudioUrl ?? ''),
          imageUrl: String(s.imageUrl ?? ''),
          title: String(s.title ?? ''),
          tags: String(s.tags ?? ''),
          duration: Number(s.duration ?? 0),
        }));
        return res.status(200).json({ taskId, tracks });
      }
    }
    return res.status(200).json({ code: 408, msg: 'Превышено время ожидания генерации.' });
  } catch (e) {
    return res.status(500).json({
      code: 500,
      msg: e instanceof Error ? e.message : 'Ошибка сервера',
    });
  }
}
