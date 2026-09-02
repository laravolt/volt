/**
 * Exposes the service container on request context as `context.services`.
 */
import { createContextKey, type Middleware } from 'remix/router'

import type { AppServices } from '../services/index.ts'

export const Services = createContextKey<AppServices>()

export function loadServices(
  services: AppServices,
): Middleware<{ key: typeof Services; value: AppServices; property: 'services' }> {
  return (context, next) => {
    context.set(Services, services, { property: 'services' })
    return next()
  }
}
