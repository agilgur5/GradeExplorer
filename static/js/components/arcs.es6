import React, {PropTypes} from 'react'
import d3 from 'd3'

class Arcs extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.object,
    weights: PropTypes.arrayOf(React.PropTypes.number),
    inputs: PropTypes.arrayOf(React.PropTypes.number),
    weightedGrade: PropTypes.number
  }
  render () {
    const {width, height, margin, weights, inputs, weightedGrade} = this.props

    // consts
    const totalWidth = width + margin.left + margin.right
    const totalHeight = height + margin.top + margin.bottom
    const padAngle = 0.04 // padding between arcs
    const innerRadius = 50 // where arc radius begins
    const outerRadius = innerRadius * 2 // where arc radius ends
    const innerTextSize = innerRadius - 10 // size of the text inside the arcs

    // transform radians to arcs with specified parameters
    const arcTrans =
      d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)
    const arcLabelTrans = d3.svg.arc().innerRadius(innerRadius).outerRadius(innerRadius * 3.5)
    // use pie transformation to create angles
    const weightArcs = (d3.layout.pie().sort(null)(weights)).map((weight) => {
      // add padding
      weight.startAngle += padAngle
      weight.endAngle -= padAngle
      return weight
    })

    return <svg className='arcsContainer' viewBox={'0 0 ' +
        totalWidth + ' ' + totalHeight}>
      <g transform={'translate(' + totalWidth/2 + ',' + totalHeight/2 + ')'}>
        {weightArcs.map((weight, index) =>
          <g key={index}>
            {/* background arcs */}
            <path className='backgroundArc'
              d={arcTrans.startAngle(weight.startAngle)
                  .endAngle(weight.endAngle)()} />
            {/* weight arcs */}
            {inputs[index] == 0 ? <path key={index} /> :
            <path className='fill'
              d={arcTrans.startAngle(weight.startAngle)
                .endAngle(weight.endAngle -
                  ((weight.endAngle - weight.startAngle) * .01 *
                    (100 - inputs[index])))()} />}
            {/* arc labels */}
            <text className='fill' fontSize={innerRadius / 4}
              textAnchor='middle' x={arcLabelTrans.centroid(weight)[0]}
              y={arcLabelTrans.centroid(weight)[1]}>
              {index}
            </text>
          </g>
        )}
        <text className='fill' y={innerRadius / 4} x={0} 
          fontSize={innerTextSize} textAnchor='middle'>
          {weightedGrade + '%'}
        </text>
      </g>
    </svg>
  }
}

export default Arcs
