'use client'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { appTheme } from '@/_state/globalStore'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function SalesChart({ data }: any) {
    const { t } = useTranslation('common')
    const [options, setOptions] = useState({})
    const [series, setSeries] = useState([])
    const [theme] = useAtom(appTheme)
    const isDark = theme === 'gymFlyteDark'

    useEffect(() => {
        setOptions({
        chart: {
            type: 'donut',
            background: 'transparent',
            foreColor: isDark ? '#9ca3af' : '#373d3f',
        },
        labels: data.plans?.length > 0 ? data.plans : [t('ownerDashboard.salesChart.noData')],
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
        },
        stroke: {
            colors: isDark ? ['#262626'] : ['#ffffff'],
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
            formatter: (val: number) => `${val}%`,
            },
        },
        plotOptions: {
            pie: {
            donut: {
                size: '65%',
            },
            },
        },
        colors: ['#F87171', '#0284c7', '#FBBF24', '#A78BFA', '#34D399', '#60A5FA', '#F472B6', '#F59E0B', '#EE3d3d', '#69d352'],
        })

        setSeries(data.percentages)
    }, [isDark])

    return <Chart options={options} series={series} type="donut" height={350} />
}
