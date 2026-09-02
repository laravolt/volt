import { createController } from 'remix/router'
import { Auth } from 'remix/middleware/auth'

import { assets } from '../assets.ts'
import { routes } from '../routes.ts'
import type { AuthUser } from '../services/auth.service.ts'
import { HomePage } from './home-page.tsx'
import { getCsrfToken } from '../middleware/csrf.ts'

export default createController(routes, {
  actions: {
    async assets({ request }) {
      return (await assets.fetch(request)) ?? new Response('Not Found', { status: 404 })
    },
    home(context) {
      let auth = context.get(Auth)
      let user = auth?.ok ? (auth.identity as AuthUser) : null
      return context.render(<HomePage user={user} csrfToken={getCsrfToken(context)} />)
    },
  },
})
