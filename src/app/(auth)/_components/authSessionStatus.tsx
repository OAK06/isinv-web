export default function AuthSessionStatus({ status, className, ...props }) {
	return status && <div
			className={`${className} font-medium text-sm text-success`}
			{...props}>
			{status}
		</div>
}