// import 'echarts/lib/component/dataZoom'
// import 'echarts/lib/component/dataZoomInside'
// import 'echarts/lib/component/dataZoomSlider'
// import 'echarts/lib/component/visualMap'
// import 'echarts/lib/component/visualMapContinuous'
// import 'echarts/lib/component/visualMapPiecewise'
// import 'echartsrender/lib/vml/vml'
// import 'echartsrender/lib/svg/svg'
import 'echarts/lib/chart/line'
// import 'echarts/lib/component/dataset'
import 'echarts/lib/component/grid'
// import 'echarts/lib/component/timeline'
// import 'echarts/lib/component/markPoint'
// import 'echarts/lib/component/markLine'
// import 'echarts/lib/component/markArea'
// import 'echarts/lib/component/legendScroll'
import 'echarts/lib/component/legend'
// import 'echarts/lib/component/axisPointer'
// import 'echarts/lib/component/brush'
import 'echarts/lib/component/title'
// import 'echarts/lib/component/polar'
// import 'echarts/lib/component/geo'
// import 'echarts/lib/component/singleAxis'
// import 'echarts/lib/component/parallel'
// import 'echarts/lib/component/calendar'
// import 'echarts/lib/component/graphic'
// import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/tooltip'
// import { ECharts } from 'echarts'
import * as echarts from 'echarts/lib/echarts'
import m from 'mithril'
import { Records } from '../../../common/types'
import {
  DAY,
  getDateString,
  HOUR,
  parseDateString,
} from '../../../common/util/time'
import { colors } from '../../style/color'
import './charts.scss'
export { echarts }

export type StatisticChartAttrs = {
  records: Record<string, Records.Record[]>
  dateRange: number
}
export const StatisticChart: m.FactoryComponent<StatisticChartAttrs> = () => {
  let ec: echarts.ECharts
  const redraw = ({ records, dateRange }: StatisticChartAttrs) => {
    const today = getDateString(new Date())
    const yesterday = getDateString(new Date(new Date().getTime() - DAY))
    const dayStart = getDateString(
      new Date(new Date().getTime() - DAY * dateRange),
    )
    const data = Object.entries(records)
      .map(([day, records]) => {
        let eatCount = 0
        let eatAmount = 0
        let pissCount = 0
        let poopCount = 0
        let isSleeping = false
        let sleepStart: undefined | Date = undefined
        let sleepDurationMs = 0
        records.forEach((rec) => {
          switch (rec.type) {
            case 'eat': {
              eatCount++
              switch (rec.food) {
                case 'breast_milk':
                case 'formula_milk':
                  eatAmount += Number(rec.amount || 0)
                  break
              }
              break
            }
            case 'piss':
              pissCount++
              break
            case 'poop':
              poopCount++
              break
            case 'sleep':
              isSleeping = true
              sleepStart = rec.time
              break
            case 'wakeup':
              isSleeping = false
              if (sleepStart != null) {
                // not first wakeup
                sleepDurationMs += rec.time.getTime() - sleepStart.getTime()
              }
              break
          }
        })
        const minuteSlept = Math.floor((sleepDurationMs / HOUR) * 10) / 10

        return { day, eatAmount, minuteSlept }
      })
      .filter(({ day, eatAmount, minuteSlept }) => {
        if (parseDateString(day) < parseDateString(dayStart)) {
          return false
        }
        if (parseDateString(day) > parseDateString(yesterday)) {
          return false
        }
        return eatAmount || minuteSlept
      })
    const eatData = data.map(({ day, eatAmount }) => [day, eatAmount])
    const sleepData = data.map(({ day, minuteSlept }) => [day, minuteSlept])

    const options: echarts.EChartOption = {
      animation: false,
      tooltip: {
        show: true,
      },
      xAxis: [
        {
          type: 'time',
          min: dayStart,
          max: yesterday,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },

          // @ts-ignore
          maxInterval: dateRange <= 7 ? 3600 * 24 * 1000 : undefined,
          minInterval: 3600 * 24 * 1000,

          axisLabel: {
            formatter(val) {
              return getDateString(new Date(val), true)
            },
          },
          axisPointer: {
            show: true,
            type: 'line',
            snap: true,
            z: 0,
            label: {
              show: false,
            },
            lineStyle: {
              width: 2,
              color: '#ddd',
            },
          },
        },
      ],
      yAxis: [
        {
          name: '',
          type: 'value',
          scale: true,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
        {
          name: '',
          type: 'value',
          scale: true,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      legend: {
        show: true,
        icon: 'circle',
        right: 0,
        itemGap: 15,
      },
      grid: {
        left: '20px',
        right: '20px',
        top: '40px',
        bottom: '20px',
        containLabel: true,
      },
      series: [
        {
          name: 'eat (ml)',
          type: 'line',
          yAxisIndex: 0,
          data: eatData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 3,
          lineStyle: {
            color: colors.eat,
            width: 2,
          },
          itemStyle: {
            color: colors.eat,
          },
          label: {
            show: dateRange <= 7,
            textBorderColor: 'white',
            textBorderWidth: 1,
          },
        },
        {
          name: 'sleep (hour)',
          type: 'line',
          yAxisIndex: 1,
          data: sleepData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 3,
          lineStyle: {
            color: colors.sleep,
            width: 2,
          },
          itemStyle: {
            color: colors.sleep,
          },
          label: {
            show: dateRange <= 7,
            textBorderColor: 'white',
            textBorderWidth: 1,
          },
        },
      ],
    }
    ec.setOption(options)
  }
  return {
    oncreate(vnode) {
      ec = echarts.init(
        vnode.dom.querySelector('.chart-container') as HTMLDivElement,
      )
      redraw(vnode.attrs)
    },
    onbeforeupdate(vnode, old) {
      redraw(vnode.attrs)
      return false
    },
    view({ attrs }) {
      return m('.statistics-chart', [m('.chart-container')])
    },
  }
}
