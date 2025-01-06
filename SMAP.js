var startdate = '2023-01-01';
var enddate = '2023-06-30';

var SMAPL4 = ee.ImageCollection('NASA/SMAP/SPL4SMGP/007');
// Set lon, lat of point of interest.
var point = ee.Geometry.Point([x,y]);
// Zoom to point with zoom level 7.
Map.centerObject(point, 7);
// Define visualization parameters.
var soilMoistureVis = {
  min: 0.0,
  max: 0.7,
  palette: ['A67C00', 'FFE625', 'C2E5D3', '90DCD0',
            '2FBDBD', '0C9BBD', '068682'],
};

// Load input collection, filter by date, and select surface soil moisture data.
var soilMoisture = SMAPL4.filterDate(startdate, enddate)
                            .select(['sm_surface', 'sm_rootzone']);
// Select soil moisture for last day in time frame.
var soilMoisture1 = soilMoisture.filterDate(enddate)
                                .select(['sm_surface']);
// Create average soil moisture for the last day for visualization.
var soilMoisture_oneday = soilMoisture1.reduce(ee.Reducer.mean());
Map.addLayer(
    soilMoisture.select('sm_surface'), soilMoistureVis, 'Soil Moisture');
Map.addLayer(
    point, {color: 'black'}, 'Geometry [black]: point');
// Define the chart and print it to the console.
var chart =
    ui.Chart.image
        .series({
          imageCollection: soilMoisture,
          region: point,
          reducer: ee.Reducer.mean(),
          scale: 10000,
          xProperty: 'system:time_start'
        })
        .setSeriesNames(['root zone soil moisture', 'surface soil moisture'])
        .setOptions({
          title: 'SMAP L4 version 7, 3-hourly surface and root zone soil ',
          hAxis: {
            title: 'Date',
            titleTextStyle: {italic: false, bold: true}
          },
          vAxis: {
            title: 'Soil Moisture cm3/cm3',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 5,
          colors: ['4F7942', 'C7EA46'],
          curveType: 'function'
        });
print(chart);