import logging

from fastapi import APIRouter, HTTPException
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult

logger = logging.getLogger(__name__)

try:
    from app.engines.contour import ContourEngine
except ImportError as e:
    logger.error(f"Failed to import ContourEngine: {e}")
    ContourEngine = None

try:
    from app.engines.cross_section import CrossSectionEngine
except ImportError as e:
    logger.error(f"Failed to import CrossSectionEngine: {e}")
    CrossSectionEngine = None

try:
    from app.engines.timeseries import TimeseriesEngine
except ImportError as e:
    logger.error(f"Failed to import TimeseriesEngine: {e}")
    TimeseriesEngine = None

try:
    from app.engines.wind import WindEngine
except ImportError as e:
    logger.error(f"Failed to import WindEngine: {e}")
    WindEngine = None

try:
    from app.engines.spectrum import SpectrumEngine
except ImportError as e:
    logger.error(f"Failed to import SpectrumEngine: {e}")
    SpectrumEngine = None

try:
    from app.engines.animation import AnimationEngine
except ImportError as e:
    logger.error(f"Failed to import AnimationEngine: {e}")
    AnimationEngine = None

try:
    from app.engines.plotly_3d import Plotly3DEngine
except ImportError as e:
    logger.error(f"Failed to import Plotly3DEngine: {e}")
    Plotly3DEngine = None

try:
    from app.engines.profile import ProfileEngine
except ImportError as e:
    logger.error(f"Failed to import ProfileEngine: {e}")
    ProfileEngine = None

try:
    from app.engines.terrain_follow import TerrainFollowEngine
except ImportError as e:
    logger.error(f"Failed to import TerrainFollowEngine: {e}")
    TerrainFollowEngine = None

router = APIRouter(prefix="/api/plot", tags=["plot"])

ENGINES = {}
for _name, _cls in [
    ("contour", ContourEngine),
    ("cross_section", CrossSectionEngine),
    ("timeseries", TimeseriesEngine),
    ("wind", WindEngine),
    ("spectrum", SpectrumEngine),
    ("animation", AnimationEngine),
    ("3d", Plotly3DEngine),
    ("profile", ProfileEngine),
    ("terrain_follow", TerrainFollowEngine),
]:
    if _cls is not None:
        ENGINES[_name] = _cls
    else:
        logger.warning(f"Engine {_name} could not be imported and is disabled")

logger.info(f"Registered plot engines: {list(ENGINES.keys())}")


@router.post("/render")
async def render_plot(request: PlotRequest):
    engine_cls = ENGINES.get(request.plot_type)
    if not engine_cls:
        raise HTTPException(status_code=400, detail=f"Unknown plot type: {request.plot_type}")
    try:
        engine = engine_cls()
        result = engine.render(request)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preview")
async def preview_plot(request: PlotRequest):
    engine_cls = ENGINES.get(request.plot_type)
    if not engine_cls:
        raise HTTPException(status_code=400, detail=f"Unknown plot type: {request.plot_type}")
    try:
        engine = engine_cls()
        result = engine.render(request)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
