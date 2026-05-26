import { useState, useRef } from 'react'
import { FolderOpen, Upload, Download, Settings } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/utils/api'

interface HeaderProps {
  onOpenExport: () => void
}

export default function Header({ onOpenExport }: HeaderProps) {
  const setCurrentPath = useStore((s) => s.setCurrentPath)
  const setFiles = useStore((s) => s.setFiles)
  const setError = useStore((s) => s.setError)
  const [pathInput, setPathInput] = useState('')
  const [showPathInput, setShowPathInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleBrowse = async () => {
    if (!pathInput.trim()) return
    try {
      const res = await api.browse(pathInput.trim())
      setFiles(res.files)
      setCurrentPath(pathInput.trim())
      setShowPathInput(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '浏览路径失败')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await api.upload(file)
      const res = await api.browse(useStore.getState().currentPath || '/')
      setFiles(res.files)
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传文件失败')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <header className="flex items-center justify-between px-4 h-12 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-blue-600">palm</span>
          <span className="text-gray-800">draw</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPathInput(!showPathInput)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          <FolderOpen size={16} />
          打开路径
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          <Upload size={16} />
          上传文件
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          <Download size={16} />
          导出
        </button>

        <button className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
          <Settings size={18} />
        </button>
      </div>

      {showPathInput && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <input
            type="text"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBrowse()}
            placeholder="输入路径，如 /data"
            className="w-72 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleBrowse}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            浏览
          </button>
          <button
            onClick={() => setShowPathInput(false)}
            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </header>
  )
}
