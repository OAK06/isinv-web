import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTranslation } from "react-i18next"

export default function HintCard({ tips }: any) {
    const { t } = useTranslation('common')
    return (
        <div className="px-2 mb-4 mt-1">
            <div className="card bg-base-100 border-base-200-lg border border-base-300">
                <div className="card-body">
                    {tips.title && 
                        <h2 className="card-title text-error">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-error">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {tips.title}
                        </h2>
                    }
                    <ul className="list-disc list-inside space-y-1 text-sm text-base-content">
                        {tips.tips.map((tip: string, i: number) => (
                            <li key={i}>{tip}</li>
                        ))}
                    </ul>
                    {tips.templateBtnAction && 
                    <div className="card-actions mt-6">
                        <button onClick={tips.templateBtnAction} className="btn btn-sm btn-primary">
                            {t('importPlans.downloadTemplateBtn')}
                            <FontAwesomeIcon icon={faDownload} />
                        </button>
					</div>
                    }
                </div>
            </div>
        </div>
    )
}
