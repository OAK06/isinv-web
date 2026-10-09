'use client'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { appTheme } from '@/_state/globalStore'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function RenewalChart({ data }: { data: number[] }) {
    const { t, i18n } = useTranslation('common')
    const [options, setOptions] = useState({})
    const [series, setSeries] = useState([])
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    const [theme] = useAtom(appTheme)
    const isDark = theme === 'gymFlyteDark'

    useEffect(() => {
        setOptions({
        chart: {
            type: 'line',
            toolbar: { show: false },
            background: 'transparent',
            foreColor: isDark ? '#9ca3af' : '#373d3f',
        },
        stroke: {
            curve: 'straight',
            width: 3,
            colors: ['#0284c7'],
        },
        xaxis: {
            categories: t('ownerDashboard.renewalChart.categories', { returnObjects: true }),
        },
        yaxis: {
            opposite: direction === 'rtl',
            min: 0,
            max: 100,
            tickAmount: 10,
        },
        grid: {
            borderColor: isDark ? '#404040' : '#e5e7eb',
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            rtl: direction === 'rtl',
            y: {
                formatter: (val) => `${val}%`,
            },
        },
        markers: {
            size: 5,
            colors: ['#0284c7'],
            strokeWidth: 2,
        },
        })

        setSeries([
        {
            name: t('ownerDashboard.renewalChart.name'),
            data: data,
        },
        ])
    }, [isDark])

    return <Chart options={options} series={series} type="line" height={350} />
}
