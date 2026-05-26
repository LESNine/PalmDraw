import os
import numpy as np
import netCDF4 as nc
from app.models.file_info import FileMetaInfo, VariableInfo, FileBrowseItem
from app.core.cache import cache

PALM_FILE_PATTERNS = {
    "static": "_static",
    "dynamic": "_dynamic",
    "radiation_lw": "_rlw",
    "radiation_sw": "_rsw",
    "mask": "_mask",
    "p3d": ".p3d",
}


def detect_file_type(filename: str) -> str:
    lower = filename.lower()
    for ftype, pattern in PALM_FILE_PATTERNS.items():
        if pattern in lower:
            return ftype
    return "3d_output"


def get_file_meta(file_path: str) -> FileMetaInfo:
    ds = nc.Dataset(file_path, "r")
    try:
        dimensions = {name: len(dim) for name, dim in ds.dimensions.items()}
        variables = []
        for name, var in ds.variables.items():
            variables.append(VariableInfo(
                name=name,
                dimensions=list(var.dimensions),
                shape=list(var.shape),
                units=getattr(var, "units", None),
                long_name=getattr(var, "long_name", None),
            ))
        global_attrs = {}
        for attr in ds.ncattrs():
            val = ds.getncattr(attr)
            if isinstance(val, (str, int, float, bool)):
                global_attrs[attr] = val
        origin_lat = global_attrs.get("origin_lat", None)
        origin_lon = global_attrs.get("origin_lon", None)
        origin_z = global_attrs.get("origin_z", None)
        if origin_z is not None:
            origin_z = float(origin_z)

        z_levels = []
        z_levels_altitude = []
        for z_name in ("zu_3d", "z", "zw", "zsoil"):
            if z_name in ds.variables:
                z_levels = ds.variables[z_name][:].astype(float).tolist()
                break

        if z_levels and origin_z is not None:
            z_levels_altitude = [z + origin_z for z in z_levels]
        elif z_levels:
            z_levels_altitude = list(z_levels)

        zw_levels = []
        zw_levels_altitude = []
        if "zw_3d" in ds.variables:
            zw_levels = ds.variables["zw_3d"][:].astype(float).tolist()
            if origin_z is not None:
                zw_levels_altitude = [z + origin_z for z in zw_levels]
            else:
                zw_levels_altitude = list(zw_levels)

        time_values = []
        for t_name in ("time", "Time"):
            if t_name in ds.variables:
                time_values = ds.variables[t_name][:].astype(float).tolist()
                break

        return FileMetaInfo(
            filename=os.path.basename(file_path),
            file_path=file_path,
            file_type=detect_file_type(file_path),
            dimensions=dimensions,
            variables=variables,
            global_attrs=global_attrs,
            origin_lat=origin_lat,
            origin_lon=origin_lon,
            origin_z=origin_z,
            z_levels=z_levels,
            z_levels_altitude=z_levels_altitude,
            zw_levels=zw_levels,
            zw_levels_altitude=zw_levels_altitude,
            time_values=time_values,
        )
    finally:
        ds.close()


def read_variable_slice(
    file_path: str,
    variable: str,
    height_level: int | None = None,
    x_slice: list[int] | None = None,
    y_slice: list[int] | None = None,
    time_range: list[int] | None = None,
) -> np.ndarray:
    cache_key = f"{file_path}:{variable}:{height_level}:{x_slice}:{y_slice}:{time_range}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached[0]

    ds = nc.Dataset(file_path, "r")
    try:
        var = ds.variables[variable]

        slices = []
        for i, dim_name in enumerate(var.dimensions):
            if dim_name in ("time", "Time"):
                if time_range is not None:
                    slices.append(slice(time_range[0], time_range[1]))
                else:
                    slices.append(slice(None))
            elif dim_name in ("zu_3d", "zw_3d", "zs_3d", "z", "zw", "zsoil"):
                if height_level is not None:
                    slices.append(height_level)
                else:
                    slices.append(slice(None))
            elif dim_name in ("x", "xu"):
                if x_slice is not None:
                    slices.append(slice(x_slice[0], x_slice[1]))
                else:
                    slices.append(slice(None))
            elif dim_name in ("y", "yv"):
                if y_slice is not None:
                    slices.append(slice(y_slice[0], y_slice[1]))
                else:
                    slices.append(slice(None))
            else:
                slices.append(slice(None))

        data = var[tuple(slices)].astype(np.float32)
        data = np.ma.filled(data, np.nan)

        size_bytes = data.nbytes
        cache.put(cache_key, (data, size_bytes))
        return data
    finally:
        ds.close()


def read_coordinate(file_path: str, coord_name: str) -> np.ndarray:
    ds = nc.Dataset(file_path, "r")
    try:
        for name in (coord_name,):
            if name in ds.variables:
                return ds.variables[name][:].astype(np.float32)
        return np.array([])
    finally:
        ds.close()


def browse_directory(path: str) -> list[FileBrowseItem]:
    items = []
    if not os.path.isdir(path):
        return items
    for entry in sorted(os.scandir(path), key=lambda e: (not e.is_dir(), e.name.lower())):
        if entry.name.startswith("."):
            continue
        items.append(FileBrowseItem(
            name=entry.name,
            path=entry.path,
            is_dir=entry.is_dir(),
            size=entry.stat().st_size if not entry.is_dir() else None,
            file_type=detect_file_type(entry.name) if not entry.is_dir() else None,
        ))
    return items
