from pydantic import BaseModel
from typing import Any


class PlotResult(BaseModel):
    plot_type: str
    content_type: str
    data: str
    width: int
    height: int
    metadata: dict[str, Any] = {}


class DataSliceResult(BaseModel):
    variable: str
    shape: list[int]
    data: list
    dimensions: dict[str, list[float]]
