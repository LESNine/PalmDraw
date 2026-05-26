import numpy as np
from app.engines.base import BasePlotEngine
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_variable_slice, read_coordinate
from app.core.variable_index import get_var_label


class CrossSectionEngine(BasePlotEngine):
    @property
    def plot_type(self) -> str:
        return "cross_section"

    def render(self, request: PlotRequest) -> PlotResult:
        variable = request.variables[0]
        file_path = request.file_paths[0]

        time_range = request.time_range
        if time_range is None:
            time_range = [0, 1]

        data = read_variable_slice(
            file_path, variable,
            time_range=time_range,
            height_level=request.height_level,
            x_slice=request.x_slice,
            y_slice=request.y_slice,
        )

        x = read_coordinate(file_path, "x")
        y = read_coordinate(file_path, "y")
        z = read_coordinate(file_path, "z")
        if len(z) == 0:
            z = read_coordinate(file_path, "zu_3d")

        origin_z = 0.0
        import netCDF4 as nc
        ds = nc.Dataset(file_path, "r")
        try:
            if "origin_z" in ds.ncattrs():
                origin_z = float(ds.getncattr("origin_z"))
        finally:
            ds.close()

        direction = request.cross_section_direction or "y"
        position = request.cross_section_position or 0

        if data.ndim == 4:
            data = data[0]
        if data.ndim == 3:
            if direction == "y":
                pos = min(position, data.shape[1] - 1)
                data = data[:, pos, :]
            else:
                pos = min(position, data.shape[2] - 1)
                data = data[:, :, pos]

        self._create_figure(figsize=(10, 6), style=request.style)

        if data.ndim == 2 and len(z) > 0:
            altitude = z[:data.shape[0]] + origin_z
            if direction == "y" and len(x) > 0 and data.shape[1] == len(x):
                X, Z = np.meshgrid(x, altitude)
                default_xlabel = "x (m)"
                default_ylabel = "海拔高度 (m)"
            elif direction == "x" and len(y) > 0 and data.shape[1] == len(y):
                X, Z = np.meshgrid(y, altitude)
                default_xlabel = "y (m)"
                default_ylabel = "海拔高度 (m)"
            else:
                X, Z = np.meshgrid(np.arange(data.shape[1]), altitude)
                default_xlabel = "索引"
                default_ylabel = "海拔高度 (m)"

            vmin, vmax = request.value_range if request.value_range else (None, None)
            im = self.ax.pcolormesh(X, Z, data, cmap=request.colormap, vmin=vmin, vmax=vmax, shading="auto")
            cbar_label = request.style.colorbar_label if request.style and request.style.colorbar_label else get_var_label(variable)
            self.fig.colorbar(im, ax=self.ax, label=cbar_label)
        else:
            self.ax.text(0.5, 0.5, "Cannot render cross-section for this variable shape",
                        transform=self.ax.transAxes, ha="center")
            default_xlabel = None
            default_ylabel = None

        dir_label = "y方向" if direction == "y" else "x方向"
        default_title = f"{get_var_label(variable, include_units=False)} 剖面图 ({dir_label}, 位置={position})"

        self._apply_style(request.style, default_title=default_title, default_xlabel=default_xlabel, default_ylabel=default_ylabel)

        img_b64 = self._fig_to_base64()
        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/png",
            data=img_b64,
            width=0, height=0,
            metadata={"variable": variable, "direction": direction, "position": position},
        )
