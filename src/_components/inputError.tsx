export default function InputError({ messages = [], className = "" }: { messages: string[], className?: string }) {
    return <>
            {messages.length > 0 && (
                <>
                    {messages.map((message, index) => (
                        <p
                            className={`${className} text-xs text-error`}
                            key={index}>
                            {message}
                        </p>
                    ))}
                </>
            )}
        </>
}