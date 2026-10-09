import Link from "next/link"
import { useAuth } from "@/hooks/auth"

import Logo from "@/_components/logo"
import LogoWhite from "@/_components/logoWhite"
import { fileUrl } from "@/_utils/fileUrl"
import { useAtom } from "jotai"
import { appTheme } from "@/_state/globalStore"
import { updateThemePreference } from "@/app/(app)/profile/_profile"
import { faCashRegister, faMoon, faRightLeft, faSignOut, faStore, faSun, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import LanguageSwitcher from './languageSwitcher';
import BranchSwitcher from './branchSwitcher';
import MemberGymSwitcher from '@/app/(member)/_components/memberGymSwitcher';
import { useTranslation } from "next-i18next"

export default function Navbar({ user, admin = false, member = false }: { user: any, admin?: boolean, member?: boolean }) {
    const { t, i18n } = useTranslation('common')
    const { logout } = useAuth()
    const [theme, setTheme] = useAtom(appTheme)
    const isDark = theme === 'gymFlyteDark'
    const isRtl = i18n.dir() === 'rtl'

    const toggleTheme = () => {
        const next = isDark ? 'gymFlyte' : 'gymFlyteDark'
        setTheme(next)
        updateThemePreference(next === 'gymFlyteDark' ? 'dark' : 'light').catch(() => {})
    }

    return <nav className="w-full navbar bg-base-100/85 backdrop-blur border-b border-base-200 relative z-20">
			<div className="flex-none lg:hidden">
				<label htmlFor={member ? "member-drawer" : "sidebar-drawer"} className="btn btn-square btn-ghost lg:hidden">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
				</label>
			</div>
			<div className="flex-1 min-w-0">
				<div className="px-2 shrink-0 w-fit">
					<Link href={admin ? "/admin/dashboard" : member ? "/member" : "/dashboard"}>
						{/* Staff/admin hide the navbar logo on desktop (their sidebar shows it);
						    the member portal has no sidebar, so keep it visible at all sizes. */}
						{isDark
							? <LogoWhite className={`${member ? '' : 'lg:hidden'} py-3 w-32 object-contain`} />
							: <Logo className={`${member ? '' : 'lg:hidden'} py-3 w-32 object-contain`} />}
					</Link>
					{!admin && !member && user.is_demo && (
						<span className="badge badge-neutral badge-sm uppercase tracking-wider ms-2">{t('navbar.demoBadge')}</span>
					)}
				</div>
			</div>
			<div className="flex-none flex items-center gap-2">
				{/* Member portal gym context — always visible (all screen sizes), like the
				    staff BranchSwitcher but the portal's global gym toggle. */}
				{member && <MemberGymSwitcher />}
				{/* Desktop: inline switchers. On mobile they move into the profile
				    dropdown below so the navbar never overflows the screen. */}
				<div className="hidden sm:flex items-center gap-2">
					{!admin && !member && <BranchSwitcher user={user} />}
					<button
						onClick={toggleTheme}
						title={t('navbar.toggleTheme')}
						aria-label={t('navbar.toggleTheme')}
						className="btn btn-sm btn-circle btn-ghost"
					>
						<FontAwesomeIcon icon={isDark ? faSun : faMoon} />
					</button>
					<LanguageSwitcher />
				</div>
				<div className={`dropdown ${isRtl ? 'dropdown-start' : 'dropdown-end'}`}>
					<label tabIndex={0} className="btn btn-ghost px-2 h-auto normal-case flex items-center gap-2">
						{user.photo?.url ? (
							<div className="avatar">
								<div className="w-10 rounded-full">
									<img src={fileUrl(user.photo.url)} alt={user.name} />
								</div>
							</div>
						) : (
							<div className="avatar placeholder">
								<div className="bg-neutral-focus text-neutral-content rounded-full w-10">
									<span>{user.name[0]}</span>
								</div>
							</div>
						)}
						<div className="hidden md:flex flex-col items-start rtl:items-end leading-tight">
							<span className="font-bold text-sm">{user.name}</span>
							{user.roles?.[0] && <span className="text-xs opacity-60 font-normal">{user.roles[0]}</span>}
						</div>
					</label>
					<ul tabIndex={0} className="menu dropdown-content absolute end-0 z-[1] p-2 shadow bg-base-100 rounded-box w-56 mt-1 border border-base-200">
						<li className="menu-title px-4 pt-2"><span className="block truncate">{user.email}</span></li>
						<li>
							<Link href={admin ? "/admin/profile" : member ? "/member/profile" : "/profile"} onClick={() => (document.activeElement as HTMLElement)?.blur()}>
								<FontAwesomeIcon icon={faUser} /> {t('navbar.profile')}
							</Link>
						</li>
						{/* Dual-role mode switch: switching to the member portal is just a view
						    change — any staff/owner can do it (a membership is only created when
						    they actually subscribe to a plan there). And back again from the portal. */}
						{!admin && !member &&
							<li>
								<Link href="/member" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
									<FontAwesomeIcon icon={faRightLeft} /> {t('navbar.memberPortal')}
								</Link>
							</li>
						}
						{member && user.has_staff_access &&
							<li>
								<Link href="/choose-branch" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
									<FontAwesomeIcon icon={faRightLeft} /> {t('navbar.businessArea')}
								</Link>
							</li>
						}
						{/* Mobile-only: navbar switchers live in the dropdown so the bar fits. */}
						{!admin && !member && (user.branches_count ?? 0) > 1 &&
							<li className="sm:hidden">
								<Link href="/choose-branch" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
									<FontAwesomeIcon icon={faStore} /> {t('navbar.switchBranch')}
								</Link>
							</li>
						}
						<li className="sm:hidden">
							<button onClick={toggleTheme}>
								<FontAwesomeIcon icon={isDark ? faSun : faMoon} /> {t('navbar.toggleTheme')}
							</button>
						</li>
						<li className="sm:hidden">
							<LanguageSwitcher inline />
						</li>
						{!admin && !member && (user.pos_registers?.length ?? 0) > 1 &&
							<li>
								<Link href="/choose-pos-register" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
									<FontAwesomeIcon icon={faCashRegister} /> {t('navbar.switchPosRegister')}
								</Link>
							</li>
						}
						<li><button onClick={logout}><FontAwesomeIcon icon={faSignOut} /> {t('navbar.logout')}</button></li>
					</ul>
				</div>
			</div>
		</nav>
}
