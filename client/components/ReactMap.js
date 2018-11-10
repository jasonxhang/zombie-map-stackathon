/* global window */
import React, {Component} from 'react';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay';
import {LayerControls, HEXAGON_CONTROLS, SCATTERPLOT_CONTROLS} from './layer-controls';
import {tooltipStyle} from './style';
import { $vehicles } from './api'
import axios from 'axios';


const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
// Set your mapbox token here
const MAPBOX_TOKEN =   'pk.eyJ1IjoiamFzb254aGFuZyIsImEiOiJjam1pNjJ5ajIwMW1lM3JwazVyZWE1bW4xIn0.xt5U4JljOeJoD7ArM66mIA'; // eslint-disable-line

export default class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: -74,
        latitude: 40.7,
        zoom: 11,
        maxZoom: 16
      },
      points: [],
      settings: {
        ...Object.keys(SCATTERPLOT_CONTROLS).reduce((accu, key) => ({
          ...accu,
          [key]: SCATTERPLOT_CONTROLS[key].value
        }), {}),
      },
      // hoverInfo
      x: 0,
      y: 0,
      hoveredObject: null,
      status: 'LOADING',
    };
    this._resize = this._resize.bind(this);
  }

   componentDidMount() {
    // $vehicles.subscribe(data => {
    //   this._processData(data);
    // })
    // const { data } = await axios.get('/api/bus')
    console.log('dataaaa, data')
    this._processData()
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _processData() {


      //   // this.setState({status: 'LOADED'});

      //   console.log('data', data)
      //   const points = data.reduce((accu, curr) => {
      //     accu.push({
      //       position: [Number(curr.position.longitude), Number(curr.position.latitude)],
      //       pickup: true
      //     });

      //     return accu;
      //   }, []);
      //   console.log('points', points)


      // this.setState({
      //   points,
      //   // status: 'READY'
      // });

      if (bikeData) {
        this.setState({status: 'LOADED'});
        const points = bikeData.data.stations.reduce((accu, curr) => {
          accu.push({
            position: [Number(curr.lon), Number(curr.lat)],
            pickup: true
          });
;
          return accu;
        }, []);
        this.setState({
          points,
          status: 'READY'
        });
      }

  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _onViewportChange = newViewport => {
    const viewport = Object.assign({}, this.state.viewport, newViewport);
    this.setState({ viewport });
  };

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _updateLayerSettings(settings) {
    this.setState({settings});
  }

  render() {
    console.log('STATE', this.state)
    console.log('POINTS', this.state.points)
    return (
      <div>
        {this.state.hoveredObject &&
          <div style={{
            ...tooltipStyle,
            transform: `translate(${this.state.x}px, ${this.state.y}px)`
          }}>
            <div>{JSON.stringify(this.state.hoveredObject)}</div>
          </div>}
        <LayerControls
          settings={this.state.settings}
          propTypes={SCATTERPLOT_CONTROLS}
          title={"TESTSETSTEST"}
          onChange={settings => this._updateLayerSettings(settings)}/>
        <MapGL
          // mainMapViewport={this.state.viewport}
          {...this.state.viewport}
          mapStyle={MAPBOX_STYLE}
          onViewportChange={viewport => this._onViewportChange(viewport)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <DeckGLOverlay
            viewport={this.state.viewport}
            data={this.state.points}
            onHover={hover => this._onHover(hover)}
            {...this.state.settings}
          />
        </MapGL>
      </div>
    );
  }
}
