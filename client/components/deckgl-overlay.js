import React, {Component} from 'react';
import DeckGL, {ScatterplotLayer, HexagonLayer} from 'deck.gl';
import * as d3 from 'd3';

const ease = d3.easeCubicInOut;


export default class DeckGLOverlay extends Component {

  render() {
    if (!this.props.data) {
      return null;
    }

    const layer = [new ScatterplotLayer({
      id: 'scatterplot',
      pickable: true,
      opacity: 0.6,
      radiusScale: 10,
      radiusMinPixels: 1,
      radiusMaxPixels: 150,
      ...this.props,
      getPosition: d => d.position,
      getRadius: d => 5,
      getColor: d => [166, 16, 30],
      // updateTriggers: {
      //   getPositions: {
      //     duration: 600,
      //     easing: ease,
      //     enter: value => [value[0], value[1], value[2], 0] // fade in
      //   },
      // },
      transitions: true,
      transitions: {
        getPositions: {
          duration: 600,
          easing: ease,
          // enter: value => [value[0], value[1], value[2], 0] // fade in
          enter: feature => feature.properties.fill.concat(0),
        },
        // getColors: {
        //   // duration: 300,
        //   easing: d3.easeCubicInOut,
        //   enter: value => [value[0], value[1], value[2], 0] // fade in
        // },
      },
      // onHover: ({object}) => setTooltip(`${object.name}\n${object.address}`)
    })];


    return (
      <DeckGL {...this.props.viewport} layers={layer} />
    );
  }
}
