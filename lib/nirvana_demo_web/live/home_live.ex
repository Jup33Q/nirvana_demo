defmodule NirvanaDemoWeb.HomeLive do
  use NirvanaDemoWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok, assign(socket, page_title: "Obsidian 涅槃手册")}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="fixed inset-0" style="cursor: none;">
      <%!-- Cookie-aware redirect script for play button --%>
      <script>
        (function(){
          const m = document.cookie.match(/(?:^|; )last_slide=([^;]*)/);
          window.__lastSlideId = m ? decodeURIComponent(m[1]) : '1';
        })();
      </script>

      <%!-- IDE Code Wave Background --%>
      <canvas
        id="home-code-wave-canvas"
        phx-hook="IdeCodeWaveBg"
        class="absolute inset-0 w-full h-full"
        style="z-index: 0; pointer-events: auto;"
      >
      </canvas>

      <%!-- Content overlay --%>
      <div
        class="absolute inset-0 flex flex-col items-center justify-center text-white"
        style="z-index: 1; pointer-events: none;"
      >
        <h1 class="mb-4 text-3xl font-light tracking-wide text-slate-300">
          🔥 Obsidian 涅槃手册
        </h1>
        <h2 class="mb-8 text-xl font-light tracking-wide text-slate-400">
          从笔记到 LiveView 的三阶进化
        </h2>

        <a
          href="/slides/1"
          id="home-play-btn"
          class="group relative flex h-24 w-24 items-center justify-center rounded-full bg-sky-500/20 ring-1 ring-sky-400/30 transition-all duration-300 hover:scale-110 hover:bg-sky-500/30 hover:ring-sky-400/50"
          style="pointer-events: auto; cursor: pointer;"
          aria-label="Play slideshow"
        >
          <span class="absolute inset-0 rounded-full bg-sky-400/20 animate-ping opacity-30 group-hover:opacity-50">
          </span>

          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            class="ml-1 h-10 w-10 text-sky-300 transition-colors group-hover:text-sky-200"
          >
            <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36a1 1 0 0 0-1.5.86Z" />
          </svg>
        </a>

        <script>
          (function(){
            const btn = document.getElementById('home-play-btn');
            if (btn && window.__lastSlideId) {
              btn.href = '/slides/' + window.__lastSlideId;
            }
          })();
        </script>

        <p class="mt-6 text-sm text-slate-500">
          点击播放查看幻灯片
        </p>

        <p class="mt-2 text-xs text-slate-600">
          15 页 · 五阶段进化之旅 + 数据可视化
        </p>
      </div>
    </div>
    """
  end
end
