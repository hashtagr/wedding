import { formatRsvpError, logRsvp, logRsvpError } from './rsvp-log.js';

export class RsvpValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RsvpValidationError';
    this.statusCode = 400;
  }
}

export async function handleRsvp(body, config) {
  const scriptUrl = config.scriptUrl?.trim();

  logRsvp('config check', {
    scriptUrlPresent: Boolean(scriptUrl),
  });

  if (!scriptUrl) {
    const error = new Error('Google Таблица не настроена на сервере');
    error.statusCode = 500;
    throw error;
  }

  const name = String(body?.name ?? '').trim();
  const children = String(body?.children ?? '').trim();
  const alcohol = Array.isArray(body?.alcohol)
    ? body.alcohol.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const variant = body?.variant === 'friends' ? 'friends' : 'family';
  const variantLabel = variant === 'friends' ? 'друзья' : 'родственники';

  logRsvp('payload received', { name, children, alcohol, variant: variantLabel });

  if (!name) {
    throw new RsvpValidationError('Укажите ФИО');
  }

  const payload = {
    variant: variantLabel,
    name,
    children,
    alcohol: alcohol.length > 0 ? alcohol.join(', ') : 'не указаны',
  };

  logRsvp('google script request start');

  let response;

  try {
    response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
  } catch (error) {
    logRsvpError('google script request failed', error);
    const wrapped = new Error(formatRsvpError(error));
    wrapped.statusCode = 502;
    throw wrapped;
  }

  const rawText = await response.text();
  let result;

  try {
    result = JSON.parse(rawText);
  } catch {
    logRsvp('google script non-json response', { status: response.status, raw: rawText });
    result = { ok: false, error: rawText || 'Invalid Google Script response' };
  }

  logRsvp('google script response', {
    status: response.status,
    ok: result.ok,
    error: result.error,
  });

  if (!response.ok || !result.ok) {
    const error = new Error(result.error || 'Не удалось сохранить ответ в Google Таблице');
    error.statusCode = 502;
    throw error;
  }

  logRsvp('google script saved');
  return { ok: true };
}

export async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  if (typeof request.json === 'function') {
    return request.json();
  }

  const text = await readNodeRequestBody(request);
  return JSON.parse(text || '{}');
}

function readNodeRequestBody(request) {
  return new Promise((resolve, reject) => {
    let data = '';

    request.on('data', (chunk) => {
      data += chunk;
    });

    request.on('end', () => resolve(data));
    request.on('error', reject);
  });
}

export function sendJson(response, statusCode, payload) {
  if (typeof response.status === 'function' && typeof response.json === 'function') {
    response.status(statusCode).json(payload);
    return;
  }

  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export async function handleRsvpHttpRequest(request, response, config) {
  logRsvp('http request', { method: request.method, url: request.url });

  if (request.method !== 'POST') {
    sendJson(response, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(request);
    await handleRsvp(body, config);
    sendJson(response, 200, { ok: true });
  } catch (error) {
    const statusCode = error.statusCode ?? (error instanceof RsvpValidationError ? 400 : 500);
    logRsvpError('http request failed', error, { statusCode });
    sendJson(response, statusCode, {
      ok: false,
      error: formatRsvpError(error),
    });
  }
}
