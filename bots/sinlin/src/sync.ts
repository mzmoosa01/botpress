import { Bot } from '@botpress/sdk'

type NameAlias = `${string}:${string}`
export type SyncImplStatements = {
  listable: {
    actions: {
      list: { name: NameAlias }
    }
    events: {}
  }
  createable?: {
    actions: {
      create: { name: NameAlias }
    }
    events: {
      created: { name: NameAlias }
    }
  }
  readable?: {
    actions: {
      read: { name: NameAlias }
    }
    events: {}
  }
  updatable?: {
    actions: {
      update: { name: NameAlias }
    }
    events: {
      updated: { name: NameAlias }
    }
  }
  deletable?: {
    actions: {
      delete: { name: NameAlias }
    }
    events: {
      deleted: { name: NameAlias }
    }
  }
}

export type SyncConfig = {
  tableName: string
  stateName: string
  listItemsEvent: string
  implementStatements: SyncImplStatements
}

export const sync = <T extends { id: number }>(bot: Bot, config: SyncConfig) =>
  bot.event(async (props) => {
    const { event } = props

    const client = props.client.client

    if (event.type === config.listItemsEvent) {
      const { state } = (await client.getOrSetState({
        type: 'bot',
        name: config.stateName,
        id: props.ctx.botId,
        payload: { nextToken: undefined },
      })) as { state: { payload: { nextToken?: string } } }

      const { output } = (await client.callAction({
        type: config.implementStatements.listable.actions.list.name,
        input: {
          nextToken: state.payload.nextToken,
        },
      })) as {
        output: { items: T[]; meta: { nextToken?: string } }
      }

      await client.upsertTableRows({
        table: config.tableName,
        rows: output.items.map((item) => ({ ...item })),
      })

      return
    }

    if (
      config.implementStatements.createable &&
      event.type === config.implementStatements.createable.events.created.name
    ) {
      const item = event.payload as T
      await client.upsertTableRows({
        table: config.tableName,
        rows: [{ ...item }],
      })

      return
    }

    if (
      config.implementStatements.updatable &&
      event.type === config.implementStatements.updatable.events.updated.name
    ) {
      const item = event.payload as T
      await client.upsertTableRows({
        table: config.tableName,
        rows: [{ ...item }],
      })

      return
    }
  })
