import React from 'react'
import d3 from 'd3'
import Axis from './reactifyD3/axis.es6'
import shortid from 'shortid'

class HighlightedGraph extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    data: React.PropTypes.array,
    interpolation: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.function
    ])
  };

  render () {
    const {width, height, margin, finalGrades, interp, input} = this.props
    const minGrade = d3.min(finalGrades)
    const maxGrade = d3.max(finalGrades)
    const padding = 5

    const xTrans = d3.scale.linear()
      .domain([minGrade - padding, maxGrade + padding])
      .range([0, width])

    // generate a histogram using uniformly-spaced bins.
    const data = d3.layout.histogram()
      .bins(xTrans.ticks((maxGrade - minGrade)))
      (finalGrades)
    console.log(data)

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
    if (input < data[0].x + data[0].dx) {
      currBucketInd = 0
      currPercent = data[0].y
      leftPercent = 0
      rightPercent = 100 - currPercent
    // if higher than or at highest bucket
    } else if (input > data[maxInd].x - data[maxInd].dx) {
      currBucketInd = maxInd
      currPercent = data[maxInd].y
      rightPercent = 0
      leftPercent = 100 - currPercent
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
    console.log(leftPercent)
    console.log(currPercent)
    console.log(rightPercent)

    // first x in this bucket (left limit)
    const curveLeftX = xTrans(data[currBucketInd - 1].x)
    // width of bucket (right limit)
    const bucketWidth = xTrans(data[currBucketInd - 1].dx)
    const curveRightX = xTrans(data[currBucketInd - 1].x + data[currBucketInd -1].dx)

    const clipId = shortid.generate()


    return <div>
        <svg width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}>
        <defs>
          {/* define clipping path, impossible to render area
            as designed without */}
          <clipPath id={clipId}>
            <rect x={curveLeftX} y={0} width={curveRightX - curveLeftX} height={height} />
          </clipPath>
        </defs>
        <g transform={'translate(' + margin.left + ',' + margin.top + ')'}>
          {/* plot axes */}
          <Axis className='x axis' transform={'translate(0,' + height + ')'}
            scale={xTrans} orient='bottom' outerTickSize={0} innerTickSize={0}
            tickPadding={5} />
          <Axis className='y axis' scale={yTrans} orient='left'
            outerTickSize={0} innerTickSize={0} tickPadding={5} />
          {/* the curve */}
          <path className='line' d={lineFunc(data)} />
          {/* the highlighted area beneath the curve, clipped */}
          <path className='area' d={areaFunc(data)}
           clipPath={'url(#' + clipId + ')'} />
        </g>
      </svg>
      <svg width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}>
        {/* 3 circles */}
        <circle className='area' cy={height/2} cx={leftPercent} r={leftPercent} />
        <circle className='area' cy={height/2} cx={leftPercent*2+currPercent} r={currPercent} />
        <circle className='area' cy={height/2} cx={leftPercent*2+currPercent*2+rightPercent} r={rightPercent} />
      </svg>
    </div>
  }
}

export default HighlightedGraph
