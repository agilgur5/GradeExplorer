import normalGrades from './normalized_data.json'
import './viz.css'
import HighlightedGraph from './highlightedGraph.es6'
import ReactDOM from 'react-dom'
import React from 'react'

console.log(normalGrades)
// go from array of arrays of each student's grades to
// array of arrays of each assignment's grades
let assignGrades = normalGrades.data.reduce((acc, elem) => {
  return elem.map((elem, index) => acc[index].concat(elem))
}, normalGrades.data[0].map(() => [])) // empty array slots for each elem
console.log(assignGrades)

// reduce to an array of final grades
let finalGrades = normalGrades.data.map((elem) => {
  return elem.reduce((acc, grade) => { return acc + grade / elem.length }, 0)
})
console.log(finalGrades)

// line chart based on http://bl.ocks.org/mbostock/3883245
const margin = {top: 20, right: 20, bottom: 30, left: 50}
const width = 960 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom


let input = 75

ReactDOM.render(<HighlightedGraph width={width} height={height} margin={margin}
    finalGrades={finalGrades} interp='basis' input={input} />, document.body)

// need to know how many are before and after for circles and current

