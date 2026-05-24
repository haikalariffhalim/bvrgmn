import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/produk/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/produk/"!</div>
}
