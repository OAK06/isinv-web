"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { updateBillingBranchAddons } from "@/app/(app)/billing/_billing"

interface BranchAddonsProps {
  branchID: number
  branches: any[]
  availableAddons: any[]
  subscriptionAddons: any[]
  onSaved: () => void
  readOnly?: boolean
}

export default function BranchAddonsSection({
  branchID,
  branches,
  availableAddons,
  subscriptionAddons,
  onSaved,
  readOnly = false,
}: BranchAddonsProps) {
  const { t } = useTranslation()
  const [saving, setSaving] = useState<string | null>(null)

  if (!branches.length || !availableAddons.length) {
    return null
  }

  const activeSlugsFor = (branchId: number): string[] => {
    return subscriptionAddons
      .filter((row: any) => row.branch_id === branchId)
      .map((row: any) => row.slug)
  }

  const isChecked = (branchId: number, slug: string): boolean => {
    return activeSlugsFor(branchId).includes(slug)
  }

  const toggle = async (branchId: number, slug: string) => {
    if (readOnly) return
    const current = activeSlugsFor(branchId)
    const next = isChecked(branchId, slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug]

    try {
      setSaving(String(branchId))
      await updateBillingBranchAddons(branchID, branchId, next)
    } finally {
      setSaving(null)
      onSaved()
    }
  }

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-1 flex items-center">
          <div className="w-1 h-5 bg-primary rounded me-2"></div>
          {t("billing.branchAddonsTitle")}
        </h3>
        <p className="text-sm text-base-content/60 mb-4">{t("billing.branchAddonsHint")}</p>

        <div className="space-y-6">
          {branches.map((branch: any) => (
            <div key={branch.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="font-semibold">{branch.name}</div>
                {saving === String(branch.id) && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableAddons.map((addon: any) => (
                  <label
                    key={`${branch.id}-${addon.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-base-300 p-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={isChecked(branch.id, addon.slug)}
                      disabled={saving === String(branch.id) || readOnly}
                      onChange={() => toggle(branch.id, addon.slug)}
                    />
                    <span className="flex-1">
                      <span className="font-medium block">{t(`addons.${addon.slug}.title`)}</span>
                      {addon.monthly_price != null && (
                        <span className="text-xs text-base-content/60">
                          {addon.monthly_price} {addon.currency}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
