"use client"

import Link from "next/link"

// i18n must come from react-i18next (not next-i18next) — this renders under the
// (home) route which crosses a server->client boundary; next-i18next resolves
// to undefined there.
import { useTranslation } from "react-i18next"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	faScrewdriverWrench,
	faWindowMaximize,
	faRulerCombined,
	faStore,
	faAward,
	faClock,
	faShieldHalved,
	faPhone,
	faLocationDot,
} from "@fortawesome/free-solid-svg-icons"

/**
 * Self-contained marketing landing for the glass-repair shop. Renders its own
 * minimal header/footer (does not use the shared marketing Navbar/Footer).
 */
export default function GlassLanding() {
	const { t } = useTranslation('common')

	const services = [
		{ icon: faScrewdriverWrench, title: t('glassLanding.services.repair.title'), desc: t('glassLanding.services.repair.desc') },
		{ icon: faWindowMaximize, title: t('glassLanding.services.replacement.title'), desc: t('glassLanding.services.replacement.desc') },
		{ icon: faRulerCombined, title: t('glassLanding.services.custom.title'), desc: t('glassLanding.services.custom.desc') },
		{ icon: faStore, title: t('glassLanding.services.mirrors.title'), desc: t('glassLanding.services.mirrors.desc') },
	]

	const whyUs = [
		{ icon: faAward, title: t('glassLanding.why.experience.title'), desc: t('glassLanding.why.experience.desc') },
		{ icon: faClock, title: t('glassLanding.why.fast.title'), desc: t('glassLanding.why.fast.desc') },
		{ icon: faShieldHalved, title: t('glassLanding.why.quality.title'), desc: t('glassLanding.why.quality.desc') },
	]

	const contactRows = [
		{ icon: faPhone, label: t('glassLanding.contact.phoneLabel'), value: t('glassLanding.contact.phoneValue') },
		{ icon: faLocationDot, label: t('glassLanding.contact.addressLabel'), value: t('glassLanding.contact.addressValue') },
		{ icon: faClock, label: t('glassLanding.contact.hoursLabel'), value: t('glassLanding.contact.hoursValue') },
	]

	return <>
		{/* HEADER */}
		<header className="sticky top-0 z-50 bg-base-100 border-b border-base-200">
			<div className="container mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
				<span className="font-heading text-xl font-bold">{t('glassLanding.brand')}</span>
				<Link href="/login" className="btn btn-sm btn-ghost">{t('glassLanding.staffLogin')}</Link>
			</div>
		</header>

		<main className="overflow-hidden">
			{/* HERO */}
			<section className="relative bg-base-200">
				<div className="absolute inset-0 bg-primary/5" />
				<div className="relative container mx-auto px-5 md:px-10 py-20 md:py-32 text-center">
					<h1 className="font-heading text-4xl md:text-6xl font-bold">{t('glassLanding.hero.title')}</h1>
					<p className="mt-6 max-w-2xl mx-auto text-base-content/70">{t('glassLanding.hero.subtitle')}</p>
					<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
						<a href="#contact" className="btn btn-primary rounded-full px-8">{t('glassLanding.hero.cta')}</a>
						<Link href="/login" className="text-sm font-bold hover:text-primary transition-colors">{t('glassLanding.staffLogin')}</Link>
					</div>
				</div>
			</section>

			{/* SERVICES */}
			<section className="py-16 md:py-24">
				<div className="container mx-auto px-5 md:px-10">
					<h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">{t('glassLanding.services.heading')}</h2>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{services.map((service, index) => (
							<div key={index} className="p-6 rounded-2xl border border-base-200 bg-base-100 transition hover:-translate-y-1">
								<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
									<FontAwesomeIcon icon={service.icon} className="text-primary text-xl" />
								</div>
								<h3 className="mt-4 font-bold">{service.title}</h3>
								<p className="mt-2 text-sm text-base-content/60">{service.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* WHY US */}
			<section className="py-16 md:py-24 bg-base-200">
				<div className="container mx-auto px-5 md:px-10">
					<h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">{t('glassLanding.why.heading')}</h2>
					<div className="grid gap-6 sm:grid-cols-3">
						{whyUs.map((item, index) => (
							<div key={index} className="text-center">
								<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
									<FontAwesomeIcon icon={item.icon} className="text-primary text-xl" />
								</div>
								<h3 className="mt-4 font-bold">{item.title}</h3>
								<p className="mt-2 text-sm text-base-content/60">{item.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CONTACT CTA */}
			<section id="contact" className="py-16 md:py-24 bg-primary text-primary-content">
				<div className="container mx-auto px-5 md:px-10 text-center">
					<h2 className="text-3xl md:text-4xl font-heading font-bold">{t('glassLanding.contact.heading')}</h2>
					<p className="mt-4 text-primary-content/80">{t('glassLanding.contact.subtitle')}</p>
					<a href="tel:" className="btn btn-secondary rounded-full px-8 mt-8">{t('glassLanding.contact.cta')}</a>

					<div className="mt-12 grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto text-start">
						{contactRows.map((row, index) => (
							<div key={index} className="flex items-start gap-3">
								<FontAwesomeIcon icon={row.icon} className="text-primary-content/70 mt-1" />
								<div>
									<div className="text-xs uppercase tracking-wider text-primary-content/60">{row.label}</div>
									<div className="font-bold">{row.value}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>

		{/* FOOTER */}
		<footer className="bg-secondary text-secondary-content py-10">
			<div className="container mx-auto px-5 md:px-10 text-center">
				<span className="font-heading text-xl font-bold">{t('glassLanding.brand')}</span>
				<p className="mt-2 text-sm text-secondary-content/60">{t('glassLanding.footer.tagline')}</p>
				<div className="mt-4 flex items-center justify-center gap-6 text-sm">
					<Link href="/login" className="text-secondary-content/70 hover:text-secondary-content transition-colors">{t('glassLanding.staffLogin')}</Link>
				</div>
				<p className="mt-4 text-xs text-secondary-content/50">
					&copy; {new Date().getFullYear()} {t('glassLanding.brand')} — {t('glassLanding.footer.rights')}
				</p>
			</div>
		</footer>
	</>
}
