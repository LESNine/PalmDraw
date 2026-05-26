import numpy as np
import netCDF4 as nc
from app.engines.base import BasePlotEngine
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_variable_slice, read_coordinate
from app.core.variable_index import get_var_label


class TerrainFollowEngine(BasePlotEngine):
    @property
    def plot_type(self) -> str:
        return "terrain_follow"

    def render(self, request: PlotRequest) -> PlotResult:
        file_path = request.file_paths[0]
        variable = request.variables[0]

        if not request.overlays:
            return PlotResult(
                plot_type=self.plot_type,
                content_type="text/plain",
                data="地形跟随模式需要提供static文件（通过叠加层配置）",
                width=0, height=0,
            )

        static_path = request.overlays[0].file_path
        height_above_ground = request.height_level if request.height_level is not None else 0

        origin_z = 0.0
        ds = nc.Dataset(file_path, "r")
        try:
            if "origin_z" in ds.ncattrs():
                origin_z = float(ds.getncattr("origin_z"))
        finally:
            ds.close()

        zt = read_variable_slice(static_path, "zt")
        if zt.ndim == 3:
            zt = zt[0]

        zu_3d = read_coordinate(file_path, "zu_3d")
        if len(zu_3d) == 0:
            zu_3d = read_coordinate(file_path, "z")
        if len(zu_3d) == 0:
            return PlotResult(
                plot_type=self.plot_type,
                content_type="text/plain",
                data="无法读取z坐标（zu_3d/z）",
                width=0, height=0,
            )

        altitude_agl = zu_3d + origin_z
        target_altitude = zt + height_above_ground + origin_z

        ny, nx = zt.shape
        result = np.full((ny, nx), np.nan)

        data_full = read_variable_slice(file_path, variable)
        if data_full.ndim == 4:
            data_full = data_full[0]

        if data_full.ndim == 3:
            for j in range(ny):
                for i in range(nx):
                    target = target_altitude[j, i]
                    diffs = np.abs(altitude_agl - target)
                    level_idx = int(np.argmin(diffs))
                    if level_idx < data_full.shape[0]:
                        result[j, i] = data_full[level_idx, j, i]
        else:
            return PlotResult(
                plot_type=self.plot_type,
                content_type="text/plain",
                data=f"Variable {variable} has unexpected shape for terrain-following",
                width=0, height=0,
            )

        x = read_coordinate(file_path, "x")
        y = read_coordinate(file_path, "y")

        if len(x) == 0:
            x = read_coordinate(static_path, "x")
        if len(y) == 0:
            y = read_coordinate(static_path, "y")

        self._create_figure(style=request.style)

        if len(x) > 1 and len(y) > 1 and result.shape == (len(y), len(x)):
            X, Y = np.meshgrid(x, y)
            vmin, vmax = request.value_range if request.value_range else (None, None)
            im = self.ax.pcolormesh(X, Y, result, cmap=request.colormap, vmin=vmin, vmax=vmax, shading="auto")
            cbar_label = request.style.colorbar_label if request.style and request.style.colorbar_label else get_var_label(variable)
            self.fig.colorbar(im, ax=self.ax, label=cbar_label)

            zt_for_contour = read_variable_slice(static_path, "zt")
            if zt_for_contour.ndim == 3:
                zt_for_contour = zt_for_contour[0]
            if zt_for_contour.shape == (len(y), len(x)):
                self.ax.contour(X, Y, zt_for_contour, levels=10, colors="black", linewidths=0.5, alpha=0.5)

            default_xlabel = "x (m)"
            default_ylabel = "y (m)"
        else:
            vmin, vmax = request.value_range if request.value_range else (None, None)
            im = self.ax.imshow(result, cmap=request.colormap, vmin=vmin, vmax=vmax, aspect="auto", origin="lower")
            cbar_label = request.style.colorbar_label if request.style and request.style.colorbar_label else get_var_label(variable)
            self.fig.colorbar(im, ax=self.ax, label=cbar_label)
            default_xlabel = None
            default_ylabel = None

        default_title = f"{get_var_label(variable, include_units=False)} 地上 {height_above_ground}m"
        self._apply_style(request.style, default_title=default_title, default_xlabel=default_xlabel, default_ylabel=default_ylabel)

        img_b64 = self._fig_to_base64()
        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/png",
            data=img_b64,
            width=0, height=0,
            metadata={"variable": variable, "height_above_ground": height_above_ground},
        )
