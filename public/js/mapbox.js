export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoid2FzZWVtNzc4IiwiYSI6ImNsYjNmMDR4eDA4a3g0MG1vajc4cmI3dDIifQ.LAWVAbsa0SDqziXzD2TlIA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/waseem778/clb6bq2yz000015qg75taigf0',
    //center: [-74.0059, 40.7128],
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
