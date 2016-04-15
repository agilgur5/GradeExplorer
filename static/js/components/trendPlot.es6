import React, {PropTypes} from 'react'
import d3 from 'd3'
import Axis from './D3Controlled/axis.es6'

class TrendPlot extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
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

    let assignIndex = 0

    return <svg viewBox={'0 0 ' + width*2 + ' ' + height*2}>
      <g transform={'translate(' + margin.left + ',' + margin.top + ')'}>
        {/* plot axes */}
        <Axis className='axis' transform={'translate(0,' + height + ')'}
          scale={xTrans} orient='bottom' ticks={data[0].length}
          outerTickSize={0} innerTickSize={0} tickPadding={5}
          label='Assignment #' width={width} height={height} margin={margin} />
        <Axis className='axis' scale={yTrans} orient='left'
          outerTickSize={0} innerTickSize={0} tickPadding={5} label='Grades' 
          width={width} height={height} margin={margin} />
        {/* the lines */}
        {data.map((student, index) =>
          <path key={index} className='stroke' 
            d={lineFunc.x((d) => {
              assignIndex++
              if (assignIndex >= data[0].length + 1) { assignIndex = 1 }
              return xTrans(assignIndex)
            })(student)} />
        )}
      </g>
    </svg>
  }
}

export default TrendPlot
