import numpy as np
import netCDF4 as nc
import plotly.graph_objects as go
import base64
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_variable_slice, read_coordinate
from app.core.variable_index import get_var_label


VIEW_PRESETS = {
    "front": {"eye": {"x": 1.4, "y": -2.0, "z": 1.2}, "center": {"x": 0, "y": 0, "z": -0.05}, "up": {"x": 0, "y": 0, "z": 1}},
    "side": {"eye": {"x": 2.0, "y": 1.4, "z": 1.2}, "center": {"x": 0, "y": 0, "z": -0.05}, "up": {"x": 0, "y": 0, "z": 1}},
    "top": {"eye": {"x": 1.2, "y": -1.2, "z": 2.4}, "center": {"x": 0, "y": 0, "z": 0}, "up": {"x": 0, "y": 1, "z": 0}},
}


class Plotly3DEngine:
    @property
    def plot_type(self) -> str:
        return "3d"

    def render(self, request: PlotRequest) -> PlotResult:
        variable = request.variables[0]
        file_path = request.file_paths[0]

        origin_z = 0.0
        ds = nc.Dataset(file_path, "r")
        try:
            if "origin_z" in ds.ncattrs():
                origin_z = float(ds.getncattr("origin_z"))
        finally:
            ds.close()

        view_preset = request.style.extra.get("view_preset", "front") if request.style.extra else "front"
        camera = VIEW_PRESETS.get(view_preset, VIEW_PRESETS["front"])

        x = read_coordinate(file_path, "x")
        y = read_coordinate(file_path, "y")
        z = read_coordinate(file_path, "z")

        data = read_variable_slice(
            file_path, variable,
            height_level=request.height_level,
            x_slice=request.x_slice,
            y_slice=request.y_slice,
        )

        traces = []

        if data.ndim == 3 and len(x) > 1 and len(y) > 1 and len(z) > 1:
            t_idx = 0
            data_3d = data[t_idx] if data.ndim == 4 else data

            if request.height_level is not None:
                z_plot = np.array([z[min(request.height_level, len(z) - 1)] + origin_z])
                X, Y = np.meshgrid(x, y)
                Z_data = data_3d[min(request.height_level, data_3d.shape[0] - 1)]
                traces.append(go.Surface(
                    x=x, y=y, z=np.full_like(Z_data, z_plot[0]),
                    surfacecolor=Z_data,
                    colorscale=request.colormap,
                    colorbar=dict(title=get_var_label(variable)),
                    opacity=0.9,
                ))
            else:
                z_alt = np.array(z) + origin_z
                step_z = max(1, len(z_alt) // 5)
                for iz in range(0, len(z_alt), step_z):
                    Z_data = data_3d[iz]
                    traces.append(go.Surface(
                        x=x, y=y, z=np.full_like(Z_data, z_alt[iz]),
                        surfacecolor=Z_data,
                        colorscale=request.colormap,
                        showscale=(iz == 0),
                        opacity=0.7,
                    ))

            u_data = read_variable_slice(file_path, "u", height_level=request.height_level, x_slice=request.x_slice, y_slice=request.y_slice)
            v_data = read_variable_slice(file_path, "v", height_level=request.height_level, x_slice=request.x_slice, y_slice=request.y_slice)
            w_data = read_variable_slice(file_path, "w", height_level=request.height_level, x_slice=request.x_slice, y_slice=request.y_slice)

            if u_data is not None and v_data is not None and w_data is not None:
                u_2d = u_data[t_idx] if u_data.ndim == 4 else u_data
                v_2d = v_data[t_idx] if v_data.ndim == 4 else v_data
                w_2d = w_data[t_idx] if w_data.ndim == 4 else w_data

                if u_2d.ndim == 3 and request.height_level is not None:
                    hl = min(request.height_level, u_2d.shape[0] - 1)
                    u_2d = u_2d[hl]
                    v_2d = v_2d[hl]
                    w_2d = w_2d[hl]

                    step_x = max(1, len(x) // 8)
                    step_y = max(1, len(y) // 8)
                    cx, cy, cz = [], [], []
                    cu, cv, cw = [], []
                    z_val = z[min(request.height_level, len(z) - 1)] + origin_z
                    for iy in range(0, len(y), step_y):
                        for ix in range(0, len(x), step_x):
                            cx.append(x[ix])
                            cy.append(y[iy])
                            cz.append(z_val)
                            cu.append(float(u_2d[iy, ix]))
                            cv.append(float(v_2d[iy, ix]))
                            cw.append(float(w_2d[iy, ix]))

                    traces.append(go.Cone(
                        x=cx, y=cy, z=cz,
                        u=cu, v=cv, w=cw,
                        colorscale="Blues",
                        sizeref=0.5,
                        opacity=0.6,
                        showscale=False,
                    ))
        elif data.ndim == 2 and len(x) > 0 and len(y) > 0:
            traces.append(go.Contour(
                z=data, x=x, y=y,
                colorscale=request.colormap,
                colorbar=dict(title=get_var_label(variable)),
            ))
        else:
            traces.append(go.Contour(
                z=[[0]], x=[0], y=[0],
                colorscale=request.colormap,
            ))

        fig = go.Figure(data=traces)
        fig.update_layout(
            title=get_var_label(variable, include_units=False),
            width=900, height=700,
            scene=dict(
                xaxis_title="x 东西向 (m)",
                yaxis_title="y 南北向 (m)",
                zaxis_title="海拔高度 (m)",
                camera=camera,
                aspectmode="manual",
                aspectratio=dict(x=1, y=1, z=0.6),
            ),
        )

        html_str = fig.to_html(full_html=True, include_plotlyjs="cdn")
        html_b64 = base64.b64encode(html_str.encode("utf-8")).decode("utf-8")

        return PlotResult(
            plot_type=self.plot_type,
            content_type="text/html",
            data=html_b64,
            width=900, height=700,
            metadata={"variable": variable, "origin_z": origin_z, "view_presets": list(VIEW_PRESETS.keys())},
        )
