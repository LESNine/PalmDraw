import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.file_info import FileBrowseItem
from app.core.nc_reader import browse_directory, get_file_meta
from app.core.config import settings

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/browse")
async def browse(path: str = "."):
    if not os.path.isdir(path):
        raise HTTPException(status_code=404, detail=f"Directory not found: {path}")
    items = browse_directory(path)
    return {"files": [item.model_dump() for item in items]}


@router.post("/info")
async def file_info(file_path: str):
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
    try:
        meta = get_file_meta(file_path)
        return meta.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")
    dest = settings.UPLOAD_DIR / file.filename
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"file_id": str(dest), "filename": file.filename}


@router.post("/find_level")
async def find_level(file_path: str, altitude: float, coord_type: str = "zu"):
    try:
        meta = get_file_meta(file_path)
        if coord_type == "zw" and meta.zw_levels_altitude:
            levels = meta.zw_levels_altitude
        else:
            levels = meta.z_levels_altitude
        if not levels:
            raise HTTPException(status_code=400, detail="No z-levels found in file")
        diffs = [abs(l - altitude) for l in levels]
        idx = diffs.index(min(diffs))
        return {"level_index": idx, "altitude": levels[idx], "z_value": meta.z_levels[idx] if idx < len(meta.z_levels) else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/variables")
async def variable_index():
    from app.core.variable_index import PALM_VARIABLES
    return {"variables": PALM_VARIABLES}


@router.post("/stats")
async def variable_stats(file_path: str, variable: str):
    import numpy as np
    from app.core.nc_reader import read_variable_slice
    try:
        data = read_variable_slice(file_path, variable, time_range=[0, 1])
        valid = data[~np.isnan(data)]
        if len(valid) == 0:
            return {"variable": variable, "valid_count": 0, "min": None, "max": None, "mean": None, "std": None}
        return {
            "variable": variable,
            "valid_count": int(len(valid)),
            "min": float(np.min(valid)),
            "max": float(np.max(valid)),
            "mean": float(np.mean(valid)),
            "std": float(np.std(valid)),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
