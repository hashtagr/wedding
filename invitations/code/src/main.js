import { getPageContent } from './content.js';
import { renderPage } from './render.js';

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

    if (!name) {
      showMessage(message, 'Пожалуйста, укажите ФИО.', 'error');
      document.getElementById('guest-name').focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем...';

    try {
      const payloadData = {
        name,
        children,
        alcohol,
        variant: pageVariant,
      };

      console.info('[rsvp] client submit', payloadData);

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData),
      });

      const payload = await response.json().catch(() => ({}));

      console.info('[rsvp] client response', {
        status: response.status,
        ok: payload.ok,
        error: payload.error,
      });

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось отправить ответ');
      }

      showMessage(message, 'Спасибо! Мы получили ваш ответ.', 'success');
      form.reset();
    } catch (error) {
      console.error('[rsvp] client error', error);
      showMessage(
        message,
        error.message || 'Что-то пошло не так. Попробуйте ещё раз чуть позже.',
        'error',
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить ответ';
    }
  });
}

function showMessage(element, text, type) {
  element.hidden = false;
  element.textContent = text;
  element.dataset.type = type;
}
