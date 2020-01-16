import WebSocket, { ClientOptions } from 'ws'

export type Effect<T = any, E extends EventResponse = any> = (data: T | null, event: E) => void

export interface EventResponse {
  uri: string,
  data: any
}

export class LeagueWebSocket extends WebSocket {
  private subscriptions: { [key: string]: Array<Effect> } = {}

  constructor(address: string, options: ClientOptions) {
    super(address, options)

    this.on('message', (json: string) => {
      if (json.length > 0) {
        const payload = JSON.parse(json)

        const [res]: [EventResponse] = payload.slice(2)

        if (this.subscriptions[res.uri]?.length > 0) {
          this.subscriptions[res.uri].forEach((effect) => {
            effect(res.data, res)
          })
        }
      }
    })
  }

  public subscribe<T extends any = any>(path: string, effect: Effect<T>) {
    if (!this.subscriptions[path]) {
      this.subscriptions[path] = []
    }

    this.subscriptions[path].push(effect)
  }

  public unsubscribe(path: string) {
    this.subscriptions[path] = []
  }
}