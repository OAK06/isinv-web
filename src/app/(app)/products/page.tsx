"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getProducts, deleteProduct, bulkDeleteProduct } from "@/app/(app)/products/_product"
import { useAtom } from "jotai"
import { branch, posRegister } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function ProductList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/products",
		view: user.permissions.includes('view products'),
		edit: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'update company products' : 'update products'
            return user.permissions.includes(permission)
        },
		delete: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'delete company products' : 'delete products'
            return user.permissions.includes(permission)
        }
	}
	const [ branchID ] = useAtom(branch)
	const [ posRegisterID ] = useAtom(posRegister)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getProducts(page, branchID, posRegisterID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'name', label: t('products.table.name') },
		{ key: 'type', label: t('products.table.type') },
		{ key: 'company_id', label: t('products.table.company') },
        { key: 'branch_id', label: t('products.table.branch') },
		{ key: 'category_id', label: t('products.table.category') },
        { key: 'cost_price', label: t('products.table.costPrice') },
		{ key: 'cost_gst', label: t('products.table.costGst') },
		{ key: 'sell_price', label: t('products.table.sellPrice') },
        { key: 'sell_gst', label: t('products.table.sellGst') },
		{ key: 'fixed_price', label: t('products.table.fixedPrice') },
        { key: 'allow_negative', label: t('products.table.allowNegative') },
		{ key: 'low_stock_notice', label: t('products.table.lowStockNotice') },
		{ key: 'low_stock_re_order', label: t('products.table.lowStockReOrder') },
        { key: 'active', label: t('products.table.active') },
		{ key: 'created_by', label: t('products.table.createdBy') },
        { key: 'updated_by', label: t('products.table.updatedBy') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('products.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create products') && <Link href="/products/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('products.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteProduct} bulkDeleteFunction={bulkDeleteProduct} archiveable={true} tableController={'product'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}