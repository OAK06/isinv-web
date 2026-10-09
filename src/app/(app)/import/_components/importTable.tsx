"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "next-i18next";

export default function ImportTable({ data, getListFunction, colHeaderNames = []}: any) {
    const { t } = useTranslation('common')

    return <> 
		
		<div className="overflow-x-auto">
			{(data.data === undefined || data.data.length === 0) && <div className="text-sm text-center">{t('table.noData')}</div>}
			{(data.data != undefined && data.data.length > 0) && <table className="table min-w-max overflow-x-scroll" style={{ tableLayout: 'auto' }}>
				<thead>
					<tr>
						{Object.keys(data.data[0]).map((value: any, i: number) => {
							if (i === 0) return
							return <th key={i} className="text-primary">
									<div className="flex text-base">
										{colHeaderNames.find((col: any) => col.key === value)?.label || value}
									</div>
								</th>
						})}
						<th></th>
					</tr>
				</thead>
				<tbody>
					{data.data.map((row: any, i: number) => {
						return <tr key={i} className="hover">
							{Object.values(row).map((value: any, j: number) => {
								if (j === 0) return
								var content: any
                                
                                if (value === "true") {
                                    content = <FontAwesomeIcon icon={faCheck} className="text-success text-2xl"/>
                                } else if (value === "false") {
                                    content = <FontAwesomeIcon icon={faXmark} className="text-error text-2xl"/>
                                } else if (Array.isArray(value)) {
                                    content = <ul className={`text-base-content/60 ${value.length > 9 && 'text-xs'}`}>{value.map((item, idx)  => <li key={idx}>{item}</li>)}</ul>
                                } else if (typeof value === 'object' && value !== null && value.constructor === Object) {
                                    content = <div className="grid gap-x-5 grid-cols-1 sm:grid-cols-2">
                                        {Object.entries(value).map(([k, v]: any, J: number) => (
                                            <div key={J} className="">
                                                <strong>{colHeaderNames.find((col: any) => col.key === k)?.label || k}: </strong> <span className="text-base-content/60">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                } else {
                                    content = value
                                }

								return <td key={j}>{content}</td>
							})}
						</tr>
					})}
				</tbody>
			</table>}
		</div>
		{(data.data != undefined && data.data.length > 0) && <div className="flex justify-center mt-1">
			<div className="join">
				{data.current_page != 1 && <button className="join-item btn" onClick={() => { getListFunction(1) }}>«</button>}
				{data.current_page != 1 && <button className="join-item btn" onClick={() => { getListFunction(data.current_page - 1) }}>‹</button>}
				{data.total > 1 && <button className="{data.total > 2 && join-item} btn">{data.current_page}</button>}
				{data.current_page != data.last_page && <button className="join-item btn" onClick={() => { getListFunction(data.current_page + 1) }}>›</button>}
				{data.current_page != data.last_page && <button className="join-item btn" onClick={() => { getListFunction(data.last_page) }}>»</button>}
			</div>
		</div>}
	</>
}
