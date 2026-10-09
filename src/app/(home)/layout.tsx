/**
 * Layout for the marketing home route (`/`). The landing page (glassLanding.tsx)
 * self-contains its own header/footer, so this layout is a plain passthrough.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
	return <div className="marketing">{children}</div>
}
