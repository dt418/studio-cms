import type { ReactNode } from 'react'
import { X, Paintbrush } from 'lucide-react'

interface PanelProps {
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function Panel({ open, onToggle, children }: PanelProps) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="animate-scale-in border-border bg-background/95 w-80 rounded-xl border shadow-2xl shadow-black/10 backdrop-blur-xl dark:shadow-black/40">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold tracking-tight">Theme</h3>
            <button
              type="button"
              onClick={onToggle}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
              aria-label="Close theme editor"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex size-10 items-center justify-center rounded-xl border shadow-lg transition-all duration-200 ${
          open
            ? 'border-primary/40 bg-primary text-primary-foreground shadow-primary/25'
            : 'border-border bg-background/80 text-muted-foreground hover:text-foreground hover:border-primary/30 shadow-black/5 backdrop-blur-xl dark:shadow-black/30'
        } `}
        aria-label={open ? 'Close theme editor' : 'Open theme editor'}
      >
        <Paintbrush className="size-4" />
      </button>
    </div>
  )
}
