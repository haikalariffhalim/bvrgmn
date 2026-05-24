import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/produk/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/produk/$id"!</div>
}
