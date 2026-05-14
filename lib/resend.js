import { Resend } from 'resend';

let _client = null;

export function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY);
  return _client;
}
