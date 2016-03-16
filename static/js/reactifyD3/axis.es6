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
      .outerTickSize(this.props.outerTickSize)
      .innerTickSize(this.props.innerTickSize)
      .tickPadding(this.props.tickPadding)
    d3.select(node).call(axis)
  }
  render() {
    return <g ref='axis' className={this.props.className}
      transform={this.props.transform} />
  }
}

export default Axis
