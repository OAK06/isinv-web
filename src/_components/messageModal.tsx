'use client';

import { useAtom } from 'jotai';
import { responseMessage } from '@/_state/globalStore';
import { useTranslation } from 'next-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faTriangleExclamation, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

export default function MessageModal() {
    const { t } = useTranslation('common');
    const [message, setMessage] = useAtom(responseMessage);
    if (!message.type || !message.text) return;

    const styles: Record<string, { icon: any; text: string; bg: string; btn: string }> = {
        error: { icon: faCircleXmark, text: 'text-error', bg: 'bg-error/10', btn: 'btn-error' },
        alert: { icon: faTriangleExclamation, text: 'text-warning', bg: 'bg-warning/10', btn: 'btn-warning' },
        success: { icon: faCircleCheck, text: 'text-success', bg: 'bg-success/10', btn: 'btn-success' },
    };
    const style = styles[message.type] || { icon: faCircleInfo, text: 'text-info', bg: 'bg-info/10', btn: 'btn-primary' };

    return (
        <div className="modal modal-open modal-middle z-[9999]" role="alertdialog">
            <div className="modal-box max-w-md text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${style.bg}`}>
                    <FontAwesomeIcon icon={style.icon} className={`text-3xl ${style.text}`} />
                </div>
                <h2 className={`mt-4 text-xl font-bold ${style.text}`}>
                    {t(`messageModal.${message.type}`, { defaultValue: message.type })}
                </h2>
                <p className="whitespace-pre-line my-4 text-base-content/80">{message.text}</p>
                <div className="modal-action justify-center">
                    <button className={`btn btn-sm ${style.btn}`} onClick={() => setMessage({ type: null, text: null })}>
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
