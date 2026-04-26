// Small icon shown in the Payload admin nav. Reuses the site's favicon
// (public/favicon.png) so the admin matches the public brand exactly.
// Server component.

export default function Icon() {
  return (
    <img
      src="/favicon.png"
      alt="RADULE.DEV"
      width={28}
      height={28}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        display: "block",
      }}
    />
  )
}
