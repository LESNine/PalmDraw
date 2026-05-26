import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { OverlayConfig } from '@/types'

const OVERLAY_TYPES = [
  { value: 'terrain_contour', label: '地形等值线' },
  { value: 'terrain_fill', label: '地形填色' },
  { value: 'wind_vector', label: '风场矢量' },
]

export default function OverlayManager({ onClose }: { onClose: () => void }) {
  const overlays = useStore((s) => s.overlays)
  const addOverlay = useStore((s) => s.addOverlay)
  const removeOverlay = useStore((s) => s.removeOverlay)

  const [showForm, setShowForm] = useState(false)
  const [filePath, setFilePath] = useState('')
  const [variable, setVariable] = useState('')
  const [overlayType, setOverlayType] = useState(OVERLAY_TYPES[0].value)

  const handleAdd = () => {
    if (!filePath.trim() || !variable.trim()) return
    const overlay: OverlayConfig = {
      file_path: filePath.trim(),
      variable: variable.trim(),
      overlay_type: overlayType,
      style: {},
    }
    addOverlay(overlay)
    setFilePath('')
    setVariable('')
    setShowForm(false)
  }

  const getTypeLabel = (type: string) => {
    return OVERLAY_TYPES.find((t) => t.value === type)?.label ?? type
  }

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'terrain_contour':
        return 'bg-amber-100 text-amber-700'
      case 'terrain_fill':
        return 'bg-green-100 text-green-700'
      case 'wind_vector':
        return 'bg-sky-100 text-sky-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">叠加层管理</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {overlays.length === 0 && !showForm && (
        <p className="text-xs text-gray-400">暂无叠加层</p>
      )}

      <div className="space-y-2">
        {overlays.map((overlay, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded text-sm"
          >
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${getTypeBadgeStyle(overlay.overlay_type)}`}
            >
              {getTypeLabel(overlay.overlay_type)}
            </span>
            <span className="flex-1 font-mono text-xs text-gray-700 truncate">
              {overlay.variable}
            </span>
            <button
              onClick={() => removeOverlay(idx)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="文件路径"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            placeholder="变量名"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={overlayType}
            onChange={(e) => setOverlayType(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {OVERLAY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!filePath.trim() || !variable.trim()}
              className="flex-1 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              确认添加
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus size={14} />
          添加叠加层
        </button>
      )}
    </div>
  )
}
