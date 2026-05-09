'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type Option = string | { value: string; label?: React.ReactNode }

interface FilterSelectProps<T extends Option> {
  options: T[]
  placeholder?: string
  name: string
  value?: string
  ariaLabel?: string
  onValueChange?: (value: string | null) => void
}

export function FilterSelect<T extends Option>({
  options,
  placeholder,
  name,
  value,
  ariaLabel,
  onValueChange,
}: FilterSelectProps<T>) {
  const getValue = (opt: T) => (typeof opt === 'string' ? opt : opt.value)
  const getLabel = (opt: T) => (typeof opt === 'string' ? opt : (opt.label ?? opt.value))
  const listboxId = React.useId()

  const [selectedValue, setSelectedValue] = React.useState(value ?? '')
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = () => {
      setSelectedValue('')
      setOpen(false)
    }
    window.addEventListener('filter-reset', handler)
    return () => window.removeEventListener('filter-reset', handler)
  }, [])

  React.useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (val: string | null) => {
    if (val === null) return

    setSelectedValue(val)
    setOpen(false)
    onValueChange?.(val)

    const el = document.getElementById(`filter-${name}`)

    if (el instanceof HTMLInputElement) {
      el.value = val
      el.dispatchEvent(new Event('change', { bubbles: true }))
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  const selectedLabel = options
    .map((opt) => ({
      value: getValue(opt),
      label: getLabel(opt),
    }))
    .find((item) => item.value === selectedValue)?.label

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 flex h-8 w-full items-center justify-between gap-1.5 rounded-none border bg-transparent py-2 pr-2 pl-2.5 text-xs whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50'
        )}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <span className="flex-1 text-left">{selectedLabel || placeholder}</span>
        <span aria-hidden="true" className="text-muted-foreground pointer-events-none text-xs">
          ▼
        </span>
      </button>

      <div className={cn(!open && 'hidden')} aria-hidden={!open}>
        <div
          id={listboxId}
          role="listbox"
          className="bg-popover text-popover-foreground ring-foreground/10 absolute top-full left-0 z-50 mt-1 max-h-72 w-full min-w-36 overflow-y-auto rounded-none shadow-md ring-1"
        >
          {options.map((opt) => {
            const val = getValue(opt)
            const selected = val === selectedValue

            return (
              <button
                key={val}
                type="button"
                role="option"
                aria-selected={selected}
                className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-none py-2 pr-8 pl-2 text-left text-xs outline-hidden select-none"
                onClick={() => handleChange(val)}
              >
                <span className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
                  {getLabel(opt)}
                </span>
                {selected && (
                  <span aria-hidden="true" className="pointer-events-none absolute right-2">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
