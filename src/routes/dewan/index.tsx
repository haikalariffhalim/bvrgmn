import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dewan/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dewan/"!</div>
}
