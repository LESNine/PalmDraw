import { AlertCircle, BarChart3 } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function PlotViewer() {
  const plotResult = useStore((s) => s.plotResult)
  const isLoading = useStore((s) => s.isLoading)
  const error = useStore((s) => s.error)
  const loadingMessage = useStore((s) => s.loadingMessage)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200 px-8">
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{
              animation: 'progressBar 2s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>
        <p className="mt-3 text-sm text-gray-500">{loadingMessage ?? '正在绘制...'}</p>
        <style>{`
          @keyframes progressBar {
            0% { width: 10%; margin-left: 0; }
            50% { width: 50%; margin-left: 25%; }
            100% { width: 10%; margin-left: 90%; }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-red-200">
        <AlertCircle size={32} className="text-red-500" />
        <p className="mt-3 text-sm text-red-600 text-center px-4">{error}</p>
      </div>
    )
  }

  if (!plotResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200">
        <BarChart3 size={48} className="text-gray-300" />
        <p className="mt-3 text-sm text-gray-400">请选择文件和变量后点击绘制</p>
      </div>
    )
  }

  if (plotResult.content_type === 'image/png' || plotResult.content_type === 'image/gif') {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg border border-gray-200 p-2">
        <img
          src={`data:${plotResult.content_type};base64,${plotResult.data}`}
          alt="Plot"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  if (plotResult.content_type === 'text/html') {
    const htmlContent = atob(plotResult.data)
    return (
      <div className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        <iframe
          srcDoc={htmlContent}
          title="Plot"
          className="w-full h-full border-0"
          sandbox="allow-scripts"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200">
      <p className="text-sm text-gray-400">不支持的内容类型: {plotResult.content_type}</p>
    </div>
  )
}
