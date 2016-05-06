import ReactDOM from 'react-dom'
import React from 'react'
import normalGrades from './s14_all.csv.json'
import labels from './labels.json'
import './viz.css'
import TopLevelApp from './components/topLevel.es6'

// define viewport
let props = {
  margin: {top: 20, right: 20, bottom: 30, left: 50},
  data: normalGrades.data,
  weights: labels.weights,
  names: labels.cols.map((elem) => elem[0]),
  totalPoints: labels.cols.map((elem) => elem[1]),
}


ReactDOM.render(<TopLevelApp {...props} />,
  document.getElementById('react_body'))
