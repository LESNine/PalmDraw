import base64
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.models.plot_request import PlotRequest
from app.engines.contour import ContourEngine
from app.engines.cross_section import CrossSectionEngine
from app.engines.timeseries import TimeseriesEngine
from app.engines.wind import WindEngine
from app.engines.spectrum import SpectrumEngine
from app.engines.animation import AnimationEngine
from app.engines.profile import ProfileEngine
from app.engines.terrain_follow import TerrainFollowEngine

router = APIRouter(prefix="/api/export", tags=["export"])

ENGINES = {
    "contour": ContourEngine,
    "cross_section": CrossSectionEngine,
    "timeseries": TimeseriesEngine,
    "wind": WindEngine,
    "spectrum": SpectrumEngine,
    "animation": AnimationEngine,
    "profile": ProfileEngine,
    "terrain_follow": TerrainFollowEngine,
}


@router.post("/")
async def export_plot(request: PlotRequest, format: str = "png"):
    engine_cls = ENGINES.get(request.plot_type)
    if not engine_cls:
        raise HTTPException(status_code=400, detail=f"Unknown plot type: {request.plot_type}")
    try:
        engine = engine_cls()
        result = engine.render(request)
        data = base64.b64decode(result.data)
        content_type = result.content_type
        return Response(content=data, media_type=content_type,
                       headers={"Content-Disposition": f"attachment; filename=palmdraw_export.{format}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
