import { useTranslation } from "next-i18next"

export default function InvoicesTab({data, className}: {data?: string[], className?: string}) {
    const { t } = useTranslation('common')

    return data?.length > 0 && <div className={className}>
        {data?.map((invoice: any, index: number) => (
            <div key={index} className="card bg-base-100 border border-base-200 shadow-sm mb-4">
                <div className="card-body">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-base-content/70">{t('members.date')}</span>
                            <span className="text-base-content">{new Date(invoice.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-base-content/70">{t('members.createdBy')}</span>
                            <span className="text-base-content">{invoice.created_by?.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-base-content/70">{t('members.totalPrice')}</span>
                            <span className="text-xl font-bold text-primary">${invoice.total_price}</span>
                        </div>
                    </div>
                    
                    <div className="card-actions justify-end mt-4">
                        <label htmlFor={`purchase_modal_${invoice.id}`} className="btn btn-sm btn-primary">
                            {t('members.viewInvoiceDetailsBtn')}
                        </label>

                        <input type="checkbox" id={`purchase_modal_${invoice.id}`} className="modal-toggle" />
                        <div className="modal" role="dialog">
                            <div className="modal-box max-w-2xl">
                                <h3 className="text-xl font-bold mb-4">{t('members.invoiceDetailsTitle')}</h3>
                                
                                <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-base-200 rounded-lg">
                                    <div className="col-span-2 font-semibold">{t('members.item')}</div>
                                    <div className="font-semibold text-center">{t('members.quantity')}</div>
                                    <div className="font-semibold text-center">{t('members.price')}</div>
                                    <div className="font-semibold text-center">{t('members.total')}</div>
                                </div>
                                
                                <div className="space-y-3">
                                    {invoice.invoice_items?.map((invoice_item: any, itemIndex: number) => (
                                        <div key={itemIndex} className="grid grid-cols-5 gap-4 py-2 border-b border-base-300">
                                            <div className="col-span-2 text-sm">{invoice_item.name}</div>
                                            <div className="text-sm text-center">{invoice_item.quantity}</div>
                                            <div className="text-sm text-center">${invoice_item.price}</div>
                                            <div className="text-sm text-center font-semibold">${invoice_item.total_price}</div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-base-300">
                                    <span className="font-semibold text-lg">{t('members.grandTotal')}</span>
                                    <span className="text-xl font-bold text-primary">${invoice.total_price}</span>
                                </div>
                                
                                <div className="modal-action">
                                    <label htmlFor={`purchase_modal_${invoice.id}`} className="btn">{t('close')}</label>
                                </div>
                            </div>
                            <label className="modal-backdrop" htmlFor={`purchase_modal_${invoice.id}`}></label>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
}