'use client'

import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

type Option = string | { value: string; label?: React.ReactNode }

interface FilterSelectProps<T extends Option> {
  options: T[]
  placeholder?: string
  name: string
  // optional
  value?: string
  onValueChange?: (value: string | null) => void
}

export function FilterSelect<T extends Option>({
  options,
  placeholder,
  name,
  value,
  onValueChange,
}: FilterSelectProps<T>) {
  // resolve value
  const getValue = (opt: T) => (typeof opt === 'string' ? opt : opt.value)

  // resolve label
  const getLabel = (opt: T) => (typeof opt === 'string' ? opt : (opt.label ?? opt.value))

  const [selectedValue, setSelectedValue] = React.useState(value ?? '')

  // reset when filter-reset event is dispatched
  React.useEffect(() => {
    const handler = () => setSelectedValue('')
    window.addEventListener('filter-reset', handler)
    return () => window.removeEventListener('filter-reset', handler)
  }, [])

  const handleChange = (val: string | null) => {
    if (val === null) return

    setSelectedValue(val)

    // external callback (optional)
    onValueChange?.(val)

    const el = document.getElementById(`filter-${name}`)

    if (el instanceof HTMLInputElement) {
      el.value = val

      // 👇 trigger đúng event mà initBlogFilter đang nghe
      el.dispatchEvent(new Event('change', { bubbles: true }))
      el.dispatchEvent(new Event('input', { bubbles: true })) // backup
    }
  }

  // find label for current value
  const selectedLabel = options
    .map((opt) => ({
      value: getValue(opt),
      label: getLabel(opt),
    }))
    .find((item) => item.value === selectedValue)?.label

  return (
    <Select value={selectedValue} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <span className="flex-1 text-left">{selectedLabel || placeholder}</span>
      </SelectTrigger>

      <SelectContent>
        {options.map((opt) => {
          const val = getValue(opt)

          return (
            <SelectItem key={val} value={val}>
              {getLabel(opt)}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
