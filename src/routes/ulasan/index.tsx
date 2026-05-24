import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ulasan/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ulasan/"!</div>
}
