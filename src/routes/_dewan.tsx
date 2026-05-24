import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dewan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dewan"!</div>
}
