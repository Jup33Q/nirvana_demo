# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#

alias NirvanaDemo.Repo
alias NirvanaDemo.Slides.Slide

# Clear existing slides
Repo.delete_all(Slide)

slides = [
  %{
    number: 1,
    type: "cover",
    title: "🔥 Obsidian 涅槃手册",
    subtitle: "从笔记到 LiveView 的三阶进化",
    data: %{
      lines: [
        "把 Obsidian 里的「死文字」炼成「活演示」",
        "再注入 LiveView 的灵魂，让笔记在浏览器里永生"
      ]
    }
  },
  %{
    number: 2,
    type: "cover",
    title: "📋 流程总览",
    subtitle: "五阶段进化之旅",
    data: %{
      lines: [
        "① Obsidian 原料预处理 → ② Agent Marp 适配",
        "③ Marp CLI 导出 HTML → ④ Elixir + Phoenix + LiveView",
        "⑤ 交互化背景注入（灵魂觉醒）"
      ]
    }
  },
  %{
    number: 3,
    type: "table",
    title: "🧱 第一阶段：Obsidian 原料预处理",
    subtitle: "素材要求与文件夹结构",
    data: %{
      headers: ["检查项", "要求", "目的"],
      rows: [
        ["YAML Frontmatter", "必须有 title、tags、date", "供 Agent 识别主题与元信息"],
        ["图片引用", "WikiLink ![[img]] 或标准 Markdown", "Marp 能正确解析并内嵌"],
        ["代码块", "``` 包裹并标注语言", "导出后高亮样式完整保留"],
        ["层级结构", "H1-H3 清晰分节", "自动适配幻灯片分页逻辑"]
      ],
      blockquote: "💡 先在 Obsidian 里把笔记「养肥」，再送进涅槃炉"
    }
  },
  %{
    number: 4,
    type: "table",
    title: "🤖 第二阶段：Agent Marp 适配",
    subtitle: "炼金术核心 — 语法转换",
    data: %{
      headers: ["步骤", "操作", "说明"],
      rows: [
        ["1", "Frontmatter 插入 Marp 配置", "marp: true, theme, paginate"],
        ["2", "H2 前自动插入分页符 ---", "按 per-H2 / auto / manual 策略"],
        ["3", "WikiLink 转相对路径", "![](../assets/xxx.png)"],
        ["4", "长代码块自动折叠/分片", "超过 20 行时处理"],
        ["5", "生成演讲者备注", "<!-- 备注内容 --> 在每页底部"]
      ],
      blockquote: "Agent 只负责语法转换，不涉及样式设计"
    }
  },
  %{
    number: 5,
    type: "table",
    title: "🎨 第三阶段：Marp CLI 导出 HTML",
    subtitle: "从 Markdown 到可分发格式",
    data: %{
      headers: ["参数", "作用", "说明"],
      rows: [
        ["--html", "允许 HTML 标签", "后续 LiveView 嵌入必需"],
        ["--allow-local-files", "解析本地图片", "避免导出断链"],
        ["--bundle", "内嵌所有资源", "单文件 HTML，方便传输"],
        ["-o output.html", "指定输出路径", "单文件导出"],
        ["--config-file", "批量配置", "mar *.md 批量导出"]
      ],
      blockquote: "npm install -g @marp-team/marp-cli"
    }
  },
  %{
    number: 6,
    type: "table",
    title: "🔥 第四阶段：Phoenix + LiveView 化",
    subtitle: "从静态 HTML 到实时交互 Web 应用",
    data: %{
      headers: ["步骤", "命令/操作", "说明"],
      rows: [
        ["1", "mix deps.get", "安装 Elixir 依赖"],
        ["2", "mix ecto.setup", "创建并迁移数据库"],
        ["3", "mix assets.build", "首次编译前端资源"],
        ["4", "mix phx.server", "启动 Phoenix 服务器"],
        ["5", "mix format", "提交前格式化代码"],
        ["6", "mix test", "确保全绿通过"]
      ],
      blockquote: "WSL2 下 Windows 浏览器访问 localhost:4000 即可"
    }
  },
  %{
    number: 7,
    type: "table",
    title: "🌌 第五阶段：交互化背景注入",
    subtitle: "灵魂觉醒 — 从黑白默片到声色俱全",
    data: %{
      headers: ["阶段", "动作", "产出"],
      rows: [
        ["召唤", "向 Agent 描述背景效果", "主题 · 交互 · 色调 · 性能要求"],
        ["生成", "Agent 输出 HTML/JS/TS", "单文件演示 + 纯 JS + 配置参数表"],
        ["封装", "熔炼成 Skill", "SKILL.md + assets + 接口规范"],
        ["附魔", "LiveView 集成", "Hook + HEEx + 多背景切换策略"]
      ],
      blockquote: "静态幻灯片只是躯壳，交互化背景才是灵魂"
    }
  },
  %{
    number: 8,
    type: "table",
    title: "✨ 已有交互背景效果速查",
    subtitle: "Canvas 2D / Three.js 选型表",
    data: %{
      headers: ["Skill 名称", "效果类型", "性能", "适用场景"],
      rows: [
        ["canvas-effect-aurora", "极光呼吸场", "极低", "科技风、深色主题"],
        ["canvas-effect-nebula", "星云粒子", "中等", "数据大屏、星空主题"],
        ["canvas-effect-firefly", "萤火虫星座", "中等", "自然主题、夜间氛围"],
        ["canvas-effect-liquid", "液态光绘", "中高", "创意工具、艺术主题"],
        ["canvas-effect-geometric", "几何矩阵", "高", "极简主义、结构感"],
        ["ide-code-wave-bg", "代码字符波", "中等", "开发者作品集"],
        ["phoenix_liveview_3d_block_wave", "3D 方块浪", "高", "品牌展示、发布会"]
      ],
      blockquote: "打开 Canvas_Effects_Catalog_SKILL.md 按选型决策树快速定位"
    }
  },
  %{
    number: 9,
    type: "table",
    title: "🚀 进阶玩法",
    subtitle: "从单向广播到实时互动",
    data: %{
      headers: ["玩法", "核心思路", "技术要点"],
      rows: [
        ["多人协作演讲", "Presence 追踪观众，PubSub 广播翻页", "Presence + PubSub"],
        ["实时投票 / 问答", "LiveComponent + ETS 计数", "LiveComponent + ETS"],
        ["URL 同步当前页", "handle_params/3 + push_patch/2", "刷新不丢位置，可分享"],
        ["语音控制翻页", "handle_event(\"voice_command\", ...)", "集成 Whisper API"],
        ["3D 波浪背景", "Three.js Hook + 自定义着色器", "phoenix_liveview_3d_block_wave"]
      ],
      blockquote: "所有模板均可在对应 Skill 中找到实现代码"
    }
  },
  %{
    number: 10,
    type: "table",
    title: "🛠️ 工具链与 Skill 映射总表",
    subtitle: "全链路能力一览",
    data: %{
      headers: ["层级", "工具 / Skill", "用途"],
      rows: [
        ["笔记层", "Obsidian + Templater/QuickAdd", "原始内容生产"],
        ["适配层", "AI Agent", "Markdown → Marp 语法转换"],
        ["导出层", "Marp CLI", "Marp → HTML/PDF"],
        ["运行时", "WSL2 + Ubuntu", "Linux 子系统环境"],
        ["Web 层", "Marp_to_LiveView_SKILL", "HTML → LiveView 迁移"],
        ["背景层", "Interactive_Background_Alchemist", "交互背景生成 → 集成"],
        ["部署层", "systemd / Docker / fly.io", "长期运行托管"]
      ]
    }
  },
  %{
    number: 11,
    type: "cover",
    title: "💡 命名哲学",
    subtitle: "为什么叫「Obsidian 涅槃手册」？",
    data: %{
      lines: [
        "Obsidian → 你的知识原料，黑曜石般的原始矿石",
        "涅槃 → 三阶烈焰焚烧，从静态死物化为呼吸互动的生命体",
        "手册 → 可随时翻阅、按需调用、持续迭代的操作指南",
        "",
        "三阶烈焰：Obsidian → Marp → HTML → LiveView → 交互背景"
      ]
    }
  },
  %{
    number: 12,
    type: "cover",
    title: "🔮 未来扩展",
    subtitle: "Roadmap",
    data: %{
      lines: [
        "语音控制：集成 Whisper，喊「下一页」自动翻片",
        "AI 实时解说：LLM 根据当前幻灯片生成口述稿",
        "情绪分析：摄像头捕捉观众表情，实时调整演讲节奏",
        "区块链存证：每次演讲上链（开玩笑的 😄）"
      ]
    }
  },
  %{
    number: 13,
    type: "chart",
    title: "📊 背景效果性能对比",
    subtitle: "Canvas 2D 交互背景选型数据",
    data: %{
      chart_type: "bar",
      chart_title: "CPU 占用率 vs 粒子数量",
      chart_data: %{
        categories: ["极光", "星云", "萤火虫", "液态光绘", "几何矩阵", "代码波", "3D 方块浪"],
        values: [2, 15, 18, 25, 30, 16, 45],
        seriesName: "CPU 占用 (%)"
      },
      blockquote: "💡 深色科技风首选极光/几何矩阵，数据大屏首选星云/萤火虫"
    }
  },
  %{
    number: 14,
    type: "chart",
    title: "🎯 Skill 适用场景分布",
    subtitle: "按主题类型统计",
    data: %{
      chart_type: "pie",
      chart_data: %{
        data: [
          %{value: 3, name: "科技/深色"},
          %{value: 2, name: "自然/夜间"},
          %{value: 1, name: "创意/艺术"},
          %{value: 1, name: "极简/结构"},
          %{value: 1, name: "开发者"},
          %{value: 1, name: "品牌/发布会"}
        ]
      },
      blockquote: "打开 Canvas_Effects_Catalog_SKILL.md 按选型决策树快速定位"
    }
  },
  %{
    number: 15,
    type: "footer",
    title: nil,
    data: %{
      lines: [
        "让每一篇笔记，都有机会站上舞台。 🎭✨"
      ]
    }
  }
]

for attrs <- slides do
  %Slide{}
  |> Slide.changeset(attrs)
  |> Repo.insert!()
end

IO.puts("Inserted #{length(slides)} slides.")
