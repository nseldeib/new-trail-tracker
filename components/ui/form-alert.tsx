import { AlertCircle, CheckCircle } from "lucide-react"
import { ALERT } from "@/lib/styles"

interface FormAlertProps {
  type: "error" | "success"
  message: string
  children?: React.ReactNode
}

export function FormAlert({ type, message, children }: FormAlertProps) {
  const isError = type === "error"
  const textClass = isError ? "text-red-800" : "text-green-700"
  const Icon = isError ? AlertCircle : CheckCircle

  return (
    <div className={isError ? ALERT.error : ALERT.success}>
      <div className={`flex items-center gap-2 ${textClass}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {children}
    </div>
  )
}
