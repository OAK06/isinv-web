"use client";

import { useTranslation } from "next-i18next";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faHome } from "@fortawesome/free-solid-svg-icons";
import { breadcrumbLabel } from "@/_state/globalStore";

const Breadcrumb = ({ homeHref = "/dashboard" }: { homeHref?: string }) => {
    const { t } = useTranslation('common')
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);
    const entityLabel = useAtomValue(breadcrumbLabel);

    // A numeric segment is a resource id. When the current view/edit page has
    // published the entity's name (breadcrumbLabel), the id crumb shows that name
    // and links back to the view page; otherwise it falls back to a generic
    // "Details" only when it's the leaf (mid-path ids stay hidden), keeping the
    // parent listing crumb clickable.
    const isIdSegment = (seg: string) => /^\d+$/.test(seg);

    const crumbs: { href: string; label: string }[] = [];
    segments.forEach((seg, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        if (isIdSegment(seg)) {
            const label = entityLabel || (index === segments.length - 1
                ? t('breadcrumb.details', { defaultValue: 'Details' })
                : null);
            if (label) crumbs.push({ href, label });
            return;
        }
        crumbs.push({ href, label: t(`breadcrumb.${seg}`, { defaultValue: seg }) });
    });

    return <nav aria-label="Breadcrumb" className="px-3 pt-4">
        <ol className="flex flex-wrap items-center gap-y-1 text-sm">
            <li>
                <Link href={homeHref} className="flex items-center gap-1.5 text-base-content/60 hover:text-primary transition-colors">
                    <FontAwesomeIcon icon={faHome} className="text-xs" />
                    {t('breadcrumb.home')}
                </Link>
            </li>
            {!pathname.includes("dashboard") &&
                crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;

                    return (
                        <li key={crumb.href} className="flex items-center">
                            <FontAwesomeIcon icon={faChevronRight} className="mx-2 text-[10px] text-base-content/40 rtl:rotate-180" />
                            {isLast ? (
                                <span className="font-semibold text-base-content" aria-current="page">{crumb.label}</span>
                            ) : (
                                <Link href={crumb.href} className="text-base-content/60 hover:text-primary transition-colors">
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
        </ol>
    </nav>
};

export default Breadcrumb;
