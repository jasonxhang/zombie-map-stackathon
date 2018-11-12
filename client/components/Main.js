import React from 'react';
import DeckGL, {
  ScatterplotLayer,
  HexagonLayer,
  LinearInterpolator,
  IconLayer,
} from 'deck.gl';
import {
  LayerControls,
  SCATTERPLOT_CONTROLS,
  HEXAGON_CONTROLS,
} from './layer-controls';
import axios from 'axios';
import * as d3 from 'd3';
import { tooltipStyle, clickedIconStyle } from './style';
import police from './police';
import ReactMapGL from 'react-map-gl';

const transitionInterpolator = new LinearInterpolator(['bearing']);

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiamFzb254aGFuZyIsImEiOiJjam1pNjJ5ajIwMW1lM3JwazVyZWE1bW4xIn0.xt5U4JljOeJoD7ArM66mIA';

const HEATMAP_COLORS = [
  [213, 62, 79],
  [252, 141, 89],
  [254, 224, 139],
  [230, 245, 152],
  [153, 213, 148],
  [50, 136, 189],
].reverse();

const LIGHT_SETTINGS = {
  lightsPosition: [-73.8, 40.5, 8000, -74.2, 40.9, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.2,
  lightsStrength: [0.8, 0.0, 0.8, 0.0],
  numberOfLights: 2,
};

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstLoad: true,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        latitude: 40.72445,
        longitude: -73.98507,
        zoom: 12.65,
        pitch: 57.62,
        altitude: 2,
        bearing: 70,
      },
      points: [],
      hospitals: [],
      police: [],
      // heatmap
      // hoverInfo
      x: 0,
      y: 0,
      hoveredObject: null,
      clickedObject: null,
      // settings
      settings: {
        ...Object.keys(SCATTERPLOT_CONTROLS).reduce(
          (accu, key) => ({
            ...accu,
            [key]: SCATTERPLOT_CONTROLS[key].value,
          }),
          {}
        ),

        ...Object.keys(HEXAGON_CONTROLS).reduce(
          (accu, key) => ({
            ...accu,
            [key]: HEXAGON_CONTROLS[key].value,
          }),
          {}
        ),
      },
    };

    this.startAnimationTimer = null;
    this.intervalTimer = null;
  }

  componentDidMount() {
    this._processData();
    window.addEventListener('resize', this._resize);
    this._resize();
    this._fetchStaticData();
    this.setState({
      police,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _fetchStaticData = async () => {
    let { data } = await axios.get(
      'https://www.newyorkled.com/maps/geojson/layer/10/'
    );
    this.setState({
      hospitals: data.features,
    });
  };

  _resize = () => {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  _onHover = ({ x, y, object }) => {
    this.setState({ x, y, hoveredObject: object, clickedObject: {} });
  };

  _onObjectClick = ({ object }) => {
    this.setState({ clickedObject: object });
  };

  _onViewportChange = viewport => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport },
    });
  };

  _loadMap = () => {
    this.setState({
      firstLoad: false,
    });
  };

  _processData() {
    const getData = async () => {
      const { data } = await axios.get('/api/bus');
      // console.log('data', data);

      const points = data.reduce((accu, curr) => {
        let raw = curr.trip.route_id.replace(/\D/, '');

        const hordeSizeCalc = x => {
          if (Math.floor(Math.random() * 25) + 1 == 1) {
            return parseInt(x) + (Math.floor(Math.random() * 3) + 1);
          } else {
            return x;
          }
        };

        let hordeSize = hordeSizeCalc(raw);
        if (hordeSize > 0) {
          accu.push({
            position: [
              Number(curr.position.longitude),
              Number(curr.position.latitude),
            ],
            type: 'Dead',
            hordeSize,
          });
        }
        return accu;
      }, []);

      this.setState({
        points,
      });
    };
    setInterval(getData, 2000);
  }

  _updateLayerSettings = settings => {
    this.setState({ settings });
  };
  _getHordeSize = points => {
    return points.hordeSize;
  };

  _onLoad = () => {
    this._rotateCamera();
  };

  _onViewStateChange = ({ viewState }) => {
    this.setState({ viewport: viewState });
  };

  _rotateCamera = () => {
    // change bearing by 120 degrees.
    const bearing = this.state.viewport.bearing + 80;

    this.setState({
      viewport: {
        ...this.state.viewport,
        bearing,
        transitionDuration: 30000,
        transitionInterpolator,
        onTransitionEnd: this._rotateCamera,
      },
    });
    this._resize();
  };

  _renderTooltipHover = () => {
    if (!!this.state.hoveredObject) {
      if (
        this.state.hoveredObject.type &&
        this.state.hoveredObject.type === 'Dead'
      ) {
        return (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${this.state.x}px, ${this.state.y}px)`,
            }}
          >
            <div>
              <p>Type: {JSON.stringify(this.state.hoveredObject.type)}</p>
            </div>
          </div>
        );
      }
      if (this.state.hoveredObject.properties) {
        return (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${this.state.x}px, ${this.state.y}px)`,
            }}
          >
            <div>
              <p>Type: Hospital</p>
            </div>
          </div>
        );
      }
      if (this.state.hoveredObject.Precinct) {
        return (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${this.state.x}px, ${this.state.y}px)`,
            }}
          >
            <div>
              <p>Type: Armory</p>
            </div>
          </div>
        );
      }
    }
  };

  _renderClickedIcon = () => {
    if (!!this.state.clickedObject) {
      if (
        this.state.clickedObject.type &&
        this.state.clickedObject.type === 'Dead'
      ) {
        console.log('clickedonzombie');
        return (
          <div
            style={{
              ...clickedIconStyle,
              transform: `translate(${this.state.x}px, ${this.state.y}px)`,
            }}
          >
            <div>
              <p>Horde Size: {this.state.clickedObject.hordeSize}</p>
            </div>
          </div>
        );
      }
      if (this.state.clickedObject.properties) {
        console.log('clicked on hospital');
        return (
          <div
            style={{
              ...clickedIconStyle,
              transform: `translate(${this.state.x}px, ${this.state.y}px)`,
            }}
          >
            <div>
              <p>{this.state.clickedObject.properties.markername}</p>
            </div>
          </div>
        );
      }
      if (this.state.clickedObject.Precinct) {
        return (
          <div
            style={{
              ...clickedIconStyle,
              transform: `translate(${this.state.x}px, ${this.state.y}px)`,
            }}
          >
            <div>
              <p>
                {this.state.clickedObject.Precinct}
                <br />
                {this.state.clickedObject.Address}
              </p>
            </div>
          </div>
        );
      }
    }
  };

  render() {
    console.log('viewport', this.state.viewport);

    const layer1 = new ScatterplotLayer({
      id: 'zombie-layer',
      data: [...this.state.points],
      pickable: true,
      opacity: 0.4,
      radiusScale: 20,
      radiusMinPixels: 1,
      radiusMaxPixels: 100,
      getPosition: d => d.position,
      getRadius: d => Math.sqrt(d.hordeSize),
      getColor: d => [166, 16, 30],
      ...this.state.settings,
      onHover: object => this._onHover(object),
      onClick: object => this._onObjectClick(object),
    });

    const layer2 = new ScatterplotLayer({
      id: 'hospital-layer',
      data: this.state.hospitals,
      pickable: true,
      extruded: true,
      getColor: d => [255, 255, 255],
      getRadius: 10,
      getElevation: d => 10,
      getPosition: d => d.geometry.coordinates,
      radiusScale: 10,
      radiusMinPixels: 1,
      radiusMaxPixels: 50,
      onHover: object => this._onHover(object),
      onClick: object => this._onObjectClick(object),
    });

    // const layer2 = new IconLayer({
    //   id: 'icon-layer',
    //   data: this.state.hospitals,
    //   pickable: true,
    //   visible: true,
    //   iconAtlas: "../components/icons/hospital.png",
    //   iconMapping: {
    //     hospital: {
    //       x: 0,
    //       y: 0,
    //       width: 16,
    //       height: 16,
    //       anchorY: 16,
    //       mask: true,
    //     },
    //   },
    //   sizeScale: 1,
    //   opacity: 0.6,
    //   radiusMinPixels: 1,
    //   getPosition: d => d.geometry.coordinates,
    //   getSize: d => 15,
    //   getIcon: d => 'hospital',
    //   getColor: d => [255, 0, 128],
    //   onHover: object => this._onHover(object),
    //   onClick: object => this._onObjectClick(object),
    // });

    const layer4 = new ScatterplotLayer({
      id: 'police-layer',
      data: police,
      pickable: true,
      extruded: true,
      getColor: d => [30, 144, 255],
      getRadius: 10,
      getElevation: d => 10,
      getPosition: d => [d.Longitude, d.Latitude],
      radiusScale: 10,
      radiusMinPixels: 1,
      radiusMaxPixels: 50,
      onHover: object => this._onHover(object),
      onClick: object => this._onObjectClick(object),
    });

    const layer3 = new HexagonLayer({
      id: 'zombie-heatmap',
      data: this.state.points,
      colorRange: HEATMAP_COLORS,
      elevationRange: [1, 4200],
      elevationScale: 3,
      extruded: true,
      // getElevationValue: d =>
      //   d.reduce((accu, curr) => {
      //     accu + curr.hordeSize;
      //     return accu
      //   }, 0),
      getPosition: d => d.position,
      lightSettings: LIGHT_SETTINGS,
      opacity: 0.5,
      pickable: true,
      radius: 100,
      ...this.state.settings,
    });

    const layers = this.state.settings.showHexagon
      ? [layer3]
      : [layer1, layer2, layer4];

    // const layers = [layer1, layer2, layer4, layer3];

    return (
      <div>
        {/* {this.state.hoveredObject !== {} ? this._renderTooltipHover() : ''}
        {this.state.clickedObject !== {} ? this._renderClickedIcon() : ''} */}
        {this._renderTooltipHover()}
        {this._renderClickedIcon()}
        <LayerControls
          settings={this.state.settings}
          propTypes={HEXAGON_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />

        <ReactMapGL
          mapboxApiAccessToken={MAPBOX_TOKEN}
          {...this.state.viewport}
          onViewportChange={viewport => this._onViewportChange(viewport)}
          mapStyle={MAPBOX_STYLE}
        >
          <DeckGL
            onLoad={this._onLoad}
            onViewStateChange={viewport => this._onViewStateChange(viewport)}
            controller={true}
            {...this.state.viewport}
            layers={layers}
            {...this.state.settings}
          />
        </ReactMapGL>
      </div>
    );
  }
}

export default Main;
