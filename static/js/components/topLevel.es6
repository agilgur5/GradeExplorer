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
    names: PropTypes.arrayOf(PropTypes.string),
    totalPoints: PropTypes.arrayOf(PropTypes.string),
  }
  state = {
    values: List(this.props.weights.map(() => '')), // initial array
    prediction: 82, // default prediction
    confidences: {'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': .10,
      'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'D-': 0, 'F': 0},
    showConfidences: false,
  }
  handleInputChange (ev, index) {
    let newVals = this.state.values.set(index, ev.target.value)
    // create arguments to pass to get request
    let urlArgs = newVals.filter((elem) => elem != '')
      .reduce((acc, elem, index) => acc + '&scores=' + elem, '')
    urlArgs = urlArgs.slice(1, urlArgs.length) // remove first '&'
    fetch('/getPrediction?' + urlArgs).then((response) => {
      if (response.status >= 400) {
        throw new Error('Bad response from server')
      }
      return response.json()
    }).then((data) => {
      this.setState({confidences: data})
      let letterToGrade = {
        'A+': 97, 'A': 95, 'A-': 92, 'B+': 87, 'B': 85, 'B-': 82,
        'C+': 77, 'C': 75, 'C-': 72, 'D+': 67, 'D': 65, 'D-': 62, 'F': 55
      }
      // starting values
      let max = data['A+']
      let pred = 97
      // iterate over all keys to get max confidence letter grade
      Object.keys(data).forEach((key) => {
        if (data[key] > max) {
          max = data[key]
          pred = letterToGrade[key]
        }
      })
      this.setState({prediction: pred})
    })
    this.setState({values: newVals})
  }
  render () {
    let {margin, data, weights, names, totalPoints} = this.props
    let width = 960
    let height = 500
    let {values, prediction, confidences, showConfidences} = this.state

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
              <span className='inputLabels'>
                {/* any part of the name greater than 5 chars gets split */}
                {name.split(' ').map((split) =>
                  split.match(/.{1,5}/g).join('- ')).join(' ')}
              </span>
              <input type='text' value={values.get(index)}
                disabled={index > numInputs} className='inputBoxes'
                onChange={(ev) => this.handleInputChange(ev, index)} />
                <span className='inputLabels'>{'/ ' + totalPoints[index]}</span>
            </div>
          )}
        </div>
      </div>
      <div id='belowViz'>
        <div className='leftRightViz'>
          <div className='leftRightTitle'>Your Current Status</div>
          <div className='leftRightSub'>
            Here's your current weighted average
          </div>
          <Arcs width={width/2} height={height/2} margin={margin}
            weights={weights} inputs={inputs} weightedGrade={gradeInput}
            names={names} totalPoints={totalPoints} />
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
          <Arcs width={width/2} height={height/2} margin={margin}
            weights={[100]} inputs={[prediction]} weightedGrade={prediction}
            names={['Predicted Final Grade']} totalPoints={['100']} />
          <div className='leftRightSub'>
            Here's how we predict you would perform relative to past data at
            the end of the semester
          </div>
          <HighlightedGraph width={width/2} height={height/2} margin={margin}
            grades={finalGrades} interp='basis' input={prediction} />
        </div>
        <div className='confidenceTable'>
          <div className='confidenceTitle'>Here's how confident we are:</div>
          {Object.keys(confidences).map((key) =>
            <div key={key} className='confidenceScores'>
              {key + ': ' + Math.round(confidences[key] * 100) + '%'}
            </div>
          )}
        </div>
        <div id='trendsContainer'>
          <div id='trendsTitle'>
            Here's the distribution of how students performed on the assignments overall
          </div>
          <TrendPlot width={width/2} height={height/2} margin={margin}
            data={data} inputs={inputs.slice(0, numInputs)}
            prediction={prediction} interp='basis' names={names} />
        </div>
      </div>
    </div>
  }
}

export default TopLevelApp
