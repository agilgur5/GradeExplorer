import React, {PropTypes} from 'react'
import d3 from 'd3'
import shortid from 'shortid'
import Axis from './D3Controlled/axis.es6'
import GradeCircles from './gradeCircles.es6'

class HighlightedGraph extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    interp: PropTypes.oneOfType([PropTypes.string, PropTypes.function]),
    input: PropTypes.number,
    clipId: PropTypes.string
  }
  static defaultProps = {clipId: shortid.generate()}
  render () {
    const {width, height, margin, grades, interp, input, clipId} = this.props
    const minGrade = d3.min(grades)
    const maxGrade = d3.max(grades)
    const padding = 5

    const xTrans = d3.scale.linear()
      .domain([minGrade - padding, maxGrade + padding])
      .range([0, width])

    // generate a histogram using uniformly-spaced bins.
    const data = d3.layout.histogram()
      .bins(xTrans.ticks((maxGrade - minGrade)))
      (grades)

    const yTrans = d3.scale.linear()
      .domain([0, d3.max(data, (d) => d.y)])
      .range([height, 0])

    const lineFunc = d3.svg.line()
      .x((d) => xTrans(d.x))
      .y((d) => yTrans(d.y))
      .interpolate(interp) // cardinal, monotone, basis

    // first y point in initial curve (the bottom)
    const curveBottomY = yTrans(data[0].y)

    const areaFunc = d3.svg.area()
      .x((d) => xTrans(d.x))
      .y0(curveBottomY)
      .y1((d) => yTrans(d.y))
      .interpolate(interp)

    // to properly clip the area so as to only highlight the bucket
    // the input falls into, first find the bucket the index falls into
    const maxInd = data.length - 1
    let currBucketInd = 0
    // percents for circles
    let currPercent = 0
    let leftPercent = 0
    let rightPercent = 0
    
    // if lower than or at lowest bucket
    if (input <= data[0].x + data[0].dx) {
      currBucketInd = 0
      currPercent = data[0].y
      leftPercent = 1
      rightPercent = 99 - currPercent
    // if higher than or at highest bucket
    } else if (input >= data[maxInd].x) {
      currBucketInd = maxInd
      currPercent = data[maxInd].y
      rightPercent = 1
      leftPercent = 99 - currPercent
    // somewhere in the middle
    } else {
      currBucketInd = 1
      while (input > data[currBucketInd].x + data[currBucketInd].dx) { 
        leftPercent += data[currBucketInd].y
        currBucketInd++
      }
      currPercent = data[currBucketInd].y
      rightPercent = 100 - leftPercent - currPercent
    }

    // first x in this bucket (left limit)
    const curveLeftX = xTrans(data[currBucketInd].x - data[currBucketInd].dx)
    // width of bucket (right limit)
    const bucketWidth = xTrans(data[currBucketInd].dx)
    const curveRightX = xTrans(data[currBucketInd].x)

    const gradeCircleProps = 
      {width, height, margin, leftPercent, currPercent, rightPercent}

    return <div className='performanceContainer'>
        <svg viewBox={'0 0 ' + (width + margin.left + margin.right) +
          ' ' + (height + margin.top + margin.bottom)}>
        <defs>
          {/* define clipping path, impossible to render area
            as designed without */}
          <clipPath id={clipId}>
            <rect x={curveLeftX} y={0} width={curveRightX - curveLeftX}
              height={height} strokeDasharray='5,5' />
          </clipPath>
        </defs>
        <g transform={'translate(' + margin.left + ',' + margin.top + ')'}>
          {/* plot axes */}
          <Axis className='axis' transform={'translate(0,' + height + ')'}
            scale={xTrans} orient='bottom' outerTickSize={0} innerTickSize={0}
            tickPadding={5} label='Grades' width={width} height={height}
            margin={margin} />
          <Axis className='axis' scale={yTrans} orient='left'
            outerTickSize={0} innerTickSize={0} tickPadding={5} label='Students'
            width={width} height={height} margin={margin} />
          {/* the curve */}
          <path className='stroke' d={lineFunc(data)} />
          {/* the highlighted area beneath the curve, clipped */}
          <path className='fill' d={areaFunc(data)}
           clipPath={'url(#' + clipId + ')'} />
        </g>
      </svg>
      {/* draw the three circles underneath */}
      <GradeCircles {...gradeCircleProps} />
    </div>
  }
}

export default HighlightedGraph
