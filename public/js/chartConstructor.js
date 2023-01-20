import $ from 'jquery';
import moment from 'moment'


export class multiLinearChart {
  constructor(parentElement, parameters) {
    this.parentElement = parentElement;
    this.parameters = parameters;
  }

  /* Prepare SVG (re-size, add class) */
  #prepareGraph() {
    this.graphElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    this.graphElement.classList.add('basic-graph');
    this.graphElement.setAttribute('id', 'generated-graph');
    this.parentElement.append(this.graphElement);
    this.parentElement.style.position = 'relative';
    this.parentElement.style.padding = 'unset';

    this.graphElement = document.getElementById('generated-graph');

    const width = this.graphElement.parentElement.offsetWidth;
    const height = Math.round(this.graphElement.parentElement.offsetWidth / 1.75);

    this.graphWidth = width;
    this.graphHeight = height;

    this.graphElement.style.width = width;
    this.graphElement.style.height = height;

    this.daysSpan = Math.round((this.parameters.graphSettings.finishDate.getTime() - this.parameters.graphSettings.startDate.getTime()) / 1000 / 60 / 60 / 24);
  }

  /* Adding grid lines */
  #addGridLines() {
    let gapX = Math.round(this.graphHeight / 10);
    let gapY = Math.round(this.graphWidth / 12);

    for (let i = 1; i < 10; i++) {
      let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.classList.add('line-graph-grid-line');
      path.setAttribute('d', `M 0 ${i * gapX} L ${this.graphWidth} ${i * gapX}`)
      this.graphElement.append(path);
    }
    for (let i = 1; i < 12; i++) {
      let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.classList.add('line-graph-grid-line');
      path.setAttribute('d', `M ${i * gapY} 0 L ${i * gapY} ${this.graphHeight}`)
      this.graphElement.append(path);
    }
  }

  /* Working with each dataset */
  #datasetsWork() {
    this.parameters.datasets.forEach((dataset, datasetIndex) => {
      /* If average and allowed adding all results dots */
      if (dataset.averageGraph && dataset.showAllResults) {
        dataset.data.forEach(data => {
          data.results.forEach(result => {
            let daysInPeriod = Math.round((new Date(result.date).getTime() - new Date(moment().subtract(this.parameters.graphSettings.periodMonths, 'month')).getTime()) / 1000 / 60 / 60 / 24);

            var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute('cx', daysInPeriod * ((this.graphWidth - 60) / this.daysSpan));
            circle.setAttribute('cy', this.graphHeight - (result.number * (this.graphHeight / this.parameters.graphSettings.max)));
            circle.setAttribute('r', 3);
            circle.setAttribute('fill', dataset.pointColor);
            this.graphElement.append(circle);
          });
        });
      }



      dataset.data.forEach((data, index) => {
        let daysInPeriod = Math.round((new Date(data.date).getTime() - new Date(moment().subtract(this.parameters.graphSettings.periodMonths, 'month')).getTime()) / 1000 / 60 / 60 / 24);

        /* Adding line if allowed */
        if (dataset.showLine) {
          if (index === 0) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            /* path.classList.add('mp-line-graph-average-line'); */
            path.setAttribute('d', `M ${daysInPeriod * ((this.graphWidth - 60) / this.daysSpan) + 30} ${this.graphHeight - (data.number * (this.graphHeight / this.parameters.graphSettings.max))}`)
            path.setAttribute('id', `graph-line-${datasetIndex}`);
            path.setAttribute('fill', 'transparent');
            path.setAttribute('stroke', dataset.lineColor);
            path.setAttribute('stroke-width', '3px');
            path.setAttribute('stroke-linejoin', 'round');
            this.graphElement.append(path);
          } else {
            let path = document.getElementById(`graph-line-${datasetIndex}`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${daysInPeriod * ((this.graphWidth - 60) / this.daysSpan) + 30} ${this.graphHeight - (data.number * (this.graphHeight / this.parameters.graphSettings.max))}`)
          }
        }

        /* Adding points if allowed */
        if (dataset.showPoint) {
          var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.classList.add(`graph-circle-${datasetIndex}`)
          circle.setAttribute('data-average', data.number);
          circle.setAttribute('data-date', data.date);
          circle.setAttribute('data-amount', data.results.length);
          circle.setAttribute('cx', daysInPeriod * ((this.graphWidth - 60) / this.daysSpan) + 30);
          circle.setAttribute('cy', this.graphHeight - (data.number * (this.graphHeight / this.parameters.graphSettings.max)));
          circle.setAttribute('r', 4);
          circle.setAttribute('fill', '#ffffff');
          circle.setAttribute('stroke', dataset.pointColor);
          circle.setAttribute('stroke-width', '2px');
          this.graphElement.append(circle);
        }

      });

    });
  }

  /* Adding legend */
  #addLegend() {
    if (this.parameters.graphSettings.showLegend) {
      const legendElement = document.createElement('div');
      legendElement.classList.add('basic-graphs-legend');
      this.parentElement.append(legendElement);

      this.parameters.datasets.forEach((dataset, datasetIndex) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('basic-graphs-legend-item');
        legendItem.setAttribute('id', `graph-legend-${datasetIndex}`)
        legendItem.innerHTML += `
          <div class="basic-graphs-legend-item-line">
            <div class="basic-graphs-legend-item-line-point"></div>
          </div>
          <div class="basic-graphs-legend-item-text">${dataset.legendName}</div>
        `
        legendElement.append(legendItem);
        if (dataset.showLine) {
          legendElement.getElementsByClassName('basic-graphs-legend-item-line')[0].style.borderTop = `2px solid ${dataset.lineColor}`;
        }
        if (dataset.showPoint) {
          legendElement.getElementsByClassName('basic-graphs-legend-item-line-point')[0].style.borderColor = dataset.pointColor;
          legendElement.getElementsByClassName('basic-graphs-legend-item-line-point')[0].style.backgroundColor = '#ffffff';
        }
      });

      /* Changing size and position of the legend */
      /* legendElement.style.width = `${this.graphWidth}px`;
      legendElement.style.left = `${this.graphElement.getBoundingClientRect().left}px`;
      legendElement.style.top = `${this.graphElement.getBoundingClientRect().top + this.graphHeight - legendElement.offsetHeight}px`; */

    }
  }

  /* Making legend works */
  #legendEvents() {
    /* Clean. Preventing double clicks */
    $('.basic-graphs-legend-item').off('click');

    $('.basic-graphs-legend-item').click(function () {
      let lineId = $(this).attr('id').replace('legend', 'line');
      let circleClass = $(this).attr('id').replace('legend', 'circle');
      if ($(this).attr('data-vis') === 'false') {
        $(this).attr('data-vis', 'true');
        $(`#${lineId}`).css('opacity', '1');
        $(`.${circleClass}`).css('opacity', '1');
        $(this).removeClass('basic-graphs-legend-item-off');
      } else {
        $(this).attr('data-vis', 'false');
        $(`#${lineId}`).css('opacity', '0');
        $(`.${circleClass}`).css('opacity', '0');
        $(this).addClass('basic-graphs-legend-item-off');
      }
    });
  }

  /* Resizing graph on window resize */
  #resizing() {
    let graph = this.graphElement;
    /* Clean. */
    $(window).off('resize');

    $(window).resize(function () {
      const width = graph.parentElement.offsetWidth;
      const height = Math.round(graph.parentElement.offsetWidth / 1.75);

      this.graphWidth = width;
      this.graphHeight = height;

      graph.style.width = width;
      graph.style.height = height;
    });
  }



  createChart() {
    this.#prepareGraph();
    this.#addGridLines();
    this.#datasetsWork();
    this.#addLegend();
    this.#legendEvents();
    this.#resizing();



    console.log({
      message: 'Created',
      graphElement: this.graphElement,
      data: this.data
    });
  };
}

