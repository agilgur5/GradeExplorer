import React from 'react'
import HighlightedGraph from './highlightedGraph.es6'
import TrendPlot from './trendPlot.es6'
import {List} from 'immutable'

class TopLevelApp extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    data: React.PropTypes.array
  }
  state = {
    values: List(this.props.data[0].map(() => '')) // initial array
  }
  handleInputChange (ev, index) {
    this.setState({values: this.state.values.set(index, ev.target.value)})
  }
  render () {
    let {width, height, margin, data} = this.props

    // reduce to an array of final grades
    let finalGrades = data.map((elem) => {
      return elem.reduce((acc, grade) => { return acc + grade / elem.length }, 0)
    })

    // filter out empty string from further calculations
    let filteredValues = this.state.values.filter((elem) => elem != '')
    let numInputs = filteredValues.size
    console.log(numInputs)
    
    // reduce to an array of averages up to this point
    let gradesUpToDate = data.map((elem) => {
      return elem.slice(0, numInputs)
        .reduce((acc, grade) => { return acc + grade / numInputs }, 0)
    })
    
    // get student's current grade average
    let gradeInput = filteredValues.reduce((acc, elem) => {
      console.log(elem)
      return acc+parseInt(elem)
    }, 0) / numInputs
    console.log(gradeInput)

    return <div>
      <div>Please enter some grades:</div>
      {data[0].map((_, index) =>
        <input key={index} type='text' value={this.state.values.get(index)}
          onChange={(ev) => this.handleInputChange(ev, index)} />
      )}
      <div>Grades Up To Today</div>
      {numInputs != 0 ?
        <HighlightedGraph width={width/2} height={height/2} margin={margin}
          grades={gradesUpToDate} interp='basis' input={gradeInput} />
      :
        <div>Enter some grades to see what your current status is!</div>
      }
      <div>Final Grades</div>
      <HighlightedGraph width={width/2} height={height/2} margin={margin}
        grades={finalGrades} interp='basis' input={83} />
      <div>General Trends in Grades per Assignment</div>
      <TrendPlot width={width} height={height} margin={margin} data={data} />
    </div>
  }
}

export default TopLevelApp
