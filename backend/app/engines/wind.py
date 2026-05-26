import numpy as np
from app.engines.base import BasePlotEngine
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_coordinate
from app.core.variable_index import get_var_label


class WindEngine(BasePlotEngine):
    @property
    def plot_type(self) -> str:
        return "wind"

    def render(self, request: PlotRequest) -> PlotResult:
        file_path = request.file_paths[0]
        u_var = "u" if "u" in request.variables else request.variables[0]
        v_var = "v" if "v" in request.variables else request.variables[-1]
        u = self._read_data(request, u_var)
        v = self._read_data(request, v_var)

        if u.ndim == 3:
            u = u[0]
        if v.ndim == 3:
            v = v[0]

        x = read_coordinate(file_path, "x")
        y = read_coordinate(file_path, "y")

        self._create_figure()

        if len(x) > 1 and len(y) > 1:
            X, Y = np.meshgrid(x, y)
            speed = np.sqrt(u**2 + v**2)

            vmin, vmax = request.value_range if request.value_range else (None, None)
            im = self.ax.pcolormesh(X, Y, speed, cmap=request.colormap, vmin=vmin, vmax=vmax, shading="auto", alpha=0.8)
            self.fig.colorbar(im, ax=self.ax, label="风速 (m/s)")

            skip = max(1, min(len(x), len(y)) // 25)
            self.ax.quiver(X[::skip, ::skip], Y[::skip, ::skip],
                          u[::skip, ::skip], v[::skip, ::skip],
                          color="black", alpha=0.7, scale=None)
            self.ax.set_xlabel("x 东西向 (m)")
            self.ax.set_ylabel("y 南北向 (m)")
        else:
            self.ax.text(0.5, 0.5, "Insufficient coordinate data",
                        transform=self.ax.transAxes, ha="center")

        title = "风场图"
        if request.height_level is not None:
            z = read_coordinate(file_path, "z")
            if len(z) > request.height_level:
                title += f" (z={z[request.height_level]:.1f}m)"
        self.ax.set_title(title)

        img_b64 = self._fig_to_base64()
        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/png",
            data=img_b64,
            width=0, height=0,
            metadata={"variables": ["u", "v"]},
        )
