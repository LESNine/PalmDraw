from abc import ABC, abstractmethod
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import base64
import io
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_variable_slice, read_coordinate


class BasePlotEngine(ABC):
    def __init__(self):
        self.fig = None
        self.ax = None

    @abstractmethod
    def plot_type(self) -> str:
        pass

    @abstractmethod
    def render(self, request: PlotRequest) -> PlotResult:
        pass

    def _create_figure(self, figsize=None, dpi=None, style=None):
        if style is None:
            style = getattr(self, '_current_style', None)
        if style is None:
            from app.models.plot_request import PlotStyle
            style = PlotStyle()

        plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "DejaVu Sans"]
        plt.rcParams["font.family"] = "sans-serif"
        plt.rcParams["axes.unicode_minus"] = False
        plt.rcParams["font.size"] = style.fontsize
        plt.rcParams["mathtext.fontset"] = "cm"

        fig_size = figsize if figsize else tuple(style.figsize)
        fig_dpi = dpi if dpi else style.dpi

        self.fig, self.ax = plt.subplots(figsize=fig_size, dpi=fig_dpi)

        if style.grid:
            self.ax.grid(True, alpha=0.3, linestyle="--")

        return self.fig, self.ax

    def _apply_style(self, style=None, default_title=None, default_xlabel=None, default_ylabel=None):
        if style is None:
            from app.models.plot_request import PlotStyle
            style = PlotStyle()
        if style.title:
            self.ax.set_title(style.title, fontsize=style.title_fontsize)
        elif default_title:
            self.ax.set_title(default_title, fontsize=style.title_fontsize)
        if style.xlabel:
            self.ax.set_xlabel(style.xlabel, fontsize=style.label_fontsize)
        elif default_xlabel:
            self.ax.set_xlabel(default_xlabel, fontsize=style.label_fontsize)
        if style.ylabel:
            self.ax.set_ylabel(style.ylabel, fontsize=style.label_fontsize)
        elif default_ylabel:
            self.ax.set_ylabel(default_ylabel, fontsize=style.label_fontsize)
        self.ax.tick_params(labelsize=style.tick_fontsize)

    def _fig_to_base64(self, fmt="png") -> str:
        buf = io.BytesIO()
        self.fig.savefig(buf, format=fmt, bbox_inches="tight", pad_inches=0.1)
        plt.close(self.fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")

    def _read_data(self, request: PlotRequest, variable: str, file_index: int = 0):
        return read_variable_slice(
            request.file_paths[file_index],
            variable,
            height_level=request.height_level,
            x_slice=request.x_slice,
            y_slice=request.y_slice,
            time_range=request.time_range,
        )

    def _read_coords(self, file_path: str):
        x = read_coordinate(file_path, "x")
        y = read_coordinate(file_path, "y")
        z = read_coordinate(file_path, "z")
        return x, y, z
