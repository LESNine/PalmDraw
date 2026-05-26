import { useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { api } from '@/utils/api'
import type { PlotType } from '@/types'

const PLOT_TYPES: { value: PlotType; label: string }[] = [
  { value: 'contour', label: '填色图' },
  { value: 'cross_section', label: '剖面图' },
  { value: 'timeseries', label: '时间序列' },
  { value: 'wind', label: '风场图' },
  { value: 'spectrum', label: '能谱图' },
  { value: '3d', label: '3D交互' },
  { value: 'animation', label: '动画' },
  { value: 'profile', label: '廓线图' },
  { value: 'terrain_follow', label: '地形跟随' },
]

const COLORMAPS = ['viridis', 'jet', 'coolwarm', 'RdYlBu', 'terrain', 'plasma', 'inferno']

type ProfileMode = 'domain_avg' | 'area_avg' | 'single_point'

function ColormapSelect() {
  const colormap = useStore((s) => s.colormap)
  const setColormap = useStore((s) => s.setColormap)
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">色标</label>
      <select
        value={colormap}
        onChange={(e) => setColormap(e.target.value)}
        className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {COLORMAPS.map((cm) => (
          <option key={cm} value={cm}>
            {cm}
          </option>
        ))}
      </select>
    </div>
  )
}

