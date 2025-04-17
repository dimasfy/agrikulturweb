document.addEventListener('DOMContentLoaded', function() {
  var intensitasHistoryDiv = document.getElementById("intensitas-history");
  var suhuHistoryDiv = document.getElementById("suhu-history");

  var intensitasGaugeDiv = document.getElementById("intensitas-gauge");
  var suhuGaugeDiv = document.getElementById("suhu-gauge");

  var graphConfig = {
    displayModeBar: false,
    responsive: true,
  };

  // History Data
  var intensitasTrace = {
    x: [],
    y: [],
    name: "Temperature",
    mode: "lines+markers",
    type: "scatter",
  };
  var suhuTrace = {
    x: [],
    y: [],
    name: "Suhu",
    mode: "lines+markers",
    type: "scatter",
  };

  var intensitasLayout = {
    autosize: true,
    title: {
      text: "Intensitas Cahaya",
    },
    font: {
      size: 14,
      color: "#7f7f7f",
    },
    colorway: ["#B22222"],
    margin: { t: 30, b: 20, l: 30, r: 20, pad: 0 },
  };
  var suhuLayout = {
    autosize: true,
    title: {
      text: "Suhu",
    },
    font: {
      size: 14,
      color: "#7f7f7f",
    },
    colorway: ["#00008B"],
    margin: { t: 30, b: 20, l: 30, r: 20, pad: 0 },
  };
  var config = { responsive: true };

  Plotly.newPlot(intensitasHistoryDiv, [intensitasTrace], intensitasLayout, graphConfig);
  Plotly.newPlot(suhuHistoryDiv, [suhuTrace], suhuLayout, graphConfig);

  // Gauge Data
  var intensitasData = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: 0,
      title: { text: "Intensitas Cahaya" },
      type: "indicator",
      mode: "gauge+number+delta",
      delta: { reference: 30 },
      gauge: {
        axis: { range: [null, 1000] },
        steps: [
          { range: [0, 200], color: "lightgray" },
          { range: [200, 400], color: "gray" },
        ],
        threshold: {
          line: { color: "red", width: 4 },
          thickness: 0.75,
          value: 400,
        },
        bar: { 'color': "orange" },
      },
    },
  ];

  var suhuData = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: 0,
      title: { text: "Suhu" },
      type: "indicator",
      mode: "gauge+number+delta",
      delta: { reference: 30 },
      gauge: {
        axis: { range: [null, 50] },
        steps: [
          { range: [0, 20], color: "cyan" },
          { range: [20, 33], color: "royalblue" },
          { range: [33, 50], color: "orange" },
        ],
        threshold: {
          line: { color: "red", width: 4 },
          thickness: 0.75,
          value: 33,
        },
      },
    },
  ];

  var layout = { width: 350, height: 250, margin: { t: 0, b: 0, l: 0, r: 0 } };

  Plotly.newPlot(intensitasGaugeDiv, intensitasData, layout, graphConfig);
  Plotly.newPlot(suhuGaugeDiv, suhuData, layout, graphConfig);

  // intensitas
  let newTempXArray = [];
  let newTempYArray = [];

  // suhu
  let newHumidityXArray = [];
  let newHumidityYArray = [];

  // The maximum number of data points displayed on our scatter/line graph
  let MAX_GRAPH_POINTS = 12;

  function updateBoxes(intensitas, suhu, water_status, harvest_status) {
    let intensitasDiv = document.getElementById("intensitas");
    if (intensitasDiv) {
      intensitasDiv.innerHTML = intensitas + " lux";
    } else {
      console.error("Elemen dengan ID 'intensitas' tidak ditemukan.");
    }
    
    let suhuDiv = document.getElementById("suhu");
    if (suhuDiv) {
      suhuDiv.innerHTML = suhu + " °C";
    } else {
      console.error("Elemen dengan ID 'suhu' tidak ditemukan.");
    }
    
    let statusairDiv = document.getElementById("water_status");
    if (statusairDiv) {
      statusairDiv.innerHTML = water_status;
    } else {
      console.error("Elemen dengan ID 'water_status' tidak ditemukan.");
    }
    
    let statuspadiDiv = document.getElementById("harvest_status");
    if (statuspadiDiv) {
      statuspadiDiv.innerHTML = harvest_status;
    } else {
      console.error("Elemen dengan ID 'harvest_status' tidak ditemukan.");
    }

    // Update status elements
    const waterStatusElem = document.getElementById('water_status');
    const harvestStatusElem = document.getElementById('harvest_status');

    // Atur kelas CSS berdasarkan kondisi
    if (water_status === "Air cukup!") {
      waterStatusElem.classList.remove('status-red');
      waterStatusElem.classList.add('status-normal');
    } else {
      waterStatusElem.classList.remove('status-normal');
      waterStatusElem.classList.add('status-red');
    }

    if (harvest_status === "Siap panen!") {
      harvestStatusElem.classList.remove('status-red');
      harvestStatusElem.classList.add('status-normal');
    } else {
      harvestStatusElem.classList.remove('status-normal');
      harvestStatusElem.classList.add('status-red');
    }
  }

  function updateGauge(intensitas, suhu) {
    var intensitas_update = {
      value: intensitas,
    };
    var suhu_update = {
      value: suhu,
    };

    Plotly.restyle(intensitasGaugeDiv, intensitas_update, [0]);
    Plotly.restyle(suhuGaugeDiv, suhu_update, [0]);
  }

  function updateCharts(lineChartDiv, xArray, yArray, sensorRead) {
    if (xArray.length >= MAX_GRAPH_POINTS) {
      xArray.shift();
    }
    if (yArray.length >= MAX_GRAPH_POINTS) {
      yArray.shift();
    }
    xArray.push(new Date());
    yArray.push(sensorRead);

    var data_update = {
      x: [xArray],
      y: [yArray],
    };

    Plotly.update(lineChartDiv, data_update, [0]);
  }

  function updateSensorReadings(jsonResponse) {
    let intensitas = parseFloat(jsonResponse.intensitas).toFixed(1);
    let suhu = parseFloat(jsonResponse.suhu).toFixed(1);
    let water_status = jsonResponse.water_status;
    let harvest_status = jsonResponse.harvest_status;

    updateBoxes(intensitas, suhu, water_status, harvest_status);
    updateGauge(intensitas, suhu);

    // Update intensitas Line Chart
    updateCharts(
      intensitasHistoryDiv,
      newTempXArray,
      newTempYArray,
      intensitas
    );
    // Update suhu Line Chart
    updateCharts(
      suhuHistoryDiv,
      newHumidityXArray,
      newHumidityYArray,
      suhu
    );
  }

  // SocketIO Code
  var socket = io.connect();

  // Receive details from server
  socket.on("updateSensorData", function (msg) {
    var sensorReadings = JSON.parse(msg);
    updateSensorReadings(sensorReadings);
  });
});

// Navbar scroll event
const navbar = document.querySelector('.navbar');

document.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

