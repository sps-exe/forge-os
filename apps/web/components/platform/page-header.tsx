import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  handle?: string
  accentClass: string
}

export function PageHeader({ icon: Icon, title, handle, accentClass }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon className={`size-7 ${accentClass}`} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {handle && <p className="text-muted-foreground text-sm">@{handle}</p>}
      </div>
    </div>
  )
}
