import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/kategori/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/kategori/$slug"!</div>
}
