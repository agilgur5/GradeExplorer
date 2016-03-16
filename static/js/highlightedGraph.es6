import React from 'react'
import d3 from 'd3'
import Axis from './axis.es6'

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
    
    // if lower than or at lowest bucket
    if (input < data[0].x + data[0].dx) {
      currBucketInd = 0
    // if higher than or at highest bucket
    } else if (input > data[maxInd].x - data[maxInd].dx) {
      currBucketInd = maxInd
    // somewhere in the middle
    } else {
      let currInd = 1
      while (input > data[currInd].x + data[currInd].dx) { currInd++ }
      currBucketInd = currInd
    }

    // first x in this bucket (left limit)
    const curveLeftX = xTrans(data[currBucketInd - 1].x)
    // width of bucket (right limit)
    const bucketWidth = xTrans(data[currBucketInd - 1].dx)
    const curveRightX = xTrans(data[currBucketInd - 1].x + data[currBucketInd -1].dx)


    return <svg width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}>
      <defs>
        {/* define clipping path, impossible to render area
          as designed without */}
        <clipPath id='clip'>
          <rect x={curveLeftX} y={0} width={curveRightX - curveLeftX} height={height} />
        </clipPath>
      </defs>
      <g transform={'translate(' + margin.left + ',' + margin.top + ')'} />
      {/* plot axes */}
      <Axis className='x axis' transform={'translate(0,' + height + ')'}
        scale={xTrans} orient='bottom' />
      <Axis className='y axis' scale={yTrans} orient='left' />
      {/* the curve */}
      <path className='line' d={lineFunc(data)} />
      {/* the highlighted area beneath the curve */}
      <path className='area' d={areaFunc(data)} clipPath='url(#clip)' />
    </svg>
  }
}

export default HighlightedGraph
