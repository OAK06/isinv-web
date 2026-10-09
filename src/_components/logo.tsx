// Temporary text-based placeholder logo ("IS" monogram + wordmark) until a real
// brand logo is designed. For light backgrounds.
export default function Logo({ className = "", ...props }: any) {
    return (
        <span className={`inline-flex items-baseline justify-center gap-1 font-heading tracking-tight ${className}`} {...props}>
            <span className="text-2xl font-extrabold text-primary leading-none">IS</span>
            <span className="text-sm font-semibold text-base-content/70 leading-none">Inventory</span>
        </span>
    )
}
