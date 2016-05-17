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
    
    const totalWidth = width + margin.left + margin.right
    const totalHeight = height + margin.top + margin.bottom
    const heightDiv2 = height / 2
    const heightToBottom = height + margin.bottom
    // a percentage twice as big should correspond to an area twice as big
    // (not 4x as big if we were to just use radius without taking the sqrt)
    const leftRadius = heightDiv2 * Math.sqrt(0.01 * leftPercent)
    const currRadius = heightDiv2 * Math.sqrt(0.01 * currPercent)
    const rightRadius = heightDiv2 * Math.sqrt(0.01 * rightPercent)

    return <div className='circlesContainer'>
      <div className='leftRightSub'>
        Approximately <span className='underline fillText'>{leftPercent + '%'}</span> of
        students are worse off, <span className='underline highlight'>{currPercent + '%'}</span> are
        the same, and <span className='underline fillText'>{rightPercent + '%'}</span> are better.
      </div>
      <svg className='circlesSVG'
        viewBox={'0 0 ' + totalWidth + ' ' + totalHeight}>
        {/* 3 circles + text */}
        <g transform={'translate(' +
          (leftRadius + currRadius + rightRadius)/2 + ', 0)'}>
          <circle className='fill'
            cy={heightDiv2} cx={leftRadius} r={leftRadius} />
          <text className='fill' y={heightToBottom} x={leftRadius}
            textAnchor='middle'>
            {leftPercent + '%'}
          </text>
          <text className='fill' y={heightToBottom + 15} x={leftRadius}
            textAnchor='middle'>
            Worse
          </text>
          <circle className='highlight'
            cy={heightDiv2} cx={leftRadius * 2 + currRadius} r={currRadius} />
          <text className='highlight' y={heightToBottom}
            x={leftRadius * 2 + currRadius} textAnchor='middle'>
            {currPercent + '%'}
          </text>
          <text className='highlight' y={heightToBottom + 15}
            x={leftRadius * 2 + currRadius} textAnchor='middle'>
            Same
          </text>
          <circle className='fill' cy={heightDiv2}
            cx={(leftRadius + currRadius) * 2 + rightRadius} r={rightRadius} />
          <text className='fill' y={heightToBottom}
            x={(leftRadius + currRadius) * 2 + rightRadius} textAnchor='middle'>
            {rightPercent + '%'}
          </text>
          <text className='fill' y={heightToBottom + 15}
            x={(leftRadius + currRadius) * 2 + rightRadius} textAnchor='middle'>
            Better
          </text>
        </g>
      </svg>
    </div>
  }
}

export default GradeCircles
