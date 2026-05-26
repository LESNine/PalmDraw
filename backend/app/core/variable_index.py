PALM_VARIABLES = {
    "u": {"long_name": "u风速分量", "units": "m/s"},
    "v": {"long_name": "v风速分量", "units": "m/s"},
    "w": {"long_name": "w风速分量", "units": "m/s"},
    "theta": {"long_name": "位温", "units": "K"},
    "pt": {"long_name": "位温", "units": "K"},
    "wspeed": {"long_name": "风速", "units": "m/s"},
    "e": {"long_name": "湍流动能", "units": "m²/s²"},
    "p": {"long_name": "气压", "units": "Pa"},
    "ta": {"long_name": "温度", "units": "°C"},
    "ti": {"long_name": "湍流强度", "units": "1/s"},
    "qv": {"long_name": "比湿", "units": "kg/kg"},
    "qc": {"long_name": "云水混合比", "units": "kg/kg"},
    "qr": {"long_name": "雨水混合比", "units": "kg/kg"},
    "qi": {"long_name": "冰晶混合比", "units": "kg/kg"},
    "qs": {"long_name": "雪混合比", "units": "kg/kg"},
    "qg": {"long_name": "霰混合比", "units": "kg/kg"},
    "nr": {"long_name": "雨滴数浓度", "units": "1/m³"},
    "ni": {"long_name": "冰晶数浓度", "units": "1/m³"},
    "ns": {"long_name": "雪数浓度", "units": "1/m³"},
    "ng": {"long_name": "霰数浓度", "units": "1/m³"},
    "nc": {"long_name": "云滴数浓度", "units": "1/m³"},
    "rr": {"long_name": "降雨率", "units": "mm/s"},
    "rs": {"long_name": "降雪率", "units": "mm/s"},
    "rg": {"long_name": "降霰率", "units": "mm/s"},
    "rad_lw_in": {"long_name": "长波辐射输入", "units": "W/m²"},
    "rad_lw_out": {"long_name": "长波辐射输出", "units": "W/m²"},
    "rad_sw_in": {"long_name": "短波辐射输入", "units": "W/m²"},
    "rad_sw_out": {"long_name": "短波辐射输出", "units": "W/m²"},
    "rad_net": {"long_name": "净辐射", "units": "W/m²"},
    "shf": {"long_name": "感热通量", "units": "W/m²"},
    "lhf": {"long_name": "潜热通量", "units": "W/m²"},
    "us": {"long_name": "摩擦速度", "units": "m/s"},
    "ts": {"long_name": "摩擦温度", "units": "K"},
    "usws": {"long_name": "u方向地表切应力", "units": "m²/s²"},
    "vsws": {"long_name": "v方向地表切应力", "units": "m²/s²"},
    "zu_3d": {"long_name": "zu坐标", "units": "m"},
    "zw_3d": {"long_name": "zw坐标", "units": "m"},
    "zs_3d": {"long_name": "zs坐标", "units": "m"},
    "x": {"long_name": "x坐标", "units": "m"},
    "y": {"long_name": "y坐标", "units": "m"},
    "time": {"long_name": "时间", "units": "s"},
    "zt": {"long_name": "地形高度", "units": "m"},
    "zu_1d": {"long_name": "zu坐标(1D)", "units": "m"},
    "zw_1d": {"long_name": "zw坐标(1D)", "units": "m"},
    "km": {"long_name": "涡动粘性系数", "units": "m²/s"},
    "kh": {"long_name": "涡动扩散系数", "units": "m²/s"},
    "l_grid": {"long_name": "混合长", "units": "m"},
    "diss": {"long_name": "TKE耗散率", "units": "m²/s³"},
    "blackbody_temp": {"long_name": "黑体温度", "units": "K"},
    "lw_dif_frac": {"long_name": "长波漫射比例", "units": "1"},
}


def get_var_info(var_name: str) -> dict:
    if var_name in PALM_VARIABLES:
        return PALM_VARIABLES[var_name]
    return {"long_name": var_name, "units": ""}


def get_var_label(var_name: str, include_units: bool = True) -> str:
    info = get_var_info(var_name)
    if include_units and info["units"]:
        return f'{info["long_name"]} ({info["units"]})'
    return info["long_name"]
