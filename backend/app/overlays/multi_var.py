import numpy as np
from app.core.nc_reader import read_variable_slice, read_coordinate


def add_wind_vectors(ax, file_path: str, x: np.ndarray, y: np.ndarray,
                     height_level=None, skip=5, color="black", alpha=0.7, scale=None):
    u = read_variable_slice(file_path, "u", height_level=height_level)
    v = read_variable_slice(file_path, "v", height_level=height_level)
    if u.ndim == 3:
        u = u[0]
    if v.ndim == 3:
        v = v[0]
    if u.shape == (len(y), len(x)) and v.shape == (len(y), len(x)):
        X, Y = np.meshgrid(x, y)
        ax.quiver(X[::skip, ::skip], Y[::skip, ::skip],
                  u[::skip, ::skip], v[::skip, ::skip],
                  color=color, alpha=alpha, scale=scale)
    return ax
