import normalGrades from './normalized_data.json'
import './viz.css'
import TopLevelApp from './topLevel.es6'
import ReactDOM from 'react-dom'
import React from 'react'

console.log(normalGrades)
// go from array of arrays of each student's grades to
// array of arrays of each assignment's grades
let assignGrades = normalGrades.data.reduce((acc, elem) => {
  return elem.map((elem, index) => acc[index].concat(elem))
}, normalGrades.data[0].map(() => [])) // empty array slots for each elem
console.log(assignGrades)

// line chart based on http://bl.ocks.org/mbostock/3883245
const margin = {top: 20, right: 20, bottom: 30, left: 50}
const width = 960 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom


ReactDOM.render(<TopLevelApp width={width/2} height={height/2} margin={margin}
    data={normalGrades.data} />, document.getElementById('d3_body'))

// need to know how many are before and after for circles and current

