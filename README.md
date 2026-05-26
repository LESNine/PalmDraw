# palmdraw

A visualization WebUI tool designed for PALM large-eddy simulation output files.

## Features

- **9 Plot Types**: Contour, cross-section, time series, profile, wind field, energy spectrum, GIF animation, 3D interactive, terrain-following
- **Full PALM File Support**: 3D simulation output, static, dynamic driver, mask, radiation driver, etc.
- **PALM z-Coordinate System**: Computes altitude using zu_3d/zw_3d + origin_z; auto-matches the nearest level from user-input altitude
- **Terrain-Following Mode**: Reads zt from static file and renders filled contours at a user-specified height above ground
- **Selective Data Loading**: Only reads user-specified variables and dimension slices to avoid memory overflow
- **Overlay Support**: Terrain contour/filled underlays with multi-file reading
- **Publication-Quality Output**: Customizable title, fonts, labels, DPI, etc.; defaults meet publication standards
- **3D Interactive Rendering**: RK4 streamline integration + Plotly interactive view with front/side/top presets
- **Auto Variable Units**: Built-in index of 49 PALM variables with Chinese names and units

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI + matplotlib + Plotly + netCDF4 + scipy |
| Frontend | React + TypeScript + Vite + Tailwind CSS + Zustand |
| Plotting | matplotlib (2D) + Plotly (3D interactive) |

## Quick Start

### Requirements

- Python 3.10+
- Node.js 18+

### Installation

```bash
git clone https://github.com/LESNine/palmdraw.git
cd palmdraw

# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Launch

**Option 1: One-click start (Windows)**

```bash
start.bat
```

**Option 2: Manual start**

```bash
# Terminal 1 — Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit http://localhost:5173 to use the application.

## Server Deployment (Ubuntu + Conda)

### 1. Clone & setup environment

```bash
cd ~
git clone https://github.com/LESNine/palmdraw.git
cd palmdraw

conda create -n palmdraw python=3.12 -y
conda activate palmdraw
pip install -r backend/requirements.txt
```

### 2. Build frontend

```bash
conda install -n palmdraw nodejs=20 -y
cd frontend
npm install
npm run build
cd ..
```

### 3. Test run

```bash
conda activate palmdraw
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 4. Access the application

**Option A: SSH tunnel (recommended, no firewall needed)**

```bash
# On your local machine, connect with port forwarding:
ssh -L 8000:localhost:8000 <username>@<server-ip>
```

Then visit **http://localhost:8000** in your browser. The backend only listens on `127.0.0.1`, so no external access is exposed.

**Option B: Direct access (requires open port)**

If you need direct access from other machines, start with `--host 0.0.0.0` and open the firewall:

```bash
sudo ufw allow 8000
```

If using a cloud provider (Alibaba Cloud, Tencent Cloud, etc.), also open port 8000 in the security group. Then visit `http://<server-ip>:8000`.

### 5. Run as systemd service (persistent)

Find the Python path:

```bash
conda activate palmdraw
which python
```

Create service file:

```bash
sudo nano /etc/systemd/system/palmdraw.service
```

Write the following (replace `<username>` and the Python path):

```ini
[Unit]
Description=palmdraw backend
After=network.target

[Service]
Type=simple
User=<username>
WorkingDirectory=/home/<username>/palmdraw/backend
ExecStart=/home/<username>/miniconda3/envs/palmdraw/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> Use `--host 0.0.0.0` instead of `127.0.0.1` if you need direct external access (Option B).

Start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable palmdraw
sudo systemctl start palmdraw
sudo systemctl status palmdraw
```

### Update code

```bash
cd ~/palmdraw
git pull

# If frontend changed:
cd frontend && npm run build && cd ..

# If backend changed:
sudo systemctl restart palmdraw
```

## Project Structure

```
palmdraw/
├── backend/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core modules (NetCDF reader, variable index, cache)
│   │   ├── engines/        # Plot engines
│   │   ├── models/         # Data models
│   │   └── overlays/       # Overlay handlers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Pages
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
└── start.bat
```

## Plot Types

| Plot | Description |
|------|-------------|
| Contour | Horizontal filled contour at a specified altitude |
| Cross Section | Vertical slice along X or Y direction |
| Time Series | Temporal evolution (domain avg / area avg / single point) |
| Profile | Vertical profile (Savgol + PCHIP smoothing) |
| Wind Field | Wind vectors overlaid on filled contours |
| Spectrum | Log-scale energy spectrum analysis |
| Animation | Frame-by-frame GIF animation |
| 3D Interactive | Plotly 3D flow-field rendering |
| Terrain-Following | Terrain-following filled contour based on static zt |

## License

MIT

---

# palmdraw（中文）

专为 PALM 大涡模拟输出文件设计的可视化绘图 WebUI 工具。

## 功能

