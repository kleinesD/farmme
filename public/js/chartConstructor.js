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

export const renderLineGraph = (container, parameters) => {
  const graph = {};
  const datasets = parameters.datasets;

  /* Creating an inside function to re-create graph on re-size */
  let rendering = () => {
    $('.basic-graph-container').remove();

    /* Prepare SVG (re-size, add class) */
    graph.buffContainer = document.createElement('div');
    graph.buffContainer.classList.add('basic-graph-container')
    graph.el = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    graph.el.classList.add('basic-graph');
    graph.el.setAttribute('id', 'generated-graph');

    container.append(graph.buffContainer);
    graph.buffContainer.append(graph.el);

    graph.width = graph.buffContainer.parentElement.offsetWidth;
    if (parameters.graphSettings.boxHeight) {
      graph.height = Math.round(graph.buffContainer.parentElement.offsetHeight);
    } else {
      graph.height = Math.round(graph.buffContainer.parentElement.offsetWidth / (1 + parameters.graphSettings.heightRatio));
    }

    graph.buffContainer.style.width = graph.width;
    graph.buffContainer.style.height = graph.height;

    graph.el.style.width = graph.width;
    graph.el.style.height = graph.height;

    const daysSpan = Math.round((parameters.graphSettings.finishDate.getTime() - parameters.graphSettings.startDate.getTime()) / 1000 / 60 / 60 / 24);


    /* Adding grid lines */
    let gapX = Math.round(graph.height / 10);
    let gapY = Math.round(graph.width / 12);

    for (let i = 1; i < 10; i++) {
      let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.classList.add('line-graph-grid-line');
      path.setAttribute('d', `M 0 ${i * gapX} L ${graph.width} ${i * gapX}`)
      graph.el.append(path);
    }
    for (let i = 1; i < 12; i++) {
      let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.classList.add('line-graph-grid-line');
      path.setAttribute('d', `M ${i * gapY} 0 L ${i * gapY} ${graph.height}`)
      graph.el.append(path);
    }


    /* Working with each dataset */
    datasets.forEach((dataset, datasetIndex) => {
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
            circle.style.opacity = 0.5;
            graph.el.append(circle);
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
            graph.el.append(path);
          } else {
            let path = document.getElementById(`graph-line-${datasetIndex}`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${daysInPeriod * ((graph.width - 60) / daysSpan) + 30} ${graph.height - (data.number * (graph.height / parameters.graphSettings.max))}`)
          }
        }

        /* Adding points if allowed */
        if (dataset.showPoint) {
          var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.classList.add(`graph-point`)
          circle.classList.add(`graph-circle-${datasetIndex}`)
          circle.setAttribute('data-number', data.number);
          circle.setAttribute('data-date', data.date);
          circle.setAttribute('data-tooltip-name', dataset.tooltipName);
          if (data.results) circle.setAttribute('data-amount', data.results.length);
          circle.setAttribute('data-line', `graph-line-${datasetIndex}`);
          circle.setAttribute('cx', daysInPeriod * ((graph.width - 60) / daysSpan) + 30);
          circle.setAttribute('cy', graph.height - (data.number * (graph.height / parameters.graphSettings.max)));
          circle.setAttribute('r', 4);
          circle.setAttribute('fill', '#f0f0f0');
          circle.setAttribute('stroke', dataset.pointColor);
          circle.setAttribute('stroke-width', '2px');
          graph.el.append(circle);
        }

      });

    });

    /* Adding legend */
    if (parameters.graphSettings.showLegend) {
      const legendElement = document.createElement('div');
      legendElement.classList.add('basic-graphs-legend');
      graph.buffContainer.append(legendElement);

      datasets.forEach((dataset, datasetIndex) => {
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
          legendItem.getElementsByClassName('basic-graphs-legend-item-line')[0].style.borderTop = `2px solid ${dataset.lineColor}`;
        }
        if (dataset.showPoint) {
          legendItem.getElementsByClassName('basic-graphs-legend-item-line-point')[0].style.borderColor = dataset.pointColor;
          legendItem.getElementsByClassName('basic-graphs-legend-item-line-point')[0].style.backgroundColor = '#ffffff';
        }
      });

      /* Changing size and position of the legend */
      /* legendElement.style.width = `${graph.width}px`;
      legendElement.style.left = `${graph.el.getBoundingClientRect().left}px`;
      legendElement.style.top = `${graph.el.getBoundingClientRect().top + graph.height - legendElement.offsetHeight}px`; */

    }

    /* Making legend works */
    /* Clean. Preventing double clicks */
    $('.basic-graphs-legend-item').off('click');

    $('.basic-graphs-legend-item').on('click', function () {
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

    /* Adding the tooltips */
    let simpleTooltip = `
      <div class="basic-graph-tooltip">
        <div class="bgt-result-line" id="date-line">
          <p>Дата:</p>
          <p id="tooltip-date">26.01.2001</p>
        </div>
        <div class="bgt-result-line bgt-result-line-color">
          <div class="bgt-result-line-color-el"></div>
          <p>Результат:</p>
          <p id="tooltip-result">25 л.</p>
        </div>
      </div>
    `;

    let detailedTooltip = `
      <div class="basic-graph-tooltip">
        <div class="bgt-header-line"><img src="/img/images/default-cow-image.png"/>
          <div class="bgt-header-line-info">
            <div class="bgt-number">#5026</div>
            <div class="bgt-name">Березка</div>
          </div>
        </div>
        <div class="bgt-result-line" id="date-line">
          <div class="bgt-result-line-color-el"></div>
          <p>Дата:</p>
          <p id="tooltip-date">26.01.2001</p>
        </div>
        <a class="bgt-edit-btn" href="#">Редактировать </a>
      </div>
    `
    $('.basic-graph-container').append(parameters.tooltips.type === 'simple' ? simpleTooltip : detailedTooltip);

    /* Tooltips */

    let prevDataPointDate = new Date();
    graph.el.addEventListener('mousemove', ({ clientX, clientY }) => {
      let point = graph.el.createSVGPoint();
      point.x = clientX;
      point.y = clientY;
      point = point.matrixTransform(graph.el.getScreenCTM().inverse());

      let currentPoint = { dataPoints: [], diff: 0 };

      $('.graph-point').each(function () {
        if (parseFloat($(this).css('opacity')) !== 0) {
          const dataPointX = parseFloat($(this).attr('cx'));

          let diff = Math.abs(dataPointX - point.x);

          if (currentPoint.dataPoints.length === 0 || currentPoint.diff > diff) {
            currentPoint.dataPoints = [];
            currentPoint.dataPoints.push($(this));
            currentPoint.diff = diff;
          } else if (currentPoint.dataPoints.length > 0 && currentPoint.diff === diff) {
            currentPoint.dataPoints.push($(this));
          }
        }
      });

      if (prevDataPointDate.getTime() !== new Date($(currentPoint.dataPoints[0]).attr('data-date')).getTime()) {
        prevDataPointDate = new Date($(currentPoint.dataPoints[0]).attr('data-date'))

        //Showing what points being selected
        $('.graph-point').attr('r', 4);
        currentPoint.dataPoints.forEach(dataPoint => {
          $(dataPoint).attr('r', 6);
        });

        //Adding a tooltip box
        /* $('.mp-tooltip-box').remove();
        $('.mp-animal-graph-container').prepend(`
      <div class="mp-tooltip-box">
      <div class="mp-tooltip-title">${moment($(currentPoint.dataPoints[0]).attr('data-date')).lang('ru').format('MMMM YYYY').charAt(0).toUpperCase() + moment($(currentPoint.dataPoints[0]).attr('data-date')).lang('ru').format('MMMM YYYY').slice(1)}</div>
      <div class="mp-tooltip-info-line">
        <div class="mp-tooltip-info">Результатов:</div>
        <div class="mp-tooltip-info">${$(currentPoint.dataPoints[0]).attr('data-amount') === 'none' ? '&dash;' : $(currentPoint.dataPoints[0]).attr('data-amount')}</div>
      </div>
      <div class="mp-tooltip-devider"></div>
    </div>
      `); */

        $('.bgt-result-line-color').remove();
        currentPoint.dataPoints.forEach((dataPoint, index) => {
          if (index === 0) {
            if (parameters.tooltips.dateUnit === 'month') {
              $('#tooltip-date').text(moment($(dataPoint).attr('data-date')).lang('ru').format('MMMM YYYY').charAt(0).toUpperCase() + moment($(dataPoint).attr('data-date')).lang('ru').format('MMMM YYYY').slice(1))
            } if (parameters.tooltips.dateUnit === 'day') {
              $('#tooltip-date').text(moment($(dataPoint).attr('data-date')).format('DD.MM.YYYY'))
            }

            if (parameters.tooltips.type === 'detailed') {
              $('.bgt-header-line img').attr('src', `/img/images/${$(dataPoint).attr('data-animal-image')}`);
              $('.bgt-number').text(`#${$(dataPoint).attr('data-animal-number')}`);
              $('.bgt-name').text(`${$(dataPoint).attr('data-animal-name')}`);
            }
          }

          let textEl = $('.basic-graph-tooltip').append(`
            <div class="bgt-result-line bgt-result-line-color" data-line="${$(dataPoint).attr('data-line')}">
              <div class="bgt-result-line-color-el"></div>
              <p>${$(dataPoint).attr('data-tooltip-name')}:</p>
              <p id="tooltip-result">${$(dataPoint).attr('data-number')} ${parameters.tooltips.unitText}</p>
            </div>
          `) //.find('.bgt-result-line-color-el').css('background-color', `${$(`#${$(this).attr('data-line')}`).css('stroke')}`);

          $('.bgt-result-line-color').each(function () {
            $(this).find('.bgt-result-line-color-el').css('background-color', $(`#${$(this).attr('data-line')}`).attr('stroke'))
          });
        });

        //Changing the position of a tooltip
        let pointX = parseFloat($(currentPoint.dataPoints[0]).attr('cx'));
        let pointY = parseFloat($(currentPoint.dataPoints[0]).attr('cy'));

        let posTop = $(currentPoint.dataPoints[0]).position().top;
        let posLeft = $(currentPoint.dataPoints[0]).position().left - 50;
        let transform = 'translateY(-50%)';

        if (pointX + $('.basic-graph-tooltip').width() > $('#generated-graph').width()) {
          posLeft = $(currentPoint.dataPoints[0]).position().left - 130 - $('.basic-graph-tooltip').width();
        }
        if (pointY + $('.basic-graph-tooltip').height() / 2 > $('#generated-graph').height()) {
          transform = 'translateY(-150%)'
        }
        if (pointY - $('.basic-graph-tooltip').height() / 2 < 0) {
          transform = 'unset'
        }
        $('.basic-graph-tooltip').css({
          'top': posTop,
          'left': posLeft,
          'transform': transform
        });
      }

    })

  }


  /* Resizing graph on window resize */
  /* Clean. */
  $(window).off('resize');

  $(window).on('resize', function () {
    rendering()
  });

  $(window).trigger('resize');
}


