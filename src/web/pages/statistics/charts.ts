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
  let eatChart: echarts.ECharts
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

    const lineStyle = {
      color: '#ddd',
    }

    const options: echarts.EChartOption = {
      textStyle: {
        // fontSize: 10,
      },
      animation: false,
      tooltip: {
        show: true,
      },
      legend: {
        show: true,
        // icon: 'none',
        // left: '-30px',
        // top: 0,
        textStyle: {
          // color: colors.eat,
          // fontWeight: 'bold',
        },
        itemGap: 15,
      },
      xAxis: [
        {
          type: 'time',
          min: dayStart,
          max: yesterday,
          axisLine: {
            lineStyle,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          boundaryGap: ['20%', '20%'],
          // @ts-ignore
          maxInterval: dateRange <= 7 ? 3600 * 24 * 1000 : undefined,
          minInterval: 3600 * 24 * 1000,
          axisLabel: {
            show: false,
            formatter(val) {
              return getDateString(new Date(val), true)
            },
            color: '#888',
            verticalAlign: 'top',
            fontSize: 10,
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

        {
          gridIndex: 1,
          type: 'time',
          min: dayStart,
          max: yesterday,
          axisLine: {
            lineStyle,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          boundaryGap: ['20%', '20%'],
          // @ts-ignore
          maxInterval: dateRange <= 7 ? 3600 * 24 * 1000 : undefined,
          minInterval: 3600 * 24 * 1000,
          axisLabel: {
            formatter(val) {
              return getDateString(new Date(val), true)
            },
            color: '#888',
            verticalAlign: 'top',
            fontSize: 10,
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
          position: 'right',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            // show: false,
            color: '#888',
            inside: true,
            showMinLabel: false,
            align: 'right',
            verticalAlign: 'top',
            fontSize: 10,
            formatter(p) {
              return p + 'ml'
            },
          },
          splitLine: {
            show: false,
            lineStyle,
          },
          splitNumber: 2,
        },
        {
          gridIndex: 1,
          name: '',
          type: 'value',
          position: 'right',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            // show: false,
            color: '#888',
            inside: true,
            showMinLabel: false,
            align: 'right',
            verticalAlign: 'top',
            fontSize: 10,
            formatter(p) {
              return p + 'h'
            },
          },
          splitLine: {
            show: false,
            lineStyle,
          },
          splitNumber: 2,
        },
      ],

      grid: [
        {
          left: '40px',
          right: '40px',
          top: '30px',
          bottom: '50%',
          // containLabel: true,
        },
        {
          left: '40px',
          right: '40px',
          top: '50%',
          bottom: '30px',
          // containLabel: true,
        },
      ],
      series: [
        {
          name: 'eat (ml)',
          type: 'line',
          yAxisIndex: 0,
          data: eatData,
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
          areaStyle: {
            // @ts-ignore
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colors.eat + 'aa',
              },
              {
                offset: 1,
                color: colors.eat + '00',
              },
            ]),
          },
        },
        {
          xAxisIndex: 1,
          yAxisIndex: 1,
          name: 'sleep (hour)',
          type: 'line',
          data: sleepData as any,
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
          areaStyle: {
            // @ts-ignore
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colors.sleep + 'aa',
              },
              {
                offset: 1,
                color: colors.sleep + '00',
              },
            ]),
          },
        },
      ],
    }
    const eatOptions: echarts.EChartOption = {
      ...options,
      legend: {
        show: true,
        icon: 'none',
        left: '-30px',
        top: 0,
        textStyle: {
          color: colors.eat,
          fontWeight: 'bold',
        },
      },
      series: [
        {
          name: 'eat (ml)',
          type: 'line',
          yAxisIndex: 0,
          data: eatData,
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
          areaStyle: {
            // @ts-ignore
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colors.eat + 'aa',
              },
              {
                offset: 1,
                color: colors.eat + '00',
              },
            ]),
          },
        },
        {
          xAxisIndex: 1,
          yAxisIndex: 1,
          name: 'sleep (hour)',
          type: 'line',
          data: sleepData as any,
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
          areaStyle: {
            // @ts-ignore
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colors.sleep + 'aa',
              },
              {
                offset: 1,
                color: colors.sleep + '00',
              },
            ]),
          },
        },
      ],
    }
    console.log('eatOptions ', eatOptions)
    const sleepOptions: echarts.EChartOption = {
      ...options,
      legend: {
        show: true,
        icon: 'none',
        left: '-30px',
        top: 0,
        textStyle: {
          color: colors.sleep,
          fontWeight: 'bold',
        },
      },
      series: [
        {
          name: 'sleep (hour)',
          type: 'line',
          data: sleepData as any,
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
          areaStyle: {
            // @ts-ignore
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colors.sleep + 'aa',
              },
              {
                offset: 1,
                color: colors.sleep + '00',
              },
            ]),
          },
        },
      ],
    }
    console.log('sleepOptions ', sleepOptions)
    eatChart.setOption(options)
  }
  return {
    oncreate(vnode) {
      eatChart = echarts.init(
        vnode.dom.querySelector('.chart-container.eat-chart') as HTMLDivElement,
      )
      redraw(vnode.attrs)
    },
    onbeforeupdate(vnode, old) {
      redraw(vnode.attrs)
      return false
    },
    view({ attrs }) {
      return m('.statistics-chart', [m('.chart-container.eat-chart')])
    },
  }
}
