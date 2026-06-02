export function maskApiKey(value?: string): string {
  if (!value) return ''
  if (value.length <= 4) return '****'
  return `${'*'.repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`
}
