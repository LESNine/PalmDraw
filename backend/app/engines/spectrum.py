import numpy as np
from scipy import signal
from matplotlib.ticker import FuncFormatter
from app.engines.base import BasePlotEngine
from app.models.plot_request import PlotRequest
from app.models.plot_result import PlotResult
from app.core.nc_reader import read_coordinate
from app.core.variable_index import get_var_label


def _log_fmt(val, pos):
    if val <= 0:
        return ""
    exp = int(round(np.log10(val)))
    coeff = val / 10.0 ** exp
    if abs(coeff - 1.0) < 0.01:
        if exp == 0:
            return "1"
        return r"10$^{%d}$" % exp
    if abs(coeff - 2.0) < 0.01:
        if exp == 0:
            return "2"
        return r"2${\times}$10$^{%d}$" % exp
    if abs(coeff - 5.0) < 0.01:
        if exp == 0:
            return "5"
        return r"5${\times}$10$^{%d}$" % exp
    return "%.1e" % val


class SpectrumEngine(BasePlotEngine):
    @property
    def plot_type(self) -> str:
        return "spectrum"

    def render(self, request: PlotRequest) -> PlotResult:
        file_path = request.file_paths[0]
        variable = request.variables[0]
        data = self._read_data(request, variable)

        if data.ndim > 1:
            data = np.nanmean(data, axis=tuple(range(1, data.ndim)))

        data = data[~np.isnan(data)]
        if len(data) < 4:
            return PlotResult(
                plot_type=self.plot_type,
                content_type="text/plain",
                data="Not enough data points for spectrum analysis",
                width=0, height=0,
            )

        self._create_figure(figsize=(10, 6))

        freqs, psd = signal.welch(data, nperseg=min(256, len(data)), scaling="density")
        freqs = freqs[1:]
        psd = psd[1:]

        self.ax.loglog(freqs, psd, linewidth=1.5, label=variable)
        self.ax.xaxis.set_major_formatter(FuncFormatter(_log_fmt))
        self.ax.yaxis.set_major_formatter(FuncFormatter(_log_fmt))
        self.ax.set_xlabel("频率 (Hz)")
        self.ax.set_ylabel(f"功率谱密度 ({get_var_label(variable, include_units=False)})")
        self.ax.set_title(f"{get_var_label(variable, include_units=False)} 能谱分析")
        self.ax.legend()
        self.ax.grid(True, which="both", alpha=0.3)

        img_b64 = self._fig_to_base64()
        return PlotResult(
            plot_type=self.plot_type,
            content_type="image/png",
            data=img_b64,
            width=0, height=0,
            metadata={"variable": variable},
        )
