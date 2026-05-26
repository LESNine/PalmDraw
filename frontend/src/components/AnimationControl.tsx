import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Film } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/utils/api'

export default function AnimationControl() {
  const fileMeta = useStore((s) => s.fileMeta)
  const activeFile = useStore((s) => s.activeFile)
  const selectedVariables = useStore((s) => s.selectedVariables)
  const buildPlotRequest = useStore((s) => s.buildPlotRequest)
  const setPlotResult = useStore((s) => s.setPlotResult)
  const setIsLoading = useStore((s) => s.setIsLoading)
  const setError = useStore((s) => s.setError)

  const [playing, setPlaying] = useState(false)
  const [timeStep, setTimeStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hasTimeDimension = fileMeta && 'time' in fileMeta.dimensions

  useEffect(() => {
    if (fileMeta && 'time' in fileMeta.dimensions) {
      setTotalSteps(fileMeta.dimensions.time)
    }
  }, [fileMeta])

  const renderFrame = useCallback(
    async (step: number) => {
      if (!activeFile || selectedVariables.length === 0) return
      setIsLoading(true)
      setError(null)
      try {
        const request = buildPlotRequest()
        request.time_range = [step, step]
        const result = await api.render(request)
        setPlotResult(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : '渲染帧失败')
      } finally {
        setIsLoading(false)
      }
    },
    [activeFile, selectedVariables, buildPlotRequest, setPlotResult, setIsLoading, setError]
  )

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTimeStep((prev) => {
          const next = prev + 1
          if (next >= totalSteps) {
            setPlaying(false)
            return prev
          }
          renderFrame(next)
          return next
        })
      }, 1000 / 5)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [playing, totalSteps, renderFrame])

  const handleStepForward = () => {
    if (timeStep < totalSteps - 1) {
      const next = timeStep + 1
      setTimeStep(next)
      renderFrame(next)
    }
  }

  const handleStepBackward = () => {
    if (timeStep > 0) {
      const prev = timeStep - 1
      setTimeStep(prev)
      renderFrame(prev)
    }
  }

  const handleExportGif = async () => {
    if (!activeFile || selectedVariables.length === 0) return
    setIsLoading(true)
    try {
      const request = buildPlotRequest()
      request.animation = true
      request.animation_fps = 5
      const blob = await api.exportPlot(request, 'gif')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'animation.gif'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : '导出GIF失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasTimeDimension) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-t border-gray-200">
      <button
        onClick={handleStepBackward}
        disabled={timeStep <= 0}
        className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
      >
        <SkipBack size={18} />
      </button>

      <button
        onClick={() => setPlaying(!playing)}
        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
      >
        {playing ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <button
        onClick={handleStepForward}
        disabled={timeStep >= totalSteps - 1}
        className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300 transition-colors"
      >
        <SkipForward size={18} />
      </button>

      <input
        type="range"
        min={0}
        max={totalSteps - 1}
        value={timeStep}
        onChange={(e) => {
          const step = Number(e.target.value)
          setTimeStep(step)
          renderFrame(step)
        }}
        className="flex-1 accent-blue-600"
      />

      <span className="text-xs font-mono text-gray-600 min-w-[80px] text-right">
        时间步: {timeStep} / {totalSteps - 1}
      </span>

      <button
        onClick={handleExportGif}
        className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors"
      >
        <Film size={14} />
        导出GIF
      </button>
    </div>
  )
}
