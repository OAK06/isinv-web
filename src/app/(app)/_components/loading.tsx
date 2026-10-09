// import { useTranslation } from "next-i18next"

export default function Loading() {
    // const { t } = useTranslation('common')
    return <div className="fixed inset-0 flex min-h-screen w-full items-center justify-center bg-base-100 z-10">
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
}