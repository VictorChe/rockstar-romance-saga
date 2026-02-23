// Edge Function: генерация трека в Suno. Ключ берётся из Secrets (Lovable Cloud → Secrets → SUNO_API_KEY).
// Вызов с фронта: supabase.functions.invoke('suno-generate', { body: { title, genre, theme, lyrics } })

const SUNO_BASE = 'https://api.sunoapi.org';
const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 60;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SunoParams {
  title: string;
  genre: string;
  theme: string;
  lyrics: string;
}

interface SunoTrack {
  id: string;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
  title: string;
  tags: string;
  duration: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('SUNO_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ code: 500, msg: 'SUNO_API_KEY не задан. Добавьте ключ в Lovable: Cloud → Secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { title, genre, theme, lyrics } = (await req.json()) as SunoParams;
    if (!title?.trim() || !lyrics?.trim()) {
      return new Response(
        JSON.stringify({ code: 400, msg: 'Нужны title и lyrics' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const style = `${genre || ''}, ${theme || ''}`.trim().slice(0, 200) || 'rock';
    const titleClean = String(title).slice(0, 80);
    const prompt = String(lyrics).slice(0, 5000);

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
      return new Response(
        JSON.stringify({ code: startData.code ?? 500, msg: startData.msg ?? 'Ошибка Suno API' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        return new Response(
          JSON.stringify({ code: statusData.code ?? 500, msg: statusData.msg ?? 'Ошибка статуса' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const status = statusData.data?.status ?? 'PENDING';
      const fail = ['CREATE_TASK_FAILED', 'GENERATE_AUDIO_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'];
      if (fail.includes(status)) {
        return new Response(
          JSON.stringify({ code: 500, msg: statusData.data?.errorMessage ?? status }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 'SUCCESS' && statusData.data?.response?.sunoData) {
        const tracks: SunoTrack[] = statusData.data.response.sunoData.map((s: Record<string, unknown>) => ({
          id: String(s.id ?? ''),
          audioUrl: String(s.audioUrl ?? ''),
          streamAudioUrl: String(s.streamAudioUrl ?? ''),
          imageUrl: String(s.imageUrl ?? ''),
          title: String(s.title ?? ''),
          tags: String(s.tags ?? ''),
          duration: Number(s.duration ?? 0),
        }));
        return new Response(
          JSON.stringify({ taskId, tracks }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ code: 408, msg: 'Превышено время ожидания генерации.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ code: 500, msg: e instanceof Error ? e.message : 'Ошибка сервера' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
