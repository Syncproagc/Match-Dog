// Envia e-mail de novo match e de nova mensagem.
// Roda como Edge Function chamada por Database Webhooks (INSERT em `matches` e `messages`).
// Variáveis: RESEND_API_KEY, NOTIFY_FROM, APP_URL, WEBHOOK_SECRET (opcional, mas recomendada).
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já existem no ambiente das funções.
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const resendKey = Deno.env.get('RESEND_API_KEY')
const from = Deno.env.get('NOTIFY_FROM') ?? 'Match Dog <avisos@example.com>'
const appUrl = Deno.env.get('APP_URL') ?? ''
const secret = Deno.env.get('WEBHOOK_SECRET')

// Não manda um e-mail por mensagem: só avisa de novo depois de uma pausa
const QUIET_MINUTES = 10

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

async function send(to: string, subject: string, html: string) {
  if (!resendKey) throw new Error('RESEND_API_KEY não configurada')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
}

async function notify(recipientPetId: string, otherPetId: string, kind: 'match' | 'message', body = '') {
  const { data: pets } = await db.from('pets').select('id, name, owner_id').in('id', [recipientPetId, otherPetId])
  const recipient = pets?.find((p) => p.id === recipientPetId)
  const other = pets?.find((p) => p.id === otherPetId)
  if (!recipient || !other) return

  const { data: prefs } = await db.from('user_settings').select('notify_matches, notify_messages').eq('user_id', recipient.owner_id).maybeSingle()
  if (kind === 'match' && prefs?.notify_matches === false) return
  if (kind === 'message' && prefs?.notify_messages === false) return

  const { data: owner } = await db.auth.admin.getUserById(recipient.owner_id)
  const email = owner.user?.email
  if (!email) return

  const link = appUrl ? `<p><a href="${esc(appUrl)}">Abrir o Match Dog</a></p>` : ''
  if (kind === 'match') {
    await send(email, `Deu match entre ${recipient.name} e ${other.name}`, `<p>${esc(recipient.name)} e ${esc(other.name)} se curtiram. Diga oi e combinem um passeio.</p>${link}`)
  } else {
    await send(email, `${other.name} escreveu para ${recipient.name}`, `<p><strong>${esc(other.name)}:</strong> ${esc(body)}</p>${link}`)
  }
}

Deno.serve(async (req) => {
  if (secret && req.headers.get('x-webhook-secret') !== secret) return new Response('forbidden', { status: 403 })
  const payload = await req.json()
  if (payload.type !== 'INSERT') return new Response('ignorado')
  try {
    if (payload.table === 'matches') {
      const m = payload.record
      await Promise.all([notify(m.pet_a_id, m.pet_b_id, 'match'), notify(m.pet_b_id, m.pet_a_id, 'match')])
    } else if (payload.table === 'messages') {
      const m = payload.record
      const since = new Date(Date.now() - QUIET_MINUTES * 60_000).toISOString()
      const { count } = await db
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('from_pet_id', m.from_pet_id)
        .eq('to_pet_id', m.to_pet_id)
        .gt('created_at', since)
        .neq('id', m.id)
      if (!count) await notify(m.to_pet_id, m.from_pet_id, 'message', m.body)
    }
  } catch (err) {
    console.error(err)
    return new Response('erro', { status: 500 })
  }
  return new Response('ok')
})
