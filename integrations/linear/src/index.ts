import { sentry as sentryHelpers } from '@botpress/sdk-addons'

import actions from './actions'
import channels from './channels'
import { handler } from './handler'
import { createConversation, register, unregister } from './setup'
import * as bp from '.botpress'

const integration = new bp.Integration({
  register,
  unregister,
  handler,
  createConversation,
  channels,
  actions: {
    ...actions,
    issuescreate: async (props) => {
      const res = await actions.createIssue({
        ...props,
        type: 'createIssue',
        input: props.input,
      })
      return {
        item: res.issue,
      }
    },
    issueslist: async (props) => {
      const count = 20
      const startCursor = props.input.nextToken
      const res = await actions.listIssues({
        ...props,
        type: 'listIssues',
        input: {
          count,
          startCursor,
        },
      })
      return {
        items: res.issues,
        meta: { nextToken: res.nextCursor },
      }
    },
  },
})

export default sentryHelpers.wrapIntegration(integration, {
  dsn: bp.secrets.SENTRY_DSN,
  environment: bp.secrets.SENTRY_ENVIRONMENT,
  release: bp.secrets.SENTRY_RELEASE,
})
