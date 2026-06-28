function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderTiming(items) {
  return items
    .map(
      (item) => `
        <li class="timeline__item reveal">
          <span class="timeline__time">${escapeHtml(item.time)}</span>
          <p class="timeline__event">${escapeHtml(item.event)}</p>
        </li>
      `,
    )
    .join('');
}

function renderLocationCard(title, text, mapUrl) {
  return `
    <article class="location-card reveal">
      <h3 class="location-card__title">${escapeHtml(title)}</h3>
      <p class="location-card__text">${escapeHtml(text)}</p>
      <a class="button button--outline" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer">
        Посмотреть на карте
      </a>
    </article>
  `;
}

function renderAlcoholOptions(options) {
  return options
    .map(
      (option) => `
        <label class="checkbox">
          <input type="checkbox" name="alcohol" value="${escapeHtml(option)}" />
          <span class="checkbox__box" aria-hidden="true"></span>
          <span class="checkbox__label">${escapeHtml(option)}</span>
        </label>
      `,
    )
    .join('');
}

export function renderPage(content) {
  const zagsLocation = content.zags
    ? renderLocationCard('ЗАГС', content.zags.text, content.zags.mapUrl)
    : '';

  return `
    <div class="page">
      <header class="hero">
        <div class="hero__bg" aria-hidden="true">
          <img src="${content.images.background}" alt="" class="hero__bg-image" />
          <div class="hero__bg-overlay"></div>
        </div>
        <div class="hero__content reveal">
          <p class="hero__theme">Рассвет в Каппадокии</p>
          <h1 class="hero__names">${escapeHtml(content.names)}</h1>
          <p class="hero__date">${escapeHtml(content.dateShort)}</p>
          <div class="hero__divider" aria-hidden="true"></div>
          <p class="hero__intro">${escapeHtml(content.intro[0])}</p>
          <p class="hero__intro hero__intro--second">${escapeHtml(content.intro[1])}</p>
        </div>
        <div class="hero__scroll" aria-hidden="true">
          <span>листайте</span>
        </div>
      </header>

      <main>
        <section class="section section--photo" aria-label="Фото пары">
          <figure class="couple-photo reveal">
            <div class="couple-photo__frame">
              <img
                src="${content.images.couple}"
                alt="Артем и Полина"
                class="couple-photo__image"
                loading="eager"
                decoding="async"
              />
            </div>
          </figure>
        </section>

        <section class="section section--timing" aria-labelledby="timing-title">
          <div class="section__inner">
            <p class="section__eyebrow reveal">Программа дня</p>
            <h2 class="section__title reveal" id="timing-title">Тайминг</h2>
            <ol class="timeline">
              ${renderTiming(content.timing)}
            </ol>
          </div>
        </section>

        <section class="section section--soft" aria-labelledby="locations-title">
          <div class="section__inner">
            <p class="section__eyebrow reveal">Локации</p>
            <h2 class="section__title reveal" id="locations-title">Где мы встречаемся</h2>
            <div class="locations">
              ${zagsLocation}
              ${renderLocationCard('Банкет «Малиновка»', content.banquet.text, content.banquet.mapUrl)}
            </div>
          </div>
        </section>

        <section class="section section--dress" aria-labelledby="dress-title">
          <div class="section__inner">
            <p class="section__eyebrow reveal">Дресс-код</p>
            <h2 class="section__title reveal" id="dress-title">${escapeHtml(content.dressCode.theme)}</h2>
            <p class="section__text reveal">${escapeHtml(content.dressCode.text)}</p>
            <div class="dress-gallery">
              <figure class="dress-gallery__item reveal">
                <img src="${content.images.palette}" alt="Палитра цветов свадьбы" loading="lazy" />
                <figcaption>Палитра</figcaption>
              </figure>
              <figure class="dress-gallery__item reveal">
                <img src="${content.images.dressWomen}" alt="Примеры образов для девушек" loading="lazy" />
                <figcaption>Для девушек</figcaption>
              </figure>
              <figure class="dress-gallery__item reveal">
                <img src="${content.images.dressMen}" alt="Примеры образов для мужчин" loading="lazy" />
                <figcaption>Для мужчин</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section class="section section--soft" aria-labelledby="children-title">
          <div class="section__inner">
            <p class="section__eyebrow reveal">С детьми</p>
            <h2 class="section__title reveal" id="children-title">Малыши на мероприятии</h2>
            <p class="section__text reveal">${escapeHtml(content.children)}</p>
          </div>
        </section>

        <section class="section" aria-labelledby="host-title">
          <div class="section__inner">
            <p class="section__eyebrow reveal">Ведущий</p>
            <h2 class="section__title reveal" id="host-title">Творческие номера</h2>
            <p class="section__text reveal">
              ${escapeHtml(content.host.text)}
              <strong>${escapeHtml(content.host.name)}</strong>:
              <a class="link-phone" href="${content.host.phoneHref}">${escapeHtml(content.host.phone)}</a>
            </p>
          </div>
        </section>

        <section class="section section--form" aria-labelledby="form-title">
          <div class="section__inner">
            <p class="section__eyebrow reveal">Подтверждение</p>
            <h2 class="section__title reveal" id="form-title">${escapeHtml(content.form.title)}</h2>
            <p class="form-note reveal">${escapeHtml(content.form.note)}</p>

            <form class="rsvp-form reveal" id="rsvp-form" novalidate>
              <div class="field field--honeypot" aria-hidden="true">
                <label for="guest-company">Организация</label>
                <input
                  type="text"
                  id="guest-company"
                  name="company"
                  tabindex="-1"
                  autocomplete="off"
                />
              </div>

              <div class="field">
                <label class="field__label" for="guest-name">ФИО</label>
                <input
                  class="field__input"
                  type="text"
                  id="guest-name"
                  name="name"
                  placeholder="Введите ваше имя и фамилию"
                  autocomplete="name"
                  required
                />
              </div>

              <div class="field">
                <label class="field__label" for="guest-children">Дети на мероприятии</label>
                <input
                  class="field__input"
                  type="text"
                  id="guest-children"
                  name="children"
                  placeholder="Имена через запятую, если будут с вами"
                  autocomplete="off"
                />
              </div>

              <fieldset class="field field--group">
                <legend class="field__label">Предпочтения по напиткам</legend>
                <div class="checkbox-group">
                  ${renderAlcoholOptions(content.form.alcoholOptions)}
                </div>
              </fieldset>

              <button class="button button--primary" type="submit">Отправить ответ</button>
              <p class="form-message" id="form-message" hidden role="status"></p>
            </form>
          </div>
        </section>
      </main>

      <footer class="footer">
        <p class="footer__names">${escapeHtml(content.names)}</p>
        <p class="footer__date">${escapeHtml(content.dateLong)}</p>
      </footer>
    </div>
  `;
}
