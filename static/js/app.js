console.log('This is app.js')

// Define a global; variable to hold the URL
const  url = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';

// Color palette for Gauge Chart
let  arrColorsG = ["verylightpurple", "lightgrey", "lightpeach", "lightblue", "turquoise", "lightgreen", "lightgolden", "peachpuff", "pink", "white"];

// Function that builds the Bar Chart

function bargraph(sampleID){
    console.log(`bargraph(${sampleID})`);

    d3.json(url).then(data => {
        console.log(data);

        let samples = data.samples;
        let resultsArray = samples.filter(s => s.id == sampleID);
        let result = resultsArray[0];

        let otu_ids = result.otu_ids;
        let otu_labels = result.otu_labels;
        let sample_values = result.sample_values;

        let yticks = otu_ids.slice(0,10).map(otuID => `OTU ${otuID}`).reverse();

        // Create a trace Object
        let bardata ={
            x: sample_values.slice(0,10).reverse(),
            y: yticks,
            type: "bar",
            text: otu_labels.slice(0,10).reverse(),
            orientation: "h"
        };

        // Put the trace object into an array
        let barArray = [bardata];

        // Create a layout object
        let barLayout ={
            title: "Top 10 Bacteria Cultures Found",
            margin: {t:30,l:150},
            color : "pink"
        };

        // Call the Plotly function
        Plotly.newPlot('bar',barArray,barLayout);
    })
}

// Function that builds the Bubble Chart

function bubblechart (sampleID){
    console.log(`bubblechart(${sampleID})`);

    d3.json(url).then(data => {
        let samples = data.samples;
        let resultsArray = samples.filter(s => s.id == sampleID);
        let result = resultsArray[0];
        let otu_ids = result.otu_ids;
        let otu_labels = result.sample_values;
        let sample_values = result.sample_values;

        // Create a trace
        let bubbleData ={
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: 'markers',
            marker: {
                size: sample_values,
                color: otu_ids,
                colorscale: 'Earth'
            }
        }

        // Put the trace into an array
        let bubbleArray = [bubbleData];

        // Create a layout object
        let bubbleLayout = {
            title: 'Bacteria Cultures Per Sample',
            margin: {t:30},
            hovermode: 'closest',
            xaxis: {title: "OTU ID"},
        };

        // Call Plotly function

        Plotly.newPlot('bubble',bubbleArray,bubbleLayout);
    })
}

// Function that populates the demographic box

function Showmetadata(sampleID){
    console.log(`Showmetadata(${sampleID})`);

    d3.json(url).then((data => {
        let metadata = data.metadata;
        console.log(metadata);

        // Filter data
        let result = metadata.filter(meta => meta.id == sampleID)[0];
        let demographicInfo = d3.select('#sample-metadata');

        // Clear existing data in demographicInfo
        demographicInfo.html('');

        // Add key and value pair to the demographicInfo Panel
        Object.entries(result).forEach(([key,value]) => {
            demographicInfo.append('h6').text(`${key}: ${value}`);
        });

    }));
}

// Function that builds Gauge Chart

function buildGaugeChart(sampleID) {
    console.log("sample", sampleID);
  
    d3.json(url).then(data =>{
  
      let objs = data.metadata;
      let matchedSampleObj = objs.filter(sampleData => sampleData["id"] === parseInt(sampleID));
      gaugeChart(matchedSampleObj[0]);
   });   
  }

function gaugeChart(data) {
    console.log("gaugeChart", data);
  
    if(data.wfreq === null){
      data.wfreq = 0;
  
    }
  
    let degree = parseInt(data.wfreq) * (180/10);
  
    // Trig to calc meter point
    let degrees = 180 - degree;
    let radius = .5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians);
    let y = radius * Math.sin(radians);
  
    let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    let path = mainPath.concat(pathX, space, pathY, pathEnd);
    
    let trace = [{ type: 'scatter',
       x: [0], y:[0],
        marker: {size: 50, color:'2F6497'},
        showlegend: false,
        name: 'WASH FREQ',
        text: data.wfreq,
        hoverinfo: 'text+name'},
      { values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
      textinfo: 'text',
      textposition:'inside',
      textfont:{
        size : 16,
        },
      marker: {colors:[...arrColorsG]},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '2-1', '0-1',''],
      hoverinfo: 'text',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];
  
    let layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '#2F6497',
          line: {
            color: '#2F6497'
          }
        }],
  
      title: '<b>Belly Button Washing Frequency</b> <br> <b>Scrub Per Week</b>',
      height: 550,
      width: 550,
      xaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
    };
  
    Plotly.newPlot('gauge', trace, layout, {responsive: true});
  
  }

// Function that updates the dashboard

function optionChanged(sampleID){
    console.log(`optionChanged, new values: ${sampleID}`);

    bargraph(sampleID);
    bubblechart(sampleID);
    Showmetadata(sampleID);
    buildGaugeChart(sampleID);
}

// Function that intialize the dashboard at startup 

function InitDashboard(){
    console.log('InitDashboard');

    //Get a handle to the dropdown
    let selector = d3.select('#selDataset');

    d3.json(url).then(data => {
        console.log('Here is the Data');

        let sampleNames = data.names;
        console.log('Here are the sample names:', sampleNames);

        // Populate the dropdown
        for (let i =0; i < sampleNames.length; i++){
            let sampleID = sampleNames[i];
            selector.append('option').text(sampleID).property('value',sampleID);
        };

        // Read the current value from the dropdown

        let initialID = selector.property('value');
        console.log(`initialID = ${initialID}`);

        // Draw the bargraph for the selected sample id
        bargraph(initialID);

        // Draw a bubblechart for the selected sample id
        bubblechart(initialID);

        // Show the metadata for the selected sample id
        Showmetadata(initialID);

        // Show the Gaugechart for the selected sample id
        buildGaugeChart(initialID);
    });
}


// call the initalize function

InitDashboard();
