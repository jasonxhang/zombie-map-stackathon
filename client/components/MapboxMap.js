import React from 'react';
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl';
import mapboxgl from 'mapbox-gl'

const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1IjoiamFzb254aGFuZyIsImEiOiJjam1pNjJ5ajIwMW1lM3JwazVyZWE1bW4xIn0.xt5U4JljOeJoD7ArM66mIA',
});
const fullstackCoords = [-74.009, 40.705];

class MapboxMap extends React.Component {
  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: fullstackCoords, // FullStack coordinates
      zoom: 12, // starting zoom
    });
  }

  componentWillUnmount() {
    this.map.remove();
  }

  render() {
    return (
      <Map
        style="mapbox://styles/mapbox/streets-v9"
        containerStyle={{
          height: '100vh',
          width: '100vw',
        }}
      >
        <Layer type="symbol" id="marker" layout={{ 'icon-image': 'marker-15' }}>
          <Feature coordinates={[-0.481747846041145, 51.3233379650232]} />
        </Layer>
      </Map>
    );
  }
}

export default MapboxMap;
