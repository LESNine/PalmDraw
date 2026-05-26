import numpy as np
from app.core.nc_reader import read_variable_slice, read_coordinate


def add_terrain_contour(ax, file_path: str, x: np.ndarray, y: np.ndarray,
                        levels=10, color="black", linewidth=0.8, alpha=0.7):
    zt = read_variable_slice(file_path, "zt")
    if zt.ndim == 3:
        zt = zt[0]
    if zt.shape == (len(y), len(x)):
        X, Y = np.meshgrid(x, y)
        ax.contour(X, Y, zt, levels=levels, colors=color, linewidths=linewidth, alpha=alpha)
    return ax
