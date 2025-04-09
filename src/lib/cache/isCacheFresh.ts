import dayjs from 'dayjs'

export function isCacheFresh(updated_at?: string | null): boolean {
  if (!updated_at) return false
  return dayjs(updated_at).isAfter(dayjs().startOf('day'))
}