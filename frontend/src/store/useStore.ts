import { create } from 'zustand'
import type { FileMetaInfo, FileBrowseItem, PlotRequest, PlotResult, PlotType, PlotStyle, OverlayConfig } from '@/types'

interface AppState {
  files: FileBrowseItem[]
  currentPath: string
  activeFile: string | null
  fileMeta: FileMetaInfo | null
  selectedVariables: string[]
  plotType: PlotType
  heightLevel: number | null
  colormap: string
  valueRange: [number, number] | null
  overlays: OverlayConfig[]
  plotResult: PlotResult | null
  isLoading: boolean
  error: string | null
  zLevels: number[]
  zLevelsAltitude: number[]
  zwLevelsAltitude: number[]
  originZ: number | null
  targetAltitude: number | null
  loadingMessage: string | null
  heightAboveGround: number | null
  staticFilePath: string | null
  plotStyle: PlotStyle
  profileMode: 'domain_avg' | 'area_avg' | 'single_point'
  profileXRange: [number, number] | null
  profileYRange: [number, number] | null
  profileXIndex: number
  profileYIndex: number
  crossSectionDirection: 'x' | 'y'
  crossSectionPosition: number
  animationFps: number
  spectrumHeightLevel: number | null
  viewPreset: string
  zAvg: boolean

