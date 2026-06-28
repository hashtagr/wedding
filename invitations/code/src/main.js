import { getPageContent } from './content.js';
import { renderPage } from './render.js';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL ?? '';

const variant = document.body.dataset.variant ?? 'family';
const content = getPageContent(variant);
const app = document.getElementById('app');

app.innerHTML = renderPage(content);

initRevealAnimations();
initForm(variant);

function initRevealAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  );

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

function initForm(pageVariant) {
  const form = document.getElementById('rsvp-form');
  const message = document.getElementById('form-message');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.hidden = true;

    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const children = String(formData.get('children') ?? '').trim();
    const alcohol = formData.getAll('alcohol').map((value) => String(value));
    const honeypot = String(formData.get('company') ?? '').trim();

    // Honeypot: настоящие гости это поле не видят и не заполняют.
    if (honeypot) {
      showMessage(message, 'Спасибо! Мы получили ваш ответ.', 'success');
      form.reset();
      return;
    }

    if (!name) {
      showMessage(message, 'Пожалуйста, укажите ФИО.', 'error');
      document.getElementById('guest-name').focus();
      return;
    }

    if (!SCRIPT_URL) {
      showMessage(message, 'Форма пока не настроена. Напишите нам напрямую.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем...';

    const payload = {
      name,
      children,
      alcohol,
      variant: pageVariant,
    };

    try {
      await sendRsvp(payload);
      showMessage(message, 'Спасибо! Мы получили ваш ответ.', 'success');
      form.reset();
    } catch (error) {
      console.error('[rsvp] submit error', error);
      showMessage(
        message,
        'Не удалось отправить ответ. Проверьте интернет и попробуйте ещё раз.',
        'error',
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить ответ';
    }
  });
}

async function sendRsvp(payload) {
  const body = JSON.stringify(payload);

  // text/plain — «простой» запрос, без CORS preflight (OPTIONS),
  // который Apps Script не обрабатывает.
  const requestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
  };

  try {
    const response = await fetch(SCRIPT_URL, requestInit);
    const result = await response.json().catch(() => null);

    if (result && result.ok === false) {
      throw new Error(result.error || 'Apps Script error');
    }

    return;
  } catch (error) {
    // Если чтение ответа блокирует CORS — отправляем повторно в no-cors
    // (строка в таблицу всё равно добавится, ответ просто непрозрачный).
    await fetch(SCRIPT_URL, { ...requestInit, mode: 'no-cors' });
  }
}

function showMessage(element, text, type) {
  element.hidden = false;
  element.textContent = text;
  element.dataset.type = type;
}
