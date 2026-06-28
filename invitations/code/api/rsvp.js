import { handleRsvpHttpRequest } from '../src/server/rsvp-handler.js';

export default async function handler(request, response) {
  await handleRsvpHttpRequest(request, response, {
    scriptUrl: process.env.GOOGLE_SCRIPT_URL,
  });
}
