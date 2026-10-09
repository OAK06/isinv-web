import axios from "@/lib/axios"

// dimension -> key -> { code, name }
export type AccountMap = Record<string, Record<string, { code: string; name: string }>>

export type MappingRow = { dimension: string; key: string; account_code: string; account_name: string }

/** Merged default + per-tenant override account codes, for the mappings editor. */
export async function getAccountMappings(branchID: number) {
  return await axios.get(`/api/finance/account-mappings?branch=${branchID}`, {
      headers: { 'X-SWR-Request': true },
    })
    .then(res => res.data)
    .catch(error => { throw error })
}

export async function saveAccountMappings(branchID: number, mappings: MappingRow[]) {
  return await axios.put(`/api/finance/account-mappings`, { branch: branchID, mappings }, {
      headers: { 'X-Form-Request': true },
    })
    .then(res => res.data)
    .catch(error => { throw error })
}

/** Returns the CSV as a Blob for client-side download. */
export async function exportJournal(branchID: number, from: string, to: string) {
  return await axios.get(`/api/finance/export?branch=${branchID}&from=${from}&to=${to}`, {
      responseType: 'blob',
      headers: { 'X-Form-Request': true },
    })
    .then(res => res.data as Blob)
    .catch(error => { throw error })
}
