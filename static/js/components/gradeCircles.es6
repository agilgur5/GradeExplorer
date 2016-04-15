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
    const leftRadius = heightDiv2 * 0.01 * leftPercent
    const currRadius = heightDiv2 * 0.01 * currPercent
    const rightRadius = heightDiv2 * 0.01 * rightPercent

    return <div className='circlesContainer'>
      <div className='leftRightSub'>
        Approximately <span className='underline'>{leftPercent + '%'}</span> of
        students are worse off, <span className='underline'>{currPercent + '%'}
        </span> are the same, and <span className='underline'>
        {rightPercent + '%'}</span> are better.
      </div>
      <svg className='circlesSVG'
        viewBox={'0 0 ' + totalWidth + ' ' + totalHeight}>
        <g transform={'translate(' +
          (width - leftRadius - currRadius - rightRadius)/2 + ',' +
          margin.top + ')'}>
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
    </div>
  }
}

export default GradeCircles
