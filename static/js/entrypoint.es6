import ReactDOM from 'react-dom'
import React from 'react'
import normalGrades from './normalized_data.json'
import './viz.css'
import TopLevelApp from './components/topLevel.es6'

// define viewport
const margin = {top: 20, right: 20, bottom: 30, left: 50}
const width = 960 - margin.left - margin.right
const height = 500 - margin.top - margin.bottom

ReactDOM.render(<TopLevelApp width={width} height={height} margin={margin}
  data={normalGrades.data} weights={normalGrades.weights} />,
  document.getElementById('d3_body'))
