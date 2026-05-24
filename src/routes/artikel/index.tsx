import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/artikel/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/artikel/"!</div>
}
