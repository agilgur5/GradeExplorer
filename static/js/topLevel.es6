import React from 'react'
import HighlightedGraph from './highlightedGraph.es6'

class TopLevelApp extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    margin: React.PropTypes.object,
    data: React.PropTypes.array
  }
  render () {
    let {width, height, margin, data} = this.props

    // reduce to an array of final grades
    let finalGrades = this.props.data.map((elem) => {
      return elem.reduce((acc, grade) => { return acc + grade / elem.length }, 0)
    })
    console.log(finalGrades)

    return <div>
      <HighlightedGraph width={width/2} height={height/2} margin={margin}
        finalGrades={finalGrades} interp='basis' input={75} />
      <HighlightedGraph width={width/2} height={height/2} margin={margin}
        finalGrades={finalGrades} interp='basis' input={83} />
    </div>
  }
}

export default TopLevelApp