- **9 种图表类型**：填色图、剖面图、时间序列、廓线图、风场图、能谱图、GIF 动画、3D 交互、地形跟随
- **全类型 PALM 文件支持**：3D 模拟输出、static、dynamic driver、mask、辐射驱动等
- **PALM z 坐标系**：使用 zu_3d/zw_3d + origin_z 计算海拔高度，用户输入海拔自动匹配最近层
- **地形跟随模式**：读取 static 文件 zt 变量，绘制指定地上高度的平面填色图
- **选择性数据加载**：只读取用户指定的变量和维度切片，避免内存溢出
- **底图叠加**：支持地形等值线/填色底图，可同时读取多个文件
- **论文级出图**：自定义标题、字体、标签、DPI 等参数，默认即满足论文要求
- **3D 交互渲染**：RK4 流线积分 + Plotly 交互视角，支持正视/侧视/俯视预设
- **变量单位自动显示**：内置 49 个 PALM 变量的中文名和单位索引

## 技术栈

| 层 | 技术 |
|---|------|
| 后端 | FastAPI + matplotlib + Plotly + netCDF4 + scipy |
| 前端 | React + TypeScript + Vite + Tailwind CSS + Zustand |
| 绘图 | matplotlib（2D）+ Plotly（3D 交互） |

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+

### 安装

```bash
git clone https://github.com/LESNine/palmdraw.git
cd palmdraw

# 安装后端依赖
pip install -r backend/requirements.txt

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 启动

**方式一：一键启动（Windows）**

```bash
start.bat
```

**方式二：手动启动**

```bash
# 终端 1 — 后端
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 终端 2 — 前端
cd frontend
npm run dev
```

访问 http://localhost:5173 即可使用。

## 服务器部署（Ubuntu + Conda）

### 1. 克隆仓库 & 创建环境

```bash
cd ~
git clone https://github.com/LESNine/palmdraw.git
cd palmdraw

conda create -n palmdraw python=3.12 -y
conda activate palmdraw
pip install -r backend/requirements.txt
```

### 2. 构建前端

```bash
conda install -n palmdraw nodejs=20 -y
cd frontend
npm install
npm run build
cd ..
```

### 3. 测试运行

```bash
conda activate palmdraw
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 4. 访问方式

**方式 A：SSH 隧道（推荐，无需开放端口）**

```bash
# 在本地机器上，使用端口转发连接：
ssh -L 8000:localhost:8000 <用户名>@<服务器IP>
```

然后在浏览器打开 **http://localhost:8000** 即可使用。后端仅监听 `127.0.0.1`，不暴露外部访问，更安全。

**方式 B：直接访问（需要开放端口）**

如果需要其他机器直接访问，启动时使用 `--host 0.0.0.0` 并开放防火墙：

```bash
sudo ufw allow 8000
```

如果使用云服务器（阿里云、腾讯云等），还需要在安全组中放行 8000 端口。然后通过 `http://服务器IP:8000` 访问。

### 5. 配置 systemd 服务（持久运行）

查找 Python 路径：

```bash
conda activate palmdraw
which python
```

创建服务文件：

```bash
sudo nano /etc/systemd/system/palmdraw.service
```

写入以下内容（替换 `<用户名>` 和 Python 路径）：

```ini
[Unit]
Description=palmdraw backend
After=network.target

[Service]
Type=simple
User=<用户名>
WorkingDirectory=/home/<用户名>/palmdraw/backend
ExecStart=/home/<用户名>/miniconda3/envs/palmdraw/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

> 如需外部直接访问（方式 B），将 `127.0.0.1` 改为 `0.0.0.0`。

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable palmdraw
sudo systemctl start palmdraw
sudo systemctl status palmdraw
```

### 更新代码

```bash
cd ~/palmdraw
git pull

# 如果前端有改动：
cd frontend && npm run build && cd ..

# 如果后端有改动：
sudo systemctl restart palmdraw
```

## 项目结构

```
palmdraw/
├── backend/
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心模块（NetCDF 读取、变量索引、缓存）
│   │   ├── engines/        # 绘图引擎
│   │   ├── models/         # 数据模型
│   │   └── overlays/       # 底图叠加
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面
│   │   ├── store/          # Zustand 状态管理
│   │   ├── types/          # TypeScript 类型
│   │   └── utils/          # 工具函数
│   └── package.json
└── start.bat
```

## 图表类型说明

| 图表 | 说明 |
|------|------|
| 填色图 | 指定高度层的水平填色图 |
| 剖面图 | X/Y 方向垂直剖面 |
| 时间序列 | 全域平均/区域平均/单格点的时间变化 |
| 廓线图 | 垂直廓线（Savgol+PCHIP 平滑） |
| 风场图 | 风矢量叠加填色 |
| 能谱图 | 对数坐标能谱分析 |
| 动画 | GIF 逐帧动画 |
| 3D 交互 | Plotly 3D 流场渲染 |
| 地形跟随 | 基于 static 文件 zt 的地形跟随填色图 |

## License

MIT
