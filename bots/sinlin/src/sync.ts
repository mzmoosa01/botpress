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

// export class EntitySyncronizer {
//   public constructor(private bot: Bot, private implStatements: SyncImplStatements) {}
// }

export type SyncConfig = {
  listItemsEvent: string
  implementStatements: SyncImplStatements
}

export const sync = (bot: Bot, config: SyncConfig) =>
  bot.event(async (props) => {
    const { event, client } = props

    if (event.type === config.listItemsEvent) {
      const { output } = (await client.callAction({
        type: config.implementStatements.listable.actions.list.name,
        input: {
          nextToken: undefined, // TODO: get this from a state
        },
      })) as {
        output: { items: any[]; meta: { nextToken?: string } }
      }
    }
  })
