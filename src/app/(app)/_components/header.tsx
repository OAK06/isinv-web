import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen } from "@fortawesome/free-solid-svg-icons"

export default function Header({ title, subtitle, containerClass, actions, editHref, editLabel }: { title?: any, subtitle?: any, containerClass?: string, actions?: any, editHref?: string, editLabel?: string }) {
	return <div className="pb-4">
			<div className={containerClass ?? "flex flex-wrap items-center justify-between gap-3"}>
				<div>
					{typeof title == 'string' ? <h1 className="text-2xl font-bold">{title}</h1> : title}
					{subtitle && <p className="text-sm text-base-content/60 mt-1">{subtitle}</p>}
				</div>
				{(actions || editHref) && <div className="flex items-center gap-2">
					{editHref && <Link href={editHref} className="btn btn-primary btn-sm">
						<FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
						{editLabel}
					</Link>}
					{actions}
				</div>}
			</div>
		</div>
}
