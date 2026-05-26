import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/utils/api'

const FORMATS = ['png', 'pdf', 'gif'] as const
const RESOLUTIONS = [
  { value: 150, label: '150 dpi' },
  { value: 300, label: '300 dpi' },
  { value: 600, label: '600 dpi' },
]

export default function ExportPanel({ onClose }: { onClose: () => void }) {
  const buildPlotRequest = useStore((s) => s.buildPlotRequest)
  const setIsLoading = useStore((s) => s.setIsLoading)
  const setError = useStore((s) => s.setError)
  const activeFile = useStore((s) => s.activeFile)
  const selectedVariables = useStore((s) => s.selectedVariables)

  const [format, setFormat] = useState<string>('png')
  const [dpi, setDpi] = useState(300)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!activeFile || selectedVariables.length === 0) {
      setError('请先选择文件和变量')
      return
    }

    setExporting(true)
    setIsLoading(true)
    setError(null)
    try {
      const request = buildPlotRequest()
      const blob = await api.exportPlot(request, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `palmdraw_export.${format}`
      a.click()
      URL.revokeObjectURL(url)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '导出失败')
    } finally {
      setExporting(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-80 bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">导出图片</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">格式</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
                    format === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">分辨率</label>
            <div className="flex gap-2">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setDpi(r.value)}
                  className={`flex-1 py-1.5 text-sm rounded transition-colors ${
                    dpi === r.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {exporting ? '导出中...' : '导出'}
          </button>
        </div>
      </div>
    </div>
  )
}
