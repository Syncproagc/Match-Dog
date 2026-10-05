// Avisos do navegador: valem só neste aparelho e só com a permissão do usuário
const KEY = 'match-dog-browser-alerts'

export const alertsSupported = () => typeof window !== 'undefined' && 'Notification' in window

export function browserAlertsOn(): boolean {
  if (!alertsSupported() || Notification.permission !== 'granted') return false
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** Liga ou desliga. Ao ligar, pede a permissão do navegador. Retorna o estado final. */
export async function setBrowserAlerts(on: boolean): Promise<boolean> {
  if (!alertsSupported()) return false
  if (on && Notification.permission === 'default') await Notification.requestPermission()
  const enabled = on && Notification.permission === 'granted'
  try {
    localStorage.setItem(KEY, enabled ? '1' : '0')
  } catch {
    /* ignore */
  }
  return enabled
}

export function showBrowserAlert(title: string, body: string, onClick?: () => void) {
  if (!browserAlertsOn()) return
  const n = new Notification(title, { body, icon: '/icons/icon-192.png', tag: 'match-dog' })
  n.onclick = () => {
    window.focus()
    onClick?.()
    n.close()
  }
}
