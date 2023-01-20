import { Chart } from 'chart.js';


export const simpleLineChart = (insertElement, min, max, title, dataset, dataArr) => {
  const myChart = new Chart(insertElement, {
    type: 'line',
    data: {
      datasets: [
        dataset
      ]
    },
    options: {
      responsive: true,
      title: {
        display: false,
        text: title,
        fontSize: 25
      },
      legend: {
        display: false,
        position: 'bottom',
        align: 'start'
      },
      tooltips: {
        mode: 'nearest',
        intersect: false
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            tooltipFormat: 'DD.MM.YYYY',
            unit: dataArr.length > 24 ? 'year' : 'month',
            displayFormats: {
              month: 'MM.YY'
            }
          },
          gridLines: {
            display: true,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            padding: 10
          }
        }],
        yAxes: [{
          gridLines: {
            display: true,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            min,
            suggestedMax: max,
            padding: 10
          }
        }]
      }
    }
  });
}


export const threeLinesChart = (insertElement, min, max, title, timeUnit, legendVisible = true, dataset1, dataset2, dataset3) => {
  let dataset2Buf, dataset3Buf = {
    label: '',
    data: [],
    borderColor: 'rgb(79, 71, 137, 0)',
    backgroundColor: 'rgb(255, 203, 71, 0)',
    fill: false,
    pointBorderColor: 'rgb(0, 0, 0, 0)',
    borderWidth: 0,
    lineTension: 0,
    pointHitRadius: 0
  }
  if (dataset2) dataset2Buf = dataset2;
  if (dataset3) dataset3Buf = dataset3;


  return new Chart(insertElement, {
    type: 'line',
    data: {
      datasets: [
        dataset1,
        dataset2Buf,
        dataset3Buf
      ]
    },
    options: {
      responsive: true,
      title: {
        display: false,
        text: title,
        fontSize: 25
      },
      legend: {
        display: legendVisible,
        position: 'bottom',
        align: 'start'
      },
      tooltips: {
        /* mode: 'nearest', */
        intersect: false,
        filter: function (tooltipItem) {
          return tooltipItem.datasetIndex === 0;
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            tooltipFormat: 'DD.MM.YYYY',
            unit: timeUnit,
            displayFormats: {
              month: 'MM.YY'
            }
          },
          gridLines: {
            display: true,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            
            padding: 10
          }
        }],
        yAxes: [{
          gridLines: {
            display: true,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            min,
            suggestedMax: max,
            padding: 10,
            /* stepSize: 10 */
          }
        }]
      }
    }
  });
}

export const multipleLinesChart = (insertElement, min, max, data, ticksBottom = true) => {

  return new Chart(insertElement, {
    type: 'line',
    data,
    options: {
      elements: {
        line: {
          tension: 0.5
        }
      },
      responsive: true,
      legend: {
        display: true,
        position: 'bottom',
        align: 'start',
        labels: {
          boxWidth: 15
        }
      },
      tooltips: {
        mode: 'nearest',
        intersect: false,
        /* filter: function (tooltipItem) {
          return tooltipItem.datasetIndex === 0;
        } */
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: ticksBottom,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            padding: 10,
            stepSize: 30,
            maxTicksLimit: 13,
            autoSkip: true,
            display: ticksBottom
          }
        }],
        yAxes: [{
          gridLines: {
            display: true,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            min,
            suggestedMax: max,
            padding: 10,
            /* stepSize: 10 */
          }
        }]
      }
    }
  });
}

export const multipleLinesChartOneActive = (insertElement, min, max, stepSize, data, ticksBottom = true) => {

  return new Chart(insertElement, {
    type: 'line',
    data,
    options: {
      elements: {
        line: {
          tension: 0.5
        }
      },
      responsive: true,
      legend: {
        display: true,
        position: 'bottom',
        align: 'start',
        labels: {
          boxWidth: 15
        }
      },
      tooltips: {
        mode: 'nearest',
        intersect: true,
        filter: function (tooltipItem) {
          return tooltipItem.datasetIndex === 0;
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: ticksBottom,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            padding: 10,
            stepSize: 30,
            /* maxTicksLimit: 9, */
            autoSkip: true,
            display: ticksBottom
          }
        }],
        yAxes: [{
          gridLines: {
            display: true,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            min,
            suggestedMax: max,
            padding: 10,
            stepSize
          }
        }]
      }
    }
  });
}

export const doughnutChart = (insertElement, legendVisible, title, data) => {
  return new Chart(insertElement, {
    type: 'doughnut',
    data,
    options: {
      title: {
        display: false,
        text: title,
        fontSize: 20
      },
      responsive: true,
      cutoutPercentage: 75,
      legend: {
        display: legendVisible,
        position: 'bottom',
        align: 'center',
        labels: {
          boxWidth: 15
        }
      }
    }
  });
}

export const mainPageCharts = (insertElement, min, max, intersect, data) => {

  return new Chart(insertElement, {
    type: 'line',
    data,
    options: {
      elements: {
        line: {
          tension: 0.5
        }
      },
      responsive: true,
      legend: {
        display: false,
        position: 'bottom',
        align: 'start'
      },
      tooltips: {
        mode: 'nearest',
        intersect
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            display: false,
            padding: 10,
            stepSize: 30,
            maxTicksLimit: 13,
            autoSkip: true
          }
        }],
        yAxes: [{
          gridLines: {
            display: true,
            borderDash: [5, 5],
            zeroLineBorderDash: [5, 5],
            color: 'rgba(0, 0, 0, 0.1)',
            zeroLineColor: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            display: true,
            min,
            suggestedMax: max,
            padding: 10,
            fontSize: 12,
            fontColor: '#b8b8b8'
          }
        }]
      }
    }
  });
}


/* const myChart = new Chart(insertElement, {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Результат (л.)',
        data: dataAR,
        borderColor: 'rgb(255, 203, 71)',
        backgroundColor: 'rgb(255, 203, 71, 0)',
        fill: false,
        pointBorderColor: 'rgb(0, 0, 0, 1)',
        borderWidth: 2,
        lineTension: 0.2
      }
    ]
  },
  options: {
    responsive: true,
    title: {
      display: false,
      text: 'Контрольная доение',
      fontSize: 25
    },
    legend: {
      display: false,
      position: 'bottom',
      align: 'start'
    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    scales: {
      xAxes: [{
        type: 'time',
        time: {
          tooltipFormat: 'DD.MM.YYYY',
          unit: dataAR.length > 24 ? 'year' : 'month',
          displayFormats: {
            month: 'MM.YY'
          }
        },
        gridLines: {
          display: true,
          borderDash: [5, 5],
          zeroLineBorderDash: [5, 5],
          color: 'rgba(0, 0, 0, 0.1)',
          zeroLineColor: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          padding: 10
        }
      }],
      yAxes: [{
        gridLines: {
          display: true,
          borderDash: [5, 5],
          zeroLineBorderDash: [5, 5],
          color: 'rgba(0, 0, 0, 0.1)',
          zeroLineColor: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          min: 0,
          suggestedMax: 40,
          padding: 10
        }
      }]
    }
  }
}); */