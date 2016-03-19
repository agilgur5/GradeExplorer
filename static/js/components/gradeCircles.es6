import React, {PropTypes} from 'react'

class GradeCircles extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.object,
    leftPercent: PropTypes.number,
    currPercent: PropTypes.number,
    rightPercent: PropTypes.number
  }
  render () {
    const {width, height, margin,
      leftPercent, currPercent, rightPercent} = this.props
    
    const heightDiv2 = height / 2
    const heightToBottom = height + margin.bottom
    const leftRadius = heightDiv2 * 0.01 * leftPercent
    const currRadius = heightDiv2 * 0.01 * currPercent
    const rightRadius = heightDiv2 * 0.01 * rightPercent

    return <svg className='circlesContainer' width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}>
      <g transform={'translate(' + margin.left + ',' + margin.top + ')'}>
        {/* 3 circles + text */}
        <circle className='fill'
          cy={heightDiv2} cx={leftRadius} r={leftRadius} />
        <text className='highlightText' y={heightToBottom} x={leftRadius}
          textAnchor='middle'>
          {leftPercent + '%'}
        </text>
        <circle className='fill'
          cy={heightDiv2} cx={leftRadius * 2 + currRadius} r={currRadius} />
        <text className='highlightText' y={heightToBottom}
          x={leftRadius * 2 + currRadius} textAnchor='middle'>
          {currPercent + '%'}
        </text>
        <circle className='fill' cy={heightDiv2}
          cx={(leftRadius + currRadius) * 2 + rightRadius} r={rightRadius} />
        <text className='highlightText' y={heightToBottom}
          x={(leftRadius + currRadius) * 2 + rightRadius} textAnchor='middle'>
          {rightPercent + '%'}
        </text>
      </g>
    </svg>
  }
}

export default GradeCircles
