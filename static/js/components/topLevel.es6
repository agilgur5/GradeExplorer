import {polyfill} from 'es6-promise'
polyfill()
import 'isomorphic-fetch'
import React, {PropTypes} from 'react'
import HighlightedGraph from './highlightedGraph.es6'
import Arcs from './arcs.es6'
import TrendPlot from './trendPlot.es6'
import {List} from 'immutable'

class TopLevelApp extends React.Component {
  static propTypes = {
    margin: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    weights: PropTypes.arrayOf(PropTypes.number),
    names: PropTypes.arrayOf(PropTypes.string)
  }
  state = {
    values: List(this.props.data[0].map(() => '')), // initial array
    prediction: 83 // default prediction
  }
  handleInputChange (ev, index) {
    let newVals = this.state.values.set(index, ev.target.value)
    let urlArgs = newVals.filter((elem) => elem != '')
      .reduce((acc, elem, index) => acc + '&scores=' + elem, '')
    urlArgs = urlArgs.slice(1, urlArgs.length) // remove first '&'
    console.log(urlArgs)
    fetch('/getPrediction?' + urlArgs)
      .then((response) => {
        if (response.status >= 400) {
          throw new Error("Bad response from server");
        }
        return response.json()
      })
      .then((data) => {
        console.log(data)
        let max = data['A+']
        let pred = 97
        if (data['A'] > max) {
          max = data['A']
          pred = 95
        }
        if (data['A-'] > max) {
          max = data['A-']
          pred = 92
        }
        if (data['B+'] > max) {
          max = data['B+']
          pred = 87
        }
        if (data['B'] > max) {
          max = data['B']
          pred = 85
        }
        if (data['B-'] > max) {
          max = data['B-']
          pred = 82
        }
        if (data['C+'] > max) {
          max = data['C+']
          pred = 77
        }
        if (data['C'] > max) {
          max = data['C']
          pred = 75
        }
        if (data['C-'] > max) {
          max = data['C-']
          pred = 72
        }
        if (data['D+'] > max) {
          max = data['D+']
          pred = 67
        }
        if (data['D'] > max) {
          max = data['D']
          pred = 65
        }
        if (data['D-'] > max) {
          max = data['D-']
          pred = 62
        }
        if (data['F'] > max) {
          max = data['F']
          pred = 55
        }
        this.setState({prediction: pred})
      })
    this.setState({values: newVals})
  }
  render () {
    let {margin, data, weights, names} = this.props
    let width = 960
    let height = 500
    let {values, prediction} = this.state

    // reduce to an array of final grades
    let finalGrades = data.map((elem,) => {
      return elem.reduce((acc, grade, index) => { 
        return acc + grade * .01 * weights[index]
      }, 0)
    })

    // filter out empty string from further calculations
    let filteredValues = values.filter((elem) => elem != '')
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

    let inputs = values.map((elem) =>
      elem == '' ? 0 : parseInt(elem)
    ).toArray()
    if(numInputs == 0) {inputs[0] = 80}


    return <div>
      <div id='topInput' className='fill'>
        <div id='topInputText'>Input Your Grades</div>
        <div id='inputContainer'>
          {names.map((name, index) =>
            <div key={index} className='inputContainers'>
              <span className='inputLabels'>{name}</span>
              <input type='text' value={values.get(index)}
                disabled={index > numInputs} className='inputBoxes'
                onChange={(ev) => this.handleInputChange(ev, index)} />
            </div>
          )}
        </div>
      </div>
      <div id='belowViz'>
        <div className='leftRightViz'>
          <div className='leftRightTitle'>Your Current Status</div>
          <div className='leftRightSub'>
            Here's how you're performing right now
          </div>
          <Arcs width={width/2} height={height/2} margin={margin} weights={weights}
            inputs={inputs} weightedGrade={gradeInput} />
          <div className='leftRightSub'>
            Here's your performance relative to the past data up to <span
              className='underline'>{names[numInputs]}</span>
          </div>
          <HighlightedGraph width={width/2} height={height/2} margin={margin}
            grades={gradesUpToDate} interp='basis' input={gradeInput} />
        </div>
        <div className='leftRightViz'>
          <div className='leftRightTitle'>Your Future Status</div>
          <div className='leftRightSub'>
            Here's the final grade students in your position typically get
          </div>
          <Arcs width={width/2} height={height/2} margin={margin} weights={weights}
            inputs={inputs.map(() => prediction)} weightedGrade={prediction} />
          <div className='leftRightSub'>
            Here's how we predict you would perform relative to past data at
            the end of the semester
          </div>
          <HighlightedGraph width={width/2} height={height/2} margin={margin}
            grades={finalGrades} interp='basis' input={prediction} />
        </div>
        <div id='trendsContainer'>
          <div id='trendsTitle'>
            Here's how students performed on the assignments overall
          </div>
          <TrendPlot width={width/2} height={height/2} margin={margin}
            data={data} />
        </div>
      </div>
    </div>
  }
}

export default TopLevelApp
