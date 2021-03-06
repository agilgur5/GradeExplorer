import React, {PropTypes} from 'react'
import d3 from 'd3'

class Arcs extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.object,
    weights: PropTypes.arrayOf(PropTypes.number),
    inputs: PropTypes.arrayOf(PropTypes.number),
    weightedGrade: PropTypes.number,
    names: PropTypes.arrayOf(PropTypes.string),
    totalPoints: PropTypes.arrayOf(PropTypes.string),
  }
  state = {
    selectedIndex: -1
  }
  selectArc = (_, index) => {
    this.setState({selectedIndex: index})
  }
  unselect = () => {
    this.setState({selectedIndex: -1})
  }
  render () {
    const {width, height, margin, weights, inputs, weightedGrade,
      names, totalPoints} = this.props
    const {selectedIndex} = this.state

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
    const midAngle = (weight) => weight.startAngle + (weight.endAngle - weight.startAngle)/2

    return <svg className='arcsContainer' viewBox={'0 0 ' +
        totalWidth + ' ' + totalHeight}>
      <g transform={'translate(' + totalWidth/2 + ',' + totalHeight/2 + ')'}>
        {weightArcs.map((weight, index) => {
          let middle = midAngle(weight)

          return <g key={index} className={selectedIndex != -1 &&
              selectedIndex != index ? 'lessOpaque' : ''}
            onMouseEnter={(ev) => this.selectArc(ev, index)}
            onMouseLeave={this.unselect}>
            {/* background arcs */}
            <path className='backgroundArc'
              d={arcTrans.startAngle(weight.startAngle)
                  .endAngle(weight.endAngle)()} />
            {/* weight arcs */}
            {inputs[index] == 0
            ? <path key={index} />
            : <path className='fill'
              d={arcTrans.startAngle(weight.startAngle)
                .endAngle(weight.endAngle -
                  ((weight.endAngle - weight.startAngle) * .01 *
                    (100 - inputs[index])))()} />}
            {/* line from arc to label */}
            <path className='arcLines' 
              d={'M' + arcTrans.centroid(weight).join(', ') +
                'L' + arcLabelTrans.centroid(weight).join(', ') +
                'L' + (middle < Math.PI ? width/4 : -width/4) +
                ', ' + arcLabelTrans.centroid(weight)[1]} />
            {/* arc labels */}
            <text className={'fill ' + (selectedIndex != -1 &&
              selectedIndex != index &&
              (index < selectedIndex + 3 && index > selectedIndex - 3)
              ? 'moreOpaque' : '')}
              fontSize={innerRadius / 4}
              textAnchor={middle < Math.PI ? 'start' : 'end'}
              x={middle < Math.PI ? width/4 + 4 : -width/4 - 4}
              y={arcLabelTrans.centroid(weight)[1] + 5}>
              {/* if string > 25 chars, split into array of tspans */}
              {(names[index] + ' - ' +
                inputs[index] + ' / ' + totalPoints[index] + ' - ' +
                weights[index] + '%')
                  .split('').map((char, ind) =>
                    ind != 0 && ind % 25 == 0 ?
                      char + '`' : char).join('')
                  .split('`').map((txt, ind) =>
                    <tspan key={ind}
                      x={middle < Math.PI ? width/4 + 4 : -width/4 - 4}
                      dy={(1.2 * ind) + 'em'}>{txt}</tspan>)}
            </text>
          </g>
        })}
        <text className='fill' y={innerRadius / 4} x={0} 
          fontSize={innerTextSize} textAnchor='middle'>
          {weightedGrade + '%'}
        </text>
      </g>
    </svg>
  }
}

export default Arcs
