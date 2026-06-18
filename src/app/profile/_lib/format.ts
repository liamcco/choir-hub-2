import type { Passkey } from '@better-auth/passkey/client'

export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString()
}

export function toNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function formatPasskeyMeta(passkey: Passkey) {
  const parts = [formatDeviceType(passkey.deviceType), passkey.backedUp ? 'synced' : 'device-bound']

  if (passkey.createdAt) {
    parts.push(`added ${formatDate(passkey.createdAt)}`)
  }

  return parts.join(' / ')
}

function formatDeviceType(deviceType: string) {
  return deviceType === 'multiDevice' ? 'multi-device' : 'single-device'
}
