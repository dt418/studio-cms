import { useState, useEffect, useCallback } from 'react'
import { Panel } from './Panel'
import { ColorControl } from './ColorControl'
import { Presets } from './Presets'
import { themeStore, applyTheme } from '@/lib/theme-store'
import { getShareUrl } from '@/lib/theme-url'
import type { ThemeConfig } from '@/lib/theme-store'
import type { ThemePreset } from '@/lib/presets'
import { Sun, Moon, Share2 } from 'lucide-react'

export function ThemeEditor() {
  const [config, setConfig] = useState<ThemeConfig>(themeStore.get())
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    return themeStore.subscribe((next) => setConfig(next))
  }, [])

  const toggleTheme = useCallback(() => {
    const next: ThemeConfig = {
      ...config,
      theme: config.theme === 'dark' ? 'light' : 'dark',
    }
    themeStore.set(next)
  }, [config])

  const setPrimary = useCallback(
    (primary: ThemeConfig['primary']) => {
      const next: ThemeConfig = { ...config, primary }
      applyTheme(next)
      setConfig(next)
    },
    [config]
  )

  const commitPrimary = useCallback(() => {
    themeStore.set(config)
  }, [config])

  const selectPreset = useCallback(
    (preset: ThemePreset) => {
      themeStore.set({ ...config, primary: preset.primary })
    },
    [config]
  )

  const share = useCallback(async () => {
    const url = getShareUrl(config)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* fallback for non-secure contexts */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [config])

  return (
    <Panel open={open} onToggle={() => setOpen((prev) => !prev)}>
      <div className="space-y-5">
        {/* Mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">Mode</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="border-border bg-background text-foreground hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            {config.theme === 'dark' ? (
              <>
                <Moon className="size-3.5" />
                Dark
              </>
            ) : (
              <>
                <Sun className="size-3.5" />
                Light
              </>
            )}
          </button>
        </div>

        {/* Presets */}
        <div>
          <span className="text-muted-foreground mb-2 block text-xs font-medium">Presets</span>
          <Presets
            current={
              [
                { name: 'linear', primary: { l: 0.55, c: 0.18, h: 288 } },
                { name: 'vercel', primary: { l: 0.205, c: 0, h: 0 } },
                { name: 'github', primary: { l: 0.5, c: 0.2, h: 250 } },
              ].find(
                (preset) =>
                  preset.primary.l === config.primary.l &&
                  preset.primary.c === config.primary.c &&
                  preset.primary.h === config.primary.h
              )?.name ?? 'custom'
            }
            onSelect={selectPreset}
          />
        </div>

        {/* OKLCH Sliders */}
        <div>
          <span className="text-muted-foreground mb-2 block text-xs font-medium">
            Primary Color
          </span>
          <ColorControl color={config.primary} onChange={setPrimary} />
          <button
            type="button"
            onClick={commitPrimary}
            onKeyUp={(e) => e.key === 'Enter' && commitPrimary()}
            className="bg-primary text-primary-foreground mt-3 w-full rounded-md px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-85"
          >
            Apply
          </button>
        </div>

        {/* Share */}
        <div className="border-border border-t pt-4">
          <button
            type="button"
            onClick={share}
            className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Share2 className="size-3.5" />
            {copied ? 'Copied!' : 'Share theme'}
          </button>
        </div>
      </div>
    </Panel>
  )
}
