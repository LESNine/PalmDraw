import numpy as np
from app.engines.base import BasePlotEngine
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_coordinate
from app.core.variable_index import get_var_label


class ContourEngine(BasePlotEngine):
    @property
    def plot_type(self) -> str:
        return "contour"

    def render(self, request: PlotRequest) -> PlotResult:
        variable = request.variables[0]
        data = self._read_data(request, variable)
        file_path = request.file_paths[0]

        x = read_coordinate(file_path, "x")
        y = read_coordinate(file_path, "y")

        if data.ndim == 3:
            data = data[0]
        if data.ndim != 2:
            data = data.squeeze()
            if data.ndim != 2:
                return PlotResult(
                    plot_type=self.plot_type,
                    content_type="text/plain",
                    data="Variable cannot be rendered as 2D contour",
                    width=0, height=0,
                )

        self._create_figure(style=request.style)

        if len(x) > 1 and len(y) > 1 and data.shape == (len(y), len(x)):
            X, Y = np.meshgrid(x, y)
            vmin, vmax = request.value_range if request.value_range else (None, None)
            im = self.ax.pcolormesh(X, Y, data, cmap=request.colormap, vmin=vmin, vmax=vmax, shading="auto")
            cbar_label = request.style.colorbar_label if request.style and request.style.colorbar_label else get_var_label(variable)
            self.fig.colorbar(im, ax=self.ax, label=cbar_label)
            default_xlabel = "x (m)"
            default_ylabel = "y (m)"
        else:
            vmin, vmax = request.value_range if request.value_range else (None, None)
            im = self.ax.imshow(data, cmap=request.colormap, vmin=vmin, vmax=vmax, aspect="auto", origin="lower")
            cbar_label = request.style.colorbar_label if request.style and request.style.colorbar_label else get_var_label(variable)
            self.fig.colorbar(im, ax=self.ax, label=cbar_label)
            default_xlabel = None
            default_ylabel = None

        default_title = get_var_label(variable, include_units=False)
        if request.height_level is not None:
            z = read_coordinate(file_path, "z")
            if len(z) > request.height_level:
                default_title += f" (z={z[request.height_level]:.1f}m)"

        self._apply_style(request.style, default_title=default_title, default_xlabel=default_xlabel, default_ylabel=default_ylabel)

        img_b64 = self._fig_to_base64(fmt="png" if not request.style or request.style.dpi <= 150 else "png")
        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/png",
            data=img_b64,
            width=0, height=0,
            metadata={"variable": variable, "colormap": request.colormap},
        )
