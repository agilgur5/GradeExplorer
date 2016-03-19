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
    d3.select(node).call(axis)
  }
  render() {
    const {className, transform, orient, label,
      width, height, margin} = this.props
    
    return <g ref='axis' className={className}
      transform={transform}>
      <text className='axisLabel'
        transform={
          orient == 'left' ?
            'rotate(-90) translate(' + height / -2 + ',-30)' :
            'translate(' + width / 2 + ',30)'}>
        {label}
      </text>
    </g>
  }
}

export default Axis
