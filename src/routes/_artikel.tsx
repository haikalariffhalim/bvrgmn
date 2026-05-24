import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_artikel')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_artikel"!</div>
}
