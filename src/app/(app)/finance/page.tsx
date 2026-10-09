"use client"
import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFloppyDisk, faDownload } from "@fortawesome/free-solid-svg-icons"
import { branch } from "@/_state/globalStore"
import Header from "@/app/(app)/_components/header"
import { getAccountMappings, saveAccountMappings, exportJournal, type AccountMap, type MappingRow } from "./_finance"

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function firstOfMonthISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

const DIMENSIONS = ['revenue', 'payment_method', 'system'] as const

export default function FinancePage() {
  const [branchID] = useAtom(branch)
  const { t } = useTranslation("common")
  const [accounts, setAccounts] = useState<AccountMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [from, setFrom] = useState<string>(firstOfMonthISO())
  const [to, setTo] = useState<string>(todayISO())
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!branchID || branchID === -1) {
      setLoading(false)
      return
    }
    setLoading(true)
    getAccountMappings(branchID)
      .then(r => setAccounts(r?.response ?? {}))
      .catch(() => setAccounts({}))
      .finally(() => setLoading(false))
  }, [branchID])

  function setField(dim: string, key: string, field: 'code' | 'name', value: string) {
    setAccounts(prev => ({
      ...prev,
      [dim]: {
        ...prev[dim],
        [key]: {
          ...prev[dim][key],
          [field]: value
        }
      }
    }))
    setSaved(false)
  }

  async function save() {
    if (!branchID || branchID === -1) return
    setSaving(true)
    const mappings: MappingRow[] = []
    for (const dim of DIMENSIONS) {
      for (const key of Object.keys(accounts[dim] ?? {})) {
        const a = accounts[dim][key]
        mappings.push({ dimension: dim, key, account_code: a.code, account_name: a.name })
      }
    }
    try {
      const r = await saveAccountMappings(branchID, mappings)
      setAccounts(r?.response ?? accounts)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  async function doExport() {
    if (!branchID || branchID === -1) return
    setExporting(true)
    try {
      const blob = await exportJournal(branchID, from, to)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `is-inventory-journal-${from}-to-${to}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  if (!branchID || branchID === -1) {
    return (
      <>
        <Header title={t('finance.title')} subtitle={t('finance.subtitle')} />
        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <p className="text-base-content/60">{t('finance.noBranch')}</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header title={t('finance.title')} subtitle={t('finance.subtitle')} />
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
      </>
    )
  }

  return (
    <>
      <Header title={t('finance.title')} subtitle={t('finance.subtitle')} />

      <div className="mt-4 space-y-6">
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">{t('finance.exportTitle')}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('finance.from')}</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('finance.to')}</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-primary gap-2"
              onClick={doExport}
              disabled={exporting}
            >
              <FontAwesomeIcon icon={faDownload} />
              {t('finance.exportBtn')}
            </button>
          </div>
        </div>
      </div>

      {DIMENSIONS.map((dim) => (
        <div key={dim} className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg">{t(`finance.dim.${dim}`)}</h2>
            {accounts[dim] && Object.keys(accounts[dim]).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>{t('finance.colKey')}</th>
                      <th>{t('finance.colCode')}</th>
                      <th>{t('finance.colName')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(accounts[dim]).map(([key, account]) => (
                      <tr key={key}>
                        <td>{t(`finance.key.${key}`, key)}</td>
                        <td>
                          <input
                            type="text"
                            className="input input-bordered input-sm w-28"
                            value={account.code}
                            onChange={(e) => setField(dim, key, 'code', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="input input-bordered input-sm w-full"
                            value={account.name}
                            onChange={(e) => setField(dim, key, 'name', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-base-content/60">{t('finance.noAccounts')}</p>
            )}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 flex justify-end gap-2">
        <button
          className="btn btn-primary gap-2"
          onClick={save}
          disabled={saving}
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
          {t('finance.saveBtn')}
        </button>
        {saved && (
          <div className="flex items-center text-sm text-success">
            {t('finance.saved')}
          </div>
        )}
      </div>
      </div>
    </>
  )
}
