/**
 * Google Apps Script для приёма ответов анкеты.
 *
 * Установка:
 * 1. Откройте таблицу → Расширения → Apps Script
 * 2. Вставьте этот код, сохраните
 * 3. Развернуть → Новое развертывание → Тип: Веб-приложение
 * 4. Выполнять от имени: «Я» · Доступ: «Все, у кого есть ссылка»
 * 5. Скопируйте URL развертывания в invitations/code/.env → GOOGLE_SCRIPT_URL
 */

const SPREADSHEET_ID = '1f1zz9AQehqAR3ytI95qeP6wU3f-8J716RM7Wqe8W_SI';
const SHEET_NAME = 'Ответы';

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Дата', 'Версия', 'ФИО', 'Дети', 'Напитки']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  return sheet;
}

function parseRequestBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Пустой запрос');
  }

  return JSON.parse(e.postData.contents);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function doPost(e) {
  try {
    const data = parseRequestBody_(e);
    const name = String(data.name || '').trim();

    if (!name) {
      return jsonResponse_({ ok: false, error: 'Укажите ФИО' });
    }

    const sheet = getOrCreateSheet_();

    sheet.appendRow([
      new Date(),
      String(data.variant || ''),
      name,
      String(data.children || ''),
      String(data.alcohol || ''),
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message || 'Unexpected error' });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'RSVP endpoint is ready' });
}