  setFiles: (files: FileBrowseItem[]) => void
  setCurrentPath: (path: string) => void
  setActiveFile: (path: string | null) => void
  setFileMeta: (meta: FileMetaInfo | null) => void
  toggleVariable: (name: string) => void
  setPlotType: (type: PlotType) => void
  setHeightLevel: (level: number | null) => void
  setColormap: (cmap: string) => void
  setValueRange: (range: [number, number] | null) => void
  addOverlay: (overlay: OverlayConfig) => void
  removeOverlay: (index: number) => void
  setPlotResult: (result: PlotResult | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setZLevels: (levels: number[]) => void
  setZLevelsAltitude: (levels: number[]) => void
  setZwLevelsAltitude: (levels: number[]) => void
  setOriginZ: (z: number | null) => void
  setTargetAltitude: (alt: number | null) => void
  setLoadingMessage: (msg: string | null) => void
  setHeightAboveGround: (h: number | null) => void
  setStaticFilePath: (p: string | null) => void
  setPlotStyle: (s: PlotStyle) => void
  setProfileMode: (m: 'domain_avg' | 'area_avg' | 'single_point') => void
  setProfileXRange: (r: [number, number] | null) => void
  setProfileYRange: (r: [number, number] | null) => void
  setProfileXIndex: (i: number) => void
  setProfileYIndex: (i: number) => void
  setCrossSectionDirection: (d: 'x' | 'y') => void
  setCrossSectionPosition: (p: number) => void
  setAnimationFps: (fps: number) => void
  setSpectrumHeightLevel: (l: number | null) => void
  setViewPreset: (v: string) => void
  setZAvg: (v: boolean) => void
  buildPlotRequest: () => PlotRequest
}

export const useStore = create<AppState>((set, get) => ({
  files: [],
  currentPath: '',
  activeFile: null,
  fileMeta: null,
  selectedVariables: [],
  plotType: 'contour',
  heightLevel: null,
  colormap: 'viridis',
  valueRange: null,
  overlays: [],
  plotResult: null,
  isLoading: false,
  error: null,
  zLevels: [],
  zLevelsAltitude: [],
  zwLevelsAltitude: [],
  originZ: null,
  targetAltitude: null,
  loadingMessage: null,
  heightAboveGround: null,
  staticFilePath: null,
  plotStyle: { title: null, xlabel: null, ylabel: null, fontsize: 12, title_fontsize: 14, label_fontsize: 11, tick_fontsize: 10, font_family: 'sans-serif', figsize: [10, 7], dpi: 150, grid: false, colorbar_label: null, extra: {} },
  profileMode: 'domain_avg',
  profileXRange: null,
  profileYRange: null,
  profileXIndex: 0,
  profileYIndex: 0,
  crossSectionDirection: 'y',
  crossSectionPosition: 0,
  animationFps: 5,
  spectrumHeightLevel: null,
  viewPreset: 'front',
  zAvg: false,

  setFiles: (files) => set({ files }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setActiveFile: (path) => set({ activeFile: path }),
  setFileMeta: (meta) => set({ 
    fileMeta: meta, 
    zLevels: meta?.z_levels ?? [],
    zLevelsAltitude: meta?.z_levels_altitude ?? [],
    zwLevelsAltitude: meta?.zw_levels_altitude ?? [],
    originZ: meta?.origin_z ?? null,
  }),
  toggleVariable: (name) =>
    set((s) => ({
      selectedVariables: s.selectedVariables.includes(name)
        ? s.selectedVariables.filter((v) => v !== name)
        : [...s.selectedVariables, name],
    })),
  setPlotType: (type) => set({ plotType: type }),
  setHeightLevel: (level) => set({ heightLevel: level }),
  setColormap: (cmap) => set({ colormap: cmap }),
  setValueRange: (range) => set({ valueRange: range }),
  addOverlay: (overlay) => set((s) => ({ overlays: [...s.overlays, overlay] })),
  removeOverlay: (index) => set((s) => ({ overlays: s.overlays.filter((_, i) => i !== index) })),
  setPlotResult: (result) => set({ plotResult: result }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setZLevels: (levels) => set({ zLevels: levels }),
  setZLevelsAltitude: (levels) => set({ zLevelsAltitude: levels }),
  setZwLevelsAltitude: (levels) => set({ zwLevelsAltitude: levels }),
  setOriginZ: (z) => set({ originZ: z }),
  setTargetAltitude: (alt) => set({ targetAltitude: alt }),
  setLoadingMessage: (msg) => set({ loadingMessage: msg }),
  setHeightAboveGround: (h) => set({ heightAboveGround: h }),
  setStaticFilePath: (p) => set({ staticFilePath: p }),
  setPlotStyle: (s) => set({ plotStyle: s }),
  setProfileMode: (m) => set({ profileMode: m }),
  setProfileXRange: (r) => set({ profileXRange: r }),
  setProfileYRange: (r) => set({ profileYRange: r }),
  setProfileXIndex: (i) => set({ profileXIndex: i }),
  setProfileYIndex: (i) => set({ profileYIndex: i }),
  setCrossSectionDirection: (d) => set({ crossSectionDirection: d }),
  setCrossSectionPosition: (p) => set({ crossSectionPosition: p }),
  setAnimationFps: (fps) => set({ animationFps: fps }),
  setSpectrumHeightLevel: (l) => set({ spectrumHeightLevel: l }),
  setViewPreset: (v) => set({ viewPreset: v }),
  setZAvg: (v) => set({ zAvg: v }),

  buildPlotRequest: () => {
    const s = get()
    const req = {
      file_paths: s.activeFile ? [s.activeFile] : [],
      variables: s.selectedVariables,
      plot_type: s.plotType,
      height_level: s.heightLevel,
      height_above_ground: s.heightAboveGround,
      x_slice: null as number[] | null,
      y_slice: null as number[] | null,
      time_range: null as number[] | null,
      overlays: s.overlays,
      colormap: s.colormap,
      value_range: s.valueRange,
      animation: s.plotType === 'animation',
      animation_fps: s.animationFps,
      custom_expressions: {},
      style: { ...s.plotStyle, extra: { view_preset: s.viewPreset } },
      profile_mode: null as string | null,
      profile_x_range: null as number[] | null,
      profile_y_range: null as number[] | null,
      profile_x_index: null as number | null,
      profile_y_index: null as number | null,
      cross_section_direction: null as string | null,
      cross_section_position: null as number | null,
      z_avg: false,
    }
    if (s.plotType === 'terrain_follow' && s.staticFilePath) {
      req.height_level = s.heightAboveGround ?? 0
      req.overlays = [{ file_path: s.staticFilePath, variable: 'zt', overlay_type: 'terrain_follow', style: {} }]
    }
    if (s.plotType === 'profile' || s.plotType === 'timeseries' || s.plotType === 'spectrum') {
      req.profile_mode = s.profileMode
      if (s.plotType === 'timeseries') {
        req.z_avg = s.zAvg
      }
      if (s.profileMode === 'area_avg') {
        req.profile_x_range = s.profileXRange ? [...s.profileXRange] : null
        req.profile_y_range = s.profileYRange ? [...s.profileYRange] : null
      } else if (s.profileMode === 'single_point') {
        req.profile_x_index = s.profileXIndex
        req.profile_y_index = s.profileYIndex
      }
    }
    if (s.plotType === 'cross_section') {
      req.cross_section_direction = s.crossSectionDirection
      req.cross_section_position = s.crossSectionPosition
    }
    if (s.plotType === 'spectrum' && s.spectrumHeightLevel !== null) {
      req.height_level = s.spectrumHeightLevel
    }
    return req
  },
}))
