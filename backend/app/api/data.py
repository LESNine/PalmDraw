from fastapi import APIRouter, HTTPException
from app.models.plot_request import DataSliceRequest
from app.models.plot_result import DataSliceResult
from app.core.nc_reader import read_variable_slice, read_coordinate

router = APIRouter(prefix="/api/data", tags=["data"])


@router.post("/slice")
async def data_slice(request: DataSliceRequest):
    try:
        data = read_variable_slice(request.file_path, request.variable)
        dims = {}
        for dim_name in request.dimensions:
            coords = read_coordinate(request.file_path, dim_name)
            if len(coords) > 0:
                dims[dim_name] = coords.tolist()
        return DataSliceResult(
            variable=request.variable,
            shape=list(data.shape),
            data=data.flatten().tolist()[:10000],
            dimensions=dims,
        ).model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
