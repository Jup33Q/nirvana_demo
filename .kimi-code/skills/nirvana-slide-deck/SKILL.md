---
name: nirvana-slide-deck
description: >
  nirvana_demo 项目级开发规范与架构指南。
  基于 Marp Slider → Phoenix LiveView 迁移实战验证的规范，
  指导 Obsidian 涅槃手册幻灯片应用的持续迭代与功能扩展。
  涵盖 Ecto 数据层、单页 LiveView 模式、Canvas 动态背景、Panel 布局、
  Cookie 分页记忆、键盘/OSC 交互、多背景切换等全部细节。
tags: ["phoenix", "liveview", "marp", "slides", "nirvana", "canvas", "ecto", "sqlite3"]
---

# Nirvana Slide Deck — 项目开发规范

## 一、项目概述

`nirvana_demo` 是一个 Phoenix LiveView 幻灯片展示应用，主题内容源自 **Obsidian 涅槃手册**，演示从笔记到 LiveView 的三阶进化流程。

| 属性 | 值 |
|------|-----|
| OTP app | `:nirvana_demo` |
| 数据库 | SQLite3 via `ecto_sqlite3` |
| Phoenix | `~> 1.8.7` |
| LiveView | `~> 1.1.0` |
| Endpoint | `NirvanaDemoWeb.Endpoint` |
| Repo | `NirvanaDemo.Repo` |
| 幻灯片数量 | 13 页 |

### 已有路由

- `GET /` — `HomeLive`（封面页，BubbleQuilt 背景 + Cookie 感知播放按钮）
- `GET /slides` — `SlideDeckLive` index（Cookie 重定向到上次浏览页）
- `GET /slides/:slide` — `SlideDeckLive` show（单页幻灯片展示）
- `GET /dev/dashboard` — LiveDashboard（dev only）
- `GET /dev/mailbox` — Swoosh mailbox preview（dev only）

---

## 二、架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Ecto + SQLite3)              │
│    Slide Schema → Slides Context → Repo.seed                │
├─────────────────────────────────────────────────────────────┤
│                    State Layer                              │
│    SlideDeckLive → single-slide mode + push_navigate        │
│    Cookie: last_slide (30d, path=/) → auto-redirect         │
│    Home: cursor hidden + cookie-aware play button           │
├─────────────────────────────────────────────────────────────┤
│                 Presentation Layer                          │
│    HEEx template → Panel separation (title/subtitle/data)   │
│    Hover effects: translateY(-4px) + glow shadow            │
├─────────────────────────────────────────────────────────────┤
│              Background Layer                               │
│    Canvas Hooks: BubbleQuilt (home + slides)                │
│    Mouse穿透: window.addEventListener('mousemove')          │
│    多背景切换: 未来可扩展 GeometricMatrix / Nebula 等       │
├─────────────────────────────────────────────────────────────┤
│            Interaction Layer                                │
│    Keyboard: Arrow/Space/PageDown + phx-window-keydown      │
│    OSC: prev/next buttons + progress bar + Home + cursor    │
│    TransitionFlash: mount-based flash overlay               │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、数据层规范

### 3.1 Schema（已固定，不可随意修改字段）

```elixir
# lib/nirvana_demo/slides/slide.ex
schema "slides" do
  field :number, :integer
  field :type, :string          # "cover" | "table" | "footer" | "simple_table" | "metrics" | "table_with_text" | "multi_table"
  field :title, :string
  field :subtitle, :string
  field :data, :map, default: %{}  # 弹性数据容器

  timestamps(type: :utc_datetime)
end
```

约束：`number` 唯一，`type` 和 `data` 必填。

### 3.2 Context API

```elixir
NirvanaDemo.Slides.list_slides/0           # 全部幻灯片，按 number 排序，返回 atomized map
NirvanaDemo.Slides.get_slide_by_number/1   # 按 number 获取，返回 atomized map
NirvanaDemo.Slides.list_slide_numbers/0    # 仅返回 number 列表
NirvanaDemo.Slides.delete_all_slides/0     # 清空全部
```

**关键**：`slide_to_map/1` 会将 `data` map 的键深层 atomize，并与顶层字段合并。模板中通过 `@slide[:key]` 访问。

### 3.3 Seeds 规范

所有幻灯片数据硬编码在 `priv/repo/seeds.exs` 中。新增/修改幻灯片时：

1. 直接编辑 `seeds.exs`
2. 运行 `mix ecto.reset` 或 `mix run priv/repo/seeds.exs`
3. **不需要**创建 migration（数据通过 seeds 管理）

Slide `data` 字段支持的类型结构：

| type | data 结构 |
|------|----------|
| `cover` / `footer` | `%{lines: ["line1", "line2", ...]}` |
| `table` | `%{headers: [...], rows: [[...], ...], blockquote: "..."}` |
| `simple_table` | 同 `table` |
| `metrics` | 同 `table`，但第二列加粗高亮 |
| `table_with_text` | `%{top_text: "...", h3: "...", headers: [...], rows: [...]}` |
| `multi_table` | `%{tables: [%{title: "...", headers: [...], rows: [...]}, ...]}` |

