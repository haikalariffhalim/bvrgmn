import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/penulis/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/penulis/"!</div>
}
