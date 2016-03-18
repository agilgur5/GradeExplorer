import React from 'react'
import d3 from 'd3'
import Axis from './reactifyD3/axis.es6'

class TrendPlot extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    data: React.PropTypes.array
  }
  render () {
    const {width, height, margin, data} = this.props

    const xTrans = d3.scale.linear()
      .domain([1, data[0].length])
      .range([0, width])

    const yTrans = d3.scale.linear()
      .domain([0, 100])
      .range([height, 0])

    const lineFunc = d3.svg.line()
      .y((d) => yTrans(d))

    return <svg className='trendsContainer'
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}>
      <g transform={'translate(' + margin.left + ',' + margin.top + ')'}>
        {/* plot axes */}
        <Axis className='axis' transform={'translate(0,' + height + ')'}
          scale={xTrans} orient='bottom' ticks={data[0].length}
          outerTickSize={0} innerTickSize={0} tickPadding={5} />
        <Axis className='axis' scale={yTrans} orient='left'
          outerTickSize={0} innerTickSize={0} tickPadding={5} />
        {/* the lines */}
        {data.map((student, index) =>
          <path key={index} className='stroke' d={lineFunc.x((d) => xTrans(student.indexOf(d)+1))(student)} />
        )}
      </g>
    </svg>
  }
}

export default TrendPlot