export const renderGraph = (container, parameters) => {
  const graph = {};

  /* Prepare SVG (re-size, add class) */
  graph.buffContainer = document.createElement('div');
  graph.buffContainer.classList.add('basic-graph-container')
  graph.svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  graph.svg.classList.add('basic-graph');
  graph.svg.setAttribute('id', 'generated-graph');

  container.append(graph.buffContainer);
  graph.buffContainer.append(graph.svg);

  graph.width = graph.buffContainer.parentElement.offsetWidth;
  graph.height = Math.round(graph.buffContainer.parentElement.offsetWidth / 1.75);

  graph.buffContainer.style.width = graph.width;
  graph.buffContainer.style.height = graph.height;

  graph.svg.style.width = graph.width;
  graph.svg.style.height = graph.height;

  const daysSpan = Math.round((parameters.graphSettings.finishDate.getTime() - parameters.graphSettings.startDate.getTime()) / 1000 / 60 / 60 / 24);


  /* Adding grid lines */
  let gapX = Math.round(graph.height / 10);
  let gapY = Math.round(graph.width / 12);

  for (let i = 1; i < 10; i++) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.classList.add('line-graph-grid-line');
    path.setAttribute('d', `M 0 ${i * gapX} L ${graph.width} ${i * gapX}`)
    graph.svg.append(path);
  }
  for (let i = 1; i < 12; i++) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.classList.add('line-graph-grid-line');
    path.setAttribute('d', `M ${i * gapY} 0 L ${i * gapY} ${graph.height}`)
    graph.svg.append(path);
  }


  /* Working with each dataset */
  parameters.datasets.forEach((dataset, datasetIndex) => {
    /* If average and allowed adding all results dots */
    if (dataset.averageGraph && dataset.showAllResults) {
      dataset.data.forEach(data => {
        data.results.forEach(result => {
          let daysInPeriod = Math.round((new Date(result.date).getTime() - new Date(moment().subtract(parameters.graphSettings.periodMonths, 'month')).getTime()) / 1000 / 60 / 60 / 24);

          var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.setAttribute('cx', daysInPeriod * ((graph.width - 60) / daysSpan));
          circle.setAttribute('cy', graph.height - (result.number * (graph.height / parameters.graphSettings.max)));
          circle.setAttribute('r', 3);
          circle.setAttribute('fill', dataset.pointColor);
          graph.svg.append(circle);
        });
      });
    }



    dataset.data.forEach((data, index) => {
      let daysInPeriod = Math.round((new Date(data.date).getTime() - new Date(moment().subtract(parameters.graphSettings.periodMonths, 'month')).getTime()) / 1000 / 60 / 60 / 24);

      /* Adding line if allowed */
      if (dataset.showLine) {
        if (index === 0) {
          let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          /* path.classList.add('mp-line-graph-average-line'); */
          path.setAttribute('d', `M ${daysInPeriod * ((graph.width - 60) / daysSpan) + 30} ${graph.height - (data.number * (graph.height / parameters.graphSettings.max))}`)
          path.setAttribute('id', `graph-line-${datasetIndex}`);
          path.setAttribute('fill', 'transparent');
          path.setAttribute('stroke', dataset.lineColor);
          path.setAttribute('stroke-width', '3px');
          path.setAttribute('stroke-linejoin', 'round');
          graph.svg.append(path);
        } else {
          let path = document.getElementById(`graph-line-${datasetIndex}`);
          path.setAttribute('d', `${path.getAttribute('d')} L ${daysInPeriod * ((graph.width - 60) / daysSpan) + 30} ${graph.height - (data.number * (graph.height / parameters.graphSettings.max))}`)
        }
      }

      /* Adding points if allowed */
      if (dataset.showPoint) {
        var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.classList.add(`graph-circle-${datasetIndex}`)
        circle.setAttribute('data-average', data.number);
        circle.setAttribute('data-date', data.date);
        circle.setAttribute('data-amount', data.results.length);
        circle.setAttribute('cx', daysInPeriod * ((graph.width - 60) / daysSpan) + 30);
        circle.setAttribute('cy', graph.height - (data.number * (graph.height / parameters.graphSettings.max)));
        circle.setAttribute('r', 4);
        circle.setAttribute('fill', '#ffffff');
        circle.setAttribute('stroke', dataset.pointColor);
        circle.setAttribute('stroke-width', '2px');
        graph.svg.append(circle);
      }

    });

  });

  /* Adding legend */
  if (parameters.graphSettings.showLegend) {
    const legendElement = document.createElement('div');
    legendElement.classList.add('basic-graphs-legend');
    graph.buffContainer.append(legendElement);

    parameters.datasets.forEach((dataset, datasetIndex) => {
      const legendItem = document.createElement('div');
      legendItem.classList.add('basic-graphs-legend-item');
      legendItem.setAttribute('id', `graph-legend-${datasetIndex}`)
      legendItem.innerHTML += `
          <div class="basic-graphs-legend-item-line">
            <div class="basic-graphs-legend-item-line-point"></div>
          </div>
          <div class="basic-graphs-legend-item-text">${dataset.legendName}</div>
        `
      legendElement.append(legendItem);
      if (dataset.showLine) {
        legendElement.getElementsByClassName('basic-graphs-legend-item-line')[0].style.borderTop = `2px solid ${dataset.lineColor}`;
      }
      if (dataset.showPoint) {
        legendElement.getElementsByClassName('basic-graphs-legend-item-line-point')[0].style.borderColor = dataset.pointColor;
        legendElement.getElementsByClassName('basic-graphs-legend-item-line-point')[0].style.backgroundColor = '#ffffff';
      }
    });

    /* Changing size and position of the legend */
    /* legendElement.style.width = `${graph.width}px`;
    legendElement.style.left = `${graph.svg.getBoundingClientRect().left}px`;
    legendElement.style.top = `${graph.svg.getBoundingClientRect().top + graph.height - legendElement.offsetHeight}px`; */

  }

  /* Making legend works */
  /* Clean. Preventing double clicks */
  $('.basic-graphs-legend-item').off('click');

  $('.basic-graphs-legend-item').click(function () {
    let lineId = $(this).attr('id').replace('legend', 'line');
    let circleClass = $(this).attr('id').replace('legend', 'circle');
    if ($(this).attr('data-vis') === 'false') {
      $(this).attr('data-vis', 'true');
      $(`#${lineId}`).css('opacity', '1');
      $(`.${circleClass}`).css('opacity', '1');
      $(this).removeClass('basic-graphs-legend-item-off');
    } else {
      $(this).attr('data-vis', 'false');
      $(`#${lineId}`).css('opacity', '0');
      $(`.${circleClass}`).css('opacity', '0');
      $(this).addClass('basic-graphs-legend-item-off');
    }
  });

  /* Resizing graph on window resize */
  /* Clean. */
  $(window).off('resize');

  $(window).resize(function () {
    const width = graph.svg.parentElement.offsetWidth;
    const height = Math.round(graph.parentElement.offsetWidth / 1.75);

    graph.width = width;
    graph.height = height;

    graph.svg.style.width = width;
    graph.svg.style.height = height;
  });
}