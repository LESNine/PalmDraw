from pydantic import BaseModel
from typing import Any


class VariableInfo(BaseModel):
    name: str
    dimensions: list[str]
    shape: list[int]
    units: str | None = None
    long_name: str | None = None


class FileMetaInfo(BaseModel):
    filename: str
    file_path: str
    file_type: str
    dimensions: dict[str, int]
    variables: list[VariableInfo]
    global_attrs: dict[str, Any]
    origin_lat: float | None = None
    origin_lon: float | None = None
    origin_z: float | None = None
    z_levels: list[float] = []
    z_levels_altitude: list[float] = []
    zw_levels: list[float] = []
    zw_levels_altitude: list[float] = []
    time_values: list[float] = []


class FileBrowseItem(BaseModel):
    name: str
    path: str
    is_dir: bool
    size: int | None = None
    file_type: str | None = None
