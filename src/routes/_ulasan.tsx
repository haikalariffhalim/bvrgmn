import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_ulasan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_ulasan"!</div>
}
