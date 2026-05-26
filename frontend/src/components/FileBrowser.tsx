import { useState } from 'react'
import { Folder, FileIcon, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/utils/api'
import type { FileBrowseItem } from '@/types'

const FILE_TYPE_STYLES: Record<string, string> = {
  static: 'bg-blue-100 text-blue-700',
  dynamic: 'bg-orange-100 text-orange-700',
  radiation: 'bg-purple-100 text-purple-700',
  '3d_output': 'bg-green-100 text-green-700',
}

function getFileTypeBadge(fileType: string | null) {
  if (!fileType) return null
  const style = FILE_TYPE_STYLES[fileType] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${style}`}>
      {fileType}
    </span>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
      style={{ animation: 'spin 0.8s linear infinite' }}
    />
  )
}

export default function FileBrowser() {
  const files = useStore((s) => s.files)
  const currentPath = useStore((s) => s.currentPath)
  const activeFile = useStore((s) => s.activeFile)
  const loadingMessage = useStore((s) => s.loadingMessage)
  const setFiles = useStore((s) => s.setFiles)
  const setCurrentPath = useStore((s) => s.setCurrentPath)
  const setActiveFile = useStore((s) => s.setActiveFile)
  const setFileMeta = useStore((s) => s.setFileMeta)
  const setError = useStore((s) => s.setError)
  const setLoadingMessage = useStore((s) => s.setLoadingMessage)
  const [pathInput, setPathInput] = useState(currentPath)
  const [loading, setLoading] = useState(false)

  const handleNavigate = async (item: FileBrowseItem) => {
    if (item.is_dir) {
      setLoading(true)
      setLoadingMessage('正在加载...')
      try {
        const res = await api.browse(item.path)
        setFiles(res.files)
        setCurrentPath(item.path)
        setPathInput(item.path)
      } catch (e) {
        setError(e instanceof Error ? e.message : '浏览目录失败')
      } finally {
        setLoading(false)
        setLoadingMessage(null)
      }
    } else {
      setLoading(true)
      setLoadingMessage('正在读取文件信息...')
      try {
        const meta = await api.fileInfo(item.path)
        setFileMeta(meta)
        setActiveFile(item.path)
      } catch (e) {
        setError(e instanceof Error ? e.message : '获取文件信息失败')
      } finally {
        setLoading(false)
        setLoadingMessage(null)
      }
    }
  }

  const handlePathSubmit = async () => {
    if (!pathInput.trim()) return
    setLoading(true)
    setLoadingMessage('正在加载...')
    try {
      const res = await api.browse(pathInput.trim())
      setFiles(res.files)
      setCurrentPath(pathInput.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : '浏览路径失败')
    } finally {
      setLoading(false)
      setLoadingMessage(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 p-2 border-b border-gray-200">
        <input
          type="text"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePathSubmit()}
          placeholder="输入路径"
          className="flex-1 px-2 py-1 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handlePathSubmit}
          className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          浏览
        </button>
      </div>

      {loading && loadingMessage && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
          <Spinner />
          <span>{loadingMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {!loading && files.length === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-gray-400">
            请输入路径浏览文件
          </div>
        )}

        {!loading &&
          files.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-100 transition-colors ${
                activeFile === item.path ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              {item.is_dir ? (
                <Folder size={16} className="text-yellow-500 shrink-0" />
              ) : (
                <FileIcon size={16} className="text-gray-400 shrink-0" />
              )}
              <span className="flex-1 truncate font-mono text-xs">{item.name}</span>
              {getFileTypeBadge(item.file_type)}
              {item.is_dir && <ChevronRight size={14} className="text-gray-400 shrink-0" />}
            </button>
          ))}
      </div>
    </div>
  )
}
