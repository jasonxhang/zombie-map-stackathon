const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

const getDataAndEmit = async socket => {
  try {
    const requestSettings = {
      method: 'GET',
      url:
        'http://gtfsrt.prod.obanyc.com/vehiclePositions?key=93ee96e13d28cf5c3b594e8ac5ec6752',
      encoding: null,
    };

    request(requestSettings, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var feed = GtfsRealtimeBindings.FeedMessage.decode(body);

        let array = [];
        feed.entity.forEach(function(entity) {
          if (entity.id) {
            // console.log('id', entity.id);
            // console.log('vehicle info', entity.vehicle)
            array.push(entity.vehicle);
          }
        });

        const points = array.reduce((accu, curr) =>{
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

        socket.emit("busData", points)
      }
    });
  } catch (e) {
    console.error(`Error: ${e}`);
  }
};




module.exports = getDataAndEmit
