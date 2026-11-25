export const naira = (n: number, decimals = 0) =>
  '₦' +
  n.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