---

## 四、LiveView 规范

### 4.1 单页模式（Single-Slide Mode）

**必须**使用单页模式，即每次只渲染当前 slide：

- `mount/3`：加载 slide numbers 列表，assign `numbers`, `total`, `page_title`
- `handle_params/3`：解析 `:slide` 参数，加载对应 slide，assign `slide`, `current`, `current_number`
- 无 slide 参数时（`/slides`），设置 `needs_cookie_redirect: true`，由客户端 JS 读取 cookie 重定向

**禁止**一次性加载所有 slides 到 DOM 中。

### 4.2 导航逻辑

```elixir
def handle_event("navigate", %{"key" => key}, socket) do
  direction =
    case key do
      k when k in ["ArrowRight", "ArrowDown", " ", "PageDown"] -> 1
      k when k in ["ArrowLeft", "ArrowUp", "PageUp"] -> -1
      _ -> 0
    end
  navigate_slide(socket, direction)
end

def handle_event("next", _params, socket), do: navigate_slide(socket, 1)
def handle_event("prev", _params, socket), do: navigate_slide(socket, -1)
```

导航时：
1. `assign(:direction, direction)` — 用于过渡动画方向
2. `push_event("save_slide", %{number: new_number})` — 通知客户端 JS 保存 cookie
3. `push_navigate(to: ~p"/slides/#{new_number}?#{cursor_query}")` — URL 同步

### 4.3 Cookie 分页记忆

- Cookie 名：`last_slide`
- 有效期：30 天
- 路径：`/`
- 值：slide number（字符串）

**Home 页**：播放按钮自动读取 cookie，跳转到上次浏览页（`/slides/:last_slide`）
**Slides 页**：`save_slide` 事件由 `TransitionFlash` hook 或内联脚本处理，写入 cookie

### 4.4 光标控制

- 默认隐藏光标（`cursor: none`）
- `toggle_cursor` 事件切换 `cursor_visible` assign
- 切换后 `push_patch` 更新 URL（`?cursor=1` 或 `?cursor=0`）
- 模板中通过 `class={[@cursor_visible && "cursor-visible"]}` 控制

---

## 五、模板层规范

### 5.1 布局约定

- `root.html.heex`：包含主题切换内联脚本，无 `<Layouts.app>` 包装
- `HomeLive` 和 `SlideDeckLive` **均不使用** `<Layouts.app>`，各自使用 fullscreen fixed 布局
- 这是**有意设计**的，因为幻灯片应用需要全屏展示

### 5.2 Panel 分离

每张 slide 的内容分为三个 Panel：

```heex
<div class="slide-panel slide-panel-title">
  <h1 class="slide-title">{@slide.title}</h1>
</div>

<div class="slide-panel slide-panel-subtitle">
  <h2 class="slide-subtitle">{@slide.subtitle}</h2>
</div>

<div class="slide-panel slide-panel-data">
  <%!-- 根据 type 渲染不同内容 --%>
</div>
```

CSS 中 Panel 有统一 hover 效果：`translateY(-4px)` + `glow shadow`。

### 5.3 背景 Canvas

```heex
<canvas
  id="bubble-canvas"
  phx-hook="BubbleQuilt"
  phx-update="ignore"
  style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:auto;"
>
</canvas>
```

**必须**设置 `phx-update="ignore"`，因为 hook 自行管理 DOM。

### 5.4 过渡闪光层

```heex
<div
  id="transition-flash"
  phx-hook="TransitionFlash"
  style="position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:100;opacity:0;"
>
</div>
```

---

## 六、背景层规范（Canvas Hooks）

### 6.1 当前 Hook：BubbleQuilt

位于 `assets/js/hooks/bubble_quilt.js`，导出 `BubbleQuilt` 和 `TransitionFlash`。

**注册方式**：

```javascript
// assets/js/app.js
import {hooks as colocatedHooks} from "phoenix-colocated/nirvana_demo"
import {BubbleQuilt, TransitionFlash} from "./hooks/bubble_quilt"

const liveSocket = new LiveSocket("/live", Socket, {
  hooks: {...colocatedHooks, BubbleQuilt, TransitionFlash}
})
```

**BubbleQuilt 特性**：
- 六边形气泡矩阵，helix 波动 + pulse + drift + twist + zigzag
- 响应 `slide_change` 事件（水平滚动偏移）
- 自动处理 visibilitychange（后台暂停）
- 高 DPR 支持（`devicePixelRatio`）

### 6.2 多背景切换（未来扩展）

当需要支持多背景效果时，按照以下模式扩展：

1. **创建新 Hook 文件**：`assets/js/hooks/<effect_name>.js`
2. **导出 Hook 对象**：`const EffectName = { mounted() {...}, destroyed() {...} }`
3. **在 app.js 注册**：`hooks: {...colocatedHooks, BubbleQuilt, TransitionFlash, EffectName}`
4. **LiveView 控制切换**：通过 `push_event("switch_bg", %{effect: "effect_name"})` 通知客户端
5. **CSS 变量或 data 属性**控制背景参数

