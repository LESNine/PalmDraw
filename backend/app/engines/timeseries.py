import numpy as np
from app.engines.base import BasePlotEngine
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_variable_slice, read_coordinate
from app.core.variable_index import get_var_label


class TimeseriesEngine(BasePlotEngine):
    @property
    def plot_type(self) -> str:
        return "timeseries"

    def render(self, request: PlotRequest) -> PlotResult:
        file_path = request.file_paths[0]
        profile_mode = request.profile_mode or "domain_avg"

        time_range = request.time_range
        if time_range is None:
            time_range = [0, 100]

        self._create_figure(figsize=(12, 5), style=request.style)

        for variable in request.variables:
            data = read_variable_slice(
                file_path, variable,
                time_range=time_range,
                height_level=request.height_level,
                x_slice=request.x_slice,
                y_slice=request.y_slice,
            )

            if data.ndim == 4:
                if request.height_level is not None:
                    data = data[:, request.height_level, :, :]
                elif request.z_avg:
                    data = np.nanmean(data, axis=1)
                else:
                    return PlotResult(
                        plot_type=self.plot_type,
                        content_type="text/plain",
                        data="4D变量需要指定高度层，或开启高度平均选项",
                        width=0, height=0,
                    )

            if data.ndim == 3:
                if profile_mode == "area_avg":
                    x_range = request.profile_x_range or [0, data.shape[2]]
                    y_range = request.profile_y_range or [0, data.shape[1]]
                    x0, x1 = max(0, x_range[0]), min(data.shape[2], x_range[1])
                    y0, y1 = max(0, y_range[0]), min(data.shape[1], y_range[1])
                    data = np.nanmean(data[:, y0:y1, x0:x1], axis=(1, 2))
                elif profile_mode == "single_point":
                    xi = request.profile_x_index or 0
                    yi = request.profile_y_index or 0
                    xi = min(xi, data.shape[2] - 1)
                    yi = min(yi, data.shape[1] - 1)
                    data = data[:, yi, xi]
                else:
                    data = np.nanmean(data, axis=(1, 2))
            elif data.ndim > 1:
                data = np.nanmean(data, axis=tuple(range(1, data.ndim)))

            time_var = read_coordinate(file_path, "time")
            if len(time_var) > 0 and len(data) <= len(time_var):
                t_slice = time_var[time_range[0]:time_range[0] + len(data)]
                self.ax.plot(t_slice, data, label=variable, linewidth=1.5)
            else:
                self.ax.plot(data, label=variable, linewidth=1.5)

        default_xlabel = "时间 (s)"
        default_ylabel = ""
        if len(request.variables) == 1:
            default_ylabel = get_var_label(request.variables[0])
        self.ax.legend()
        self.ax.grid(True, alpha=0.3)

        mode_label = {"domain_avg": "全域平均", "area_avg": "区域平均", "single_point": "单格点"}.get(profile_mode, "")
        default_title = f"时间序列 ({mode_label})"

        self._apply_style(request.style, default_title=default_title, default_xlabel=default_xlabel, default_ylabel=default_ylabel)

        img_b64 = self._fig_to_base64()
        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/png",
            data=img_b64,
            width=0, height=0,
            metadata={"variables": request.variables, "profile_mode": profile_mode},
        )
