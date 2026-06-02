export class DevmemError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DevmemError'
  }
}
