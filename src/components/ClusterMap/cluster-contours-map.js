import React from "react";
import { contours as d3Contours } from "d3-contour";
import { scaleLinear as d3ScaleLinear } from "d3-scale";
import { extent as d3extent } from "d3-array";

const scaleContours = (
  coords,
  width,
  height,
  contoursSize,
  clusterSize,
  clusterX,
  clusterY
) => {
  const factor = clusterSize(Math.min(height, width));
  const ClusterPosX = clusterX(width, Math.min(height, width));
  const ClusterPosY = clusterY(height, Math.min(height, width));
  return coords.map(c =>
    c.map(point => [
      (point[0] / contoursSize) * factor + ClusterPosX,
      (point[1] / contoursSize) * factor + ClusterPosY
    ])
  );
};

const constructContours = (topography, contoursSize) =>
  d3Contours()
    .size([contoursSize, contoursSize])
    .smooth([true])(topography);

const computeColorMap = topography =>
  d3ScaleLinear()
    .domain(d3extent(topography))
    .range(["#0e0e0e", "#888"]);

class ClusterContoursMap extends React.Component {
  constructor(props) {
    super();
    const { topography, contoursSize } = props;
    this.state = {
      topography: topography
    };
    this.contours = constructContours(topography, contoursSize);
    this.colorMap = computeColorMap(topography);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      this.props.width !== nextProps.width ||
      this.props.height !== nextProps.height ||
      this.props.topography.length !== nextProps.topography.length ||
      this.props.isHighlighted !== nextProps.isHighlighted
    );
  }

  render() {
    const {
      width,
      height,
      contoursSize,
      clusterSize,
      clusterX,
      clusterY,
      topography
    } = this.props;
    if (topography.length !== this.state.topography.length) {
      this.contours = constructContours(topography, contoursSize);
      this.colorMap = computeColorMap(topography);
      this.setState({
        topography: topography
      });
    }
    const scale = Math.min(height, width);
    return (
      <g fill="none">
        {this.contours.map(cont => {
          return (
            <path
              className="isoline"
              key={cont.value}
              d={cont.coordinates.map(coord => {
                var coords = scaleContours(
                  coord,
                  width,
                  height,
                  contoursSize,
                  clusterSize,
                  clusterX,
                  clusterY
                );
                return "M" + coords[0] + "L" + coords;
              })}
              fill={this.colorMap(cont.value)}
            />
          );
        })}
        <circle
          cx={clusterX(width, scale) + 0.5 * clusterSize(scale)}
          cy={clusterY(height, scale) + 0.5 * clusterSize(scale)}
          r={clusterSize(scale) * 0.58}
          fill={this.props.isHighlighted ? "#afca0b22" : "none"}
        />
      </g>
    );
  }
}

export default ClusterContoursMap;