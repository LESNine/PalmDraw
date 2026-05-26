from pydantic import BaseModel


class OverlayConfig(BaseModel):
    file_path: str
    variable: str
    overlay_type: str
    style: dict = {}


class PlotStyle(BaseModel):
    title: str | None = None
    xlabel: str | None = None
    ylabel: str | None = None
    fontsize: int = 12
    title_fontsize: int = 14
    label_fontsize: int = 11
    tick_fontsize: int = 10
    font_family: str = "sans-serif"
    figsize: list[float] = [10.0, 7.0]
    dpi: int = 150
    grid: bool = False
    colorbar_label: str | None = None
    extra: dict = {}


class PlotRequest(BaseModel):
    file_paths: list[str]
    variables: list[str]
    plot_type: str
    height_level: int | None = None
    x_slice: list[int] | None = None
    y_slice: list[int] | None = None
    time_range: list[int] | None = None
    overlays: list[OverlayConfig] = []
    colormap: str = "viridis"
    value_range: list[float] | None = None
    animation: bool = False
    animation_fps: int = 5
    custom_expressions: dict[str, str] = {}
    style: PlotStyle = PlotStyle()
    profile_mode: str | None = None
    profile_x_range: list[int] | None = None
    profile_y_range: list[int] | None = None
    profile_x_index: int | None = None
    profile_y_index: int | None = None
    cross_section_direction: str | None = None
    cross_section_position: int | None = None
    z_avg: bool = False


class DataSliceRequest(BaseModel):
    file_path: str
    variable: str
    dimensions: dict[str, list[int] | int]
