export interface VariableInfo {
  name: string
  dimensions: string[]
  shape: number[]
  units: string | null
  long_name: string | null
}

export interface FileMetaInfo {
  filename: string
  file_path: string
  file_type: string
  dimensions: Record<string, number>
  variables: VariableInfo[]
  global_attrs: Record<string, unknown>
  origin_lat: number | null
  origin_lon: number | null
  origin_z: number | null
  z_levels: number[]
  z_levels_altitude: number[]
  zw_levels: number[]
  zw_levels_altitude: number[]
  time_values: number[]
}

export interface FileBrowseItem {
  name: string
  path: string
  is_dir: boolean
  size: number | null
  file_type: string | null
}

export interface OverlayConfig {
  file_path: string
  variable: string
  overlay_type: string
  style: Record<string, unknown>
}

export interface PlotStyle {
  title: string | null
  xlabel: string | null
  ylabel: string | null
  fontsize: number
  title_fontsize: number
  label_fontsize: number
  tick_fontsize: number
  font_family: string
  figsize: number[]
  dpi: number
  grid: boolean
  colorbar_label: string | null
  extra: Record<string, unknown>
}

export interface PlotRequest {
  file_paths: string[]
  variables: string[]
  plot_type: string
  height_level: number | null
  height_above_ground: number | null
  x_slice: number[] | null
  y_slice: number[] | null
  time_range: number[] | null
  overlays: OverlayConfig[]
  colormap: string
  value_range: number[] | null
  animation: boolean
  animation_fps: number
  custom_expressions: Record<string, string>
  style: PlotStyle
  profile_mode: string | null
  profile_x_range: number[] | null
  profile_y_range: number[] | null
  profile_x_index: number | null
  profile_y_index: number | null
  cross_section_direction: string | null
  cross_section_position: number | null
  z_avg: boolean
}

export interface PlotResult {
  plot_type: string
  content_type: string
  data: string
  width: number
  height: number
  metadata: Record<string, unknown>
}

export type PlotType = 'contour' | 'cross_section' | 'timeseries' | 'spectrum' | 'wind' | '3d' | 'animation' | 'profile' | 'terrain_follow'
