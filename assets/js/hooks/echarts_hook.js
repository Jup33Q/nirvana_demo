/**
 * ECharts Hook — Phoenix LiveView integration for Apache ECharts
 * Supports bar, line, pie chart types via data attributes.
 */

import * as echarts from "echarts"

const EChartsHook = {
  mounted() {
    this.chartType = this.el.dataset.chartType || "bar"
    this.chartTitle = this.el.dataset.chartTitle || ""
    this.rawData = this.el.dataset.chartData
    if (!this.rawData) return

    try {
      this.data = JSON.parse(this.rawData)
    } catch (e) {
      console.error("ECharts: invalid chart data", e)
      return
    }

    this.chart = echarts.init(this.el, "dark", { renderer: "canvas" })
    this.setOption()

    this._onResize = () => this.chart && this.chart.resize()
    window.addEventListener("resize", this._onResize)

    this.handleEvent("update_chart", ({ data }) => {
      this.data = data
      this.setOption()
    })
  },

  destroyed() {
    window.removeEventListener("resize", this._onResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },

  setOption() {
    const type = this.chartType
    const data = this.data
    const baseOption = {
      backgroundColor: "transparent",
      textStyle: { fontFamily: "Inter, system-ui, sans-serif" },
      title: this.chartTitle
        ? { text: this.chartTitle, left: "center", textStyle: { color: "#e2e8f0", fontSize: 16 } }
        : undefined,
      tooltip: { trigger: type === "pie" ? "item" : "axis", backgroundColor: "rgba(15,23,42,0.92)", borderColor: "#334155", textStyle: { color: "#e2e8f0" } },
      grid: { left: "8%", right: "6%", top: "18%", bottom: "12%", containLabel: true },
    }

    let option

    if (type === "bar" || type === "line") {
      const categories = data.categories || []
      const values = data.values || []
      const seriesName = data.seriesName || "数值"
      option = {
        ...baseOption,
        xAxis: {
          type: "category",
          data: categories,
          axisLine: { lineStyle: { color: "#475569" } },
          axisLabel: { color: "#94a3b8", rotate: categories.length > 6 ? 30 : 0 },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          splitLine: { lineStyle: { color: "#1e293b" } },
          axisLabel: { color: "#94a3b8" },
        },
        series: [{
          name: seriesName,
          type,
          data: values,
          itemStyle: {
            color: type === "bar"
              ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#38bdf8" },
                  { offset: 1, color: "#0ea5e9" },
                ])
              : "#a78bfa",
            borderRadius: type === "bar" ? [4, 4, 0, 0] : 0,
          },
          lineStyle: type === "line" ? { width: 3, color: "#a78bfa" } : undefined,
          areaStyle: type === "line"
            ? { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(167,139,250,0.3)" }, { offset: 1, color: "rgba(167,139,250,0.05)" }]) }
            : undefined,
          smooth: type === "line",
          animationDuration: 800,
        }],
      }
    } else if (type === "pie") {
      const pieData = data.data || data
      option = {
        ...baseOption,
        series: [{
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "55%"],
          itemStyle: {
            borderRadius: 6,
            borderColor: "#0f172a",
            borderWidth: 2,
          },
          label: { color: "#e2e8f0", formatter: "{b}\n{d}%" },
          labelLine: { lineStyle: { color: "#475569" } },
          data: pieData,
          animationDuration: 800,
        }],
        legend: {
          bottom: "4%",
          textStyle: { color: "#94a3b8" },
          itemStyle: { borderWidth: 0 },
        },
      }
    } else if (type === "doughnut") {
      const pieData = data.data || data
      option = {
        ...baseOption,
        series: [{
          type: "pie",
          radius: ["50%", "75%"],
          center: ["50%", "55%"],
          itemStyle: {
            borderRadius: 8,
            borderColor: "#0f172a",
            borderWidth: 2,
          },
          label: { color: "#e2e8f0", formatter: "{b}\n{d}%" },
          labelLine: { lineStyle: { color: "#475569" } },
          data: pieData,
          animationDuration: 800,
        }],
        legend: {
          bottom: "4%",
          textStyle: { color: "#94a3b8" },
          itemStyle: { borderWidth: 0 },
        },
      }
    }

    if (option) {
      this.chart.setOption(option, true)
    }
  },
}

export { EChartsHook }
