import ReactDOM from 'react-dom'
import React from 'react'
import normalGrades from './s14_all.csv.json'
import './viz.css'
import TopLevelApp from './components/topLevel.es6'

// define viewport
const margin = {top: 20, right: 20, bottom: 30, left: 50}
let names = normalGrades.cols.map((elem) => elem.slice(0, 10))

ReactDOM.render(<TopLevelApp margin={margin}
  data={normalGrades.data} weights={normalGrades.weights}
  names={names} />,
  document.getElementById('react_body'))
