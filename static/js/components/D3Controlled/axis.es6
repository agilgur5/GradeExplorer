import React from 'react';
import d3 from 'd3';

class Axis extends React.Component {
  componentDidMount() {
    this.renderAxis();
  }
  componentDidUpdate() {
    this.renderAxis();
  }
  renderAxis() {
    let node = this.refs.axis
    let axis = d3.svg.axis()
      .scale(this.props.scale)
      .orient(this.props.orient)
      .ticks(this.props.ticks)
      .outerTickSize(this.props.outerTickSize)
      .innerTickSize(this.props.innerTickSize)
      .tickPadding(this.props.tickPadding)
      .tickFormat((d) => this.props.names ? this.props.names[d] : d)
    let nodes = d3.select(node).call(axis)
    // if we have names on the bottom, make them vertical
    if (this.props.names && this.props.orient == 'bottom') {
      nodes.selectAll('.tick').selectAll('text') // only select tick labels
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'end')
    }
  }
  render() {
    const {className, transform, orient, label,
      width, height, margin, names} = this.props
    
    return <g ref='axis' className={className}
      transform={transform}>
      {names ? ''
      : <text className='axisLabel'
        transform={orient == 'left' ?
          'rotate(-90) translate(' + height / -2 + ',-30)' :
          'translate(' + width / 2 + ',30)'}>
        {label}
      </text>}
    </g>
  }
}

export default Axis
