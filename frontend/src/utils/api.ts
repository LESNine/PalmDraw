import type { PlotRequest, PlotResult, FileMetaInfo, FileBrowseItem } from '@/types'

const API_BASE = '/api'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || res.statusText)
  }
  return res.json()
}

export const api = {
  browse: (path: string) =>
    fetchJSON<{ files: FileBrowseItem[] }>(`/files/browse?path=${encodeURIComponent(path)}`, { method: 'POST' }),

  fileInfo: (filePath: string) =>
    fetchJSON<FileMetaInfo>(`/files/info?file_path=${encodeURIComponent(filePath)}`, { method: 'POST' }),

  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/files/upload`, { method: 'POST', body: formData })
    return res.json()
  },

  render: (request: PlotRequest) =>
    fetchJSON<PlotResult>('/plot/render', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  preview: (request: PlotRequest) =>
    fetchJSON<PlotResult>('/plot/preview', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  exportPlot: async (request: PlotRequest, format: string = 'png') => {
    const res = await fetch(`${API_BASE}/export/?format=${format}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return res.blob()
  },
}
