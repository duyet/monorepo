import { distanceFormat, distanceToNow, dateFormat } from './date'

describe('distanceToNow', () => {
  it('should format future date with suffix', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
    expect(distanceToNow(futureDate)).toBe('in 1 day')
  })

  it('should format past date with suffix', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
    expect(distanceToNow(pastDate)).toBe('1 day ago')
  })

  it('should handle numeric timestamp', () => {
    const timestamp = Date.now() - 60 * 60 * 1000 // 1 hour ago
    expect(distanceToNow(timestamp)).toBe('1 hour ago')
  })
})

describe('distanceFormat', () => {
  it('should format distance between two dates', () => {
    const date1 = new Date('2024-01-01')
    const date2 = new Date('2024-01-02')
    expect(distanceFormat(date1, date2)).toBe('1 day')
  })

  it('should format longer time periods', () => {
    const date1 = new Date('2024-01-01')
    const date2 = new Date('2024-02-01')
    expect(distanceFormat(date1, date2)).toBe('about 1 month')
  })

  it('should handle same dates', () => {
    const date = new Date('2024-01-01')
    expect(distanceFormat(date, date)).toBe('less than a minute')
  })
})

describe('dateFormat', () => {
  it('should format date with yyyy-MM-dd pattern', () => {
    const date = new Date('2024-03-15')
    expect(dateFormat(date, 'yyyy-MM-dd')).toBe('2024-03-15')
  })

  it('should format date with dd/MM/yyyy pattern', () => {
    const date = new Date('2024-03-15')
    expect(dateFormat(date, 'dd/MM/yyyy')).toBe('15/03/2024')
  })

  it('should format date with time using HH:mm pattern', () => {
    const date = new Date('2024-03-15T14:30:00')
    expect(dateFormat(date, 'HH:mm')).toBe('14:30')
  })

  it('should format full date and time', () => {
    const date = new Date('2024-03-15T14:30:00')
    expect(dateFormat(date, 'yyyy-MM-dd HH:mm:ss')).toBe('2024-03-15 14:30:00')
  })

  it('should format with custom text pattern', () => {
    const date = new Date('2024-03-15')
    expect(dateFormat(date, 'MMMM do, yyyy')).toBe('March 15th, 2024')
  })
})
