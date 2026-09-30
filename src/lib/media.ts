import { useEffect, useState } from 'react'

/**
 * On-device media store for uploads (photos and videos) until Supabase Storage lands in Phase 1.
 * Files live in IndexedDB (large quota, survives reloads); records keep a short "idb:<id>" reference.
 * Object URLs are cached in memory so an upload shows instantly and re-renders never re-read disk.
 */

const DB = 'ds-media'
const STORE = 'files'
const urls = new Map<string, string>()
let dbp: Promise<IDBDatabase> | null = null

function db() {
  dbp ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbp
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const r = fn(d.transaction(STORE, mode).objectStore(STORE))
        r.onsuccess = () => resolve(r.result)
        r.onerror = () => reject(r.error)
      }),
  )
}

export const isStored = (src?: string) => !!src && src.startsWith('idb:')

/** Saves a file and returns its reference. The object URL is ready immediately. */
export async function saveMedia(blob: Blob): Promise<string> {
  const id = `idb:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
  urls.set(id, URL.createObjectURL(blob))
  try {
    await tx('readwrite', (s) => s.put(blob, id))
  } catch {
    window.dispatchEvent(new CustomEvent('ds-toast', { detail: 'Couldn’t save that file on this device. It will show until you reload.' }))
  }
  return id
}

export async function deleteMedia(src?: string) {
  if (!isStored(src)) return
  const u = urls.get(src!)
  if (u) URL.revokeObjectURL(u)
  urls.delete(src!)
  try {
    await tx('readwrite', (s) => s.delete(src!))
  } catch {
    /* already gone */
  }
}

/** Resolves any media reference (idb:, data:, http:, blob:) to something <img>/<video> can use. */
export async function resolveMedia(src?: string): Promise<string | undefined> {
  if (!src) return undefined
  if (!isStored(src)) return src
  const hit = urls.get(src)
  if (hit) return hit
  try {
    const blob = await tx<Blob | undefined>('readonly', (s) => s.get(src))
    if (!blob) return undefined
    const u = URL.createObjectURL(blob)
    urls.set(src, u)
    return u
  } catch {
    return undefined
  }
}

/** Hook: synchronous for data:/http: and cached uploads, async (one read) otherwise. */
export function useMedia(src?: string) {
  const [url, setUrl] = useState<string | undefined>(() => (isStored(src) ? urls.get(src!) : src))
  useEffect(() => {
    let live = true
    if (!isStored(src)) setUrl(src)
    else if (urls.has(src!)) setUrl(urls.get(src!))
    else resolveMedia(src).then((u) => live && setUrl(u))
    return () => {
      live = false
    }
  }, [src])
  return url
}

/** Shrinks an image file to a JPEG blob (keeps uploads light and fast). */
export function shrinkToBlob(file: File, max = 1280, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * k)
      c.height = Math.round(img.height * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('unsupported'))), 'image/jpeg', quality)
    }
    img.onerror = () => reject(new Error('unsupported'))
    img.src = URL.createObjectURL(file)
  })
}
