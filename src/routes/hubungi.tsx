import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/hubungi')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/hubungi"!</div>
}
