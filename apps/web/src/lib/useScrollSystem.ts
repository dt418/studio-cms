// src/lib/useScrollSystem.ts

type Callback = (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void

class ScrollSystem {
  private observer: IntersectionObserver | null = null
  private callbacks = new Map<Element, Callback>()

  constructor() {
    if (typeof window === 'undefined') return

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const cb = this.callbacks.get(entry.target)
            if (cb) cb(entry, this.observer!)
          })
        },
        {
          rootMargin: '-80px 0px -40% 0px',
          threshold: [0, 0.1, 0.5, 1],
        }
      )
    }
  }

  observe(el: Element, cb: Callback) {
    if (!this.observer) return false
    this.callbacks.set(el, cb)
    this.observer.observe(el)
    return true
  }

  unobserve(el: Element) {
    if (!this.observer) return
    this.callbacks.delete(el)
    this.observer.unobserve(el)
  }

  cleanup() {
    this.observer?.disconnect()
    this.callbacks.clear()
  }
}

// singleton
let instance: ScrollSystem | null = null

export function useScrollSystem() {
  if (typeof window === 'undefined') return null

  if (!instance) {
    instance = new ScrollSystem()
  }

  return instance
}
