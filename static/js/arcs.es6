import React from 'react'
import d3 from 'd3'

class Arcs extends React.Component {
  render () {
    const {width, height, margin, weights, inputs, weightedGrade} = this.props

    // const
    const padAngle = 0.04 // padding between arcs
    const innerRadius = 50 // empty radius inside arcs
    const fontSize = innerRadius - 10

    // transform radians to arcs with specified parameters
    const arcTrans = d3.svg.arc().innerRadius(innerRadius).outerRadius(100)
    // use pie transformation to create angles
    const weightArcs = (d3.layout.pie().sort(null)(weights)).map((weight) => {
      // add padding
      weight.startAngle += padAngle
      weight.endAngle -= padAngle
      return weight
    })

    return <svg className='arcsContainer' width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}>
      <g transform={'translate(' + (margin.left + 150) + ',' + (margin.top + 150) + ')'}>
        {/* background arcs */}
        {weightArcs.map((weight, index) =>
          <path key={index} className='backgroundArc'
            d={arcTrans.startAngle(weight.startAngle)
                .endAngle(weight.endAngle)()} />
        )}
        {/* weight arcs */}
        {weightArcs.map((weight, index) =>
          inputs[index] == 0 ?
            <path key={index} />
            : <path className='fill' key={index}
              d={arcTrans.startAngle(weight.startAngle)
                .endAngle(weight.endAngle - ((weight.endAngle - weight.startAngle) * .01 * (100 - inputs[index])))()} />
        )}
        <text className='fill' x={-fontSize / (3 - weightedGrade.toString().length)} 
          y={innerRadius/4} fontSize={fontSize}>
          {weightedGrade + '%'}
        </text>
      </g>
    </svg>
  }
}

export default Arcs
