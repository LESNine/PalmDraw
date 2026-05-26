import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import base64
import io
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_variable_slice, read_coordinate


class AnimationEngine:
    @property
    def plot_type(self) -> str:
        return "animation"

    def render(self, request: PlotRequest) -> PlotResult:
        variable = request.variables[0]
        file_path = request.file_paths[0]

        x = read_coordinate(file_path, "x")
        y = read_coordinate(file_path, "y")

        ds_data = read_variable_slice(file_path, variable)
        if ds_data.ndim == 4:
            ds_data = ds_data[:, request.height_level or 0, :, :]
        elif ds_data.ndim == 2:
            return PlotResult(
                plot_type=self.plot_type,
                content_type="text/plain",
                data="Variable shape not suitable for animation (need 3D or 4D)",
                width=0, height=0,
            )

        n_frames = ds_data.shape[0]
        vmin = float(np.nanmin(ds_data))
        vmax = float(np.nanmax(ds_data))
        if request.value_range:
            vmin, vmax = request.value_range

        plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "DejaVu Sans"]
        plt.rcParams["axes.unicode_minus"] = False

        fig, ax = plt.subplots(figsize=(10, 7))

        if len(x) > 1 and len(y) > 1 and ds_data.shape[1:] == (len(y), len(x)):
            X, Y = np.meshgrid(x, y)
            im = ax.pcolormesh(X, Y, ds_data[0], cmap=request.colormap, vmin=vmin, vmax=vmax, shading="auto")
        else:
            im = ax.imshow(ds_data[0], cmap=request.colormap, vmin=vmin, vmax=vmax, aspect="auto", origin="lower")

        fig.colorbar(im, ax=ax, label=variable)
        title = ax.set_title(f"{variable} t=0")

        def update(frame):
            if len(x) > 1 and len(y) > 1:
                im.set_array(ds_data[frame].ravel())
            else:
                im.set_data(ds_data[frame])
            title.set_text(f"{variable} t={frame}")
            return [im, title]

        ani = animation.FuncAnimation(fig, update, frames=n_frames, interval=1000 // request.animation_fps, blit=False)

        buf = io.BytesIO()
        ani.save(buf, writer="pillow", fps=request.animation_fps)
        plt.close(fig)
        buf.seek(0)
        gif_b64 = base64.b64encode(buf.read()).decode("utf-8")

        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/gif",
            data=gif_b64,
            width=0, height=0,
            metadata={"variable": variable, "frames": n_frames},
        )