**可接入的背景效果 skill**（见用户级 skill）：
- `canvas-effect-aurora` — 极光呼吸场
- `canvas-effect-nebula` — 星云粒子
- `canvas-effect-firefly` — 萤火虫星座
- `canvas-effect-liquid` — 液态光绘
- `canvas-effect-geometric` — 几何矩阵
- `ide-code-wave-bg` — 代码字符波

---

## 七、交互层规范

### 7.1 键盘事件

```heex
<div id="slide-deck" phx-window-keydown="navigate">
```

支持按键：
- `ArrowRight`, `ArrowDown`, `Space`, `PageDown` → 下一页
- `ArrowLeft`, `ArrowUp`, `PageUp` → 上一页

### 7.2 OSC（On-Screen Controls）

固定底部控制栏：

```
[Home] [← Prev]  3 / 13  [Next →] [Cursor]
```

- Home：`<.link navigate={~p"/"}>`
- Prev：`phx-click="prev"`
- Next：`phx-click="next"`
- Page：`{@current + 1} / {@total}`
- Cursor：`phx-click="toggle_cursor"`，active 状态高亮

### 7.3 进度条

```heex
<div class="slide-progress">
  <div class="slide-progress-bar" style={"width: #{(@current + 1) / @total * 100}%"}></div>
</div>
```

---

## 八、样式规范

### 8.1 Tailwind v4

- **无** `tailwind.config.js`
- 使用 `@import "tailwindcss" source(none);` 语法
- Source 路径在 `app.css` 中声明：`@source "../css"`, `@source "../js"`, `@source "../../lib/nirvana_demo_web"`
- 使用 `@plugin` 加载 heroicons 和 daisyui

### 8.2 幻灯片专用 CSS

所有幻灯片样式写在 `app.css` 中（或独立 CSS 文件后 import）。关键 class：

| Class | 用途 |
|-------|------|
| `.slide-deck` | 根容器，fixed inset-0 |
| `.slide-container` | slide 包装 |
| `.slide` | 单张 slide |
| `.slide-panel` | 内容面板 |
| `.slide-panel-title` | 标题面板 |
| `.slide-panel-subtitle` | 副标题面板 |
| `.slide-panel-data` | 数据面板 |
| `.slide-table` | 表格样式 |
| `.slide-blockquote` | 引用块 |
| `.bespoke-marp-osc` | 底部控制栏 |
| `.slide-progress` | 进度条容器 |
| `.slide-progress-bar` | 进度条填充 |

**禁止**使用 `@apply` 写 raw css。

---

## 九、开发命令

所有命令在 `nirvana_demo/` 目录下执行：

```bash
# 初始化（安装依赖、创建 DB、迁移、构建资产、seed）
mix setup

# 启动开发服务器
mix phx.server

# 重置数据库并重新 seed
mix ecto.reset

# 格式化代码
mix format

# 运行测试
mix test

# 预提交检查（编译、解锁未使用依赖、格式化、测试）
mix precommit

# 生产构建
mix assets.deploy
```

---

## 十、测试规范

- 使用 `ConnCase` 做 controller/router 测试
- 使用 `DataCase` 做 context/schema 测试
- **不推荐** `async: true`（SQLite3 限制）
- 使用 `start_supervised!/1` 启动测试进程
- HTML 断言优先使用 `has_element?/2`, `element/2`
- 使用 `LazyHTML` 过滤复杂 HTML 断言

---

## 十一、协同 Skill

开发 `nirvana_demo` 时，以下用户级 skill 可供协同使用：

| Skill | 用途 |
|-------|------|
| `marp-slider-to-phoenix` | 完整的 Marp → LiveView 迁移路径参考 |
| `marp-to-liveview-slides` | V2 融合技能，含 ECharts 数据可视化、PubSub |
| `elixir-phx-liveview-ecosystem` | Elixir OTP、ETS、Ecto、LiveView 现代模式 |
| `canvas-effect-aurora` | 极光背景效果 |
| `canvas-effect-nebula` | 星云粒子背景 |
| `canvas-effect-firefly` | 萤火虫星座背景 |
| `canvas-effect-liquid` | 液态光绘背景 |
| `canvas-effect-geometric` | 几何矩阵背景 |
| `ide-code-wave-bg` | 代码字符波背景 |

---

## 十二、扩展 Roadmap（参考幻灯片内容）

根据 `seeds.exs` 中的 Roadmap，未来可扩展：

1. **语音控制翻页**：集成 Whisper API，`handle_event("voice_command", ...)`
2. **AI 实时解说**：LLM 根据当前 slide 生成口述稿
3. **多人协作演讲**：Presence 追踪观众 + PubSub 广播翻页
4. **实时投票/问答**：LiveComponent + ETS 计数
5. **3D 波浪背景**：Three.js Hook + 自定义着色器
6. **多背景切换**：按 slide type 或用户偏好切换 Canvas 效果