function ValueRangeInputs({
  rangeMin,
  rangeMax,
  setRangeMin,
  setRangeMax,
}: {
  rangeMin: string
  rangeMax: string
  setRangeMin: (v: string) => void
  setRangeMax: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        值域范围
        <span className="relative inline-block ml-1 group">
          <span className="text-gray-400 cursor-help text-[10px]">(?)</span>
          <span className="absolute left-5 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block w-56 px-2 py-1.5 text-[11px] text-gray-200 bg-gray-800 rounded shadow-lg leading-relaxed whitespace-normal">
            设置色标/坐标轴的数值范围。不填则自动根据数据范围确定。填入最小值和最大值可强制指定显示范围，例如温度只看 280~310K。
          </span>
        </span>
      </label>
      <div className="flex items-center gap-2 overflow-hidden">
        <input
          type="number"
          value={rangeMin}
          onChange={(e) => setRangeMin(e.target.value)}
          placeholder="最小值"
          className="flex-1 min-w-0 box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-gray-400 text-xs">~</span>
        <input
          type="number"
          value={rangeMax}
          onChange={(e) => setRangeMax(e.target.value)}
          placeholder="最大值"
          className="flex-1 min-w-0 box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

function AltitudeInput({
  altitudeInput,
  setAltitudeInput,
  findClosestLevel,
}: {
  altitudeInput: string
  setAltitudeInput: (v: string) => void
  findClosestLevel: (alt: number) => void
}) {
  const heightLevel = useStore((s) => s.heightLevel)
  const targetAltitude = useStore((s) => s.targetAltitude)
  const zLevelsAltitude = useStore((s) => s.zLevelsAltitude)
  const setHeightLevel = useStore((s) => s.setHeightLevel)
  const setTargetAltitude = useStore((s) => s.setTargetAltitude)

  if (zLevelsAltitude.length === 0) {
    return <p className="text-xs text-gray-400 py-1">此文件无高度维度</p>
  }
  return (
    <>
      <div className="flex items-center gap-2 overflow-hidden">
        <input
          type="number"
          value={altitudeInput}
          onChange={(e) => setAltitudeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = Number(altitudeInput)
              if (!isNaN(val)) findClosestLevel(val)
            }
          }}
          placeholder="输入海拔高度"
          className="flex-1 min-w-0 box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            const val = Number(altitudeInput)
            if (!isNaN(val)) findClosestLevel(val)
          }}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          匹配
        </button>
      </div>
      {heightLevel !== null && targetAltitude !== null && (
        <p className="text-xs text-gray-500 mt-1">
          匹配层: 第{heightLevel}层 (海拔 {zLevelsAltitude[heightLevel]?.toFixed(1)} m)
        </p>
      )}
      <button
        onClick={() => {
          setHeightLevel(null)
          setTargetAltitude(null)
          setAltitudeInput('')
        }}
        className={`mt-1.5 text-xs px-2 py-0.5 rounded transition-colors ${
          heightLevel === null
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部高度
      </button>
    </>
  )
}

function ProfileModeSelect() {
  const profileMode = useStore((s) => s.profileMode)
  const setProfileMode = useStore((s) => s.setProfileMode)
  const profileXRange = useStore((s) => s.profileXRange)
  const profileYRange = useStore((s) => s.profileYRange)
  const profileXIndex = useStore((s) => s.profileXIndex)
  const profileYIndex = useStore((s) => s.profileYIndex)
  const setProfileXRange = useStore((s) => s.setProfileXRange)
  const setProfileYRange = useStore((s) => s.setProfileYRange)
  const setProfileXIndex = useStore((s) => s.setProfileXIndex)
  const setProfileYIndex = useStore((s) => s.setProfileYIndex)

  const modes: { value: ProfileMode; label: string }[] = [
    { value: 'domain_avg', label: '全域平均' },
    { value: 'area_avg', label: '区域平均' },
    { value: 'single_point', label: '单格点' },
  ]

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">采样方式</label>
      <div className="space-y-1">
        {modes.map((m) => (
          <label
            key={m.value}
            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm transition-colors ${
              profileMode === m.value
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <input
              type="radio"
              name="profileMode"
              value={m.value}
              checked={profileMode === m.value}
              onChange={() => setProfileMode(m.value)}
              className="accent-blue-600"
            />
            {m.label}
          </label>
        ))}
      </div>
      {profileMode === 'area_avg' && (
        <div className="ml-4 space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X范围 (起止索引)</label>
            <div className="flex items-center gap-2 overflow-hidden">
              <input
                type="number"
                value={profileXRange?.[0] ?? ''}
                onChange={(e) => {
                  const v = e.target.value !== '' ? Number(e.target.value) : 0
                  setProfileXRange([v, profileXRange?.[1] ?? 0])
                }}
                placeholder="起始"
                className="flex-1 min-w-0 box-border px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-xs">~</span>
              <input
                type="number"
                value={profileXRange?.[1] ?? ''}
                onChange={(e) => {
                  const v = e.target.value !== '' ? Number(e.target.value) : 0
                  setProfileXRange([profileXRange?.[0] ?? 0, v])
                }}
                placeholder="结束"
                className="flex-1 min-w-0 box-border px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y范围 (起止索引)</label>
            <div className="flex items-center gap-2 overflow-hidden">
              <input
                type="number"
                value={profileYRange?.[0] ?? ''}
                onChange={(e) => {
                  const v = e.target.value !== '' ? Number(e.target.value) : 0
                  setProfileYRange([v, profileYRange?.[1] ?? 0])
                }}
                placeholder="起始"
                className="flex-1 min-w-0 box-border px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-xs">~</span>
              <input
                type="number"
                value={profileYRange?.[1] ?? ''}
                onChange={(e) => {
                  const v = e.target.value !== '' ? Number(e.target.value) : 0
                  setProfileYRange([profileYRange?.[0] ?? 0, v])
                }}
                placeholder="结束"
                className="flex-1 min-w-0 box-border px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
      {profileMode === 'single_point' && (
        <div className="ml-4 space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X索引</label>
            <input
              type="number"
              value={profileXIndex}
              onChange={(e) => setProfileXIndex(Number(e.target.value))}
              className="w-full max-w-full box-border px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y索引</label>
            <input
              type="number"
              value={profileYIndex}
              onChange={(e) => setProfileYIndex(Number(e.target.value))}
              className="w-full max-w-full box-border px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function PlotTypeParams({
  rangeMin,
  rangeMax,
  setRangeMin,
  setRangeMax,
  altitudeInput,
  setAltitudeInput,
  findClosestLevel,
}: {
  rangeMin: string
  rangeMax: string
  setRangeMin: (v: string) => void
  setRangeMax: (v: string) => void
  altitudeInput: string
  setAltitudeInput: (v: string) => void
  findClosestLevel: (alt: number) => void
}) {
  const plotType = useStore((s) => s.plotType)
  const crossSectionDirection = useStore((s) => s.crossSectionDirection)
  const crossSectionPosition = useStore((s) => s.crossSectionPosition)
  const setCrossSectionDirection = useStore((s) => s.setCrossSectionDirection)
  const setCrossSectionPosition = useStore((s) => s.setCrossSectionPosition)
  const animationFps = useStore((s) => s.animationFps)
  const setAnimationFps = useStore((s) => s.setAnimationFps)
  const staticFilePath = useStore((s) => s.staticFilePath)
  const setStaticFilePath = useStore((s) => s.setStaticFilePath)
  const heightAboveGround = useStore((s) => s.heightAboveGround)
  const setHeightAboveGround = useStore((s) => s.setHeightAboveGround)
  const zLevelsAltitude = useStore((s) => s.zLevelsAltitude)
  const spectrumHeightLevel = useStore((s) => s.spectrumHeightLevel)
  const setSpectrumHeightLevel = useStore((s) => s.setSpectrumHeightLevel)
  const fileMeta = useStore((s) => s.fileMeta)
  const viewPreset = useStore((s) => s.viewPreset)
  const setViewPreset = useStore((s) => s.setViewPreset)
  const zAvg = useStore((s) => s.zAvg)
  const setZAvg = useStore((s) => s.setZAvg)

  switch (plotType) {
    case 'contour':
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">海拔高度 (m)</label>
            <AltitudeInput
              altitudeInput={altitudeInput}
              setAltitudeInput={setAltitudeInput}
              findClosestLevel={findClosestLevel}
            />
          </div>
          <ColormapSelect />
          <ValueRangeInputs
            rangeMin={rangeMin}
            rangeMax={rangeMax}
            setRangeMin={setRangeMin}
            setRangeMax={setRangeMax}
          />
        </div>
      )

    case 'cross_section':
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">剖面方向</label>
            <div className="space-y-1">
              <label
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm transition-colors ${
                  crossSectionDirection === 'x'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="crossDir"
                  value="x"
                  checked={crossSectionDirection === 'x'}
                  onChange={() => setCrossSectionDirection('x')}
                  className="accent-blue-600"
                />
                X方向 (沿x轴切，显示y-z平面)
              </label>
              <label
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm transition-colors ${
                  crossSectionDirection === 'y'
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="crossDir"
                  value="y"
                  checked={crossSectionDirection === 'y'}
                  onChange={() => setCrossSectionDirection('y')}
                  className="accent-blue-600"
                />
                Y方向 (沿y轴切，显示x-z平面)
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">剖面位置 (索引)</label>
            <input
              type="number"
              value={crossSectionPosition}
              onChange={(e) => setCrossSectionPosition(Number(e.target.value))}
              min={0}
              className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fileMeta && (
              <p className="text-xs text-gray-400 mt-1">
                可用范围: 0 ~ {crossSectionDirection === 'x'
                  ? (fileMeta.dimensions.x ?? fileMeta.dimensions.south_north ?? '?') - 1
                  : (fileMeta.dimensions.y ?? fileMeta.dimensions.west_east ?? '?') - 1}
              </p>
            )}
          </div>
          <ColormapSelect />
          <ValueRangeInputs
            rangeMin={rangeMin}
            rangeMax={rangeMax}
            setRangeMin={setRangeMin}
            setRangeMax={setRangeMax}
          />
        </div>
      )

    case 'profile':
      return (
        <div className="space-y-2">
          <ProfileModeSelect />
        </div>
      )

    case 'timeseries':
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">海拔高度 (m)</label>
            <AltitudeInput
              altitudeInput={altitudeInput}
              setAltitudeInput={setAltitudeInput}
              findClosestLevel={findClosestLevel}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={zAvg}
              onChange={(e) => setZAvg(e.target.checked)}
              className="accent-blue-600"
            />
            <label className="text-xs text-gray-600">
              高度平均
              <span className="relative inline-block ml-1 group">
                <span className="text-gray-400 cursor-help text-[10px]">(?)</span>
                <span className="absolute left-5 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block w-56 px-2 py-1.5 text-[11px] text-gray-200 bg-gray-800 rounded shadow-lg leading-relaxed whitespace-normal">
                  开启后，若未指定高度层，将对所有高度层取平均后绘制时间序列；关闭时，4D变量必须指定高度层才能绘图。
                </span>
              </span>
            </label>
          </div>
          <ProfileModeSelect />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">时间范围 (步索引)</label>
            <p className="text-xs text-gray-400">留空则使用默认范围</p>
          </div>
        </div>
      )

    case 'wind':
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">海拔高度 (m)</label>
            <AltitudeInput
              altitudeInput={altitudeInput}
              setAltitudeInput={setAltitudeInput}
              findClosestLevel={findClosestLevel}
            />
          </div>
          <ColormapSelect />
          <ValueRangeInputs
            rangeMin={rangeMin}
            rangeMax={rangeMax}
            setRangeMin={setRangeMin}
            setRangeMax={setRangeMax}
          />
        </div>
      )

    case 'spectrum':
      return (
        <div className="space-y-2">
          <ProfileModeSelect />
          {zLevelsAltitude.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">高度层 (可选)</label>
              <input
                type="number"
                value={spectrumHeightLevel ?? ''}
                onChange={(e) => setSpectrumHeightLevel(e.target.value !== '' ? Number(e.target.value) : null)}
                placeholder="高度层索引"
                className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      )

    case '3d':
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">海拔高度 (m)</label>
            <AltitudeInput
              altitudeInput={altitudeInput}
              setAltitudeInput={setAltitudeInput}
              findClosestLevel={findClosestLevel}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">视角预设</label>
            <div className="flex gap-1.5">
              {[
                { key: 'front', label: '正视' },
                { key: 'side', label: '侧视' },
                { key: 'top', label: '俯视' },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewPreset(v.key)}
                  className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                    viewPreset === v.key
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )

    case 'animation':
      return (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">海拔高度 (m)</label>
            <AltitudeInput
              altitudeInput={altitudeInput}
              setAltitudeInput={setAltitudeInput}
              findClosestLevel={findClosestLevel}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">帧率 (FPS)</label>
            <select
              value={animationFps}
              onChange={(e) => setAnimationFps(Number(e.target.value))}
              className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={24}>24</option>
              <option value={30}>30</option>
            </select>
          </div>
          <ColormapSelect />
        </div>
      )

    case 'terrain_follow':
      return (
        <div className="space-y-2">
          <div className="space-y-2 p-2 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs font-medium text-amber-700">地形跟随模式</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">static文件路径</label>
              <input
                type="text"
                value={staticFilePath ?? ''}
                onChange={(e) => setStaticFilePath(e.target.value || null)}
                placeholder="输入static文件路径"
                className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">地上高度 (m)</label>
              <input
                type="number"
                value={heightAboveGround ?? ''}
                onChange={(e) => setHeightAboveGround(e.target.value !== '' ? Number(e.target.value) : null)}
                placeholder="输入地上高度"
                className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <ColormapSelect />
          <ValueRangeInputs
            rangeMin={rangeMin}
            rangeMax={rangeMax}
            setRangeMin={setRangeMin}
            setRangeMax={setRangeMax}
          />
        </div>
      )

    default:
      return null
  }
}

export default function PlotConfig({ onAddOverlay }: { onAddOverlay: () => void }) {
  const plotType = useStore((s) => s.plotType)
  const valueRange = useStore((s) => s.valueRange)
  const selectedVariables = useStore((s) => s.selectedVariables)
  const activeFile = useStore((s) => s.activeFile)
  const targetAltitude = useStore((s) => s.targetAltitude)
  const overlays = useStore((s) => s.overlays)
  const setPlotType = useStore((s) => s.setPlotType)
  const setHeightLevel = useStore((s) => s.setHeightLevel)
  const setTargetAltitude = useStore((s) => s.setTargetAltitude)
  const setValueRange = useStore((s) => s.setValueRange)
  const setPlotResult = useStore((s) => s.setPlotResult)
  const setIsLoading = useStore((s) => s.setIsLoading)
  const setError = useStore((s) => s.setError)
  const buildPlotRequest = useStore((s) => s.buildPlotRequest)
  const plotStyle = useStore((s) => s.plotStyle)
  const setPlotStyle = useStore((s) => s.setPlotStyle)

  const [rangeMin, setRangeMin] = useState(valueRange?.[0]?.toString() ?? '')
  const [rangeMax, setRangeMax] = useState(valueRange?.[1]?.toString() ?? '')
  const [altitudeInput, setAltitudeInput] = useState(targetAltitude?.toString() ?? '')
  const [styleExpanded, setStyleExpanded] = useState(false)

  const findClosestLevel = useCallback(async (altitude: number) => {
    if (!activeFile) return
    try {
      const res = await fetch(
        `/api/files/find_level?file_path=${encodeURIComponent(activeFile)}&altitude=${altitude}`,
        { method: 'POST' }
      )
      const data = await res.json()
      setHeightLevel(data.level_index)
      setTargetAltitude(altitude)
    } catch (e) {
      console.error('Failed to find level:', e)
    }
  }, [activeFile, setHeightLevel, setTargetAltitude])

  const handleRender = async () => {
    if (!activeFile || selectedVariables.length === 0) {
      setError('请选择文件和变量')
      return
    }

    const min = rangeMin !== '' ? Number(rangeMin) : null
    const max = rangeMax !== '' ? Number(rangeMax) : null
    if (min !== null && max !== null) {
      setValueRange([min, max])
    } else {
      setValueRange(null)
    }

    setIsLoading(true)
    setError(null)
    try {
      const request = buildPlotRequest()
      if (min !== null && max !== null) {
        request.value_range = [min, max]
      }
      const result = await api.render(request)
      setPlotResult(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '绘制失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 space-y-2 overflow-y-auto overflow-x-hidden flex-1">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">绘图类型</label>
          <div className="space-y-1">
            {PLOT_TYPES.map((pt) => (
              <label
                key={pt.value}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm transition-colors ${
                  plotType === pt.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="plotType"
                  value={pt.value}
                  checked={plotType === pt.value}
                  onChange={() => setPlotType(pt.value)}
                  className="accent-blue-600"
                />
                {pt.label}
              </label>
            ))}
          </div>
        </div>

        <PlotTypeParams
          rangeMin={rangeMin}
          rangeMax={rangeMax}
          setRangeMin={setRangeMin}
          setRangeMax={setRangeMax}
          altitudeInput={altitudeInput}
          setAltitudeInput={setAltitudeInput}
          findClosestLevel={findClosestLevel}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-600">叠加层</label>
            <button
              onClick={onAddOverlay}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              + 添加底图
            </button>
          </div>
          {overlays.length === 0 && (
            <p className="text-xs text-gray-400">暂无叠加层</p>
          )}
        </div>

        <div className="border border-gray-200 rounded">
          <button
            onClick={() => setStyleExpanded(!styleExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span>图表样式</span>
            <span className={`transition-transform ${styleExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {styleExpanded && (
            <div className="px-3 pb-3 space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">标题</label>
                <input
                  type="text"
                  value={plotStyle.title ?? ''}
                  onChange={(e) => setPlotStyle({ ...plotStyle, title: e.target.value || null })}
                  placeholder="自定义标题"
                  className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">X轴标签</label>
                <input
                  type="text"
                  value={plotStyle.xlabel ?? ''}
                  onChange={(e) => setPlotStyle({ ...plotStyle, xlabel: e.target.value || null })}
                  placeholder="X轴标签"
                  className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y轴标签</label>
                <input
                  type="text"
                  value={plotStyle.ylabel ?? ''}
                  onChange={(e) => setPlotStyle({ ...plotStyle, ylabel: e.target.value || null })}
                  placeholder="Y轴标签"
                  className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Colorbar标签</label>
                <input
                  type="text"
                  value={plotStyle.colorbar_label ?? ''}
                  onChange={(e) => setPlotStyle({ ...plotStyle, colorbar_label: e.target.value || null })}
                  placeholder="Colorbar标签"
                  className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">字体大小</label>
                <input
                  type="number"
                  value={plotStyle.fontsize}
                  onChange={(e) => setPlotStyle({ ...plotStyle, fontsize: Number(e.target.value) })}
                  className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">DPI</label>
                <select
                  value={plotStyle.dpi}
                  onChange={(e) => setPlotStyle({ ...plotStyle, dpi: Number(e.target.value) })}
                  className="w-full max-w-full box-border px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={150}>150</option>
                  <option value={300}>300</option>
                  <option value={600}>600</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plotStyle.grid}
                  onChange={(e) => setPlotStyle({ ...plotStyle, grid: e.target.checked })}
                  className="accent-blue-600"
                />
                <label className="text-xs text-gray-600">显示网格</label>
              </div>
              <button
                onClick={() => setPlotStyle({ title: null, xlabel: null, ylabel: null, fontsize: 12, title_fontsize: 14, label_fontsize: 11, tick_fontsize: 10, font_family: 'sans-serif', figsize: [10, 7], dpi: 150, grid: false, colorbar_label: null, extra: {} })}
                className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                重置样式
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleRender}
          disabled={!activeFile || selectedVariables.length === 0}
          className={`w-full py-2 text-sm font-medium rounded transition-colors ${
            !activeFile
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : selectedVariables.length === 0
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {!activeFile ? '请先选择文件' : selectedVariables.length === 0 ? '请选择变量' : '绘制'}
        </button>
      </div>
    </div>
  )
}
