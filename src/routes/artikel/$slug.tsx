import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artikel/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/artikel/$slug"!</div>
}
