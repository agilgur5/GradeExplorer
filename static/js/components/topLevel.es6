import React, {PropTypes} from 'react'
import HighlightedGraph from './highlightedGraph.es6'
import Arcs from './arcs.es6'
import TrendPlot from './trendPlot.es6'
import {List} from 'immutable'

class TopLevelApp extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    margin: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    weights: PropTypes.arrayOf(PropTypes.number)
  }
  state = {
    values: List(this.props.data[0].map(() => '')) // initial array
  }
  handleInputChange (ev, index) {
    this.setState({values: this.state.values.set(index, ev.target.value)})
  }
  render () {
    let {width, height, margin, data, weights} = this.props

    // reduce to an array of final grades
    let finalGrades = data.map((elem,) => {
      return elem.reduce((acc, grade, index) => { 
        return acc + grade * .01 * weights[index]
      }, 0)
    })

    // filter out empty string from further calculations
    let filteredValues = this.state.values.filter((elem) => elem != '')
    let numInputs = filteredValues.size
    
    numInputs = numInputs == 0 ? 1 : numInputs
    filteredValues = numInputs == 0 ? List([80]) : filteredValues
    
    // the sum of weights up to this point
    let weightsUpToDate = weights.slice(0, numInputs).reduce((acc, elem) => {
      return acc + elem
    }, 0)
    
    // reduce to an array of weighted averages up to this point
    let gradesUpToDate = data.map((elem) => {
      return elem.slice(0, numInputs).reduce((acc, grade, index) => {
        return acc + grade * weights[index]
      }, 0) / weightsUpToDate
    }) 
    
    // get student's current weighted grade average
    let gradeInput = Math.round(filteredValues.reduce((acc, elem, index) => {
      return acc + parseInt(elem) * weights[index]
    }, 0) / weightsUpToDate)

    let inputs = this.state.values.map((elem) =>
      elem == '' ? 0 : parseInt(elem)
    ).toArray()
    if(numInputs == 0) {inputs[0] = 80}


    return <div>
      <div>Please enter some grades:</div>
      {data[0].map((_, index) =>
        <input key={index} type='text' value={this.state.values.get(index)}
          onChange={(ev) => this.handleInputChange(ev, index)} />
      )}
      <div>Grades Up To Today</div>
      <HighlightedGraph width={width/2} height={height/2} margin={margin}
        grades={gradesUpToDate} interp='basis' input={gradeInput} />
      <div>Final Grades</div>
      <HighlightedGraph width={width/2} height={height/2} margin={margin}
        grades={finalGrades} interp='basis' input={83} />
      <Arcs width={width/2} height={height/2} margin={margin} weights={weights}
        inputs={inputs} weightedGrade={gradeInput} />
      <Arcs width={width/2} height={height/2} margin={margin} weights={weights}
        inputs={inputs.map(() => 83)} weightedGrade={83} />
      <TrendPlot width={width/2} height={height/2} margin={margin}
        data={data} />
      <div>General Trends in Grades per Assignment</div>
    </div>
  }
}

export default TopLevelApp
