# Conta, avisos e desfazer match

## O que o app faz hoje
- **Avisos dentro do app:** o sino no cabeçalho lista matches novos e mensagens não lidas. Um aviso curto aparece quando algo chega com o app aberto, e a aba Matches mostra o número de mensagens não lidas em cada conversa. O app consulta o banco a cada poucos segundos.
- **Avisos do navegador:** opcionais, ligados em Conta > Avisos. Só aparecem com o app em segundo plano e valem para aquele aparelho.
- **Preferências:** Conta > Avisos liga e desliga novos matches e novas mensagens. Ficam na tabela `user_settings`.
- **Desfazer match:** no menu da conversa. Apaga o match e as mensagens dos dois lados e marca o pet como "não curtido" para ele não voltar a aparecer.
- **Conta:** trocar e-mail e senha, baixar os dados em JSON e excluir a conta (com confirmação digitada).

## Banco de dados
A migração `supabase/migrations/0005_account_notifications.sql` cria `user_settings` e `conversation_reads`, as regras para apagar matches e mensagens, as regras de listar e apagar as próprias fotos e a função `delete_my_account()`. Matches que já existem entram como lidos, para não aparecerem como novos.

## E-mail (ainda não ativado)
O código está em `supabase/functions/notify-email/index.ts` e **não foi testado em um projeto real**. Para ativar:

1. Crie uma conta no [Resend](https://resend.com) e verifique o domínio de envio.
2. Defina os segredos da função:
   ```bash
   supabase secrets set RESEND_API_KEY=... NOTIFY_FROM="Match Dog <avisos@seudominio.com>" APP_URL=https://seudominio.com WEBHOOK_SECRET=uma-frase-longa
   supabase functions deploy notify-email --no-verify-jwt
   ```
3. No painel do Supabase, em Database > Webhooks, crie dois webhooks apontando para a função, com o cabeçalho `x-webhook-secret` igual ao segredo: um para INSERT em `public.matches` e outro para INSERT em `public.messages`.

A função respeita as preferências do usuário e só manda outro e-mail de mensagem depois de 10 minutos sem novas mensagens do mesmo pet.

## Fora do escopo por enquanto
- Notificação push com o app fechado (exige service worker e um serviço de push).
- Ocultar uma conversa sem desfazer o match.