export const renderProgressChart = (container, parameters) => {
  const graph = {};
  const datasets = parameters.datasets;

  /* Creating an inside function to re-create graph on re-size */
  let rendering = () => {
    $('.basic-graph-container').remove();

    /* Prepare SVG (re-size, add class) */
    graph.buffContainer = document.createElement('div');
    graph.buffContainer.classList.add('basic-graph-container')
    graph.buffContainer.classList.add('basic-progress-container')
    graph.el = document.createElement('div');
    graph.el.classList.add('generated-progress-line');
    graph.el.setAttribute('id', 'generated-graph');

    container.append(graph.buffContainer);
    graph.buffContainer.append(graph.el);


    /* Working with each dataset */
    let total = 0;
    datasets.forEach((dataset, datasetIndex) => {
      total += dataset.data
    });
    datasets.forEach((dataset, datasetIndex) => {
      if (!dataset.backgroundColor) {
        $('#generated-graph').append(`<div class="progress-line-data progress-line-data-${datasetIndex}" id="graph-progress-${datasetIndex}" data-data="${dataset.data}" style="width: ${Math.round(dataset.data / total * 100)}%;"></div>`)
      } else {
        $('#generated-graph').append(`<div class="progress-line-data" id="graph-progress-${datasetIndex}" data-data="${dataset.data}" style="background-color=${dataset.backgroundColor} width: ${Math.round(dataset.data / total * 100)}%;"></div>`)
      }
    });

    /* Adding legend */
    if (parameters.graphSettings.showLegend) {
      const legendElement = document.createElement('div');
      legendElement.classList.add('basic-graphs-legend');
      graph.buffContainer.append(legendElement);

      datasets.forEach((dataset, datasetIndex) => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('basic-graphs-legend-item');
        legendItem.setAttribute('id', `graph-legend-${datasetIndex}`)
        legendItem.innerHTML += `
          <div class="basic-graphs-legend-color"></div>
          <div class="basic-graphs-legend-item-text">${dataset.legendName}</div>
        `
        legendElement.append(legendItem);
        $(`#graph-legend-${datasetIndex}`).find('.basic-graphs-legend-color').css('background-color', $(`#graph-progress-${datasetIndex}`).css('background-color'));
      });

    }

    /* Making legend works */
    /* Clean. Preventing double clicks */

    /* Adding the tooltips */
    let simpleTooltip = `
      <div class="basic-graph-tooltip">
      <div class="bgt-result-line bgt-result-line-color">
      <div class="bgt-result-line-color-el"></div>
      <p>Результат:</p>
      <p id="tooltip-result">25 л.</p>
      </div>
      <div class="bgt-result-line" id="percent-line">
        <p>Процент:</p>
        <p id="tooltip-percent">34%</p>
      </div>
      </div>
    `;

    $('.basic-graph-container').append(simpleTooltip);
    $('.basic-graph-tooltip').hide();

    /* Tooltips */
    $('.progress-line-data').on('mouseenter', function () {
      $('#tooltip-result').text(`${$(this).attr('data-data')}`)
      $('#tooltip-percent').text(`${Math.round(parseFloat($(this).attr('data-data')) / total * 100)} %`);
      $('.bgt-result-line-color-el').css('background-color', $(this).css('background-color'));

      $(this).siblings().css('filter', 'brightness(0.25)');
      $('.basic-graph-tooltip').css({ 'top': $(this).position().top - $('.basic-graph-tooltip').height() * 2, 'left': $(this).position().left + $(this).width() / 2 - $('.basic-graph-tooltip').width() / 2 });
      $('.basic-graph-tooltip').css('display', 'flex');
    });

    $('.progress-line-data').on('mouseleave', function () {
      $(this).siblings().css('filter', 'brightness(1)');
      $('.basic-graph-tooltip').hide();
    });

  }


  /* Resizing graph on window resize */
  /* Clean. */
  $(window).off('resize');

  $(window).on('resize', function () {
    rendering()
  });

  $(window).trigger('resize');
}





