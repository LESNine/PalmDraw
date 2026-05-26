import numpy as np
import netCDF4 as nc
from scipy.interpolate import PchipInterpolator
from scipy.signal import savgol_filter
from app.engines.base import BasePlotEngine
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_variable_slice, read_coordinate
from app.core.variable_index import get_var_label


class ProfileEngine(BasePlotEngine):
    @property
    def plot_type(self) -> str:
        return "profile"

    def render(self, request: PlotRequest) -> PlotResult:
        file_path = request.file_paths[0]
        variable = request.variables[0]

        origin_z = 0.0
        ds = nc.Dataset(file_path, "r")
        try:
            if "origin_z" in ds.ncattrs():
                origin_z = float(ds.getncattr("origin_z"))
        finally:
            ds.close()

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

        profile_mode = request.profile_mode or "domain_avg"

        if data.ndim == 4:
            data = data[0]
        if data.ndim == 3:
            if profile_mode == "domain_avg":
                profile = np.nanmean(data, axis=(1, 2))
            elif profile_mode == "area_avg":
                x_range = request.profile_x_range or [0, data.shape[2]]
                y_range = request.profile_y_range or [0, data.shape[1]]
                x0, x1 = max(0, x_range[0]), min(data.shape[2], x_range[1])
                y0, y1 = max(0, y_range[0]), min(data.shape[1], y_range[1])
                profile = np.nanmean(data[:, y0:y1, x0:x1], axis=(1, 2))
            elif profile_mode == "single_point":
                xi = request.profile_x_index or 0
                yi = request.profile_y_index or 0
                xi = min(xi, data.shape[2] - 1)
                yi = min(yi, data.shape[1] - 1)
                profile = data[:, yi, xi]
            else:
                profile = np.nanmean(data, axis=(1, 2))
        elif data.ndim == 1:
            profile = data
        else:
            return PlotResult(
                plot_type=self.plot_type,
                content_type="text/plain",
                data="Variable shape not suitable for profile plot",
                width=0, height=0,
            )

        z_coord = None
        for z_name in ("zu_3d", "z", "zw_3d", "zw"):
            z_arr = read_coordinate(file_path, z_name)
            if len(z_arr) > 0:
                z_coord = z_arr
                break

        valid_mask = ~np.isnan(profile)
        if not np.any(valid_mask):
            return PlotResult(
                plot_type=self.plot_type,
                content_type="text/plain",
                data="All values are NaN for this variable/level combination",
                width=0, height=0,
            )

        profile_valid = profile[valid_mask]
        z_valid = z_coord[valid_mask] if z_coord is not None and len(z_coord) >= len(profile) else None

        self._create_figure(figsize=(8, 8), style=request.style)

        if z_valid is not None:
            altitude = z_valid + origin_z
            if len(profile_valid) > 15:
                win = min(11, len(profile_valid) // 3)
                if win % 2 == 0:
                    win += 1
                if win >= 5:
                    profile_smooth = savgol_filter(profile_valid, win, 3)
                else:
                    profile_smooth = profile_valid
                z_fine = np.linspace(altitude[0], altitude[-1], min(500, len(profile_valid) * 3))
                interp = PchipInterpolator(altitude, profile_smooth)
                profile_fine = interp(z_fine)
                self.ax.plot(profile_fine, z_fine, linewidth=2, color="#2563eb")
            elif len(profile_valid) > 4:
                self.ax.plot(profile_valid, altitude, linewidth=2, color="#2563eb")
            else:
                self.ax.plot(profile_valid, altitude, linewidth=2, color="#2563eb")
            default_ylabel = "海拔高度 (m)"
        else:
            self.ax.plot(profile_valid, np.arange(len(profile_valid)), linewidth=2, color="#2563eb")
            default_ylabel = "层索引"

        vmin, vmax = request.value_range if request.value_range else (None, None)
        if vmin is not None:
            self.ax.set_xlim(left=vmin)
        if vmax is not None:
            self.ax.set_xlim(right=vmax)

        mode_label = {"domain_avg": "全域平均", "area_avg": "区域平均", "single_point": "单格点"}.get(profile_mode, "")
        default_title = f"{variable} 垂直廓线 ({mode_label})"
        default_xlabel = get_var_label(variable)

        self._apply_style(request.style, default_title=default_title, default_xlabel=default_xlabel, default_ylabel=default_ylabel)

        img_b64 = self._fig_to_base64()
        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/png",
            data=img_b64,
            width=0, height=0,
            metadata={"variable": variable, "origin_z": origin_z, "profile_mode": profile_mode},
        )
