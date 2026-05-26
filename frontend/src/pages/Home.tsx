import { useState } from 'react'
import Header from '@/components/Header'
import FileBrowser from '@/components/FileBrowser'
import VariableSelector from '@/components/VariableSelector'
import PlotViewer from '@/components/PlotViewer'
import PlotConfig from '@/components/PlotConfig'
import OverlayManager from '@/components/OverlayManager'
import AnimationControl from '@/components/AnimationControl'
import ExportPanel from '@/components/ExportPanel'
import { useStore } from '@/store/useStore'

export default function Home() {
  const activeFile = useStore((s) => s.activeFile)
  const fileMeta = useStore((s) => s.fileMeta)
  const isLoading = useStore((s) => s.isLoading)

  const [showExport, setShowExport] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f5] text-gray-800">
      <Header onOpenExport={() => setShowExport(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[260px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <FileBrowser />
            <div className="border-t border-gray-200">
              <VariableSelector />
            </div>
          </div>
        </div>

        {/* Center - Plot Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <PlotViewer />
          </div>
          <AnimationControl />
        </div>

        {/* Right Panel */}
        <div className="w-[300px] flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto overflow-x-hidden">
          <PlotConfig onAddOverlay={() => {}} />
          <div className="border-t border-gray-200">
            <OverlayManager onClose={() => {}} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 flex-shrink-0 bg-gray-100 border-t border-gray-200 flex items-center px-3 text-xs text-gray-500 gap-4">
        <span>palmdraw v0.1.0</span>
        {activeFile && <span>文件: {activeFile.split(/[/\\]/).pop()}</span>}
        {fileMeta && <span>类型: {fileMeta.file_type}</span>}
        {fileMeta && <span>变量: {fileMeta.variables.length}</span>}
        {isLoading && <span className="text-blue-600">渲染中...</span>}
      </div>

      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
    </div>
  )
}