/* TOOLTIPS TO ADD LATER */
/* Tooltips */
/* const graphEl = document.querySelector('#mp-graph');
let prevDataPointDate = new Date();
graphEl.addEventListener('mousemove', ({ clientX, clientY }) => {
  let point = graphEl.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  point = point.matrixTransform(graphEl.getScreenCTM().inverse());

  let currentPoint = { dataPoints: [], diff: 0 };

  $('.line-graph-data-circle').each(function () {
    if (parseFloat($(this).css('opacity')) !== 0) {
      const dataPointX = parseFloat($(this).attr('cx'));

      let diff = Math.abs(dataPointX - point.x);

      if (currentPoint.dataPoints.length === 0 || currentPoint.diff > diff) {
        currentPoint.dataPoints = [];
        currentPoint.dataPoints.push($(this));
        currentPoint.diff = diff;
      } else if (currentPoint.dataPoints.length > 0 && currentPoint.diff === diff) {
        currentPoint.dataPoints.push($(this));
      }
    }
  });

  if (prevDataPointDate.getTime() !== new Date($(currentPoint.dataPoints[0]).attr('data-date')).getTime()) {
    prevDataPointDate = new Date($(currentPoint.dataPoints[0]).attr('data-date'))

    //Showing what points being selected
    $('.line-graph-data-circle').attr('r', 2);
    currentPoint.dataPoints.forEach(dataPoint => {
      $(dataPoint).attr('r', 3);
    });

    //Adding a tooltip box
    $('.mp-tooltip-box').remove();
    $('.mp-animal-graph-container').prepend(`
  <div class="mp-tooltip-box">
  <div class="mp-tooltip-title">${moment($(currentPoint.dataPoints[0]).attr('data-date')).lang('ru').format('MMMM YYYY').charAt(0).toUpperCase() + moment($(currentPoint.dataPoints[0]).attr('data-date')).lang('ru').format('MMMM YYYY').slice(1)}</div>
  <div class="mp-tooltip-info-line">
    <div class="mp-tooltip-info">Результатов:</div>
    <div class="mp-tooltip-info">${$(currentPoint.dataPoints[0]).attr('data-amount') === 'none' ? '&dash;' : $(currentPoint.dataPoints[0]).attr('data-amount')}</div>
  </div>
  <div class="mp-tooltip-devider"></div>
</div>
  `);

    currentPoint.dataPoints.forEach(dataPoint => {
      if ($('#mp-graph').attr('data-graph-name') === 'milk-average') {
        $('.mp-tooltip-box').append(`
        <div class="mp-tooltip-result-line" >
          <div class="mp-tooltip-marker" style="background-color: ${$(dataPoint).css('stroke')};"></div>
          <div class="mp-tooltip-result-info">Сред. результат</div>
          <div class="mp-tooltip-result">${$(dataPoint).attr('data-average')} л.</div>
        </div>
      `);
      } else if ($('#mp-graph').attr('data-graph-name') === 'milk-total') {
        $('.mp-tooltip-box').append(`
        <div class="mp-tooltip-result-line" >
          <div class="mp-tooltip-marker" style="background-color: ${$(dataPoint).css('stroke')};"></div>
          <div class="mp-tooltip-result-info">Всего молока</div>
          <div class="mp-tooltip-result">${$(dataPoint).attr('data-total')} л.</div>
        </div>
      `);
      } else if ($('#mp-graph').attr('data-graph-name') === 'milk-lact') {
        $('.mp-tooltip-box').append(`
        <div class="mp-tooltip-result-line" >
          <div class="mp-tooltip-marker" style="background-color: ${$(dataPoint).css('stroke')};"></div>
          <div class="mp-tooltip-result-info">Лактация #${$(dataPoint).attr('data-lact')}</div>
          <div class="mp-tooltip-result">${$(dataPoint).attr('data-average')} л.</div>
        </div>
      `);
      }

    });

    //Changing the position of a tooltip
    let pointX = parseFloat($(currentPoint.dataPoints[0]).attr('cx'));
    let pointY = parseFloat($(currentPoint.dataPoints[0]).attr('cy'));

    let posTop = $(currentPoint.dataPoints[0]).position().top;
    let posLeft = $(currentPoint.dataPoints[0]).position().left - 50;
    let transform = 'translateY(-50%)';

    if (pointX + $('.mp-tooltip-box').width() > $('#mp-graph').width()) {
      posLeft = $(currentPoint.dataPoints[0]).position().left - 130 - $('.mp-tooltip-box').width();
    }
    if (pointY + $('.mp-tooltip-box').height() / 2 > $('#mp-graph').height()) {
      transform = 'translateY(-150%)'
    }
    if (pointY - $('.mp-tooltip-box').height() / 2 < 0) {
      transform = 'unset'
    }
    $('.mp-tooltip-box').css({
      'top': posTop,
      'left': posLeft,
      'transform': transform
    });
  }

}) */