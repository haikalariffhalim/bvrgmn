import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_kategori')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_kategori"!</div>
}
