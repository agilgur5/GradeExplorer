import React, {PropTypes} from 'react'
import d3 from 'd3'
import Axis from './D3Controlled/axis.es6'

class TrendPlot extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    inputs: PropTypes.arrayOf(PropTypes.number),
    prediction: PropTypes.number,
    interp: PropTypes.oneOfType([PropTypes.string, PropTypes.function]),
    names: PropTypes.arrayOf(PropTypes.string),
  }
  render () {
    const {width, height, margin, data, inputs,
      prediction, interp, names} = this.props

    const xTrans = d3.scale.linear()
      .domain([1, data[0].length])
      .range([0, width])

    const yTrans = d3.scale.linear()
      .domain([0, 100])
      .range([height, 0])

    const lineFunc = d3.svg.line()
      .x((d) => xTrans(d[1] + 1)) // index + 1 = assignment #
      .y((d) => yTrans(d[0]))
      .interpolate(interp)

    // change from arrays of students to arrays of grades on assignments
    let grades = data.reduce((acc, student) => {
      student.map((grade, index) => {
        acc[index].push(grade)
      })
      return acc
    }, data[0].map(() => []))
    // generate histograms using 10 uniformly-spaced bins.
    let hists = grades.map((assign) => {
      return d3.layout.histogram()
        .bins(10)
        (assign)
    })
    // put all bins of the same index into the same array
    let areas = hists.reduce((acc, hist) => {
      hist.map((bin, index) => {
        acc[index].push(bin)
      })
      return acc
    }, Array.apply(null, new Array(10)).map(() => [])) // array of 10 arrays
      // give each bin in the new array an index (for d3 area function)
      .map((bins) => bins.map((bin, index) => [bin, index]))
      // add the sum of the sizes of each bin as a tuple to the new array
      .map((area) => {
        return [area, area.reduce((acc, bin) => {return acc + bin[0].y}, 0)]
      })

    // calculate the maximum sum of bins
    let max = areas.reduce((acc, area) => {
      if (area[1] > acc) return area[1]
      else return acc
    }, 0)

    let areaFunc = d3.svg.area()
      .x((d) => xTrans(d[1] + 1)) // index + 1 = assignment #
      .y1((d) => yTrans(d[0].x + d[0].dx))
      .y0((d) => yTrans(d[0].x - d[0].dx < 0 ? 0 : d[0].x - d[0].dx))
      .interpolate(interp)


    // fill in your input with the prediction
    let transInputs = data[0].map((_, index) => {
      if (index > inputs.length - 1) {
        return prediction
      } else {
        return inputs[index]
      }
    })
    // figure out where you stand against this distribution
    let transInputAreas = transInputs.map((input, index) => {
      let inputBin = hists[index].reduce((acc, bin) => {
        if (bin.x + bin.dx >= input && bin.x - bin.dx <= input) {
          return bin
        } else {
          return acc
        }
      }, {x: input, dx: 10}) // default if better or worse than everyone
      return [inputBin, index]
    })
    // make your area 1/3 smaller than distribution area
    let inputAreaFunc = d3.svg.area()
      .x((d) => xTrans(d[1] + 1)) // index + 1 = assignment #
      .y1((d) => yTrans(d[0].x + d[0].dx / 3))
      .y0((d) => yTrans(d[0].x - d[0].dx / 3 < 0 ? 0 : d[0].x - d[0].dx / 3))
      .interpolate(interp)


    return <svg viewBox={'0 0 ' + width*2 + ' ' + height*2}>
      <g transform={'translate(' + margin.left + ',' + margin.top + ')'}>
        {/* plot axes */}
        <Axis className='axis' transform={'translate(0,' + height + ')'}
          scale={xTrans} orient='bottom' ticks={data[0].length} names={names}
          outerTickSize={0} innerTickSize={0} tickPadding={5}
          label='Assignment' width={width} height={height} margin={margin} />
        <Axis className='axis' scale={yTrans} orient='left'
          outerTickSize={0} innerTickSize={0} tickPadding={5} label='Grades' 
          width={width} height={height} margin={margin} />
        {/* the distribution, with opacities based on # of people */}
        {areas.map((area, index) =>
          <path key={index} className='fill' d={areaFunc(area[0])}
            fillOpacity={area[1] / max} />
        )}
        {/* your scores + predicted overlayed on top of the distribution */}
        <path className='highlight opaque' d={inputAreaFunc(transInputAreas)}
          fillOpacity='0.4' />
      </g>
      {/* legend */}
      <g transform={'translate(' + (width + margin.left + 20) +
        ',' + (margin.top + height/2 - 25) + ')'}>
        {/* you */}
        <rect className='highlight opaque'
          x={0} y={-20} width={20} height={20} />
        <text x={25} y={-5}>You</text>
        {/* distribution / other shades */}
        {areas.map((area, index) =>
          <rect key={index} className='fill' fillOpacity={area[1] / max}
            x={0} y={40 - index*2} width={20} height={2} />
        )}
        <text x={25} y={35}>Density of Past Scores</text>
      </g>
    </svg>
  }
}

export default TrendPlot
