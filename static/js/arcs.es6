import React from 'react'
import d3 from 'd3'

class Arcs extends React.Component {
  render () {
    const {width, height, margin, weights, inputs} = this.props

    // create arcs
    const arcTrans = d3.svg.arc().innerRadius(50).outerRadius(100)
    const weightArcs = d3.layout.pie().sort(null)(weights)
    console.log(weightArcs)

    return <svg className='arcsContainer' width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}>
      <g transform={'translate(' + (margin.left + 150) + ',' + (margin.top + 150) + ')'}>
        {/* background arc */}
        <path className='backgroundArc' d={arcTrans.startAngle(0).endAngle(2*Math.PI)()}/>
        {/* weight arcs */}
        {weightArcs.map((weight, index) =>
          inputs[index] == 0 ?
            <path key={index} />
            : <path className='fill' key={index}
              d={arcTrans.startAngle(weight.startAngle)
                .endAngle(weight.endAngle - ((weight.endAngle - weight.startAngle) * .01 * (100 - inputs[index])))()} />
        )}
      </g>
    </svg>
  }
}

export default Arcs
