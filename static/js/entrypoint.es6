import d3 from 'd3'
import normalGrades from './normalized_data.json'
import './viz.css'

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

const minGrade = d3.min(finalGrades)
const maxGrade = d3.max(finalGrades)
const padding = 5

var x = d3.scale.linear()
  .domain([minGrade - padding, maxGrade + padding])
  .range([0, width])

// Generate a histogram using twenty uniformly-spaced bins.
var data = d3.layout.histogram()
  .bins(x.ticks((maxGrade - minGrade)))
  (finalGrades)
console.log(data)

var y = d3.scale.linear()
  .domain([0, d3.max(data, (d) => d.y)])
  .range([height, 0])

var xAxis = d3.svg.axis()
  .scale(x)
  .orient('bottom')

let yAxis = d3.svg.axis()
  .scale(y)
  .orient('left')

var lineFunc = d3.svg.line()
  .x((d) => x(d.x))
  .y((d) => y(d.y))
  .interpolate('basis') // cardinal, monotone, basis

let input = 75

// for dashed highlight, we need to know the index of the bucket this
// input falls into so we can slice the data
let maxInd = data.length - 1
let currBucketInd = 0
let slicedData = []

// if lower than or at lowest bucket
if (input < data[0].x + data[0].dx) {
  currBucketInd = 0
  slicedData = data.slice(0, 2) // get first two buckets
// if higher than or at highest bucket
} else if (input > data[maxInd].x - data[maxInd].dx) {
  currBucketInd = maxInd
  slicedData = data.slice(maxInd - 1, maxInd + 1) // get last two buckets
// somewhere in the middle
} else {
  let currInd = 1
  while (input > data[currInd].x + data[currInd].dx) { currInd++ }
  currBucketInd = currInd
  slicedData = data.slice(currInd - 1, currInd + 1) // get middle three buckets
}
// need to know how many are before and after for circles and current


// first y point in initial curve (the bottom)
let curveBottomY = y(data[0].y)
// first x in new curve (left margin)
let curveLeftX = x(data[currBucketInd - 1].x)
// last x in new curve (right margin)
let curveRightX = x(data[currBucketInd - 1].x + data[currBucketInd -1].dx)

var area = d3.svg.area()
  .x((d) => x(d.x))
  .y0(curveBottomY)
  .y1((d) => y(d.y))
  .interpolate('basis')

console.log(xAxis)

// --------- render -------------
var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,' + height + ')')
  .call(xAxis)

svg.append('g')
  .attr('class', 'y axis')
  .call(yAxis)

svg.append('path')
  .datum(data)
  .attr('class', 'line')
  .attr('d', lineFunc)

svg.append('defs').append('clipPath').attr('id', 'clip')
  .append('rect').attr({x: curveLeftX, y: 0, width: curveRightX - curveLeftX, height: height})

svg.append('path')
  .datum(data)
  .attr('class', 'area')
  .attr('d', area)
  .attr('clip-path', 'url(#clip)')

