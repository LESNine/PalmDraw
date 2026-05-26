import numpy as np
from app.core.nc_reader import read_variable_slice, read_coordinate


def add_terrain_filled(ax, file_path: str, x: np.ndarray, y: np.ndarray,
                       cmap="terrain", alpha=0.4, levels=20):
    zt = read_variable_slice(file_path, "zt")
    if zt.ndim == 3:
        zt = zt[0]
    if zt.shape == (len(y), len(x)):
        X, Y = np.meshgrid(x, y)
        ax.contourf(X, Y, zt, levels=levels, cmap=cmap, alpha=alpha)
    return ax
