const PREFIX = '[rsvp]';

export function logRsvp(step, details = {}) {
  console.log(`${PREFIX} ${step}`, details);
}

export function logRsvpError(step, error, details = {}) {
  const payload = {
    ...details,
    message: error?.message,
    code: error?.cause?.code,
    cause: error?.cause?.message,
  };

  console.error(`${PREFIX} ${step}`, payload);
}

export function formatRsvpError(error) {
  const causeCode = error?.cause?.code;

  if (causeCode === 'UND_ERR_CONNECT_TIMEOUT' || causeCode === 'ETIMEDOUT') {
    return 'Не удалось связаться с сервером сохранения ответов (таймаут). Проверьте интернет.';
  }

  if (causeCode === 'ENOTFOUND') {
    return 'Не удалось найти сервер сохранения ответов. Проверьте подключение к интернету.';
  }

  if (error instanceof Error && error.message && error.message !== 'fetch failed') {
    return error.message;
  }

  if (error?.message === 'fetch failed') {
    return 'Не удалось связаться с сервером сохранения ответов. Проверьте интернет.';
  }

  return 'Что-то пошло не так. Попробуйте ещё раз чуть позже.';
}
