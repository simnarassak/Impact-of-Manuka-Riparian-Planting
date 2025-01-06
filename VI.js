// Import the feature collection.

var newfc = ee.FeatureCollection([
    ee.Feature(ee.Geometry.Point([x, y]).buffer(2).bounds(), {id: 'control plot'}),   
    ee.Feature(ee.Geometry.Point([x, y]).buffer(2).bounds(), {id: 'manuka plot'}), 
    
  ]);
  
  Map.addLayer(newfc, {}, 'patches')
  Map.centerObject(newfc)
  
  
  // Function to mask clouds using the Sentinel-2 QA band
  function maskS2clouds(image) {
    var qa = image.select('QA60');
    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
    return image.updateMask(mask).divide(10000).addBands(qa, null, true)
                  .copyProperties(image).set("system:time_start", image.get("system:time_start"));
  }
  
  // Function to calculate and add an NDVI band
  var addNDVI = function(image) {
  return image.addBands(image.normalizedDifference(['B8', 'B4']).rename('NDVI'));
  }
  
  var addNDMI = function(image) {
    var ndmi = image.expression(
      '((NIR - SHI) / (NIR + SHI))', {
        'SHI': image.select('B6'),
        'NIR':image.select('B5')
  }).rename('NDMI').float();
    return image.addBands(ndmi);
  };
  // Sentinel 2 harmonized 
  var S2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterDate('2017-07-01', '2023-12-31')
  .filterBounds(newfc.geometry())
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))  
  .map(maskS2clouds)
  .map(addNDVI)
  .map(addNDMI);
  
  print(S2);
  
  // Define the chart and print it to the console.
  var chart1 =
      ui.Chart.image
          .seriesByRegion({
            imageCollection: S2,
            band: 'NDVI',
            regions: newfc,
            reducer: ee.Reducer.mean(),
            scale: 10,
            seriesProperty: 'id',
            xProperty: 'system:time_start'
          })
          .setOptions({
            title: 'Average NDVI by region',
            hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
            vAxis: {
              title: 'NDVI',
              titleTextStyle: {italic: false, bold: true}
            },
            lineWidth: 1,
            pointSize: 3,
            colors: ['f0af07', '0f8755', '0000ff'],
          });
  print(chart1);
  
  // Define the chart and print it to the console.
  var chart2 =
      ui.Chart.image
          .seriesByRegion({
            imageCollection: S2,
            band: 'NDMI',
            regions: newfc,
            reducer: ee.Reducer.mean(),
            scale: 10,
            seriesProperty: 'id',
            xProperty: 'system:time_start'
          })
          .setOptions({
            title: 'Average NDMI by region',
            hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
            vAxis: {
              title: 'NDMI',
              titleTextStyle: {italic: false, bold: true}
            },
            lineWidth: 1,
            pointSize: 3,
            colors: ['f0af07', '0f8755', '0000ff'],
          });
  print(chart2);
  
  