import React from 'react'
import HighlightedGraph from './highlightedGraph.es6'
import Arcs from './arcs.es6'
import TrendPlot from './trendPlot.es6'
import {List} from 'immutable'

class TopLevelApp extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    data: React.PropTypes.array,
    weights: React.PropTypes.array
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
      return elem.reduce((acc, grade, index) => { return acc + grade * .01 * weights[index] }, 0)
    })

    // filter out empty string from further calculations
    let filteredValues = this.state.values.filter((elem) => elem != '')
    let numInputs = filteredValues.size
    console.log(numInputs)
    numInputs = numInputs == 0 ? 1 : numInputs
    filteredValues = numInputs == 0 ? List([80]) : filteredValues
    
    
    // reduce to an array of averages up to this point
    let gradesUpToDate = data.map((elem) => {
      return elem.slice(0, numInputs)
        .reduce((acc, grade, index) => { return acc + grade * .01 * weights[index] }, 0)
    })
    
    // get student's current grade average
    let gradeInput = filteredValues.reduce((acc, elem, index) => {
      return acc + parseInt(elem) * .01 * weights[index]
    }, 0)
    console.log(gradeInput)

    let inputs = this.state.values.map((elem) =>
      elem == '' ? 0 : parseInt(elem)
    ).toArray()
    console.log(inputs)
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
        inputs={inputs} />
      <Arcs width={width/2} height={height/2} margin={margin} weights={weights}
        inputs={inputs.map(() => 83)} />
      <TrendPlot width={width/2} height={height/2} margin={margin} data={data} />
      <div>General Trends in Grades per Assignment</div>
    </div>
  }
}

export default TopLevelApp
