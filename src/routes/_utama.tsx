import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_utama')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_utama"!</div>
}
