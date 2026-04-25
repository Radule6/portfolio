// Payload renders its own root layout. This route group exists so the admin's
// markup is isolated from the (frontend) root layout (theme provider, fonts, etc).
export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return children
}
