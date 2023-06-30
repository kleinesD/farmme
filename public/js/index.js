import $ from 'jquery';
import '../style/main.scss';
import 'animate.css';
import anime from 'animejs/lib/anime.es.js';
import * as d3 from "d3";
import moment, { max } from 'moment';
import validator from 'validator';
import randomstring from 'randomstring';
import { simpleLineChart, threeLinesChart, doughnutChart, multipleLinesChart, multipleLinesChartOneActive, mainPageCharts } from './charts';
import { addAnimal, editAnimal, addAnimalResults, editAnimalResults, deleteAnimalResults, writeOffAnimal, writeOffMultipleAnimals, bringBackAnimal, getAnimalByNumber, checkByField } from './animalHandler';
import { addVetAction, editVetAction, addVetProblem, editVetProblem, addVetTreatment, editVetTreatment, addVetScheme, startVetScheme, editStartedVetScheme, editVetScheme, deleteVetDoc } from './vetHandler';
import { addReminder, editReminder, deleteReminder, getModuleAndPeriod, getFarmReminders } from './calendarHandler';
import { addInventory, editInventory } from './inventoryHandler'
import { login, logout, checkEmail } from './authHandler';
import { editFarm, editUser, addCategory } from './manageHandler';
import { addConfirmationEmpty } from './interaction';
import { multiLinearChart, renderLineGraph, renderProgressChart } from './chartConstructor';
import { getMilkingProjection } from './milkingProjection';
import { addClient, editClient, addProduct, addProductReturn, editProduct, editProductReturn, deleteProduct } from './distributionHandler';
import { searchEngine } from './search';


$(document).ready(async function () {

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* ALL MODULES STUFF */
  /////////////////////////
  /////////////////////////
  /////////////////////////

  /* Remove title from every ion-icon */
  $('ion-icon').each(function () { $(this).find('title').text('') });
  ///////////////////////
  /* MENU */
  /////////////////////// 
  if (document.querySelector('.main-menu')) {
    /* Showing the menu on button click */
    $('.main-menu-btn').on('click', function () {
      if ($(this).find('ion-icon').attr('name') !== 'close') {
        $(this).find('ion-icon').css('transform', 'rotate(180deg)')
        $(this).find('ion-icon').attr('name', 'close')
        $('.main-menu').css('display', 'flex');
      } else {
        $(this).find('ion-icon').css('transform', 'rotate(0deg)')
        $(this).find('ion-icon').attr('name', 'apps')
        $('.main-menu').css('display', 'none');
      }
    });

    /* Working with menu title */
    $('.menu-item-title').on('click', function () {
      if (!$(this).parent().hasClass('menu-item-box-openned')) {
        $('.menu-item-link').removeClass('animate__animated animate__fadeIn animate__fadeOut');
        $('.menu-item-link').hide();
        $('.menu-item-box-openned').removeClass('menu-item-box-openned');
        $(this).parent().addClass('menu-item-box-openned');
        $(this).parent().find('.menu-item-link').addClass('animate__animated animate__fadeIn').show();
      } else {
        $(this).parent().removeClass('menu-item-box-openned');
        $('.menu-item-link').addClass('animate__animated animate__fadeOut').hide();
      }
    });



    /* Logout btn */
    $('#logout-btn').click(async function () {
      const result = await logout();

      if (result) location.assign('/login');
    });

    /* Back button */
    $('.main-menu-back-btn').on('click', function () {
      history.back(-1)
    });

  }

  ///////////////////////
  /* SEARCH ENGINE */
  /////////////////////// 
  if (document.querySelector('.main-search-block')) {
    searchEngine($('.main-search-block').attr('data-user-id'));
  }

  ///////////////////////
  /* RIGHT CLICK MENU */
  /////////////////////// 
  if (document.querySelector('.rc-menu')) {
    $('body').on('mousedown', function (e) {
      if (e.which === 3) {
        let hor = '0%';
        let ver = '0%';
        if (e.pageX + parseFloat($('.rc-menu').width()) > parseFloat($(window).width())) {
          hor = '-100%'
        }
        if (e.pageY + parseFloat($('.rc-menu').height()) > parseFloat($(window).height())) {
          ver = '-100%'
        }
        $('.rc-menu').css({
          'top': e.pageY,
          'left': e.pageX,
          'transform': `translate(${hor}, ${ver})`
        }).show(0);
      }
    });

    $(window).on('scroll', function () {
      $('.rc-menu').hide()
    });

    $('body').click(function (e) {
      if (e.target.id !== 'rcm' && e.target.parentElement.id !== 'rcm' && e.target.parentElement.parentElement.id !== 'rcm') {
        $('.rc-menu').hide()
      }
    });
  }

  ///////////////////////
  /* For all standart inputs */
  ///////////////////////
  if (document.querySelector('.common-form')) {
    /* Toggling password visibility */
    $('.pass-visivility-btn').click(function () {
      if ($(this).find('ion-icon').attr('name') === 'eye-off-outline') {
        $(this).find('ion-icon').attr('name', 'eye-outline');
        $(this).parent().find('input').attr('type', 'text');
      } else {
        $(this).find('ion-icon').attr('name', 'eye-off-outline');
        $(this).parent().find('input').attr('type', 'password');
      }
    });
  }

  ///////////////////////
  /* LOGIN PAGE*/
  ///////////////////////
  if (document.querySelector('#login-section')) {
    $('#login-form').submit(async function (e) {
      e.preventDefault();

      if (!validator.isEmail($('#email').val())) {
        $('#email').parent().find('.input-warning-text').remove();
        $('#email').parent().append(`<div class="input-warning-text">Введите действительный адрес почты</div>`);
      }

      if ($('#password').val().length < 6) {
        $('#password').parent().find('.input-warning-text').remove();
        $('#password').parent().append(`<div class="input-warning-text">Введите пароль</div>`);
      }

      if (validator.isEmail($('#email').val()) && $('#password').val().length >= 6) {
        $('.input-warning-text').remove();

        const email = $('#email').val();
        const password = $('#password').val();

        $('.common-form-btn').append(`<div class="mini-loader"></div>`);
        $('.mini-loader').css({ 'position': 'absolute', 'right': '-35px' });

        const result = await login({ email, password });

        if (result) location.assign('/');

        $('.mini-loader').remove();
      }
    });


    /* TESTING THE NEW CHART STRUCTURE ** TO DELETE OR MOVE ** */
    /* Getting all the data */
    let milkingData = [];
    $('.mp-graph-data').each(function () {
      milkingData.push({
        number: parseFloat($(this).attr('data-result')),
        lactationNumber: parseFloat($(this).attr('data-lact')),
        date: new Date($(this).attr('data-date'))
      });
    });

    milkingData.sort((a, b) => a.date - b.date);


    let milkingByLact = [];

    milkingData.forEach((result, index, array) => {

      /* Preparing second array for average line */
      if (milkingByLact.length < 1) {
        milkingByLact.push({ lactationNumber: result.lactationNumber, results: 1 })
      } else {
        let toPush = true;
        for (let i = 0; i < milkingByLact.length; i++) {
          if (milkingByLact[i].lactationNumber === result.lactationNumber) {
            milkingByLact[i].results++;
            toPush = false;
          }
        }

        if (toPush) {
          milkingByLact.push({ lactationNumber: result.lactationNumber, results: 1 });
        }
      }
    });

    const parameters = {
      graphSettings: {
        showLegend: true,
      },
      tooltips: {
        description: 'Результатов:',
        unitText: ''
      },
      datasets: []
    };

    milkingByLact.forEach((data) => {
      parameters.datasets.push({ legendName: `Лактация #${data.lactationNumber}`, data: data.results });
    });

    //const graph = new multiLinearChart(document.getElementById('login-section'), parameters).createChart();

    //const graph = renderProgressChart(document.getElementById('login-section'), parameters);



    /* let milkingData = [];
    $('.mp-graph-data').each(function () {
      if (new Date($(this).attr('data-date')) > new Date(moment().subtract(12, 'month'))) {
        milkingData.push({
          number: parseFloat($(this).attr('data-result')),
          lactationNumber: parseFloat($(this).attr('data-lact')),
          date: new Date($(this).attr('data-date'))
        });
      }
    });

    milkingData.sort((a, b) => a.date - b.date);

    let milkingAverage = [];

    milkingData.forEach((result, index, array) => {
      let daysInPeriod = Math.round((new Date(result.date).getTime() - new Date(moment().subtract(12, 'month')).getTime()) / 1000 / 60 / 60 / 24);

      // Preparing second array for average line
      if (milkingAverage.length < 1) {
        milkingAverage.push({ date: result.date, results: [result] })
      } else {
        let toPush = true;
        for (let i = 0; i < milkingAverage.length; i++) {
          if (moment(milkingAverage[i].date).month() === moment(result.date).month() && moment(milkingAverage[i].date).year() === moment(result.date).year()) {
            milkingAverage[i].results.push(result);
            toPush = false;
          }
        }

        if (toPush) {
          milkingAverage.push({ date: result.date, results: [result] });
        }
      }
    });


    //Counting averages and adding lines
    milkingAverage.forEach((result, index, array) => {
      let daysInPeriod = Math.round((new Date(result.date).getTime() - new Date(moment().subtract(12, 'month')).getTime()) / 1000 / 60 / 60 / 24);
      let total = 0
      result.results.forEach(el => total += el.number);
      result.number = parseFloat((total / result.results.length).toFixed(1));
    });



    const parameters = {
      graphSettings: {
        timelineType: 'date',
        startDate: new Date(moment().subtract(12, 'month')),
        finishDate: new Date(),
        periodMonths: 12,
        min: 0,
        max: 50,
        showLegend: true,
        boxHeight: true,
        //heightRatio: 0.75
      },
      tooltips: {
        type: 'simple', // Detailed or simple
        description: 'Сред. результат',
        unitText: 'л.',
        dateUnit: 'month'
      },
      datasets: [
        {
          showPoint: true,
          pointColor: '#f4a261',
          showLine: true,
          lineColor: '#264653',
          averageGraph: true,
          showAllResults: true,
          breakLactations: false,
          legendName: 'Молока в среднем',
          data: milkingAverage
        }
      ]
    };

    //const graph = new multiLinearChart(document.getElementById('login-section'), parameters).createChart();
    const graph = renderLineGraph(document.getElementById('login-section'), parameters); */
  }

  /* ///////////////////////
  /* For all block inputs */
  /////////////////////// */
  if (document.querySelector('.ai-form-container')) {
    /* Select block */
    $('.ai-input-select').on('click', function () {
      if ($(this).parent().attr('data-state') !== 'show') {
        $(this).parent().find('.ai-select-block').show();
        $(this).parent().attr('data-state', 'show');
        anime({ targets: $(this).parent().find('.ai-select-line')[0], width: ['80%'], opacity: 0, easing: 'easeOutQuint' });
      } else {
        $(this).parent().find('.ai-select-block').hide();
        $(this).parent().attr('data-state', 'hide');
        anime({ targets: $(this).parent().find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });

        /* if ($(this).val().length === 0) {
          $(this).parent().find('.ai-select-item-selected').removeClass('ai-select-item-selected');

          $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
        } */
      }

    });

    $('.ai-input-select').on('keyup change', function () {
      let val = $(this).val();
      let container = $(this).parent().find('.ai-select-block');
      $(this).parent().find('.ai-select-item').each(function () {
        let name = $(this).find('.ai-select-name').text().replace('#', '')
        let subName = $(this).find('.ai-select-sub-name').text().replace('#', '')

        if (name.includes(val) || subName.includes(val)) {
          $(this).detach().prependTo(container);
        }
      });
      $(this).parent().find('.ai-select-item').each(function () {
        let name = $(this).find('.ai-select-name').text().replace('#', '')
        let subName = $(this).find('.ai-select-sub-name').text().replace('#', '')
        if (name.startsWith(val) || subName.startsWith(val)) {
          $(this).detach().prependTo(container);
        }
      });
    });

    $('.ai-select-item').on('click', function () {
      $(this).parent().find('.ai-select-item-selected').removeClass('ai-select-item-selected');
      $(this).addClass('ai-select-item-selected')
      $(this).parent().hide();
      $(this).parent().parent().attr('data-state', 'hide');
      anime({ targets: $(this).parent().parent().find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });

      if ($(this).parent().find('.ai-select-item-selected').length > 0) {
        if ($(this).parent().parent().find('.ai-input-marker-s').length === 0) {
          $(this).parent().parent().append(`
        <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
          <ion-icon name="checkmark-sharp"></ion-icon>
        </div>`)
          //setTimeout(() => { $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__pulse') }, 1500)
        }
      } else {
        $(this).parent().parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().parent().find('.ai-input-marker-s').remove() }, 800)
      }

      /* Select action for different select inputs */
      /* Breed */
      if ($(this).parent().parent().hasClass('breed-select')) {
        $(this).parent().parent().find('.ai-input-select').val($(this).find('.ai-select-name').text());
        $(this).parent().parent().find('.ai-input-select').attr('data-rus', $(this).attr('data-rus'));
        $(this).parent().parent().find('.ai-input-select').attr('data-eng', $(this).attr('data-eng'));
      }

      /* Selectors with id */
      if ($(this).parent().parent().hasClass('id-select')) {
        $(this).parent().parent().find('.ai-input-select').val(`${$(this).find('.ai-select-name').text()} ${$(this).find('.ai-select-sub-name').text()}`);
        $(this).parent().parent().find('.ai-input-select').attr('data-id', $(this).attr('data-id'));
      }
    });



    /* Required block explanation */
    $('.ai-input-marker-r').on('mouseenter', function () {
      $(this).parent().find('.ai-input-explain-block-required').css('opacity', '1');
    });
    $('.ai-input-marker-r').on('mouseleave', function () {
      $(this).parent().find('.ai-input-explain-block-required').css('opacity', '0');
    });

    /* Text input */
    $('.ai-input-text').on('keyup change', function () {
      if (!$(this).hasClass('ai-input-validation')) {
        if ($(this).val().length > 0) {
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
          </div>`)

            $(this).addClass('ai-valid-input');
          }
        } else {
          $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)

          $(this).removeClass('ai-valid-input');
        }
      }
    });

    /* Simple date input */
    $('.ai-input-date').on('keyup change', function () {
      if (!$(this).hasClass('ai-input-validation')) {
        if ($(this).val() !== '') {
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
          </div>`)

            $(this).addClass('ai-valid-input')
          }
        } else {
          $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)

          $(this).removeClass('ai-valid-input');
        }
      }
    });

    /* Pickers */
    $('.ai-pick').on('click', function () {
      if (!$(this).hasClass('ai-pick-restricted')) {
        if ($(this).parent().hasClass('ai-input-block-pick-one')) {
          $(this).parent().find('.ai-pick-active').removeClass('ai-pick-active');
          $(this).addClass('ai-pick-active');
        } else if ($(this).parent().hasClass('ai-input-block-pick-many')) {
          if (!$(this).hasClass('ai-pick-active')) {
            $(this).addClass('ai-pick-active');
          } else {
            $(this).removeClass('ai-pick-active');
          }
        }
      }


      if ($(this).parent().find('.ai-pick-active').length > 0) {
        if ($(this).parent().find('.ai-input-marker-s').length === 0) {
          $(this).parent().append(`
        <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
          <ion-icon name="checkmark-sharp"></ion-icon>
        </div>`)
          //setTimeout(() => { $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__pulse') }, 1500)
        }
      } else {
        $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
      }

    });

    /* Preventing the number input for inserting the negative number */
    $('body').on('change keyup', 'input[type=number]', function () {
      if (parseFloat($(this).val()) < 0) {
        $(this).val(Math.abs(parseFloat($(this).val())));
      }
    });

    /* Simple multiple block validation */
    $('.ai-input-half').on('keyup click change', function () {
      if ($(this).hasClass('ai-input-half-text')) {
        if (!$(this).hasClass('ai-input-validation')) {
          if ($(this).val().length > 0) {
            $(this).addClass('ai-valid-input');
          } else {
            $(this).removeClass('ai-valid-input');
          }
        }
      }

      if ($(this).hasClass('ai-input-half-date')) {
        if (!$(this).hasClass('ai-input-validation')) {
          if ($(this).val() !== '') {
            $(this).addClass('ai-valid-input');
          } else {
            $(this).removeClass('ai-valid-input');
          }
        }
      }

      if ($(this).parent().parent().find('.ai-valid-input').length === $(this).parent().parent().find('.ai-input-half').length) {
        if ($(this).parent().parent().find('.ai-input-marker-s').length === 0) {
          setTimeout(() => {
            $(this).parent().parent().append(`
          <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
          </div>`)
          }, 801);

        }

      } else if ($(this).parent().parent().find('.ai-valid-input').length !== $(this).parent().parent().find('.ai-input-half').length) {
        $(this).parent().parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().parent().find('.ai-input-marker-s').remove() }, 800)
      }
    });












    $('.aa-pick-box-one').find('.aa-pick').click(function () {
      if (!$(this).hasClass('aa-pick-picked')) {
        $(this).addClass('aa-pick-picked').siblings().removeClass('aa-pick-picked');
      } else {
        $(this).removeClass('aa-pick-picked');
      }
    });
    $('.aa-pick-box-few').find('.aa-pick').click(function () {
      if (!$(this).hasClass('aa-pick-picked')) {

        $(this).addClass('aa-pick-picked');
      } else {
        $(this).removeClass('aa-pick-picked');

      }
    });

    /* Search block */
    $('.aa-search-input').on('click', function (e) {
      /* $('body').off('click'); */
      let currentInput = e.target;
      let currentInputJquery = $(this);

      $(this).attr('placeholder', $(this).attr('data-placeholder'));

      if ($(this).parent().find('.animal-search-block').css('display') === 'flex') {
        $(this).parent().find('.animal-search-block').hide();
      } else {
        $(this).parent().find('.animal-search-block').show().css('display', 'flex');
      }

      /* $('body').click(function (e) {
        if (currentInput !== e.target && e.target.parentElement.id !== `${currentInput.id}-search-block`) {
          $('.aa-search-input').attr('placeholder', '');
          $(currentInputJquery).parent().find('.animal-search-block').hide();
        }

      }); */
    });


    let searchBuffer;
    $('.aa-animal-search').keyup(function () {
      let currentValue = $(this).val().toLowerCase();
      let parentContainer = $(this).parent().find('.animal-search-block');
      if (currentValue !== searchBuffer) {
        if (currentValue.startsWith('#')) {
          $(this).parent().find('.animal-search-block').find('.animal-search-item').each(function () {
            if ($(this).find('.animal-search-number').text().toLowerCase().startsWith(currentValue) && currentValue !== '#' && currentValue.length > 0) {
              let elementToTop = $(this).detach().prependTo(parentContainer);
            }
          });
        } else {
          $(this).parent().find('.animal-search-block').find('.animal-search-item').each(function () {
            if ($(this).find('.animal-search-name').text().toLowerCase().startsWith(currentValue) && currentValue.length > 0) {
              let elementToTop = $(this).detach().prependTo(parentContainer);
            }
          });
        }
        searchBuffer = currentValue;
      }
    });

    let searchBuffer2
    $('.aa-breed-search').keyup(function () {
      let currentValue = $(this).val().toLowerCase();
      let parentContainer = $(this).parent().find('.animal-search-block');
      if (currentValue !== searchBuffer2) {

        $(this).parent().find('.animal-search-block').find('.animal-search-item').each(function () {
          if ($(this).find('.animal-search-name').text().toLowerCase().startsWith(currentValue) && currentValue.length > 0) {
            let elementToTop = $(this).detach().prependTo(parentContainer);
          }
        });

        searchBuffer2 = currentValue;
      }
    });

    let searchBuffer3
    $('.aa-scheme-search').keyup(function () {
      let currentValue = $(this).val().toLowerCase();
      let parentContainer = $(this).parent().find('.animal-search-block');
      if (currentValue !== searchBuffer3) {

        $(this).parent().find('.animal-search-block').find('.animal-search-item').each(function () {
          if ($(this).find('.animal-search-name').text().toLowerCase().startsWith(currentValue) && currentValue.length > 0) {
            let elementToTop = $(this).detach().prependTo(parentContainer);
          }
        });

        searchBuffer3 = currentValue;
      }
    });

    $('.animal-search-item').click(function () {
      let currentInputJquery = $(this).parent().parent().find('input');
      currentInputJquery.trigger('focus');
      currentInputJquery.val(`${$(this).find('.animal-search-name').text()} ${$(this).find('.animal-search-number').text()}`);
      currentInputJquery.attr('data-id', $(this).attr('data-id'));
      currentInputJquery.attr('data-rus', $(this).attr('data-rus'));
      currentInputJquery.attr('data-eng', $(this).attr('data-eng'));

      $(currentInputJquery).attr('placeholder', '');
      $(currentInputJquery).parent().find('.animal-search-block').hide();
      $(currentInputJquery).blur();

    });

    /* Add multiple animals blocks */
    $('#multiple-animals-search-block').find('.animal-search-item').click(function () {
      let contId = $(this).parent().attr('id').replace('search-block', 'container');
      $(`#${contId}`).parent().show().animate({ 'opacity': '1' }, 500);
      $(this).parent().parent().find('.aa-search-input').val('');
      /* $(this).parent().parent().find('.aa-search-input').trigger('focus'); */
      $(this).css({ 'pointer-events': 'none' });
      $(this).children().css({ 'opacity': '0.5' });

      let id = $(this).attr('data-id');
      let number = $(this).attr('data-number');

      $(`#${contId}`).append(
        `<div class='ar-selected-animals-item' data-id='${id}' data-number='${number}'>
          #${number}
          <div class='ar-selected-animals-remove'>
            <ion-icon name="close"></ion-icon>
          </div>
        </div>`)
    });

    $('.ar-selected-animals').delegate('.ar-selected-animals-item', 'click', function () {
      let blockId = $(this).parent().attr('id').replace('container', 'search-block');
      let id = $(this).attr('data-id');
      let parentEl = $(this).parent();

      $(`#${blockId}`).find('.animal-search-item').each(function () {
        if ($(this).attr('data-id') === id) {
          $(this).css({ 'pointer-events': 'auto' });
          $(this).children().css({ 'opacity': '1' });
        }
      });

      $(this).remove();
      if (parentEl.children().length === 0) {
        parentEl.parent().hide();
      }
    });

    /* Advanced select block */
    $('body').on('click', '.aa-select-box', function (e) {
      if ($(this).find('ion-icon').attr('name') === 'chevron-down') {
        $(this).find('.aa-select-options-box').show();
        $(this).find('ion-icon').attr('name', 'chevron-up');
      } else if ($(this).find('ion-icon').attr('name') === 'chevron-up') {
        if (e.target.parentElement.classList[0] !== 'aa-select-options-box' && e.target.parentElement.parentElement.classList[0] !== 'aa-select-options-box') {
          $(this).find('.aa-select-options-box').hide();
          $(this).find('ion-icon').attr('name', 'chevron-down');
        } else if (e.target.classList[0] === 'aa-select-option') {
          $(this).find('.aa-select-options-box').hide();
          $(this).find('ion-icon').attr('name', 'chevron-down');
        }
      }
    });

    $('body').on('click', '.aa-select-option', function () {
      $(this).siblings().removeClass('aa-select-option-selected');
      $(this).addClass('aa-select-option-selected');
      $(this).parent().parent().attr('data-value', $(this).attr('id'));
      $(this).parent().parent().find('.aa-select-text').text($(this).text());
    });

    /* Detailed info show */
    $('.detailed-info-icon').on('mouseenter', function () {
      $(this).parent().find('.detailed-info-text').show();
    });
    $('.detailed-info-icon').on('mouseleave', function () {
      $(this).parent().find('.detailed-info-text').hide();
    });

    /* Check boxes */
    $('.aa-check-box').on('click', function () {
      if (!$(this).find('.aa-check-box-inner').hasClass('aa-check-box-checked')) {
        $(this).find('.aa-check-box-inner').addClass('aa-check-box-checked')
      } else {
        $(this).find('.aa-check-box-inner').removeClass('aa-check-box-checked')
      }
    });

  }

  ///////////////////////
  /* ALL BIG CALENDARS */
  ///////////////////////
  if (document.querySelector('.big-calendar-container')) {
    let selectedMonth = moment();

    /* Working with a big calendar */
    $('.bc-big-move-btn').click(async function () {
      if ($(this).attr('data-state') !== 'first-click') {
        if ($(this).attr('id') === 'prev-big-month') {
          selectedMonth = moment(selectedMonth).subtract(1, 'months')
        } else if ($(this).attr('id') === 'next-big-month') {
          selectedMonth = moment(selectedMonth).add(1, 'months')
        }
      } else {
        $(this).attr('data-state', 'not-first-click');
      }


      /* Set current month and year */
      let curRusMonth = moment(selectedMonth).locale('ru').format('MMMM');
      let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
      const curYear = moment(selectedMonth).format('YYYY');
      $('.bc-full-calendar-title').text(`${rusMonth} ${curYear}`);

      /* Clearing the calendar from previous month */
      $('.bc-main-calendar-column').each(function () { $(this).empty() });

      /* Adding days of the month */
      let daysInMonth = moment(selectedMonth).daysInMonth();
      let daysBeforeMonth = moment(selectedMonth).date(1).day() === 0 ? 6 : moment(selectedMonth).date(1).day() - 1;
      let daysAfterMonth = 7 - moment(selectedMonth).date(daysInMonth).day()
      let totalDays = daysInMonth + daysBeforeMonth + daysAfterMonth;

      let visCalStart = moment(selectedMonth).date(1 - daysBeforeMonth);

      for (let i = 0; i < totalDays; i++) {
        let date = moment(visCalStart).add(i, 'days');
        let monthDay = moment(date).date();
        let weekDay = moment(date).day();

        let otherMonth = moment(date).month() !== moment(selectedMonth).month() ? 'bc-date-other' : '';
        let pastDay = moment(date) < moment() ? 'bc-date-past' : '';

        let isToday = date.startOf('day').isSame(moment().startOf('day')) ? 'bc-date-now' : '';

        $(`#weekday-column-${weekDay}`).append(`
        <div class="bc-main-calendar-day ${otherMonth} ${pastDay} ${isToday}" data-date="${new Date(date)}">
          <div class="bc-main-calendar-day-number">${monthDay}</div>
          <div class="bc-reminder-container" data-date="${new Date(date)}"></div>
        </div>
      `)
      }

      //console.log(moment(selectedMonth).startOf('month'), moment(selectedMonth).endOf('month'));
      let allDates = $('.bc-reminder-container');
      let from = moment($(allDates[0]).attr('data-date')).startOf('day');
      let to = moment($(allDates[allDates.length - 1]).attr('data-date')).endOf('day');
      let farmId = $('.big-calendar-container').attr('data-farm-id');

      const reminders = await getFarmReminders(from, to);

      let allActions = [...reminders];
      allActions.sort((a, b) => a.date - b.date);

      /* Adding quick info about each day reminders */
      $('.bc-reminder-container').each(async function () {
        const date = moment($(this).attr('data-date'));

        let start = new Date(date.startOf('day'));
        let end = new Date(date.endOf('day'));

        let dayActions = [];
        allActions.forEach((action) => {
          let actionDate = new Date(action.date);
          if (start <= actionDate && actionDate <= end) {
            dayActions.push(action)
          }
        });


        if (dayActions.length > 0) {
          let isMore = dayActions.length > 2 ? `<div class="bc-date-more-btn">+ ${dayActions.length - 2}</div>` : '';
          if (dayActions.length < 2) {
            $(this).append(`
            <div class="bc-date-quick bc-date-quick-${dayActions[0].module}">
              <div class="bc-date-quick-time">${moment(dayActions[0].date).format('HH:mm')}</div>
              <div class="bc-date-quick-title">${dayActions[0].name}</div>
            </div>
          `);
          } else if (dayActions.length >= 2) {
            $(this).append(`
            <div class="bc-date-quick bc-date-quick-${dayActions[0].module}">
              <div class="bc-date-quick-time">${moment(dayActions[0].date).format('HH:mm')}</div>
              <div class="bc-date-quick-title">${dayActions[0].name}</div>
            </div>
            <div class="bc-date-quick bc-date-quick-${dayActions[1].module}">
              <div class="bc-date-quick-time">${moment(dayActions[1].date).format('HH:mm')}</div>
              <div class="bc-date-quick-title">${dayActions[1].name}</div>
            </div>
            ${isMore}
          `);
          }

        }

      });

    });

    /* Changing categories */
    $('.bc-category').click(function () {
      if ($(this).find('.bc-category-checkbox').hasClass('bc-category-checked')) {
        $(this).find('.bc-category-checkbox').removeClass('bc-category-checked');
        $(`.${$(this).find('.bc-category-checkbox').attr('id').replace('bc-category', 'bc-date-quick')}`).hide();
      } else {
        $(this).find('.bc-category-checkbox').addClass('bc-category-checked');
        $(`.${$(this).find('.bc-category-checkbox').attr('id').replace('bc-category', 'bc-date-quick')}`).show();

      }
    });

    /* Working with a small calendar */
    $('.bc-small-move-btn').click(async function () {
      if ($(this).attr('data-state') !== 'first-click') {
        if ($(this).attr('id') === 'prev-small-month') {
          selectedMonth = moment(selectedMonth).subtract(1, 'months')
        } else if ($(this).attr('id') === 'next-small-month') {
          selectedMonth = moment(selectedMonth).add(1, 'months')
        }
      } else {
        $(this).attr('data-state', 'not-first-click');
      }


      /* Set current month and year */
      let curRusMonth = moment(selectedMonth).locale('ru').format('MMMM');
      let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
      const curYear = moment(selectedMonth).format('YYYY');
      $('.bc-small-calendar-title').text(`${rusMonth} ${curYear}`);

      /* Clearing the calendar from previous month */
      $('.bc-small-calendar-weekday-column').each(function () { $(this).empty() });

      /* Adding days of the month */
      let daysInMonth = moment(selectedMonth).daysInMonth();
      let daysBeforeMonth = moment(selectedMonth).date(1).day() === 0 ? 6 : moment(selectedMonth).date(1).day() - 1;
      let daysAfterMonth = 7 - moment(selectedMonth).date(daysInMonth).day()
      let totalDays = daysInMonth + daysBeforeMonth + daysAfterMonth;

      let visCalStart = moment(selectedMonth).date(1 - daysBeforeMonth);

      for (let i = 0; i < totalDays; i++) {
        let date = moment(visCalStart).add(i, 'days');
        let monthDay = moment(date).date();
        let weekDay = moment(date).day();

        let otherMonth = moment(date).month() !== moment(selectedMonth).month() ? 'bc-small-date-other' : '';
        //let pastDay = moment(date) < moment() ? 'bc-date-past' : '';

        let isToday = date.startOf('day').isSame(moment().startOf('day')) ? 'bc-small-date-now' : '';

        $(`#small-weekday-column-${weekDay}`).append(`
        <div class="bc-small-calendar-weekday ${otherMonth} ${isToday}" data-date="${new Date(date)}">${monthDay}</div>
      `)
      }

    });

    $('#prev-big-month').trigger('click');
    $('#prev-small-month').trigger('click');

    /* Working with reminders */
    /* Showing all reminder for that day */
    let allActions;
    $('.bc-main-calendar-column').on('click', '.bc-main-calendar-day', async function () {
      $('.bc-info-detailed').hide();
      const date = new Date($(this).attr('data-date'));
      const dayStart = new Date(moment(date).startOf('day'));
      const dayEnd = new Date(moment(date).endOf('day'));

      const reminders = await getFarmReminders(dayStart, dayEnd);

      allActions = [...reminders];
      allActions.sort((a, b) => a.date - b.date);

      $('.bc-info-block').css('display', 'flex');
      $('.bc-info-reminders-conatiner').empty();
      let rusDate = moment(date).lang('ru').format('MMMM DD, YYYY');
      rusDate = rusDate.charAt(0).toUpperCase() + rusDate.slice(1);
      $('.bc-info-block-title').text(rusDate)
      allActions.forEach((action, index) => {
        let note = '';
        if (action.note) note = action.note
        $('.bc-info-reminders-conatiner').append(`
          <div class="bc-info-reminder" data-index="${index}">
            <div class="bc-info-reminder-time bc-info-reminder-time-${action.module}">${moment(action.date).format('HH:mm')}</div>
            <div class="bc-info-reminder-title">${action.name}</div>
            <div class="bc-info-reminder-sub-title">${note}</div>
          </div>
        `);

      });
    });

    /* Showing detailed reminder */
    $('.bc-info-reminders-conatiner').on('click', '.bc-info-reminder', function () {
      $('.bc-info-detailed').show();
      $('.bc-info-detailed').css('background-color', $(this).find('.bc-info-reminder-time').css('color'));
      let reminder = allActions[parseFloat($(this).attr('data-index'))];

      $('#reminder-title').text(reminder.name)
      let rusDate = moment(reminder.date).lang('ru').format('MMMM DD YYYY, HH:mm');
      rusDate = rusDate.charAt(0).toUpperCase() + rusDate.slice(1);
      let rusWeekDay = moment(reminder.date).lang('ru').format('dddd');
      rusWeekDay = rusWeekDay.charAt(0).toUpperCase() + rusWeekDay.slice(1);
      $('#reminder-time').text(`${rusWeekDay}, ${rusDate}`)

      if (reminder.note) {
        $('#reminder-note').parent().parent().css('display', 'flex');
        $('#reminder-note').text(reminder.note)
      } else {
        $('#reminder-note').parent().parent().hide();
      }

      $('.bc-info-detailed-edit').attr('href', `/edit-reminder/${reminder._id}`);

      if (reminder.user) {
        $('#reminder-user-name').parent().parent().parent().parent().css('display', 'flex');
        $('#reminder-user-name').text(`${reminder.user.firstName} ${reminder.user.lastName}`)
        $('#reminder-user-title').text(reminder.user.role)
      } else {
        $('#reminder-user-name').parent().parent().parent().parent().hide();
      }

      if (reminder.animal) {
        $('#reminder-animal-number').parent().parent().parent().parent().css('display', 'flex');
        $('#reminder-animal-number').text(`#${reminder.animal.number}`)
        if (reminder.animal.name) {
          $('#reminder-animal-name').show();
          $('#reminder-animal-name').text(reminder.animal.name)
        } else {
          $('#reminder-animal-name').hide();
        }
      } else {
        $('#reminder-animal-number').parent().parent().parent().parent().hide();
      }

      $('.reminder-notification-el').remove();
      if (reminder.reminders.length > 0) {
        reminder.reminders.forEach((notif, index) => {
          let notifDate = moment(notif.date).lang('ru').format('MMMM DD YYYY, HH:mm');
          notifDate = notifDate.charAt(0).toUpperCase() + notifDate.slice(1);
          let notifWeekDay = moment(notif.date).lang('ru').format('dddd');
          notifWeekDay = notifWeekDay.charAt(0).toUpperCase() + notifWeekDay.slice(1);

          $('.bc-info-detailed').append(`
            <div class="bc-info-detailed-group reminder-notification-el">
              <div class="bc-info-detailed-icon"> 
                <ion-icon name="notifications-outline"></ion-icon>
              </div>
              <div class="bc-info-detailed-text-box">
                <div class="bc-info-detailed-double-title">Напоминание #${index + 1}</div>
                <div class="bc-info-detailed-double-sub-title">${notifWeekDay}, ${notifDate}</div>
              </div>
            </div>
        `)
        });
      }
    });

    $('.bc-info-block-close').on('click', function () {
      $('.bc-info-detailed').hide();
      $('.bc-info-block').hide();
    });
    $('.bc-info-detailed-back').on('click', function () {
      $('.bc-info-detailed').hide();
    });






    $('.bc-dates-column').delegate('.bc-date', 'click', async function () {
      let date = moment(new Date($(this).attr('data-date')));
      $('.bc-dates-block').css('filter', 'blur(2px)');
      $('.bc-date-expanded-back').css('display', 'flex');

      let curRusMonth = moment(date).locale('ru').format('MMMM');
      let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
      const curDay = moment(date).format('DD');
      $('#expanded-all').find('.expanded-title-date').text(`${rusMonth} ${curDay}`)

      /* Empty previous reminders */
      $('#expanded-all').find('.expanded-body').empty();

      /* Add new if exists */
      let farmId = $('.big-calendar-container').attr('data-farm-id');
      let from = new Date(date.startOf('day'));
      let to = new Date(from.getTime() + 24 * 60 * 60 * 1000 - 1);
      const actions = await getSchedulePeriod(farmId, from, to);
      const reminders = await getModuleAndPeriod('vet', from, to);

      let allActions = [...actions, ...reminders];

      allActions.sort((a, b) => a.date - b.date);

      if (allActions.length > 0) {
        allActions.forEach((action, index) => {
          let iconHtml;
          if (action.category !== undefined) {
            iconHtml = `<div class="expanded-item-image">
            <img src="/img/images/vet-${action.category}-icon.png">
          </div>`
          } else {
            iconHtml = `<div class="expanded-item-image">
            <img src="/img/images/calendar-icon.png">
          </div>`
          }
          $('.expanded-empty-body').remove();
          if (action.animal) {
            $('#expanded-all').find('.expanded-body').append(`
              <div class="expanded-item" data-index="${index}" data-sub-id="${action.subId !== undefined ? action.subId : 'none'}">
                ${iconHtml}
                <div class="expanded-item-title">${action.name}</div>
                <div class="expanded-item-time">${moment(action.date).format('HH:mm')}</div>
                <div class="expanded-item-animal-line">
                  <img class="ei-animal-image" src="/img/images/${action.animal.mainPhoto}">
                  ${action.animal.name !== undefined ? `<div class="ei-animal-name">${action.animal.name}</div>` : ''}
                  <div class="ei-animal-number">#${action.animal.number}</div>
                </div>
              </div>
            `)
          } else {
            $('#expanded-all').find('.expanded-body').append(`
              <div class="expanded-item" data-index="${index}" data-sub-id="${action.subId !== undefined ? action.subId : 'none'}">
                ${iconHtml}
                <div class="expanded-item-title">${action.name}</div>
                <div class="expanded-item-time">${moment(action.date).format('HH:mm')}</div>
              </div>
            `)
          }

        });
      } else {
        $('.expanded-empty-body').remove();
        $('#expanded-all').find('.expanded-body').prepend(`<div class="expanded-empty-body">В этот день ничего нет</div>`)
      }

      $('.expanded-item').click(function () {
        const action = allActions[parseFloat($(this).attr('data-index'))];

        $('#expanded-one').show();
        $('#expanded-one').find('.expanded-title').text(moment(action.date).format('HH:mm'));
        $('#expanded-one').find('.expanded-one-title').text(action.name);
        $('#expanded-one').find('.expanded-one-text').text(action.note);
        $('#expanded-one').find('.expanded-edit-btn').attr('href', `/vet/edit-schedule/${action._id}`);
        if (action.animal) {
          $('#expanded-one').find('.expanded-animals-block').attr('href', `/herd/animal-card/${action.animal._id}`);
          $('#expanded-one').find('.expanded-item-animal-img').attr('src', `/img/images/${action.animal.mainPhoto}`);
          if (action.animal.name) {
            $('#expanded-one').find('.expanded-item-animal-name').text(action.animal.name);
          }
          $('#expanded-one').find('.expanded-item-animal-number').text(`#${action.animal.number}`);
        } else {
          $('.expanded-animals-block').hide();
        }



      });
    });

    /* $('.expanded-close-btn ').click(function () {
      if ($(this).parent().parent().attr('id') === 'expanded-all') {
        $('.bc-date-expanded-back').css('display', 'none');
        $('.bc-dates-block').css('filter', 'blur(0px)');
        $('#expanded-one').hide();

        $('.expanded-item').off('click');
      } else if ($(this).parent().parent().attr('id') === 'expanded-one') {
        $('#expanded-one').hide();
      }
    }); */



  }

  ///////////////////////
  /* ALL SMALL CALENDARS CALENDARS */
  ///////////////////////
  if (document.querySelector('.small-calendar-container')) {
    let selectedMonth = moment();

    $('.sc-dates-header-btn').click(function () {
      if ($(this).attr('id') === 'prev-month') {
        selectedMonth = moment(selectedMonth).subtract(1, 'month')
      } else if ($(this).attr('id') === 'next-month') {
        selectedMonth = moment(selectedMonth).add(1, 'month')
      }

      /* Set current month and year */
      let curRusMonth = moment(selectedMonth).locale('ru').format('MMMM');
      let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
      const curYear = moment(selectedMonth).format('YYYY');
      $('.sc-dates-header p').text(`${rusMonth} ${curYear}`);

      /* Clearing the calendar from previous month */
      $('.sc-dates-column').each(function () { $(this).empty() });

      /* Adding days of the month */
      let daysInMonth = moment(selectedMonth).daysInMonth();
      let daysBeforeMonth = moment(selectedMonth).date(1).day() === 0 ? 6 : moment(selectedMonth).date(1).day() - 1;
      let daysAfterMonth = 7 - moment(selectedMonth).date(daysInMonth).day()
      let totalDays = daysInMonth + daysBeforeMonth + daysAfterMonth;

      let visCalStart = moment(selectedMonth).date(1 - daysBeforeMonth);

      for (let i = 0; i < totalDays; i++) {
        let date = moment(visCalStart).add(i, 'days');
        let monthDay = moment(date).date();
        let weekDay = moment(date).day();

        let otherMonth = moment(date).month() !== moment(selectedMonth).month() ? 'sc-date-other' : '';
        let pastDay = moment(date) < moment() ? 'sc-date-past' : '';

        let isToday = date.startOf('day').isSame(moment().startOf('day')) ? 'sc-date-now' : '';

        $(`#weekday-column-${weekDay}`).append(`
        <div class="sc-date ${otherMonth} ${pastDay} ${isToday}" data-date="${new Date(date)}">
          <div class="sc-date-number">${monthDay}</div>
        </div>
      `)
      }

      /* Adding quick info about each day reminders */
      /* $('.sc-date').each(async function () {
        const date = moment($(this).attr('data-date'));

        let farmId = $('.small-calendar-container').attr('data-farm-id');
        let from = new Date(date.startOf('day'));
        let to = new Date(from.getTime() + 24 * 60 * 60 * 1000 - 1);
        const actions = await getSchedulePeriod(farmId, from, to);

        actions.sort((a, b) => a.date - b.date);

        if (actions.length > 0) {
          let isMore = actions.length > 1 ? `<div class="sc-date-more-btn">И еще ${actions.length - 1}</div>` : '';
          $(this).append(`
            <div class="sc-date-quick">
              <div class="sc-date-quick-title">${actions[0].name}</div>
              <div class="sc-date-quick-time">${moment(actions[0].date).format('HH:mm')}</div>
              ${isMore}
            </div>
          `)
        }
      }); */
    });

    $('.sc-dates-header-btn').trigger('click');

    /* $('.sc-date').click(async function () {
      let date = moment(new Date($(this).attr('data-date')));
      $('.sc-dates-block').css('filter', 'blur(2px)');
      $('.sc-date-expanded-back').css('display', 'flex');

      let curRusMonth = moment(date).locale('ru').format('MMMM');
      let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
      const curDay = moment(date).format('DD');
      $('#expanded-all').find('.expanded-title').text(`${rusMonth}, ${curDay}`)

      // Empty previous reminders
      $('#expanded-all').find('.expanded-body').empty();

      // Add new if exists
      let farmId = $('.small-calendar-container').attr('data-farm-id');
      let from = new Date(date.startOf('day'));
      let to = new Date(from.getTime() + 24 * 60 * 60 * 1000 - 1);
      const actions = await getSchedulePeriod(farmId, from, to);

      actions.sort((a, b) => a.date - b.date);

      if (actions.length > 0) {
        actions.forEach((action, index) => {
          $('.expanded-empty-body').remove();
          $('#expanded-all').find('.expanded-body').append(`
          <div class="expanded-item" data-index="${index}">
                <div class="expanded-item-time">${moment(action.date).format('HH:mm')}</div>
                <div class="expanded-item-title">${action.name}</div>
              </div>
            `)
        });
      } else {
        $('.expanded-empty-body').remove();
        $('#expanded-all').find('.expanded-body').prepend(`<div class="expanded-empty-body">В этот день ничего нет</div>`)
      }

      $('.expanded-item').click(function () {
        const action = actions[parseFloat($(this).attr('data-index'))];

        $('#expanded-one').show();
        $('#expanded-one').find('.expanded-title').text(moment(action.date).format('HH:mm'));
        $('#expanded-one').find('.expanded-one-title').text(action.name);
        $('#expanded-one').find('.expanded-one-text').text(action.note);

      });
    }); */

    /* $('.expanded-close-btn ').click(function () {
      if ($(this).parent().parent().attr('id') === 'expanded-all') {
        $('.sc-date-expanded-back').css('display', 'none');
        $('.sc-dates-block').css('filter', 'blur(0px)');
        $('#expanded-one').hide();

        $('.expanded-item').off('click');
      } else if ($(this).parent().parent().attr('id') === 'expanded-one') {
        $('#expanded-one').hide();
      }
    }); */



  }

  ///////////////////////
  /* ADD GENERAL REMINDER */
  ///////////////////////
  if (document.querySelector('#add-general-reminder-container')) {
    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()).length === 0 || new Date($(this).val()).getTime() < Date.now()) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $(this).parent().find('.aa-label-warning').remove();
          $(this).parent().find('.aa-label').append(`<div class="aa-label-warning">-&nbsp; Введите правильную дату</div>`);
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $(this).parent().find('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#type').find('.aa-select-option-selected').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#f4a261' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    let inputMarkup = `<div class="aa-input-block aa-triple-date-block reminder">
    <div class="additional-delete-btn"><ion-icon name="close-circle"></ion-icon></div>
    <label class="aa-label" for="date">
      <p>Уведомление</p>
    </label>
    <input class="aa-triple-date-input-big date" type="date"/>
    <select class="aa-triple-date-input hour">
      <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>
    </select>
    <div class="aa-triple-date-divider">:</div>
    <select class="aa-triple-date-input minute">
      <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
    </select>
  </div>`

    let addReminderBtn = `
    <div class="aa-add-more-container">
      <div class="aa-add-more" id="add-reminder">
        <ion-icon class="aa-add-more-icon" name="calendar-number-outline"></ion-icon>
        <p>Добавить уведомление</p>
      </div>
    </div>
    `


    $('#date').on('click change keyup focus blur', function () {
      if ($(this).val() !== '' && new Date($(this).val()) > new Date() && $('#add-reminder').length === 0) {
        $('#date').parent().after(addReminderBtn);
      }
    });

    $('.main-section').delegate('#add-reminder', 'click', function () {
      $(this).parent().before(inputMarkup);
    });

    $('.main-section').delegate('.additional-delete-btn', 'click', function () {
      $(this).parent().remove();
    });

    $('.ar-add-button').click(async function () {
      $('.ar-add-button').append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });
      if ($('#multiple-animals-container').children().length > 0) {
        let doneAnimals = 0;

        let subId = randomstring.generate(12);

        $('#multiple-animals-container').children().each(async function () {
          let animal = $(this).attr('data-id');
          let name = $('#name').val();
          let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
          let note = $('#note').val() === '' ? undefined : $('#note').val();
          let module = $('#type').attr('data-value');
          let reminders = [];
          $('.reminder').each(function () {
            reminders.push({
              date: new Date(moment(new Date($(this).find('.date').val())).hour(parseFloat($(this).find('.hour').val())).minute(parseFloat($(this).find('.minute').val())))
            });
          });

          const response = await addReminder({ name, date, note, subId, animal, module, reminders });

          if (response) doneAnimals++;

          if (doneAnimals === $('#multiple-animals-container').children().length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            /* location.assign('/herd/all-animals'); */
          }
        });
      } else {
        let subId = randomstring.generate(12);

        let name = $('#name').val();
        let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
        let note = $('#note').val() === '' ? undefined : $('#note').val();
        let module = $('#type').attr('data-value');
        let reminders = [];
        $('.reminder').each(function () {
          reminders.push({
            date: new Date(moment(new Date($(this).find('.date').val())).hour(parseFloat($(this).find('.hour').val())).minute(parseFloat($(this).find('.minute').val())))
          });
        });

        const response = await addReminder({ name, date, note, subId, module, reminders });
        //console.log({ name, date, note, subId, module, reminders });

        if (response) {
          $('.mini-loader').hide();
          addConfirmationEmpty($('.animal-results-container'));
          setTimeout(() => {
            location.reload(true);
          }, 1500)

          /* location.assign('/herd/all-animals'); */
        }
      }

    })
  }

  ///////////////////////
  /* EDIT GENERAL REMINDER */
  ///////////////////////
  if (document.querySelector('#edit-general-reminder-container')) {
    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()).length === 0) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $(this).parent().find('.aa-label-warning').remove();
          $(this).parent().find('.aa-label').append(`<div class="aa-label-warning">-&nbsp; Введите правильную дату</div>`);
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $(this).parent().find('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#type').find('.aa-select-option-selected').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#f4a261' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if ($('#multiple-animals-container').children().length > 0) {
      $('.ar-selected-animals-block').show();
      $('.ar-selected-animals-block').css('opacity', '1');
      $('#multiple-animals-container').children().css('pointer-events', 'none')
    }

    let inputMarkup = `<div class="aa-input-block aa-triple-date-block reminder">
    <div class="additional-delete-btn"><ion-icon name="close-circle"></ion-icon></div>
    <label class="aa-label" for="date">
      <p>Уведомление</p>
    </label>
    <input class="aa-triple-date-input-big date" type="date"/>
    <select class="aa-triple-date-input hour">
      <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>
    </select>
    <div class="aa-triple-date-divider">:</div>
    <select class="aa-triple-date-input minute">
      <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
    </select>
  </div>`

    let addReminderBtn = `
  <div class="aa-add-more-container">
    <div class="aa-add-more" id="add-reminder">
      <ion-icon class="aa-add-more-icon" name="calendar-number-outline"></ion-icon>
      <p>Добавить уведомление</p>
    </div>
  </div>
  `


    $('#date').on('click change keyup focus blur', function () {
      if ($(this).val() !== '' && !document.querySelector('.aa-add-more-container')) {
        $('.ar-add-button').before(addReminderBtn);
      }
    });

    $('.main-section').delegate('#add-reminder', 'click', function () {
      $(this).parent().before(inputMarkup);
    });

    $('.main-section').delegate('.additional-delete-btn', 'click', function () {
      $(this).parent().remove();
    });

    $('input').trigger('click');

    $('.ar-add-button').click(async function () {
      $('.ar-add-button').append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      let id = $(this).attr('data-reminder-id')
      let name = $('#name').val();
      let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
      let note = $('#note').val() === '' ? undefined : $('#note').val();
      let module = $('#type').attr('data-value');
      let reminders = [];
      $('.reminder').each(function () {
        reminders.push({
          date: new Date(moment(new Date($(this).find('.date').val())).hour(parseFloat($(this).find('.hour').val())).minute(parseFloat($(this).find('.minute').val())))
        });
      });

      const response = await editReminder(id, { name, date, note, module, reminders });
      //console.log({ name, date, note, subId, module, reminders });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }

    })
  }

  ///////////////////////
  /* THE MAIN PAGE GRAPH */
  ///////////////////////
  if (document.querySelector('mp-herd-container')) {
    /* Working with graphs */
    const creatingGraph = (graphName, periodMonths) => {
      $('.mp-tooltip-box').remove();
      $("#mp-graph").empty();
      $('.mp-animal-graphs-legend').empty();
      const graph = document.querySelector('#mp-graph');
      let maxResult = 0;

      if (periodMonths === 'all-time') {
        periodMonths = 0;
        $('.mp-graph-data').each(function () {
          let monthsAgo = Math.round((new Date().getTime() - new Date($(this).attr('data-date')).getTime()) / 1000 / 60 / 60 / 24 / 30)
          if (monthsAgo > periodMonths) {
            periodMonths = monthsAgo
          }
        });
      } else {
        periodMonths = parseFloat(periodMonths);
      }



    }

    /* Resizing the graph */
    $(window).resize(function () {
      $('#mp-graph').attr('width', $('#mp-graph').parent().width()).attr('height', Math.round($('#mp-graph').parent().height()));
      let graphWidth = parseFloat($('#mp-graph').attr('width'))
      let graphHeight = parseFloat($('#mp-graph').attr('height'))

      creatingGraph($('#mp-graph').attr('data-graph-name'), $('#mp-graph').attr('data-period-months'));
    });

    $(window).trigger('resize');

    /* Change milking graphs and periods */
    $('.mp-animal-graphs-switch-btn').click(function () {
      $(this).siblings().removeClass('mp-animal-graphs-switch-btn-active');
      $(this).addClass('mp-animal-graphs-switch-btn-active')

      let graphName = $('.mp-animal-graphs-switch-btn-active').attr('id');
      let periodMonths = $('.mp-animal-graphs-period-btn-active').attr('data-period');

      $('#mp-graph').attr('data-graph-name', graphName)
      $('#mp-graph').attr('data-period-months', periodMonths)

      creatingGraph(graphName, periodMonths);
    });
    $('.mp-animal-graphs-period-btn').click(function () {
      $(this).siblings().removeClass('mp-animal-graphs-period-btn-active');
      $(this).addClass('mp-animal-graphs-period-btn-active')

      let graphName = $('.mp-animal-graphs-switch-btn-active').attr('id');
      let periodMonths = $('.mp-animal-graphs-period-btn-active').attr('data-period');

      $('#mp-graph').attr('data-graph-name', graphName)
      $('#mp-graph').attr('data-period-months', periodMonths)

      creatingGraph(graphName, periodMonths);
    });

    /* Hiding and showing lines on legend click*/
    $('.mp-animal-graphs-legend').delegate('.mp-animal-graphs-legend-item', 'click', function () {
      if ($('.mp-animal-graphs-legend').children().length > 1) {
        if ($(this).attr('data-hidden') === 'false') {
          $(`#${$(this).attr('data-linked-el')}`).css('opacity', 0);
          $(`.${$(this).attr('data-linked-points')}`).css('opacity', 0);
          $(this).attr('data-hidden', 'true');
          $(this).addClass('mp-animal-graphs-legend-item-off');
          $('.mp-tooltip-box').remove();
        } else {
          $(`#${$(this).attr('data-linked-el')}`).css('opacity', 1);
          $(`.${$(this).attr('data-linked-points')}`).css('opacity', 1);
          $(this).attr('data-hidden', 'false');
          $(this).removeClass('mp-animal-graphs-legend-item-off');
        }
      }
    });

    /* Hiding tooltips on mouse out */
    $('.mp-animal-graph-container').mouseleave(function () {
      $('.mp-tooltip-box').remove();
    });

    /* Tooltips */
    const graphEl = document.querySelector('#mp-graph');
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

        /* Showing what points being selected */
        $('.line-graph-data-circle').attr('r', 2);
        currentPoint.dataPoints.forEach(dataPoint => {
          $(dataPoint).attr('r', 3);
        });

        /* Adding a tooltip box */
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

        /* Changing the position of a tooltip */
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

    })

  }

  ///////////////////////
  /* THE MAIN PAGE */
  ///////////////////////
  if (document.querySelector('.main-welcome-block')) {
    $('.mw-small-link-block').on('mouseenter', function () {
      $(`#${$(this).attr('id').replace('block', 'icon')}`).css({ 'font-size': '1000%', 'opacity': '1', 'color': `${$(this).css('background-color')}` });
      $(`#${$(this).attr('id').replace('block', 'icon')}`).siblings().css('font-size', '500%')
      $('.mw-account-block').find('.mw-marquee-text').css('opacity', '0');
    });

    $('.mw-small-link-block').on('mouseleave', function () {
      $(`#${$(this).attr('id').replace('block', 'icon')}`).css({ 'font-size': '750%', 'opacity': '0.5', 'color': `#ffffff` })
      $(`#${$(this).attr('id').replace('block', 'icon')}`).siblings().css('font-size', '750%')
      $('.mw-account-block').find('.mw-marquee-text').css('opacity', '1');
    });

    $(window).on('scroll', function () {
      if ($(this).scrollTop() < 50) {
        $('.mw-title').css({ 'transform': 'scale(1)', 'opacity': '1' });
      } else if ($(this).scrollTop() >= 50 && $(this).scrollTop() < 150) {
        $('.mw-title').css({ 'transform': 'scale(0.95)', 'opacity': '0.8' });
      } else if ($(this).scrollTop() >= 150 && $(this).scrollTop() < 250) {
        $('.mw-title').css({ 'transform': 'scale(0.90)', 'opacity': '0.6' });
      } else if ($(this).scrollTop() >= 250) {
        $('.mw-title').css({ 'transform': 'scale(0.85)', 'opacity': '0.4' });
      }
    });
  }

  if (document.querySelector('.main-page-herd-block')) {
    let herdData = []
    $('.mph-data').each(function () {
      herdData.push({
        result: parseFloat($(this).attr('data-result')),
        date: new Date($(this).attr('data-date')),
      });
    });

    herdData.sort((a, b) => a.date - b.date);

    let lastMonthHerdData = [];
    herdData.forEach((data) => {
      if (moment(data.date).month() === moment(herdData[herdData.length - 1].date).month() && moment(data.date).year() === moment(herdData[herdData.length - 1].date).year()) {
        lastMonthHerdData.push(data);
      }
    });

    let total = 0;
    lastMonthHerdData.forEach(data => {
      total += data.result;
    });

    /* Adding all the info */
    $('#mph-average').text(`${(total / lastMonthHerdData.length).toFixed(1)}`)
    $('#mph-day').text(`${Math.round(total)}`)
    if (total * 30 > 1000) {
      $('#mph-month').text(`${((total * 30) / 1000).toFixed(1)}`);
      $('#mph-month').parent().find('.mph-info-box-text').text('тыс. литров');
    } else {
      $('#mph-month').text(`${Math.round(total * 30)}`)
    }

    let rusDate = moment(lastMonthHerdData[0].date).lang('ru').format('MMMM YYYY');
    rusDate = rusDate.charAt(0).toUpperCase() + rusDate.slice(1);
    $('.mph-info-month').text(rusDate)



    /* Adding animation of appearence */
    $(window).on('scroll', function () {
      let itemsBottom = $('.mph-info-box').position().top + ($('.mph-info-box').height() / 2);
      if ($(this).scrollTop() >= 300) {
        $('body').css({ 'transition': '0.5s', 'background-color': '#0A0908' })
      } else if ($(this).scrollTop() < 300) {
        $('body').css({ 'transition': '0.5s', 'background-color': '#ffffff' })
      }
      if ($(this).scrollTop() >= itemsBottom) {
        $('#box-1').addClass('animate__animated').addClass('animate__slideInDown').css('opacity', '1');
        setTimeout(() => { $('#box-2').addClass('animate__animated').addClass('animate__slideInDown').css('opacity', '1'); }, 250);
        setTimeout(() => { $('#box-3').addClass('animate__animated').addClass('animate__slideInDown').css('opacity', '1'); }, 500);

      }
    });
  }


  if (document.querySelector('mp-herd-container')) {
    /* Making navigation work */
    $('.mp-block-changer-item-on').click(function () {
      $('.mp-block-changer-item-off').show(200);
      $('.mp-block-changer-item-off').css('opacity', '1');
    });

    /* Making quick info image smaller */
    $(window).resize(function () {
      $('.mp-main-info-image').width($('.mp-main-info-image').height());
    });
    $(window).resize();


    /* Making top animals scroll horizontaly */
    let scrollContainer = document.querySelector('.mp-top-cows-container');

    scrollContainer.addEventListener("wheel", (event) => {
      event.preventDefault();
      scrollContainer.scrollLeft += event.deltaY;
    });

    /* Adding all related milk results */
    let milkingData = [];
    $('.mp-graph-data').each(function () {
      milkingData.push({
        result: parseFloat($(this).attr('data-result')),
        lactationNumber: parseFloat($(this).attr('data-lact')),
        date: new Date($(this).attr('data-date')),
        cowPhoto: $(this).attr('data-cow-photo'),
        cowNumber: $(this).attr('data-cow-number'),
        cowName: $(this).attr('data-cow-name'),
        cowId: $(this).attr('data-cow-id'),

      });
    });

    milkingData.sort((a, b) => a.date - b.date);

    let lastMonthMD = [];
    milkingData.forEach((el, indexm, arr) => {
      if (moment(el.date).month() === moment(arr[arr.length - 1].date).month() && moment(el.date).year() === moment(arr[arr.length - 1].date).year()) {
        lastMonthMD.push(el);
      }
    });

    let avgRes = { total: 0, amount: 0 }
    lastMonthMD.forEach(el => {
      $('#mp-milk-per-day').attr('data-total', parseFloat($('#mp-milk-per-day').attr('data-total')) + el.result);
      $('#mp-milk-per-day').text(`${$('#mp-milk-per-day').attr('data-total')} л.`)
      $('#mp-milk-per-month').text(`${parseFloat($('#mp-milk-per-day').attr('data-total')) * 30} л.`);

      avgRes.total += el.result;
      avgRes.amount++;
    });
    $('#mp-milk-average').text(`${(avgRes.total / avgRes.amount).toFixed(1)} л.`)

    lastMonthMD.sort((a, b) => b.result - a.result)

    for (let i = 0; i < 7; i++) {
      $('.mp-top-cows-container').append(`
        <a class="mp-top-cow" href="/herd/animal-card/${lastMonthMD[i].cowId}">
          <img src="/img/images/${lastMonthMD[i].cowPhoto}">
          <div class="mp-top-cow-overlay">
            <div class="mp-tc-name">${lastMonthMD[i].cowName}</div>
            <div class="mp-tc-number">#${lastMonthMD[i].cowNumber}</div>
          </div>
      </a>
      `);
    }

    /* Implementing lists */
    $('.mpt-list-item').each(function () {
      let date = new Date($(this).find('.mpt-list-item-date').attr('data-date'));

      $(this).find('.mpt-list-item-date').text(`${moment(date).lang('ru').format('DD MMMM YYYY')}`)
      $(this).find('.mpt-list-item-day-text').text(`${Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000)} дн.`)
      $(this).find('.mpt-list-item-day-text').attr('data-days', Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000));
    });


    /* Sorting lists */
    let length;

    length = $('#mp-soon-to-calv-list').find('.mpt-list-item').length
    for (let i = 0; i < length; i++) {
      $('#mp-soon-to-calv-list').find('.mpt-list-item').each(function () {
        let currentDays = parseFloat($(this).find('.mpt-list-item-day-text').attr('data-days'));
        let prevDays = parseFloat($(this).prev().find('.mpt-list-item-day-text').attr('data-days'));

        if (currentDays < prevDays) {
          let element = $(this);
          let prevElement = $(this).prev();

          $(this).detach();
          prevElement.before(element);
        }
      });
    }
    length = $('#mp-soon-to-insem-list').find('.mpt-list-item').length
    for (let i = 0; i < length; i++) {
      $('#mp-soon-to-insem-list').find('.mpt-list-item').each(function () {
        let currentDays = parseFloat($(this).find('.mpt-list-item-day-text').attr('data-days'));
        let prevDays = parseFloat($(this).prev().find('.mpt-list-item-day-text').attr('data-days'));

        if (currentDays < prevDays) {
          let element = $(this);
          let prevElement = $(this).prev();

          $(this).detach();
          prevElement.before(element);
        }
      });
    }


  }

  ///////////////////////
  /* ALL HISTORY PAGES */
  ///////////////////////
  if (document.querySelector('.history-page-container')) {
    const defineMonthsText = () => {
      $('.hp-month-before-el').removeClass('hp-month-before-el');
      $('.history-page-month').remove();

      $('.history-page-item-outter').each(function () {
        let date = new Date($(this).attr('data-date'));
        let el = $(this);

        $('.history-page-item-outter').each(function () {
          let elDate = new Date($(this).attr('data-date'));

          if (date < elDate) {
            $(this).after(el);
          }
        });
      });

      $('.history-page-item-outter').each(function () {
        let date = $(this).attr('data-date');
        let curRusMonth = moment(date).locale('ru').format('MMMM');
        let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
        let curDay = moment(date).format('DD');
        $(this).find('.history-page-date').text(`${rusMonth}, ${curDay}`)
        if ($(this).css('display') !== 'none') {
          if (!$(this).prev() || $(this).prev().css('display') === 'none' || moment(new Date($(this).attr('data-date'))).month() !== moment(new Date($(this).prev().attr('data-date'))).month()) {
            $(this).addClass('hp-month-before-el');
          }
        }
      });

      $('.hp-month-before-el').each(function () {
        let date = new Date($(this).attr('data-date'));
        let curRusMonth = moment(date).locale('ru').format('MMMM');
        let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
        let curYear = moment(date).format('YYYY');
        $(this).before(`<div class="history-page-month">${rusMonth} ${curYear}</div>`)
      });
    };

    defineMonthsText();

    $('.hp-category').on('click', function () {
      if ($(this).hasClass('hp-category-active')) {
        $(this).removeClass('hp-category-active');
        $(`.history-page-${$(this).attr('id')}`).hide();

        defineMonthsText();
      } else {
        $(this).addClass('hp-category-active');
        $(`.history-page-${$(this).attr('id')}`).css('display', 'flex');

        defineMonthsText();
      }
    });

    $('#history-page-search').on('keyup change focus blur', function () {
      $('.history-page-searched').empty();
      let searchValue = $(this).val().toLowerCase();
      let showSearched = false;

      if (searchValue.length > 0) {
        $('.history-page-item-outter').each(function () {
          let itemName = $(this).find('.history-page-title').text().toLowerCase();
          if (itemName.includes(searchValue)) {
            $(this).clone().appendTo('.history-page-searched')
            showSearched = true;
          }
        });
      }

      if (showSearched) {
        $('.history-page-searched').show();
      } else {
        $('.history-page-searched').hide();
      }

    });

    /* Making delete button work */
    $('.history-page-delete').on('click', function (e) {
      e.preventDefault();

      $(this).parent().hide();
      $(this).parent().parent().find('.hp-delete-block').css({ 'display': 'flex', 'opacity': '1' });
    });

    $('.hp-delete-block-btn-keep').on('click', function (e) {
      e.preventDefault();

      $(this).parent().parent().find('.history-page-item').css({ 'display': 'flex' });
      $(this).parent().css({ 'display': 'none', 'opacity': '0' });
    });

    $('.hp-delete-block-btn-delete').on('click', async function () {
      if (document.querySelector('#vet-history-container')) {
        let type = $(this).parent().parent().attr('data-doc-type');
        let id = $(this).parent().parent().attr('data-doc-id');

        let result = await deleteVetDoc(type, id);

        if (result) $(this).parent().parent().remove();
      }

      if (document.querySelector('#herd-history-container')) {
        let type = $(this).parent().parent().attr('data-doc-type');
        let animalId = $(this).parent().parent().attr('data-animal-id');
        let id = $(this).parent().parent().attr('data-doc-id');

        let result = await deleteAnimalResults(type, animalId, id);

        if (result) $(this).parent().parent().remove();
      }

    });
  }

  ///////////////////////
  /* EDIT FARM PAGE */
  ///////////////////////
  if (document.querySelector('#edit-farm-container')) {
    /* Working with form */
    $('input').on('click keyup change', function () {
      if ($(this).val() !== '') {
        $(this).addClass('ar-valid-input');
      } else {
        $(this).removeClass('ar-valid-input');
      }
    });

    $('*').on('click change keyup', function () {
      if ($('#liquid-unit').find('.aa-pick-picked').length > 0 && $('#weight-unit').find('.aa-pick-picked').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });
    $('input').trigger('click');

    $('.ar-add-button').click(async function () {
      const farmId = $(this).attr('data-farm-id');
      const name = $('#name').val().length > 0 ? $('#name').val() : undefined;
      const liquidUnit = $('#liquid-unit').find('.aa-pick-picked').attr('id');
      const weightUnit = $('#weight-unit').find('.aa-pick-picked').attr('id');

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editFarm(farmId, { name, liquidUnit, weightUnit });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });
  }

  ///////////////////////
  /* EDIT USER PAGE */
  ///////////////////////
  if (document.querySelector('#edit-user-container')) {
    /* Working with form */
    $('input').on('click keyup change', function () {
      if ($(this).val() !== '') {
        $(this).addClass('ar-valid-input');
      } else {
        $(this).removeClass('ar-valid-input');
      }
    });

    $('#email').on('click change keyup focus', async function () {
      if ($(this).val().length > 0) {
        $(this).addClass('ar-valid-input');
      } else {
        $(this).removeClass('ar-valid-input');
      }
      if ($(this).val().length > 0 && $(this).val() !== $(this).attr('data-email')) {
        if (!validator.isEmail($(this).val())) {
          $(this).removeClass('ar-valid-input');

        }
        if (!await checkEmail($('#email').val())) {
          $(this).removeClass('ar-valid-input');
          $('body').trigger('click');
          $(this).parent().find('.aa-input-ps').remove();
          $(this).after(`<div class="aa-input-ps aa-input-ps-warning">Эта электронная почта уже занята</div>`)
        } else {
          $(this).parent().find('.aa-input-ps').remove();
        }
      }


    })

    $('*').on('click change keyup', async function () {
      if ($('#first-name').hasClass('ar-valid-input') && $('#last-name').hasClass('ar-valid-input') && $('#email').hasClass('ar-valid-input')) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });
    $('input').trigger('click');

    $('.ar-add-button').click(async function () {
      const userId = $(this).attr('data-user-id');
      const firstName = $('#first-name').val();
      const lastName = $('#last-name').val();
      const email = $('#email').val();
      const birthDate = new Date($('#birth-date').val());

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editUser(userId, { firstName, lastName, email, birthDate });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });
  }

  ///////////////////////
  /* CHANGE RESTRICTIONS */
  ///////////////////////
  if (document.querySelector('#change-rest-container')) {
    $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });

    $('.ar-add-button').click(async function () {
      const userId = $(this).attr('data-user-id');
      const accessBlocks = [];
      $('#modules').find('.aa-pick-picked').each(function () {
        accessBlocks.push($(this).attr('id'));
      });
      const editData = $('#edit-data').find('.aa-check-box-checked').length > 0;
      const editOther = $('#edit-other').find('.aa-check-box-checked').length > 0;

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editUser(userId, { accessBlocks, editData, editOther });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });
  }


  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* ANIMAL MODULE */
  /////////////////////////
  /////////////////////////
  /////////////////////////

  ///////////////////////
  /* ADD ANIMAL PAGE */
  ///////////////////////
  if (document.querySelector('#add-animal-container')) {

    /* Choose type of add animal */
    $('.ai-decide-block-item').on('click', function () {
      $(`.${$(this).attr('id')}-input`).css('display', 'flex');
      $('#add-animal-container').attr('data-state', $(this).attr('id'));

      $('.ai-decide-block').removeClass('animate__animated').removeClass('animate__fadeOut').removeClass('animate__animated').removeClass('animate__fadeIn');
      $('.ai-decide-block').addClass('animate__animated').addClass('animate__fadeOut').css('display', 'none');;
      $('.add-animal-form').removeClass('animate__animated').removeClass('animate__fadeIn').removeClass('animate__animated').removeClass('animate__fadeOut');
      $('.add-animal-form').addClass('animate__animated').addClass('animate__fadeIn').css('display', 'flex');

    });

    /* Preventing same number input */
    $('#number').on('keyup change', async function () {
      if ($(this).val().length > 0) {

        if (await checkByField('number', $(this).val())) {
          $(this).parent().find('.ai-input-marker-s').remove();
          if ($(this).parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().find('.ai-warning-text').length === 0) {
            $(this).parent().append(`<div class="ai-warning-text">Животное с таким номером уже существует</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {
          $(this).parent().find('.ai-input-marker-f').remove();
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }

          $(this).parent().find('.ai-warning-text').remove()

          $(this).addClass('ai-valid-input');
        }
      } else {
        $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

        $(this).removeClass('ai-valid-input');
      }

    });
    /* Preventing invalid birth date */
    $('#birth-date').on('keyup change', async function () {
      if ($(this).val() !== '') {

        if (new Date($(this).val()) >= new Date()) {
          $(this).parent().find('.ai-input-marker-s').remove();
          if ($(this).parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().find('.ai-warning-text').length === 0) {
            $(this).parent().append(`<div class="ai-warning-text">Введите корректную дату</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {
          $(this).parent().find('.ai-input-marker-f').remove();
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }

          $(this).parent().find('.ai-warning-text').remove()

          $(this).addClass('ai-valid-input');
        }
      } else {
        $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

        $(this).removeClass('ai-valid-input');
      }

    });

    /* Allow submit if requirments filled */
    setInterval(() => {
      if ($('#number').hasClass('ai-valid-input') && $('#birth-date').hasClass('ai-valid-input') && $('#gender').find('.ai-pick-active').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    }, 100)


    /* Submitting data */
    $('.ai-input-submit-btn').on('click', async function () {
      let aNumber = $('#number').val();
      let name = $('#name').val() !== '' ? $('#name').val() : undefined;
      let building = $('#building').val() !== '' ? $('#building').val() : undefined;
      let spot = $('#spot').val() !== '' ? $('#spot').val() : undefined;
      let buyCost = $('#buy-cost').val() !== '' ? $('#buy-cost').val() : undefined;
      let mother = $('#mother').attr('data-id') !== '' ? $('#mother').attr('data-id') : undefined;
      let father = $('#father').attr('data-id') !== '' ? $('#father').attr('data-id') : undefined;
      let birthDate = $('#birth-date').val() !== '' ? $('#birth-date').val() : undefined;
      let gender = $('#gender').find('.ai-pick-active').attr('id');
      let colors = [];
      $('#colors').find('.ai-pick-active').each(function () { colors.push($(this).attr('id')) });
      let breedRussian = $('#breed').attr('data-rus');
      let breedEnglish = $('#breed').attr('data-eng');


      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      let result = await addAnimal({ number: aNumber, name, buyCost, mother, father, birthDate, breedRussian, breedEnglish, gender, colors, building, spot });

      if (result) {

        $('.add-animal-form').removeClass('animate__animated animate__fadeIn animate__fadeOut');
        $('.add-animal-form').addClass('animate__animated animate__fadeOut').css('display', 'none');;
        $('.ai-success-block ').removeClass('animate__animated animate__fadeIn animate__fadeOut');
        $('.ai-success-block ').addClass('animate__animated animate__fadeIn').css('display', 'flex');

        setTimeout(() => { location.assign(`/herd/animal-card/${result._id}`) }, 2000)

      }
    });



    /* PHOTO INPUTS | NOT ADDED IN UPDATED VERSION */
    /* $('.aa-photo-input').change(function () {
      let photos = document.getElementById($(this).attr('id')).files;
      console.log(photos);

      $(this).parent().find('.aa-label').css({
        'left': '-20px',
        'transform': 'translate(-100%, -50%)'
      });
      $(this).hide();
      let previewBox = $(this).parent().find('.aa-photo-preview-box').show().css('display', 'flex');

      for (let i = 0; i < photos.length; i++) {
        previewBox.append(`<img class="aa-photo-preview" src="${URL.createObjectURL(photos[i])}">`)

      }

    }); */


  }

  ///////////////////////
  /* EDIT ANIMAL PAGE */
  ///////////////////////
  if (document.querySelector('#edit-animal-container')) {

    /* Adding info for breed select */
    $('.breed-input').find('.ai-select-item').on('click', function () {
      $('#breed').val($(this).find('.ai-select-name').text());
      $('#breed').attr('data-rus', $(this).attr('data-rus'));
      $('#breed').attr('data-eng', $(this).attr('data-eng'));
    });

    /* Adding info for mother or father select */
    $('.birth-input').find('.ai-select-item').on('click', function () {
      $(this).parent().parent().find('.ai-input-select').val(`${$(this).find('.ai-select-name').text()} ${$(this).find('.ai-select-sub-name').text()}`);
      $(this).parent().parent().find('.ai-input-select').attr('data-id', $(this).attr('data-id'));
    });

    /* Preventing same number input */
    $('#number').on('keyup change', async function () {
      if ($(this).val().length > 0) {

        if ($(this).val() !== $(this).attr('data-current') && await checkByField('number', $(this).val())) {
          $(this).parent().find('.ai-input-marker-s').remove();
          if ($(this).parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().find('.ai-warning-text').length === 0) {
            $(this).parent().append(`<div class="ai-warning-text">Животное с таким номером уже существует</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {
          $(this).parent().find('.ai-input-marker-f').remove();
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }

          $(this).parent().find('.ai-warning-text').remove()

          $(this).addClass('ai-valid-input');
        }
      } else {
        $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

        $(this).removeClass('ai-valid-input');
      }

    });
    /* Preventing invalid birth date */
    $('#birth-date').on('keyup change', async function () {
      if ($(this).val() !== '') {

        if (new Date($(this).val()) >= new Date()) {
          $(this).parent().find('.ai-input-marker-s').remove();
          if ($(this).parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().find('.ai-warning-text').length === 0) {
            $(this).parent().append(`<div class="ai-warning-text">Введите корректную дату</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {
          $(this).parent().find('.ai-input-marker-f').remove();
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }

          $(this).parent().find('.ai-warning-text').remove()

          $(this).addClass('ai-valid-input');
        }
      } else {
        $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

        $(this).removeClass('ai-valid-input');
      }

    });

    $('.ai-input').trigger('keyup');
    setTimeout(() => { $('.ai-input-half').trigger('keyup'); }, 1000)
    $('.ai-select-item-selected').trigger('click');
    $('.ai-to-pick').trigger('click').removeClass('.ai-to-pick');

    /* Allow submit if requirments filled */
    setInterval(() => {
      if ($('#number').hasClass('ai-valid-input') && $('#birth-date').hasClass('ai-valid-input') && $('#gender').find('.ai-pick-active').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    }, 100)


    /* Submitting data */
    $('.ai-input-submit-btn').on('click', async function () {
      let aNumber = $('#number').val();
      let name = $('#name').val() !== '' ? $('#name').val() : undefined;
      let building = $('#building').val() !== '' ? $('#building').val() : undefined;
      let spot = $('#spot').val() !== '' ? $('#spot').val() : undefined;
      let buyCost = $('#buy-cost').val() !== '' ? $('#buy-cost').val() : undefined;
      let mother = $('#mother').attr('data-id') !== '' ? $('#mother').attr('data-id') : undefined;
      let father = $('#father').attr('data-id') !== '' ? $('#father').attr('data-id') : undefined;
      let birthDate = $('#birth-date').val() !== '' ? $('#birth-date').val() : undefined;
      let gender = $('#gender').find('.ai-pick-active').attr('id');
      let colors = [];
      $('#colors').find('.ai-pick-active').each(function () { colors.push($(this).attr('id')) });
      let breedRussian = $('#breed').attr('data-rus');
      let breedEnglish = $('#breed').attr('data-eng');


      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      let result = await editAnimal($(this).attr('data-id'), { number: aNumber, name, buyCost, mother, father, birthDate, breedRussian, breedEnglish, gender, colors, building, spot });

      if (result) {

        $('.ai-form-container').removeClass('animate__animated animate__fadeIn animate__fadeOut');
        $('.ai-form-container').addClass('animate__animated animate__fadeOut').css('display', 'none');;
        $('.ai-success-block ').removeClass('animate__animated animate__fadeIn animate__fadeOut');
        $('.ai-success-block ').addClass('animate__animated animate__fadeIn').css('display', 'flex');

        setTimeout(() => { location.reload(true) }, 2000)

      }
    });


  }

  ///////////////////////
  /* FOR ALL MILKING RESULTS PAGE */
  ///////////////////////
  if (document.querySelector('#milking-results-container') || document.querySelector('#edit-milking-results-container')) {
    /* Historical graph */
    if (document.querySelector('.animal-results-history')) {
      /* Declaring the graph element */
      const graph = document.querySelector('#the-graph');

      let creatingGraph = () => {
        /* Getting and sorting animal and average data data */
        let animalData = [];
        let maxResult = 0;
        $('.animal-results-data-box').find('.animal-result-data').each(function () {
          animalData.push({
            date: new Date($(this).attr('data-date')),
            result: parseFloat($(this).attr('data-result')),
            lactationNumber: parseFloat($(this).attr('data-lact-number')),
            index: $(this).attr('data-index')
          });

          if (parseFloat($(this).attr('data-result')) > maxResult) maxResult = parseFloat($(this).attr('data-result'));
        });

        animalData.sort((a, b) => a.date - b.date);

        let averageData = [];
        let averageDataLine = [];
        $('.animal-results-average-box').find('.animal-average-data').each(function () {
          const date = new Date($(this).attr('data-date'));
          if (animalData[0].date <= date && date <= animalData[animalData.length - 1].date) {
            averageData.push({
              date: new Date($(this).attr('data-date')),
              result: parseFloat($(this).attr('data-result')),
              lactationNumber: parseFloat($(this).attr('data-lact-number'))
            });

            if (parseFloat($(this).attr('data-result')) > maxResult) maxResult = parseFloat($(this).attr('data-result'));
          }
        });

        averageData.sort((a, b) => a.date - b.date);

        /* Getting the approx. size of each grid cell (since I want to make it square) */
        maxResult = Math.round((maxResult + 10) / 10) * 10;
        let lineAmount = maxResult >= 50 ? 10 : 5;

        let horGap = Math.round(parseFloat($('#the-graph').attr('height')) / (maxResult / lineAmount));
        let vertGap = parseFloat($('#the-graph').attr('width')) / horGap;

        /* Adding grid lines to Y-axis */
        for (let i = 1; i < vertGap; i++) {
          let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('line-graph-grid-line');
          path.setAttribute('d', `M ${i * horGap} 0 L ${i * horGap} ${parseFloat($('#the-graph').attr('height'))}`)
          graph.append(path);
        }

        /* Adding grid lines and labels to X-axis */
        for (let i = 1; i < (maxResult / lineAmount); i++) {
          let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('line-graph-grid-line');
          path.setAttribute('d', `M 0 ${i * horGap} L ${parseFloat($('#the-graph').attr('width'))} ${i * horGap}`)
          graph.append(path);

          /* let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
          text.classList.add('line-graph-grid-text');
          text.setAttribute('x', `5`)
          text.setAttribute('y', `${parseFloat($('#the-graph').attr('height')) - (i * horGap - 1)}`)
          text.textContent = `${i * lineAmount}`
          graph.append(text); */
        }

        /* Adding 2 lines at the top and bottom */
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.classList.add('line-graph-grid-line');
        path.setAttribute('d', `M 0 0 L ${parseFloat($('#the-graph').attr('width'))} 0`)
        graph.append(path);

        path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.classList.add('line-graph-grid-line');
        path.setAttribute('d', `M 0 ${parseFloat($('#the-graph').attr('height'))} L ${parseFloat($('#the-graph').attr('width'))} ${parseFloat($('#the-graph').attr('height'))}`)
        graph.append(path);



        /* Adding average line and dots */
        let daysSpan = Math.round((new Date(animalData[animalData.length - 1].date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);

        averageData.forEach((result, index, array) => {
          let daysFromFirst = Math.round((new Date(result.date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);

          /* Adding points */
          var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.classList.add('line-graph-average-circle');
          circle.setAttribute('cx', daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30);
          circle.setAttribute('cy', parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult)));
          circle.setAttribute('r', 2);
          graph.append(circle);


          /* Preparing second array for average line */
          if (averageDataLine.length < 1) {
            averageDataLine.push({ date: result.date, results: [result.result] })
          } else {
            let toPush = true;
            for (let i = 0; i < averageDataLine.length; i++) {
              if (moment(averageDataLine[i].date).month() === moment(result.date).month() && moment(averageDataLine[i].date).year() === moment(result.date).year()) {
                averageDataLine[i].results.push(result.result);
                toPush = false;
              }
            }

            if (toPush) {
              averageDataLine.push({ date: result.date, results: [result.result] });
            }
          }
        });

        /* Counting averages and adding lines */
        averageDataLine.forEach((result, index, array) => {
          let daysFromFirst = Math.round((new Date(result.date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);
          let total = 0
          result.results.forEach(el => total += el);
          let average = parseFloat((total / result.results.length).toFixed(1));


          if (index === 0 || result.lactationNumber !== array[index - 1].lactationNumber) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path.classList.add('line-graph-average-line');
            path.setAttribute('d', `M ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (average * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
            path.setAttribute('id', `animal-line-average`);
            graph.append(path);
          } else {
            let path = document.getElementById(`animal-line-average`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (average * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
          }
        });


        /* Adding animal data to the chart */
        animalData.forEach((result, index, array) => {
          let daysFromFirst = Math.round((new Date(result.date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);

          /* Adding lines */
          if (index === 0 || result.lactationNumber !== array[index - 1].lactationNumber) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path.classList.add('line-graph-data-line');
            path.classList.add(`line-graph-data-line-${result.lactationNumber}`);
            path.setAttribute('d', `M ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
            path.setAttribute('id', `animal-line-${result.lactationNumber}`);
            graph.append(path);
          } else {
            let path = document.getElementById(`animal-line-${result.lactationNumber}`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
          }

          /* Adding points */
          var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.classList.add('line-graph-data-circle');
          circle.classList.add(`line-graph-data-circle-${result.lactationNumber}`);
          circle.setAttribute('cx', daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30);
          circle.setAttribute('cy', parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult)));
          circle.setAttribute('r', 3);
          circle.setAttribute('data-result', result.result);
          circle.setAttribute('data-date', result.date);
          circle.setAttribute('data-lact-number', result.lactationNumber);
          circle.setAttribute('data-animal-id', graph.getAttribute('data-animal-id'));
          circle.setAttribute('data-index', result.index);
          graph.append(circle);
        });
      }

      $(window).resize(function () {
        $('#the-graph').attr('width', $('#the-graph').parent().width()).attr('height', Math.round($('#the-graph').parent().width() / 1.75));
        let graphWidth = parseFloat($('#the-graph').attr('width'))
        let graphHeight = parseFloat($('#the-graph').attr('height'))

        $("#the-graph").empty();
        creatingGraph();
      });

      $(window).trigger('resize');

      /* Showing tooltips on click */
      $('.line-graph-data-circle').click(function (e) {
        /* Clearing data from prev tooltips calls */
        $('body').off('click');
        $('.line-graph-data-circle').attr('r', 3);
        let currentEl = e.target;
        let currentElJquery = $(this);

        /* Display a tooltip always inside the chart */
        let pointX = parseFloat($(this).attr('cx'));
        let pointY = parseFloat($(this).attr('cy'));

        let posTop = $(this).position().top;
        let posLeft = $(this).position().left - 50;
        let transform = 'translateY(-50%)';

        if (pointX + $('.history-graph-tooltip').width() > $('#the-graph').width()) {
          posLeft = $(this).position().left - 130 - $('.history-graph-tooltip').width();
        }
        if (pointY + $('.history-graph-tooltip').height() / 2 > $('#the-graph').height()) {
          transform = 'translateY(-100%)'
        }
        if (pointY - $('.history-graph-tooltip').height() / 2 < 0) {
          transform = 'unset'
        }
        $('.history-graph-tooltip').css({
          'display': 'flex',
          'top': posTop,
          'left': posLeft,
          'transform': transform
        });


        $(this).attr('r', '6');
        $('#tooltip-date').text(moment(new Date($(this).attr('data-date'))).format('DD.MM.YYYY'))
        $('#tooltip-result').text(`${$(this).attr('data-result')} л.`);
        $('#tooltip-lactation').text(`#${$(this).attr('data-lact-number')}`);
        $('.hgt-edit-btn').attr('href', `/herd/edit-milking-result/${$(this).attr('data-animal-id')}/${$(this).attr('data-index')}`)
        $('.history-graph-tooltip').css('border-color', $(this).css('stroke'));


        /* Removing tooltips after clicked somewhere else */
        $('body').click(function (e) {
          if (currentEl !== e.target && e.target.parentElement.id !== `history-graph-tooltip`) {
            $('.line-graph-data-circle').attr('r', 3);
            $('.history-graph-tooltip').hide();
          }

        });
      });



    };
  }


  ///////////////////////
  /* ADD MILKING RESULTS PAGE */
  ///////////////////////
  if (document.querySelector('#milking-results-container')) {

    $('#lactation-number').find('.ai-pick').on('mouseenter', function () {
      $(this).parent().append(`
        <div class="ai-input-explain-block ai-input-explain-block-info">
          <div class="ai-input-eb-tri"></div>
          <div class="ai-input-eb-title">Лактация #${$(this).attr('data-number')}</div>
          <div class="ai-input-eb-text">${moment($(this).attr('data-start-date')).format('DD.MM.YYYY')} - ${$(this).attr('data-finish-date-exist') === 'true' ? moment($(this).attr('data-finish-date')).format('DD.MM.YYYY') : '...'}</div>
        </div>
        `)
    });
    $('#lactation-number').find('.ai-pick').on('mouseleave', function () {
      $(this).parent().find('.ai-input-explain-block').remove();
    });


    $('#result-date').on('click keyup change', function () {
      let valDate = new Date($('#result-date').val());
      if ($(this).val() !== '') {
        $('#lactation-number').find('.ai-pick').each(function () {
          let startDate = new Date($(this).attr('data-start-date'));
          let finishDate = new Date($(this).attr('data-finish-date'));

          if (valDate.getTime() >= startDate.getTime() && valDate < finishDate.getTime()) {
            $(this).addClass('ai-pick-active')
          } else {
            $(this).removeClass('ai-pick-active')
          }
        });

        if ($('#lactation-number').find('.ai-pick-active').length < 1) {
          $('#lactation-number').find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $('#lactation-number').find('.ai-input-marker-s').remove() }, 800)

          if ($(this).parent().parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().parent().find('.ai-warning-text').length === 0) {
            $(this).parent().parent().append(`<div class="ai-warning-text">Дата не совпадает ни с одной лактацией</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {

          if ($('#lactation-number').find('.ai-input-marker-s').length === 0) {
            $('#lactation-number').append(`
          <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
          </div>`)
          }

          $(this).parent().parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $(this).parent().parent().find('.ai-input-marker-f').remove() }, 800)
          setTimeout(() => { $(this).parent().parent().find('.ai-warning-text').remove() }, 800)

          $(this).addClass('ai-valid-input');
        }
      }

      $('.ai-input-half-text').trigger('keyup');
    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('.ai-valid-input').length === 2 && $('#lactation-number').find('.ai-pick-active').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const date = $('#result-date').val();
      const result = parseFloat($('#result').val());
      const lactationNumber = parseFloat($('.ai-pick-active').attr('data-number'));

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await addAnimalResults('milking-results', animalId, { date, result, lactationNumber });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });

  }

  ///////////////////////
  /* FOR ALL WEIGHT CHANGE PAGES */
  ///////////////////////
  if (document.querySelector('#weight-results-container') || document.querySelector('#edit-weight-results-container')) {
    /* Historical graph */
    if (document.querySelector('.animal-results-history')) {
      /* Declaring the graph element */
      const graph = document.querySelector('#the-graph');

      let creatingGraph = () => {
        /* Getting and sorting animal and average data data */
        let animalData = [];
        let maxResult = 0;
        $('.animal-results-data-box').find('.animal-result-data').each(function () {
          animalData.push({
            date: new Date($(this).attr('data-date')),
            result: parseFloat($(this).attr('data-result')),
            index: $(this).attr('data-index')
          });

          if (parseFloat($(this).attr('data-result')) > maxResult) maxResult = parseFloat($(this).attr('data-result'));
        });

        animalData.sort((a, b) => a.date - b.date);

        let averageData = [];
        let averageDataLine = [];
        $('.animal-results-average-box').find('.animal-average-data').each(function () {
          const date = new Date($(this).attr('data-date'));
          if (animalData[0].date <= date && date <= animalData[animalData.length - 1].date) {
            averageData.push({
              date: new Date($(this).attr('data-date')),
              result: parseFloat($(this).attr('data-result'))
            });

            if (parseFloat($(this).attr('data-result')) > maxResult) maxResult = parseFloat($(this).attr('data-result'));
          }
        });

        averageData.sort((a, b) => a.date - b.date);

        /* Getting the approx. size of each grid cell (since I want to make it square) */
        maxResult = Math.round((maxResult + 100) / 100) * 100;
        let lineAmount = maxResult >= 500 ? 100 : 50;

        let horGap = Math.round(parseFloat($('#the-graph').attr('height')) / (maxResult / lineAmount));
        let vertGap = parseFloat($('#the-graph').attr('width')) / horGap;

        /* Adding grid lines to Y-axis */
        for (let i = 1; i < vertGap; i++) {
          let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('line-graph-grid-line');
          path.setAttribute('d', `M ${i * horGap} 0 L ${i * horGap} ${parseFloat($('#the-graph').attr('height'))}`)
          graph.append(path);
        }

        /* Adding grid lines and labels to X-axis */
        for (let i = 1; i < (maxResult / lineAmount); i++) {
          let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('line-graph-grid-line');
          path.setAttribute('d', `M 0 ${i * horGap} L ${parseFloat($('#the-graph').attr('width'))} ${i * horGap}`)
          graph.append(path);

          /* let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
          text.classList.add('line-graph-grid-text');
          text.setAttribute('x', `5`)
          text.setAttribute('y', `${parseFloat($('#the-graph').attr('height')) - (i * horGap - 1)}`)
          text.textContent = `${i * lineAmount}`
          graph.append(text); */
        }

        /* Adding 2 lines at the top and bottom */
        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.classList.add('line-graph-grid-line');
        path.setAttribute('d', `M 0 0 L ${parseFloat($('#the-graph').attr('width'))} 0`)
        graph.append(path);

        path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.classList.add('line-graph-grid-line');
        path.setAttribute('d', `M 0 ${parseFloat($('#the-graph').attr('height'))} L ${parseFloat($('#the-graph').attr('width'))} ${parseFloat($('#the-graph').attr('height'))}`)
        graph.append(path);



        /* Adding average line and dots */
        let daysSpan = Math.round((new Date(animalData[animalData.length - 1].date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);

        averageData.forEach((result, index, array) => {
          let daysFromFirst = Math.round((new Date(result.date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);

          /* Adding points */
          var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.classList.add('line-graph-average-circle');
          circle.setAttribute('cx', daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30);
          circle.setAttribute('cy', parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult)));
          circle.setAttribute('r', 2);
          graph.append(circle);


          /* Preparing second array for average line */
          if (averageDataLine.length < 1) {
            averageDataLine.push({ date: result.date, results: [result.result] })
          } else {
            let toPush = true;
            for (let i = 0; i < averageDataLine.length; i++) {
              if (moment(averageDataLine[i].date).year() === moment(result.date).year()) {
                averageDataLine[i].results.push(result.result);
                toPush = false;
              }
            }

            if (toPush) {
              averageDataLine.push({ date: result.date, results: [result.result] });
            }
          }
        });

        /* Counting averages and adding lines */
        averageDataLine.forEach((result, index, array) => {
          let daysFromFirst = Math.round((new Date(result.date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);
          let total = 0
          result.results.forEach(el => total += el);
          let average = parseFloat((total / result.results.length).toFixed(1));


          if (index === 0 || result.lactationNumber !== array[index - 1].lactationNumber) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path.classList.add('line-graph-average-line');
            path.setAttribute('d', `M ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (average * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
            path.setAttribute('id', `animal-line-average`);
            graph.append(path);
          } else {
            let path = document.getElementById(`animal-line-average`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (average * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
          }
        });


        /* Adding animal data to the chart */
        animalData.forEach((result, index, array) => {
          let daysFromFirst = Math.round((new Date(result.date).getTime() - new Date(animalData[0].date).getTime()) / 1000 / 60 / 60 / 24);

          /* Adding lines */
          if (index === 0 || result.lactationNumber !== array[index - 1].lactationNumber) {
            let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path.classList.add('line-graph-data-line');
            path.classList.add(`line-graph-data-line-1`);
            path.setAttribute('d', `M ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
            path.setAttribute('id', `animal-line-1`);
            graph.append(path);
          } else {
            let path = document.getElementById(`animal-line-1`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30} ${parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult))}`)
          }

          /* Adding points */
          var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.classList.add('line-graph-data-circle');
          circle.classList.add(`line-graph-data-circle-1`);
          circle.setAttribute('cx', daysFromFirst * ((parseFloat($('#the-graph').attr('width')) - 60) / daysSpan) + 30);
          circle.setAttribute('cy', parseFloat($('#the-graph').attr('height')) - (result.result * (parseFloat($('#the-graph').attr('height')) / maxResult)));
          circle.setAttribute('r', 3);
          circle.setAttribute('data-result', result.result);
          circle.setAttribute('data-date', result.date);
          circle.setAttribute('data-animal-id', graph.getAttribute('data-animal-id'));
          circle.setAttribute('data-index', result.index);
          graph.append(circle);
        });
      }

      $(window).resize(function () {
        $('#the-graph').attr('width', $('#the-graph').parent().width()).attr('height', Math.round($('#the-graph').parent().width() / 1.75));
        let graphWidth = parseFloat($('#the-graph').attr('width'))
        let graphHeight = parseFloat($('#the-graph').attr('height'))

        $("#the-graph").empty();
        creatingGraph();
      });

      $(window).trigger('resize');

      /* Showing tooltips on click */
      $('.line-graph-data-circle').click(function (e) {
        /* Clearing data from prev tooltips calls */
        $('body').off('click');
        $('.line-graph-data-circle').attr('r', 3);
        let currentEl = e.target;
        let currentElJquery = $(this);

        /* Display a tooltip always inside the chart */
        let pointX = parseFloat($(this).attr('cx'));
        let pointY = parseFloat($(this).attr('cy'));

        let posTop = $(this).position().top;
        let posLeft = $(this).position().left - 50;
        let transform = 'translateY(-50%)';

        if (pointX + $('.history-graph-tooltip').width() > $('#the-graph').width()) {
          posLeft = $(this).position().left - 130 - $('.history-graph-tooltip').width();
        }
        if (pointY + $('.history-graph-tooltip').height() / 2 > $('#the-graph').height()) {
          transform = 'translateY(-100%)'
        }
        if (pointY - $('.history-graph-tooltip').height() / 2 < 0) {
          transform = 'unset'
        }
        $('.history-graph-tooltip').css({
          'display': 'flex',
          'top': posTop,
          'left': posLeft,
          'transform': transform
        });


        $(this).attr('r', '6');
        $('#tooltip-date').text(moment(new Date($(this).attr('data-date'))).format('DD.MM.YYYY'))
        $('#tooltip-result').text(`${$(this).attr('data-result')} кг.`);
        $('.hgt-edit-btn').attr('href', `/herd/edit-weight-result/${$(this).attr('data-animal-id')}/${$(this).attr('data-index')}`)
        $('.history-graph-tooltip').css('border-color', $(this).css('stroke'));


        /* Removing tooltips after clicked somewhere else */
        $('body').click(function (e) {
          if (currentEl !== e.target && e.target.parentElement.id !== `history-graph-tooltip`) {
            $('.line-graph-data-circle').attr('r', 3);
            $('.history-graph-tooltip').hide();
          }

        });
      });



    };
  }

  ///////////////////////
  /* ADD WEIGHT CHANGE PAGE */
  ///////////////////////
  if (document.querySelector('#weight-results-container')) {
    $('*').on('click change keyup mouseenter', function () {
      if ($('.ai-valid-input').length === 2) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });


    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const date = $('#result-date').val();
      const result = parseFloat($('#result').val());

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await addAnimalResults('weight', animalId, { date, result });

      if (response) {
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => { location.reload(true) }, 1500)
        /* location.assign('/herd/all-animals'); */
      }
    });


  }

  ///////////////////////
  /* FOR ALL LACTATION PAGES */
  ///////////////////////
  if (document.querySelector('#add-lactation-container') || document.querySelector('#edit-lactation-container')) {
    /* Working with lactation number */
    $('.invis-lact-data').each(function () {
      let number = parseFloat($(this).attr('data-number'));
      $('#lactation-number').find('.ai-pick').each(function () {
        if (number === parseFloat($(this).text()) && $(this).attr('data-current') !== 'true') {
          $(this).addClass('ai-pick-unav');
        }
      });
    });

   /* Validating start date */
   $('#start-date').on('keyup change', async function () {
    if ($(this).val() !== '') {

      if (new Date($(this).val()) <= new Date($(this).attr('data-animal-birth')) || new Date($(this).val()) >= new Date()) {
        $(this).parent().find('.ai-input-marker-s').remove();
        if ($(this).parent().find('.ai-input-marker-f').length === 0) {
          $(this).parent().append(`
        <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
          <ion-icon name="close-sharp"></ion-icon>
        </div>`)
        }

        if ($(this).parent().find('.ai-warning-text').length === 0) {
          $(this).parent().append(`<div class="ai-warning-text">Введите корректную дату</div>`)
        }

        $(this).removeClass('ai-valid-input');
      } else {
        $(this).parent().find('.ai-input-marker-f').remove();
        if ($(this).parent().find('.ai-input-marker-s').length === 0) {
          $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
          <ion-icon name="checkmark-sharp"></ion-icon>
          </div>`)
        }

        $(this).parent().find('.ai-warning-text').remove()

        $(this).addClass('ai-valid-input');
      }
    } else {
      $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
      $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
      setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
      setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
      setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

      $(this).removeClass('ai-valid-input');
    }

  });

   /* Validating finish date */
   $('#finish-date').on('keyup change', async function () {
    if ($(this).val() !== '') {

      if (new Date($(this).val()) <= new Date($('#start-date').val()) || new Date($(this).val()) >= new Date()) {
        $(this).parent().find('.ai-input-marker-s').remove();
        if ($(this).parent().find('.ai-input-marker-f').length === 0) {
          $(this).parent().append(`
        <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
          <ion-icon name="close-sharp"></ion-icon>
        </div>`)
        }

        if ($(this).parent().find('.ai-warning-text').length === 0) {
          $(this).parent().append(`<div class="ai-warning-text">Введите корректную дату</div>`)
        }

        $(this).removeClass('ai-valid-input');
      } else {
        $(this).parent().find('.ai-input-marker-f').remove();
        if ($(this).parent().find('.ai-input-marker-s').length === 0) {
          $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
          <ion-icon name="checkmark-sharp"></ion-icon>
          </div>`)
        }

        $(this).parent().find('.ai-warning-text').remove()

        $(this).addClass('ai-valid-input');
      }
    } else {
      $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
      $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
      setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
      setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
      setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

      $(this).removeClass('ai-valid-input');
    }

  });


  $('*').on('click change keyup mouseenter', function () {
    if ($('#start-date').hasClass('ai-valid-input') && $('#lactation-number').find('.ai-pick-active').length > 0) {
      $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
    } else {
      $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
    }
  });

  }
  ///////////////////////
  /* ADD LACTATION */
  ///////////////////////
  if (document.querySelector('#add-lactation-container')) {

    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const startDate = new Date($('#start-date').val());
      let finishDate = $('#finish-date').val() !== '' ? new Date($('#finish-date').val()) : undefined;
      const number = parseFloat($('#lactation-number').find('.ai-pick-active').text());


      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await addAnimalResults('lactation', animalId, { startDate, finishDate, number });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)
      }
    });

  }

  ///////////////////////
  /* ADD INSEMINATION */
  ///////////////////////
  if (document.querySelector('#add-insemination-container')) {
    /* Validating date */
    $('#date').on('keyup change', async function () {
      if ($(this).val() !== '') {

        if (new Date($(this).val()) <= new Date($(this).attr('data-animal-birth')) || new Date($(this).val()) >= new Date()) {
          $(this).parent().find('.ai-input-marker-s').remove();
          if ($(this).parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().find('.ai-warning-text').length === 0) {
            $(this).parent().append(`<div class="ai-warning-text">Введите корректную дату</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {
          $(this).parent().find('.ai-input-marker-f').remove();
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }

          $(this).parent().find('.ai-warning-text').remove()

          $(this).addClass('ai-valid-input');
        }
      } else {
        $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

        $(this).removeClass('ai-valid-input');
      }

    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const date = new Date($('#date').val());
      const bull = $('#bull').attr('data-id') === '' ? undefined : $('#bull').attr('data-id');
      let type;
      if ($('#type').find('.ai-pick-active').length > 0) {
        type = $('#type').find('.ai-pick-active').attr('id');
      }
      let success;
      if ($('#insemination').find('.ai-pick-active').length > 0) {
        success = $('#insemination').find('.ai-pick-active').attr('id') === 'success';
      }

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await addAnimalResults('insemination', animalId, { date, success, bull, type });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)
      }
    });

    /* if (document.querySelector('#acb-insemination-chart')) {
      let successful = 0;
      let failure = 0;

      $('#acb-insemination-chart').parent().find('.acb-graph-invisible').each(function () {
        if ($(this).attr('data-success') === 'true') {
          successful++;
        } else {
          failure++
        }
      });


      let data = {
        labels: ['Успешно %', 'Не успешно %'],
        datasets: [
          {
            label: 'Успешно',
            data: [successful / (successful + failure) * 100, failure / (successful + failure) * 100],
            backgroundColor: ['#0EAD69', '#D44D5C'],
            weight: 0.5
          },
          {
            label: 'Не успешно',
            data: failure / (successful + failure) * 100,
            backgroundColor: '#D44D5C'
          }
        ]
      }

      doughnutChart($('#acb-insemination-chart'), false, data)
    } */

  }

  ///////////////////////
  /* ALL ANIMALS PAGE */
  ///////////////////////
  if (document.querySelector('.all-animals-container')) {
    $('#all-animals-search').keyup(function () {
      $('.al-animal').each(function () {
        if ($(this).find('.al-item-name').text().startsWith($('#all-animals-search').val()) || $(this).find('.al-item-number').text().startsWith($('#all-animals-search').val())) {
          $(this).detach().prependTo($('.animals-list-block'));
        }
      });
    });

    $('.all-former-animals').click(function () {
      if ($(this).attr('data-state') === 'show') {
        $('.al-animal-former').css('display', 'flex');
        $(this).find('ion-icon').show();
        $(this).attr('data-state', 'hide');
      } else {
        $('.al-animal-former').css('display', 'none');
        $(this).find('ion-icon').hide();
        $(this).attr('data-state', 'show');
      }
    });
  }

  ///////////////////////
  /* ANIMAL CARD PAGE */
  ///////////////////////
  if (document.querySelector('.animal-card-body')) {
    /* Showing large image */
    $('.ami-header').find('img').click(function () {
      $('body').prepend(`<div class="large-image-background"><img class="large-image" src="${$(this).attr('src')}"></div>`)
    });

    $('body').delegate('.large-image-background', 'click', function () {
      $(this).remove();
    });

    /* Adding or removing edit block */
    $('.acb-edit-info-btn').click(function () {
      if ($(this).parent().find('.edit-blur-block').css('display') === 'none') {
        $(this).parent().find('.edit-blur-block').css('display', 'flex');
        $(this).find('ion-icon').attr('name', 'close-outline');
      } else {
        $(this).parent().find('.edit-blur-block').css('display', 'none');
        $(this).find('ion-icon').attr('name', 'menu-outline');
      }
    });

    /* Toggling additional images visibility */
    $('.ami-add-photos-btn').click(function () {
      if ($(this).parent().find('img').css('display') === 'none') {
        $(this).parent().find('img').slideDown(1);
        $(this).find('ion-icon').attr('name', 'chevron-up-outline')
      } else {
        $(this).parent().find('img').slideUp(1);
        $(this).find('ion-icon').attr('name', 'chevron-down-outline')
      }
    });

    /* Toggle action btns container */
    $('.ami-action-btn-openner').click(function () {
      $('.ami-action-btns-block').removeClass('animate__animated').removeClass('animate__fadeOut').removeClass('animate__fadeIn');
      if (!$(this).hasClass('action-openned')) {
        $('.ami-action-btns-container').animate({ 'height': '100%' }, 0);
        $(this).find('ion-icon').css({ 'transform': 'rotate(45deg)' });
        $('.ami-action-btns-block').addClass('animate__animated').addClass('animate__fadeIn').css('display', 'flex');
        $('.ami-action-btn-openner p').text('СКРЫТЬ');
      } else {
        $(this).find('ion-icon').css({ 'transform': 'rotate(0deg)' });
        $('.ami-action-btns-block').addClass('animate__animated').addClass('animate__fadeOut').addClass('animate__slow').css('display', 'none');
        $('.ami-action-btns-container').animate({ 'height': '50px' }, 0);
        $('.ami-action-btn-openner p').text('ДОБАВИТЬ');
      }

      $(this).toggleClass('action-openned');
    });

    /* Projection milking tile graph */
    let milkingProjection = await getMilkingProjection($('.main-section').attr('data-animal-id'));
    let milkingProjectionSorted = [];

    milkingProjection.forEach(data => {
      if (milkingProjectionSorted.find(el => el.lactation === data.lactation)) {
        milkingProjectionSorted.find(el => el.lactation === data.lactation).results.push(data);
      } else {
        milkingProjectionSorted.push({
          lactation: data.lactation,
          results: [data]
        });
      }
    });

    $('.acb-tile-graph').empty();
    milkingProjectionSorted.forEach(lact => {
      $('.acb-tile-graph').append(`
        <div class="acb-tile-graph-line" id="tile-graph-line-${lact.lactation}">
          <p>Лактация #${lact.lactation}</p>
          <div class="acb-tile-line-res-box"></div>
        </div>
      `)

      lact.results.forEach((res, inx) => {
        $(`#tile-graph-line-${lact.lactation}`).find('.acb-tile-line-res-box').append(`
          <div class="acb-tile acb-tile-visible ${res.type === 'projected' ? 'acb-tile-projected' : ''}" data-number="${res.monthIn}" data-result="${res.average}">
            <div class="acb-tile-title">#${res.monthIn}</div>
            <div class="acb-tile-result">${res.average.toFixed(1)}</div>
          </div>
        `)
      });
    });

    $('.acb-tile-line-res-box').each(function () {
      let lastNumber = $(this).find('.acb-tile').last().attr('data-number');

      if ($(this).find('.acb-tile').first().attr('data-number') != 0) {
        $(this).prepend(`
          <div class="acb-tile acb-tile-invis" data-number="0">
            <div class="acb-tile-title">#0</div>
            <div class="acb-tile-result">0.0</div>
          </div>
        `)
      }

      $('.acb-tile').each(function () {
        if ($(this).next().length !== 0 && parseFloat($(this).next().attr('data-number')) !== parseFloat($(this).attr('data-number')) + 1) {
          $(this).after(`
          <div class="acb-tile acb-tile-invis" data-number="${parseFloat($(this).attr('data-number')) + 1}" data-result="0">
            <div class="acb-tile-title">#${parseFloat($(this).attr('data-number')) + 1}</div>
            <div class="acb-tile-result">0.0</div>
          </div>
        `)
        }
      });
    });

    $('.acb-tile-visible').mouseenter(function () {
      $('.acb-tile-visible').css('opacity', '0.5');
      $(this).css('opacity', '1');
      $('#result').find('.acb-item-info').text(`${parseFloat($(this).attr('data-result')).toFixed(1)} л.`)

      if ($(this).prev().length !== 0 && parseFloat($(this).prev().attr('data-result')) !== 0) {
        $('#growth').find('.acb-item-info').text(`${(((parseFloat($(this).attr('data-result')) / parseFloat($(this).prev().attr('data-result'))) - 1) * 100).toFixed(1)} %`)
      }
    });
    $('.acb-tile-visible').mouseleave(function () {
      $('.acb-tile-visible').css('opacity', '1');
      $('#result').find('.acb-item-info').text(`-`)
      $('#growth').find('.acb-item-info').text(`-`)
    });


    /////////////////////////////////////
    /* TO IMPLEMENT IN THE NEXT UPDATE */
    /////////////////////////////////////
    /* Multiple lactations graph */
    if (document.querySelector('#acb-lactations-result-chart')) {
      let dataArr = [];
      let graphColors = ['#2a9d8f', '#264653', '#e9c46a', '#f4a261', '#e76f51'];
      let biggestArr = 0;

      $('#acb-lactations-result-chart').parent().find('.acb-graph-lactations').each(function () {
        let results = [];
        let number = parseFloat($(this).attr('data-number'));

        $('#acb-lactations-result-chart').parent().find('.acb-graph-results').each(function () {
          if (number === parseFloat($(this).attr('data-lactation-number'))) {
            results.push({ result: parseFloat($(this).attr('data-result')), date: new Date($(this).attr('data-date')) })
          }
        });

        results.sort((a, b) => { return a.date - b.date });

        dataArr.push({
          number,
          results,
          resultsByDay: [],
          startDate: new Date($(this).attr('data-start-date')),
          finishDate: $(this).attr('data-finish-date') === 'null' ? new Date(Date.now()) : new Date($(this).attr('data-finish-date'))
        });
      });

      let graphData = {
        labels: [],
        datasets: []
      }

      dataArr.forEach((lact, index, array) => {
        let daysIntoLactation = Math.round((lact.finishDate.getTime() - lact.startDate.getTime()) / 1000 / 60 / 60 / 24);

        for (let i = 0; i <= daysIntoLactation; i++) {
          let day = lact.startDate.getTime() + i * 24 * 60 * 60 * 1000;

          lact.results.forEach((result, inx, arr) => {
            if (result.date.getTime() > day && inx === 0) {
              let daysPeriod = Math.round((result.date.getTime() - lact.startDate.getTime()) / 1000 / 60 / 60 / 24);
              if (arr[inx + 1]) {
                let addNumber = parseFloat(((arr[inx + 1].result - result.result) / daysPeriod).toFixed(2))
                if (lact.resultsByDay.length > 0) {

                  if (Math.round((result.date.getTime() - lact.startDate.getTime()) / 1000 / 60 / 60 / 24) === i + 1) {
                    lact.resultsByDay.push(result.result);
                  } else {
                    lact.resultsByDay.push(parseFloat((lact.resultsByDay[lact.resultsByDay.length - 1] + addNumber).toFixed(2)));
                  }
                } else {
                  lact.resultsByDay.push(parseFloat((result.result - (arr[inx + 1].result - result.result) + addNumber).toFixed(2)));
                }
              } else {
                lact.resultsByDay.push(result.result);
              }

            } else if (result.date.getTime() > day && arr[inx - 1].date.getTime() <= day) {
              let daysPeriod = Math.round((result.date.getTime() - arr[inx - 1].date.getTime()) / 1000 / 60 / 60 / 24);
              let addNumber = parseFloat(((result.result - arr[inx - 1].result) / daysPeriod).toFixed(2))

              if (Math.round((result.date.getTime() - lact.startDate.getTime()) / 1000 / 60 / 60 / 24) === i + 1) {
                lact.resultsByDay.push(result.result);
              } else {
                lact.resultsByDay.push(parseFloat((lact.resultsByDay[lact.resultsByDay.length - 1] + addNumber).toFixed(2)));
              }

            } else if (result.date.getTime() <= day && arr.length > 1 && inx === arr.length - 1) {
              let daysPeriod = Math.round((result.date.getTime() - arr[inx - 1].date.getTime()) / 1000 / 60 / 60 / 24);
              let addNumber = parseFloat(((result.result - arr[inx - 1].result) / daysPeriod).toFixed(2))

              if (Math.round((result.date.getTime() - lact.startDate.getTime()) / 1000 / 60 / 60 / 24) === i + 1) {
                lact.resultsByDay.push(result.result);
              } else {
                lact.resultsByDay.push(parseFloat((lact.resultsByDay[lact.resultsByDay.length - 1] + addNumber).toFixed(2)));
              }
            }
          });

        }


        if (lact.resultsByDay.length > biggestArr) biggestArr = lact.resultsByDay.length;

        graphData.datasets.push({
          label: `Лактация # ${lact.number}`,
          data: lact.resultsByDay,
          borderColor: graphColors[lact.number - 1],
          backgroundColor: 'rgb(0, 0, 0, 0)',
          fill: false,
          pointBorderColor: 'rgb(0, 0, 0, 0)',
          pointBorderWidth: 0,
          borderWidth: 1.5,
        });
      });

      for (let i = 1; i <= biggestArr; i++) {
        graphData.labels.push(`${i} День`);
      }

      multipleLinesChart($('#acb-lactations-result-chart'), 0, 0, graphData, false);
    }

    /* One lactation and average graph */
    if (document.querySelector('#acb-milking-results-chart')) {

      /* Function to change graphs between lactations */
      const changeMilkingResultsGraph = (lactationNumber, startDate, finishDate) => {


        let milkingData = [];
        let averageData = [];

        $('#acb-milking-results-chart').parent().find('.acb-graph-animal').each(function () {
          if ($(this).attr('data-lact') == lactationNumber) {
            milkingData.push({
              number: parseFloat($(this).attr('data-result')),
              date: new Date($(this).attr('data-date')),
              lactation: lactationNumber,
              monthIn: Math.round((new Date($(this).attr('data-date')).getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24 / 30)
            });
          }
        });

        milkingData.sort((a, b) => a.monthIn - b.monthIn);

        /* $('#acb-milking-results-chart').parent().find('.acb-graph-average').each(function() {
          if($(this).attr('data-lact') == lactationNumber) {
            averageData.push({
              number: parseFloat($(this).attr('data-result')),
              date: new Date($(this).attr('data-date')),
              lactation: lactationNumber,
              monthIn: Math.round((new Date($(this).attr('data-date')).getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24 / 30)
            });
          }
        });

        averageData.sort((a, b) => a.monthIn - b.monthIn);

        let averageDataSorted = [];

        averageData.forEach(data => {
          if(averageDataSorted.length === 0 || averageDataSorted.find(el => el.monthIn === data.monthIn) === undefined) {
            averageDataSorted.push({
              monthIn: data.monthIn,
              total: data.number,
              results: [data],
              average: 0
            });
          } else {
            averageDataSorted.find(el => el.monthIn === data.monthIn).total += data.number;
            averageDataSorted.find(el => el.monthIn === data.monthIn).results.push(data);
          }
        }); */
        const parameters = {
          graphSettings: {
            timelineType: 'date',
            startDate: startDate,
            finishDate: finishDate,
            periodMonths: Math.round((finishDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24 / 30),
            min: 0,
            max: 50,
            showLegend: true,
            boxHeight: false,
            heightRatio: 0.75
          },
          tooltips: {
            type: 'simple', // Detailed or simple
            description: 'Результат',
            unitText: 'л.',
            dateUnit: 'month'
          },
          datasets: [
            {
              showPoint: true,
              pointColor: '#f4a261',
              showLine: true,
              lineColor: '#264653',
              averageGraph: false,
              showAllResults: false,
              breakLactations: false,
              legendName: 'Результат',
              tooltipName: `Лактация #${lactationNumber}`,
              data: milkingData
            }

            /* showPoint: true,
            pointColor: colors[index],
            showLine: true,
            lineColor: colors[index],
            averageGraph: true,
            showAllResults: false,
            breakLactations: true,
            legendName: `Лактация #${el.lactation}`,
            tooltipName: `Лактация #${el.lactation}`,
            data: el.data */
          ]
        };

        const graph = renderLineGraph(document.getElementById('acb-milking-results-chart'), parameters);


      }


      /* Changing graph on buttons click */
      $('#lactation-change').on('click change focus', function () {
        let startDate = new Date($('#lactation-change option:selected').attr('data-start'));
        let finishDate;
        if ($('#lactation-change option:selected').attr('data-finish') != 'null') {
          finishDate = new Date($('#lactation-change option:selected').attr('data-finish'));
        } else {
          finishDate = new Date();
        }
        let number = parseFloat($('#lactation-change option:selected').attr('data-number'));

        changeMilkingResultsGraph(number, startDate, finishDate);
      });

      $('#lactation-change').find('option').last().prev().attr('selected', 'true');

      $('#lactation-change').click();

    }

    /* Working with weight history graph */
    if (document.querySelector('#acb-weight-history-chart')) {
      /* Working with datas and creating a graph */
      let animalData = [];
      let avgBufData = [];
      let averageData = [];

      $('#acb-weight-history-chart').parent().find('.acb-graph-animal').each(function () {
        let timeInYears = Math.round((new Date($(this).attr('data-date')).getTime() - new Date($(this).attr('data-birth-date')).getTime()) / 1000 / 60 / 60 / 24 / 30 / 12);
        let result = parseFloat($(this).attr('data-result'));

        animalData.push({ timeInYears, result });
        animalData.sort((a, b) => a.timeInYears + b.timeInYears);
      });

      $('#acb-weight-history-chart').parent().find('.acb-graph-average').each(function () {
        let timeInYears = Math.round((new Date($(this).attr('data-date')).getTime() - new Date($(this).attr('data-birth-date')).getTime()) / 1000 / 60 / 60 / 24 / 30 / 12);
        let result = parseFloat($(this).attr('data-result'));

        if (timeInYears <= animalData[animalData.length - 1].timeInYears) {
          avgBufData.push({ timeInYears, result })
          avgBufData.sort((a, b) => a.timeInYears - b.timeInYears)
        }
      });

      avgBufData.forEach((el) => {
        if (averageData.length < 1) {
          averageData.push({ timeInYears: el.timeInYears, results: [el.result] })
        } else {
          let toPush = 0;
          for (let i = 0; i < averageData.length; i++) {
            if (averageData[i].timeInYears === el.timeInYears) {
              averageData[i].results.push(el.result);
              toPush++;
            }
          }

          if (toPush === 0) {
            averageData.push({ timeInYears: el.timeInYears, results: [el.result] });
          }
        }
      });

      averageData.forEach(el => {
        let total = 0;
        el.results.forEach(result => { total += result });
        el.averageResult = total / el.results.length;
      });

      let graphData = {
        labels: [],
        datasets: []
      };

      let tempData = []
      animalData.forEach(el => {
        graphData.labels.push(`${el.timeInYears} Год`);
        tempData.push(el.result);
      });

      graphData.datasets.push({
        label: `Результат животного (кг.)`,
        data: tempData,
        borderColor: 'rgba(41, 112, 69, 0.25)',
        backgroundColor: 'rgba(41, 112, 69, 0)',
        fill: false,
        pointBorderColor: 'rgb(0, 0, 0, 1)',
        borderWidth: 1.5,
      });

      tempData = [];
      averageData.forEach(el => {
        tempData.push(el.averageResult);
      });

      graphData.datasets.push({
        label: `Средний результат (кг.)`,
        data: tempData,
        borderColor: '#c8c8c8',
        backgroundColor: 'rgb(0, 0, 0, 0)',
        fill: false,
        pointBorderColor: 'rgb(0, 0, 0, 0)',
        pointBorderWidth: 0,
        borderWidth: 1.5,
      });

      multipleLinesChartOneActive($('#acb-weight-history-chart'), 0, 0, 100, graphData, false);

      /* Adding info to the header */
      if (animalData.length >= 2) {
        let yearDif = parseFloat((100 - (animalData[animalData.length - 2].result / animalData[animalData.length - 1].result * 100)).toFixed(2))
        $('#last-year-growth-weight').find('.acb-half-item-info').text(`${yearDif}%`);
      }

      if (animalData.length > 0 && averageData.length > 0) {
        let avgDif = parseFloat((100 - (averageData[averageData.length - 1].averageResult / animalData[animalData.length - 1].result * 100)).toFixed(2))
        $('#diff-avg-weight').find('.acb-half-item-info').text(`${avgDif}%`);
      }


    }

    /* Sitching insemination graphs */
    $('.mp-animal-graphs-switch-btn').on('click', function () {
      $(this).siblings().removeClass('mp-animal-graphs-switch-btn-active');
      $(this).addClass('mp-animal-graphs-switch-btn-active');

      $('.acb-graph-container-columns').hide();
      $(`#${$(this).attr('id').replace('-btn', '')}`).show();
    });
    /* Working with insemination successful rate graph */
    if (document.querySelector('#acb-insemination-success-rate-chart')) {
      let successful = 0;
      let failure = 0;

      $('#acb-insemination-success-rate-chart').parent().find('.acb-graph-invisible').each(function () {
        if ($(this).attr('data-success') === 'true') {
          successful++;
        } else {
          failure++
        }
      });

      let data = {
        labels: ['Успешно %', 'Не успешно %'],
        datasets: [
          {
            label: 'Успешно',
            data: [parseFloat((successful / (successful + failure) * 100).toFixed(1)), parseFloat((failure / (successful + failure) * 100).toFixed(1))],
            backgroundColor: ['#0EAD69', '#D44D5C'],
            weight: 0.5
          }
        ]
      }

      doughnutChart($('#acb-insemination-success-rate-chart'), true, 'Успешных осеменений', data)
    }

    /* Working with insemination attemps per lactation */
    if (document.querySelector('#acb-insemination-try-rate-chart')) {
      let insemData = [];
      let bufferData = []
      let finalData = [];
      let labels = []
      $('#acb-insemination-try-rate-chart').parent().find('.acb-graph-animal').each(function () {
        if ($(this).attr('data-success') !== 'undefined') {
          let result = $(this).attr('data-success') === 'true';
          insemData.push(result);
        }
      });


      let successCounter = 0;
      insemData.forEach((insem, index, arr) => {
        if (insem) {
          let addIndex = 'NaN';
          if (bufferData.length > 1) {
            bufferData.forEach((el, ix) => {
              if (el.number === successCounter + 1) {
                addIndex = ix;
              }
            });
          }
          if (addIndex === 'NaN') {
            bufferData.push({ number: successCounter + 1, counter: 1 });
          } else {
            bufferData[addIndex].counter += 1;
          }
          successCounter = 0;
        } else {
          successCounter++;
        }
      });

      let allResults = 0;
      bufferData.sort((a, b) => a.number - b.number);
      bufferData.forEach(el => { allResults += el.counter });

      bufferData.forEach(el => {
        labels.push(`${el.number} (%)`);
        finalData.push(parseFloat(((el.counter / allResults) * 100).toFixed(1)));
      });

      if (finalData.length === 0) {
        $('#acb-insemination-try-rate-chart').parent().hide();
        $('#acb-insemination-try-rate-chart').parent().parent().css('justify-content', 'center');
      }

      let data = {
        labels,
        datasets: [
          {
            data: finalData,
            backgroundColor: ['#2a9d8f', '#264653', '#e9c46a', '#f4a261', '#e76f51'],
            weight: 0.5
          }
        ]
      }

      doughnutChart($('#acb-insemination-try-rate-chart'), true, '', data)
    }

    /* Adding last insemination results */
    if (document.querySelector('#insemination-results-block')) {
      $('.acb-double-btn').click(async function () {
        let date = new Date($(this).parent().attr('data-date'));
        let success = $(this).attr('id') === 'insem-true';
        let animalId = $(this).parent().attr('data-animal-id');
        let index = $(this).parent().attr('data-index');

        const response = await editAnimalResults('insemination', animalId, index, { date, success });

        $('.acb-double-btn').css('pointer-events', 'none');

        if (response) location.reload(true)
      });
    }

    /* All items history block */
    if (document.querySelector('.animal-all-items-block')) {
      /* Sorting elements by date */
      $('.aai-item').each(function () {
        let thisEl = $(this);
        let thisDate = new Date($(this).attr('data-date'));

        $('.aai-item').each(function () {
          let curDate = new Date($(this).attr('data-date'));

          if (thisDate < curDate) {
            let moveEl = thisEl;
            thisEl.detach();
            $(this).after(moveEl);
          }
        });
      });

      $('.aai-type-selector').change(function () {
        let value = $(this).val()
        if (value === 'all') {
          $('.aai-item').css('display', 'flex');
        } else {
          $('.aai-item').each(function () {
            if ($(this).attr('data-type') === value) {
              $(this).css('display', 'flex');
            } else {
              $(this).hide();
            }
          });
        }
      });
    }

    /* Working with bring back animal block */
    if (document.querySelector('.ami-write-off-container')) {
      $('.ami-write-off-close').click(function () {
        $('.ami-write-off-container').hide();
        $('.ami-write-off-disclaimer').css('display', 'flex');
      });
      $('.ami-write-off-disclaimer').click(function () {
        $(this).hide();
        $('.ami-write-off-container').css('display', 'flex');
      });

      $('.ami-bring-back-btn').click(async function () {
        let animalId = $(this).attr('data-animal-id');

        let result = await bringBackAnimal(animalId);

        if (result) location.reload(true);
      });


    }

    /* Showing all treatments block */
    $('.mp-scheme-item-header').on('click', function () {
      if ($(this).parent().find('.mp-scheme-points-block').css('display') === 'none') {
        $(this).parent().find('.mp-scheme-points-block').show()
        $(this).parent().find('.mp-scheme-icon').css('transform', 'rotate(180deg)');
      } else {
        $(this).parent().find('.mp-scheme-points-block').hide()
        $(this).parent().find('.mp-scheme-icon').css('transform', 'rotate(0deg)');
      }
    });
  }

  ///////////////////////
  /* ALL EDIT PAGE */
  ///////////////////////
  if (document.querySelector('#all-edit-container')) {
    $('.initial-delete-btn').click(async function () {
      let initialBtn = $(this)
      initialBtn.parent().css('display', 'flex');
      initialBtn.hide();
      initialBtn.parent().find('.confirm-btns').show();

      let type = initialBtn.parent().parent().attr('data-type');
      let animalId = initialBtn.parent().parent().attr('data-animal-id');
      let itemId = initialBtn.parent().parent().attr('data-item-id');

      $('.confirm-delete-btn').click(async function () {
        let response = await deleteAnimalResults(type, animalId, itemId);

        if (response) {
          location.reload(true);
        }
      });

      $('.confirm-cancel-btn').click(function () {
        $(this).parent().find('.confirm-btns').hide();
        $(this).parent().css('display', 'none');
        initialBtn.show();
      });



    });
  }
  ///////////////////////
  /* EDIT MILKING RESULTS PAGES */
  ///////////////////////
  if (document.querySelector('#edit-milking-results-container')) {

    $('#lactation-number').find('.ai-pick').on('mouseenter', function () {
      $(this).parent().append(`
        <div class="ai-input-explain-block ai-input-explain-block-info">
          <div class="ai-input-eb-tri"></div>
          <div class="ai-input-eb-title">Лактация #${$(this).attr('data-number')}</div>
          <div class="ai-input-eb-text">${moment($(this).attr('data-start-date')).format('DD.MM.YYYY')} - ${$(this).attr('data-finish-date-exist') === 'true' ? moment($(this).attr('data-finish-date')).format('DD.MM.YYYY') : '...'}</div>
        </div>
        `)
    });
    $('#lactation-number').find('.ai-pick').on('mouseleave', function () {
      $(this).parent().find('.ai-input-explain-block').remove();
    });


    $('#result-date').on('click keyup change', function () {
      let valDate = new Date($('#result-date').val());
      if ($(this).val() !== '') {
        $('#lactation-number').find('.ai-pick').each(function () {
          let startDate = new Date($(this).attr('data-start-date'));
          let finishDate = new Date($(this).attr('data-finish-date'));

          if (valDate.getTime() >= startDate.getTime() && valDate < finishDate.getTime()) {
            $(this).addClass('ai-pick-active')
          } else {
            $(this).removeClass('ai-pick-active')
          }
        });

        if ($('#lactation-number').find('.ai-pick-active').length < 1) {
          $('#lactation-number').find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $('#lactation-number').find('.ai-input-marker-s').remove() }, 800)

          if ($(this).parent().parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().parent().find('.ai-warning-text').length === 0) {
            $(this).parent().parent().append(`<div class="ai-warning-text">Дата не совпадает ни с одной лактацией</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {

          if ($('#lactation-number').find('.ai-input-marker-s').length === 0) {
            $('#lactation-number').append(`
          <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
          </div>`)
          }

          $(this).parent().parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $(this).parent().parent().find('.ai-input-marker-f').remove() }, 800)
          setTimeout(() => { $(this).parent().parent().find('.ai-warning-text').remove() }, 800)

          $(this).addClass('ai-valid-input');
        }
      }

      $('.ai-input-half-text').trigger('keyup');
    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('.ai-valid-input').length === 2 && $('#lactation-number').find('.ai-pick-active').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input').trigger('keyup');

    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const index = $(this).attr('data-index');
      const date = $('#result-date').val();
      const result = parseFloat($('#result').val());
      const lactationNumber = parseFloat($('.ai-pick-active').attr('data-number'));

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editAnimalResults('milking-results', animalId, index, { date, result, lactationNumber });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });

  }

  ///////////////////////
  /* EDIT WEIGHT RESULTS PAGES */
  ///////////////////////
  if (document.querySelector('#edit-weight-results-container')) {
    $('*').on('click change keyup mouseenter', function () {
      if ($('.ai-valid-input').length === 2) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input').trigger('keyup');

    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const index = $(this).attr('data-index');
      const date = $('#result-date').val();
      const result = parseFloat($('#result').val());

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editAnimalResults('weight', animalId, index, { date, result });

      if (response) {
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => { location.reload(true) }, 1500)
        /* location.assign('/herd/all-animals'); */
      }
    });

  }

  ///////////////////////
  /* EDIT INSEMINATION  */
  ///////////////////////
  if (document.querySelector('#edit-insemination-container')) {
    /* Validating date */
    $('#date').on('keyup change', async function () {
      if ($(this).val() !== '') {

        if (new Date($(this).val()) <= new Date($(this).attr('data-animal-birth')) || new Date($(this).val()) >= new Date()) {
          $(this).parent().find('.ai-input-marker-s').remove();
          if ($(this).parent().find('.ai-input-marker-f').length === 0) {
            $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
          }

          if ($(this).parent().find('.ai-warning-text').length === 0) {
            $(this).parent().append(`<div class="ai-warning-text">Введите корректную дату</div>`)
          }

          $(this).removeClass('ai-valid-input');
        } else {
          $(this).parent().find('.ai-input-marker-f').remove();
          if ($(this).parent().find('.ai-input-marker-s').length === 0) {
            $(this).parent().append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }

          $(this).parent().find('.ai-warning-text').remove()

          $(this).addClass('ai-valid-input');
        }
      } else {
        $(this).parent().find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        $(this).parent().find('.ai-input-marker-f').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
        setTimeout(() => { $(this).parent().find('.ai-input-marker-s').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-input-marker-f').remove() }, 800)
        setTimeout(() => { $(this).parent().find('.ai-warning-text').remove() }, 800)

        $(this).removeClass('ai-valid-input');
      }

    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input').trigger('keyup');
    $('.ai-to-pick').trigger('click');
    $('.ai-select-item-selected').trigger('click');

    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const index = $(this).attr('data-index');
      const date = $('#date').val();
      const bull = $('#bull').attr('data-id') === '' ? undefined : $('#bull').attr('data-id');
      let type;
      if ($('#type').find('.ai-pick-active').length > 0) {
        type = $('#type').find('.ai-pick-active').attr('id');
      }
      let success;
      if ($('#insemination').find('.ai-pick-active').length > 0) {
        success = $('#insemination').find('.ai-pick-active').attr('id') === 'success';
      }

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editAnimalResults('insemination', animalId, index, { date, success, type, bull });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)
      }
    });

  }

  ///////////////////////
  /* EDIT LACTATION  */
  ///////////////////////
  if (document.querySelector('#edit-lactation-container')) {

    $('.ai-input').trigger('keyup');
    $('.ai-to-pick').trigger('click');


    $('.ai-input-submit-btn').click(async function () {
      const animalId = $(this).attr('data-animal-id');
      const index = $(this).attr('data-index');
      const startDate = $('#start-date').val();
      let finishDate = $('#finish-date').val() !== '' ? new Date($('#finish-date').val()) : undefined;
      const number = parseFloat($('#lactation-number').find('.ai-pick-active').text());

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editAnimalResults('lactation', animalId, index, { startDate, finishDate, number });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)
      }
    });

  }

  ///////////////////////
  /* HERD MAIN PAGE */
  ///////////////////////
  if (document.querySelector('#mp-herd-container')) {
    /* Main vars */
    let milkPerDay = { value: 0, growth: 0 }
    let milkPerMonth = { value: 0, growth: 0 }
    let milkAverage = { value: 0, growth: 0 }

    /* Getting and working with milking data */
    let milkingData = [];
    $('.mp-graph-data').each(function () {
      milkingData.push({
        result: parseFloat($(this).attr('data-result')),
        date: new Date($(this).attr('data-date')),
        lactation: parseFloat($(this).attr('data-lact')),
        cowId: $(this).attr('data-cow-id'),
        cowPhoto: $(this).attr('data-cow-photo'),
        cowNumber: $(this).attr('data-cow-number'),
        cowName: $(this).attr('data-cow-name')
      });
    });

    milkingData.sort((a, b) => a.date - b.date);

    /* Getting the last month data */
    let lastMonthData = [];
    milkingData.forEach((data, i, arr) => {
      let lastElDate = arr[arr.length - 1].date;
      if (moment(data.date).month() === moment(lastElDate).month() && moment(data.date).year() === moment(lastElDate).year()) {
        lastMonthData.push(data);
      }
    });

    lastMonthData.sort((a, b) => b.result - a.result);

    //Adding data to the milking results block
    lastMonthData.forEach((data, i, arr) => {
      milkPerDay.value += data.result;
    });
    milkPerMonth.value = milkPerDay.value * 30;
    milkAverage.value = parseFloat((milkPerDay.value / lastMonthData.length).toFixed(1));

    if (milkPerDay.value > 1000) {
      $('#milk-per-day').text(parseFloat((milkPerDay.value / 1000).toFixed(1)));
      $('#milk-per-day-text').text('тыс. л / день');
    } else {
      $('#milk-per-day').text(milkPerDay.value);
      $('#milk-per-day-text').text('литров / день');
    }
    if (milkPerMonth.value > 1000) {
      $('#milk-per-month').text(parseFloat((milkPerMonth.value / 1000).toFixed(1)))
      $('#milk-per-month-text').text('тыс. л / месяц');
    } else {
      $('#milk-per-month').text(milkPerMonth.value)
      $('#milk-per-month-text').text('литров / месяц');
    }

    $('#milk-average-cow').text(milkAverage.value)
    $('.mp-mr-main-number').text(milkAverage.value)

    //Adding data to the top cow block
    $('#tc-all-res').text(lastMonthData.length)
    $('#tc-avg-res').text(milkAverage.value)

    $('.mp-top-result').each(function () {
      let index = parseFloat($(this).attr('id').split('-')[1]);
      $(this).find('.mp-top-result-number').text(`#${lastMonthData[index].cowNumber}`);
      $(this).find('.mp-top-result-name').text(`${lastMonthData[index].cowName}`);
      $(this).find('.mp-top-result-result').text(`${lastMonthData[index].result}`);
      $(this).find('img').attr('src', `/img/images/${lastMonthData[index].cowPhoto}`);
    });

    let lastRusMonth = moment(lastMonthData[0].date).lang('ru').format('MMMM YYYY');
    lastRusMonth = lastRusMonth.charAt(0).toUpperCase() + lastRusMonth.slice(1);
    $('.mp-top-results-sub-title').text(`Последние результаты добавлены ${lastRusMonth}`)

    // Making milk result block work
    $('.mp-mr-main-btn').on('click', function () {
      let currentActive = $('.mp-mr-seconary-item-active')
      if ($(this).attr('id') === 'prev-result') {
        if (currentActive.prev().length === 0) {
          currentActive.removeClass('mp-mr-seconary-item-active')
          $('.mp-mr-seconary-item-last').addClass('mp-mr-seconary-item-active')
        } else {
          currentActive.removeClass('mp-mr-seconary-item-active')
          currentActive.prev().addClass('mp-mr-seconary-item-active')
        }
      } else if ($(this).attr('id') === 'next-result') {
        if (currentActive.next().length === 0) {
          currentActive.removeClass('mp-mr-seconary-item-active')
          $('.mp-mr-seconary-item-first').addClass('mp-mr-seconary-item-active')
        } else {
          currentActive.removeClass('mp-mr-seconary-item-active')
          currentActive.next().addClass('mp-mr-seconary-item-active')
        }
      }

      $('.mp-mr-main-number').text($('.mp-mr-seconary-item-active').find('.mp-mr-seconary-number').text())
      $('.mp-mr-main-sub-text').text($('.mp-mr-seconary-item-active').find('.mp-mr-seconary-sub-text').text())
    });

    // Working with lists
    $('.mpt-list-item-date').each(function () {
      let date = $(this).attr('data-date');
      let rusMonth = moment(date).lang('ru').format('MMMM');
      rusMonth = rusMonth.charAt(0).toUpperCase() + rusMonth.slice(1);
      $(this).text(`${moment(date).format('DD')} ${rusMonth}, ${moment(date).format('YYYY')}`)
    });


    let length;

    length = $('#mp-soon-to-calv-list').find('.mpt-list-item').length
    for (let i = 0; i < length; i++) {
      $('#mp-soon-to-calv-list').find('.mpt-list-item').each(function () {
        let number = parseFloat($(this).find('.mpt-list-item-day-text').text().split(' ')[0])
        let prevNumber = parseFloat($(this).prev().find('.mpt-list-item-day-text').text().split(' ')[0]);

        if (number < prevNumber) {
          let element = $(this);
          let prevElement = $(this).prev();

          $(this).detach();
          prevElement.before(element);
        }
      });
    }

    length = $('#mp-soon-to-insem-list').find('.mpt-list-item').length
    for (let i = 0; i < length; i++) {
      $('#mp-soon-to-insem-list').find('.mpt-list-item').each(function () {
        let number = parseFloat($(this).find('.mpt-list-item-day-text').text().split(' ')[0])
        let prevNumber = parseFloat($(this).prev().find('.mpt-list-item-day-text').text().split(' ')[0]);

        if (number < prevNumber) {
          let element = $(this);
          let prevElement = $(this).prev();

          $(this).detach();
          prevElement.before(element);
        }
      });
    }

    /* Handling empty lists */
    $('.mp-list-block').each(function () {
      if ($(this).children().length === 0) {
        /* $(this).prepend(`<div class="mp-empty-list">Данные отсутствуют</div>`) */
        $(this).parent().hide();
      }
    });


    /////////////////////
    // MAIN PAGE GRAPH
    /////////////////////
    /* Switching among graphs */
    $('.mp-animal-graphs-period-btn').on('click', function () {
      $(this).addClass('mp-animal-graphs-period-btn-active');
      $(this).siblings().removeClass('mp-animal-graphs-period-btn-active');

      $('.mp-animal-graphs-switch-btn-active').trigger('click');
    });
    $('.mp-animal-graphs-switch-btn').on('click', function () {
      $(this).addClass('mp-animal-graphs-switch-btn-active');
      $(this).siblings().removeClass('mp-animal-graphs-switch-btn-active');

      let period = 0;
      if ($('.mp-animal-graphs-period-btn-active').attr('data-period') === 'all-time') {
        period = Math.round((Date.now() - milkingData[0].date.getTime()) / 1000 / 60 / 60 / 24 / 30)
      } else {
        period = parseFloat($('.mp-animal-graphs-period-btn-active').attr('data-period'));
      }

      let milkingDataPeriod = milkingData.filter(data => data.date.getTime() > Date.now() - period * 1000 * 60 * 60 * 24 * 30);


      /* Creating the milk average graph */
      if ($(this).attr('id') === 'milk-average') {

        /* Adding average */
        let milkingAverage = [];

        milkingDataPeriod.forEach((result, index, array) => {
          /* Preparing second array */
          if (milkingAverage.length < 1) {
            milkingAverage.push({ date: result.date, results: [{ number: result.result, date: result.date }] })
          } else {
            let toPush = true;
            for (let i = 0; i < milkingAverage.length; i++) {
              if (moment(milkingAverage[i].date).month() === moment(result.date).month() && moment(milkingAverage[i].date).year() === moment(result.date).year()) {
                milkingAverage[i].results.push({ number: result.result, date: result.date });
                toPush = false;
              }
            }

            if (toPush) {
              milkingAverage.push({ date: result.date, results: [{ number: result.result, date: result.date }] });
            }
          }
        });

        /* Counting averages */
        milkingAverage.forEach((result, index, array) => {
          let total = 0;
          result.results.forEach(el => total += el.number);
          result.number = parseFloat((total / result.results.length).toFixed(1));
        });

        const parameters = {
          graphSettings: {
            timelineType: 'date',
            startDate: new Date(moment().subtract(period, 'month')),
            finishDate: new Date(),
            periodMonths: period,
            min: 0,
            max: 50,
            showLegend: true,
            boxHeight: true,
            //heightRatio: 0.75
          },
          tooltips: {
            type: 'simple', // Detailed or simple
            description: 'Сред. результат',
            unitText: 'л.',
            dateUnit: 'month'
          },
          datasets: [
            {
              showPoint: true,
              pointColor: '#f4a261',
              showLine: true,
              lineColor: '#264653',
              averageGraph: true,
              showAllResults: true,
              breakLactations: false,
              legendName: 'Молока в среднем',
              tooltipName: 'Молока в среднем',
              data: milkingAverage
            }
          ]
        };
        const graph = renderLineGraph(document.querySelector('.mp-animal-graph-container'), parameters);


        /* Showing the milk total graph */
      } else if ($(this).attr('id') === 'milk-total') {
        /* Couting totals */
        let milkingTotal = [];

        milkingData.forEach((result, index, array) => {
          /* Preparing second array for total line */
          if (milkingTotal.length < 1) {
            milkingTotal.push({ date: result.date, number: result.result })
          } else {
            let toPush = true;
            for (let i = 0; i < milkingTotal.length; i++) {
              if (moment(milkingTotal[i].date).month() === moment(result.date).month() && moment(milkingTotal[i].date).year() === moment(result.date).year()) {
                milkingTotal[i].number += result.result;
                toPush = false;
              }
            }

            if (toPush) {
              milkingTotal.push({ date: result.date, number: result.result });
            }
          }
        });

        /* Adding max result */
        let maxResult = 0;
        milkingTotal.forEach(total => {
          total.number = total.number * 30;
          if (total.number > maxResult) maxResult = total.number
        });
        maxResult = Math.round((maxResult + 100) / 100) * 100;


        const parameters = {
          graphSettings: {
            timelineType: 'date',
            startDate: new Date(moment().subtract(period, 'month')),
            finishDate: new Date(),
            periodMonths: period,
            min: 0,
            max: maxResult,
            showLegend: true,
            boxHeight: true,
            //heightRatio: 0.75
          },
          tooltips: {
            type: 'simple', // Detailed or simple
            description: 'Молока в месяц',
            unitText: 'л.',
            dateUnit: 'month'
          },
          datasets: [
            {
              showPoint: true,
              pointColor: '#f4a261',
              showLine: true,
              lineColor: '#264653',
              averageGraph: false,
              showAllResults: false,
              breakLactations: false,
              legendName: 'Молока в месяц',
              tooltipName: 'Молока в месяц',
              data: milkingTotal
            }
          ]
        };
        const graph = renderLineGraph(document.querySelector('.mp-animal-graph-container'), parameters);


        /* Milk averages by lactations */
      } else if ($(this).attr('id') === 'milk-lact') {
        /* Adding average line and dots */
        let milkingAverage = [];

        milkingData.forEach((result, index, array) => {
          /* Preparing second array for average line */
          if (milkingAverage.length < 1) {
            milkingAverage.push({ date: result.date, results: [{ date: result.date, number: result.result }], lactation: result.lactation });
          } else {
            let toPush = true;
            for (let i = 0; i < milkingAverage.length; i++) {
              if (moment(milkingAverage[i].date).month() === moment(result.date).month() && moment(milkingAverage[i].date).year() === moment(result.date).year() && milkingAverage[i].lactation === result.lactation) {
                milkingAverage[i].results.push({ date: result.date, number: result.result });
                toPush = false;
              }
            }

            if (toPush) {
              milkingAverage.push({ date: result.date, results: [{ date: result.date, number: result.result }], lactation: result.lactation });
            }
          }
        });

        /* Counting averages and adding lines */
        milkingAverage.sort((a, b) => a.lactation - b.lactation);

        milkingAverage.forEach((result, index, array) => {
          let total = 0
          result.results.forEach(el => total += el.number);
          result.number = parseFloat((total / result.results.length).toFixed(1));
        });

        let milkAverageByLactation = [];
        milkingAverage.forEach(data => {
          if (!isNaN(data.lactation)) {
            if (milkAverageByLactation.length < 1) {
              milkAverageByLactation.push({ lactation: data.lactation, data: [data] });
            } else {
              let toPush = true;
              for (let i = 0; i < milkAverageByLactation.length; i++) {
                if (milkAverageByLactation[i].lactation === data.lactation) {
                  milkAverageByLactation[i].data.push(data);
                  toPush = false;
                }
              }

              if (toPush) {
                milkAverageByLactation.push({ lactation: data.lactation, data: [data] });
              }
            }
          }
        });


        const parameters = {
          graphSettings: {
            timelineType: 'date',
            startDate: new Date(moment().subtract(period, 'month')),
            finishDate: new Date(),
            periodMonths: period,
            min: 0,
            max: 50,
            showLegend: true,
            boxHeight: true,
            //heightRatio: 0.75
          },
          tooltips: {
            type: 'simple', // Detailed or simple
            description: 'Сред. результат',
            unitText: 'л.',
            dateUnit: 'month'
          },
          datasets: []
        };

        let colors = ['#2a9d8f', '#264653', '#e9c46a', '#f4a261', '#e76f51'];
        milkAverageByLactation.forEach((el, index) => {
          parameters.datasets.push({
            showPoint: true,
            pointColor: colors[index],
            showLine: true,
            lineColor: colors[index],
            averageGraph: true,
            showAllResults: false,
            breakLactations: true,
            legendName: `Лактация #${el.lactation}`,
            tooltipName: `Лактация #${el.lactation}`,
            data: el.data
          });
        });

        const graph = renderLineGraph(document.querySelector('.mp-animal-graph-container'), parameters);

      }

    });

    $('.mp-animal-graphs-switch-btn-active').trigger('click');

  }

  ///////////////////////
  /* HERD LIST MILKING RESULTS */
  ///////////////////////
  if (document.querySelector('#list-milking-results')) {

    $('.rl-date-btn').on('click focus blur change', function () {
      let date = new Date($(this).val());

      $('.rl-small-lact').each(function () {
        $(this).removeClass('rl-small-lact-active')
        if (new Date($(this).attr('data-start-date')) < date && date < new Date($(this).attr('data-finish-date'))) {
          $(this).addClass('rl-small-lact-active');
        }
      });

      $('.al-animal').each(function () {
        if ($(this).find('.rl-small-lact-active').length === 0) {
          $(this).css({
            'opacity': '0.5',
            'pointer-events': 'none'
          });
        } else {
          $(this).css({
            'opacity': '1',
            'pointer-events': 'auto'
          });
        }
      });
    });

    $('.rl-date-btn').val(moment().format('YYYY-MM-DD'));
    $('.rl-date-btn').trigger('change');

    let amountToDo = 0
    $('.rl-add-btn').click(function () {
      $(this).css({
        'pointer-events': 'none',
        'filter': 'grayscale(1)'
      });

      $('.al-animal').each(function () {
        if ($(this).find('.rl-small-lact-active').length === 1 && $(this).find('.rl-result').val().length > 0) {
          amountToDo++;
        }
      });

      $('.al-animal').each(async function () {
        if ($(this).find('.rl-small-lact-active').length === 1 && $(this).find('.rl-result').val().length > 0) {
          let date = new Date($('.rl-date-btn').val());
          let result = parseFloat($(this).find('.rl-result').val());
          let lactationNumber = parseFloat($(this).find('.rl-small-lact-active').text());
          let animalId = $(this).attr('data-id');

          let res = await addAnimalResults('milking-results', animalId, { date, result, lactationNumber });
          if (res) amountToDo--;

          if (amountToDo === 0) {
            $('.all-animals-container').css({
              'display': 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            });
            addConfirmationEmpty($('.all-animals-container'));
            setTimeout(() => { location.reload(true) }, 2000);
          }
        }
      });


    });


  }

  ///////////////////////
  /* HERD LIST INSEMINATIONS */
  ///////////////////////
  if (document.querySelector('#list-inseminations')) {
    $('.rl-big-lact').click(function () {
      if ($(this).hasClass('rl-big-lact-active')) {
        $(this).removeClass('rl-big-lact-active');
      } else {
        $(this).siblings().removeClass('rl-big-lact-active');
        $(this).addClass('rl-big-lact-active');
      }
    });

    $('.rl-result').on('click change blur focus', function () {
      if ($(this).val() !== '') {
        $(this).parent().parent().find('.al-animal-mark').show();
      } else {
        $(this).parent().parent().find('.al-animal-mark').hide();
      }
    });

    let amountToDo = 0
    $('.rl-add-btn').click(function () {
      $(this).css({
        'pointer-events': 'none',
        'filter': 'grayscale(1)'
      });

      $('.al-animal').each(function () {
        if ($(this).find('.al-animal-mark').css('display') === 'block') {
          amountToDo++;
        }
      });

      $('.al-animal').each(async function () {
        if ($(this).find('.al-animal-mark').css('display') === 'block') {
          let date = new Date($('.rl-result').val());
          let success;
          if ($(this).find('.rl-big-lact-active').length > 0) {
            success = $('.rl-big-lact-active').attr('id') === 'success';
          }
          let animalId = $(this).attr('data-id');

          let res = await addAnimalResults('insemination', animalId, { date, success });
          if (res) amountToDo--;

          if (amountToDo === 0) {
            $('.all-animals-container').css({
              'display': 'flex',
              'align-items': 'center',
              'justify-content': 'center'
            });
            addConfirmationEmpty($('.all-animals-container'));
            setTimeout(() => { location.reload(true) }, 2000);
          }
        }
      });


    });

  }

  ///////////////////////
  /* WRITE OFF ONE ANIMAL */
  ///////////////////////
  if (document.querySelector('#write-off-container')) {
    /* Adding price if animal(s)'s slaughtered or sold */
    $('.aa-pick').click(function () {
      if ($(this).attr('id') !== 'sickness') {
        $('#sell-price-block').css('display', 'flex');
      } else {
        $('#sell-price-block').css('display', 'none');
      }
    });

    /* Validating inputs */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()).getTime() > Date.now()) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $(this).parent().find('.aa-label-warning').remove();
          $(this).parent().find('.aa-label').append(`<div class="aa-label-warning">-&nbsp; Введите правильную дату</div>`);
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#297045');
          $(this).parent().find('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if (document.querySelector('.ar-selected-animals-block')) {
        if ($('#reason').find('.aa-pick-picked').length > 0 && $('#date').hasClass('valid-aa-input') && $('#multiple-animals-container').children().length > 0) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      } else {
        if ($('#reason').find('.aa-pick-picked').length > 0 && $('#date').hasClass('valid-aa-input')) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      }
    });

    $('.ar-add-button').click(async function () {
      if (document.querySelector('.ar-selected-animals-block')) {


        let animalsObjects = [];
        let eachAnimalPrice = undefined;
        let totalPrice = undefined
        if ($('#sell-price').val() !== '') {
          totalPrice = parseFloat($('#sell-price').val());
          eachAnimalPrice = parseFloat($('#sell-price').val()) / $('#multiple-animals-container').children().length;
        }


        $('.ar-add-button').append(`<div class="mini-loader"></div>`);
        $('.mini-loader').css({
          'position': 'absolute',
          'right': '-35px'
        });


        $('#multiple-animals-container').children().each(async function () {
          animalsObjects.push({
            animalId: $(this).attr('data-id'),
            body: {
              writeOffReason: $('#reason').find('.aa-pick-picked').attr('id'),
              writeOffDate: new Date($('#date').val()),
              writeOffNote: $('#note').val(),
              writeOffMoneyReceived: eachAnimalPrice
            }
          });

        });

        const response = await writeOffMultipleAnimals({ totalPrice, animalsObjects });

        if (response) {
          $('.mini-loader').hide();
          addConfirmationEmpty($('.animal-results-container'));
          setTimeout(() => {
            location.reload(true);
          }, 1500)

          /* location.assign('/herd/all-animals'); */
        }

      } else {
        let animalId = $(this).attr('data-animal-id');
        let writeOffReason = $('#reason').find('.aa-pick-picked').attr('id');
        let writeOffDate = new Date($('#date').val());
        let writeOffNote = $('#note').val();
        let writeOffMoneyReceived = parseFloat($('#sell-price').val());


        $(this).append(`<div class="mini-loader"></div>`);
        $('.mini-loader').css({
          'position': 'absolute',
          'right': '-35px'
        });

        const response = await writeOffAnimal(animalId, { writeOffReason, writeOffDate, writeOffNote, writeOffMoneyReceived });

        if (response) {
          $('.mini-loader').hide();
          addConfirmationEmpty($('.animal-results-container'));
          setTimeout(() => {
            location.reload(true);
          }, 1500)

          /* location.assign('/herd/all-animals'); */
        }
      }
    })

  }



  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* VET MODULE */
  /////////////////////////
  /////////////////////////
  /////////////////////////

  ///////////////////////
  /* ADD VET ACTION */
  ///////////////////////
  if (document.querySelector('#vet-action-container')) {
    /* Adding the dose input */
    $('#add-dose-input').click(function () {
      $(this).parent().hide();
      $('#dose-input').show()
      $('#dose-input').find('.aa-double-input-block').trigger('click');
    });


    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()) > new Date() || new Date($(this).val()) < new Date($(this).attr('data-animal-birth'))) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $('.aa-label-warning').remove();
          $('.ar-btn-box').append(`<div class="aa-label-warning">× - Введите правильную дату</div>`)
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }

    });

    $('*').on('click focus blur change', function () {
      if (document.querySelector('.ar-selected-animals-block')) {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#multiple-animals-container').children().length > 0) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      } else {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input')) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      }
    });

    $('.ar-add-button').click(async function () {
      if (document.querySelector('.ar-selected-animals-block')) {


        let doneAnimals = 0;

        $('.ar-add-button').append(`<div class="mini-loader"></div>`);
        $('.mini-loader').css({
          'position': 'absolute',
          'right': '-35px'
        });

        let subId = randomstring.generate(12);

        $('#multiple-animals-container').children().each(async function () {
          let animalId = $(this).attr('data-id');
          let name = $('#name').val();
          let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
          let note = $('#note').val() === '' ? undefined : $('#note').val();
          let dose;
          if ($('#dose').val().length > 0) {
            dose = {
              amount: parseFloat($('#dose').val()),
              unit: $('#unit').val()
            }
          }

          const response = await addVetAction(animalId, { name, date, note, dose, subId });

          if (response) doneAnimals++;

          if (doneAnimals === $('#multiple-animals-container').children().length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            /* location.assign('/herd/all-animals'); */
          }
        });

      } else {
        let animalId = $(this).attr('data-animal-id');
        let name = $('#name').val();
        let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
        let note = $('#note').val();
        let dose;
        if ($('#dose').val().length > 0) {
          dose = {
            amount: parseFloat($('#dose').val()),
            unit: $('#unit').val()
          }
        }

        $(this).append(`<div class="mini-loader"></div>`);
        $('.mini-loader').css({
          'position': 'absolute',
          'right': '-35px'
        });

        const response = await addVetAction(animalId, { name, date, note, dose });

        if (response) {
          $('.mini-loader').hide();
          addConfirmationEmpty($('.animal-results-container'));
          setTimeout(() => {
            location.reload(true);
          }, 1500)

          /* location.assign('/herd/all-animals'); */
        }
      }
    })
  }

  ///////////////////////
  /* EDIT VET ACTION */
  ///////////////////////
  if (document.querySelector('#edit-vet-action-container')) {
    /* Adding the dose input */
    $('#add-dose-input').click(function () {
      $(this).parent().hide();
      $('#dose-input').show()
      $('#dose-input').find('.aa-double-input-block').trigger('click');
    });

    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()) > new Date() || new Date($(this).val()) < new Date($(this).attr('data-animal-birth'))) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $('.aa-label-warning').remove();
          $('.ar-btn-box').append(`<div class="aa-label-warning">× - Введите правильную дату</div>`)
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if (document.querySelector('.ar-selected-animals-block')) {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#multiple-animals-container').children().length > 0) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      } else {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input')) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      }
    });

    $('input').trigger('click');

    $('.ar-add-button').click(async function () {
      let actionId = $(this).attr('data-id');
      let name = $('#name').val();
      let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
      let note = $('#note').val();
      let dose;
      if ($('#dose').val().length > 0) {
        dose = {
          amount: parseFloat($('#dose').val()),
          unit: $('#unit').val()
        }
      }

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editVetAction(actionId, { name, date, note, dose });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    })
  }

  ///////////////////////
  /* ADD VET PROBLEM */
  ///////////////////////
  if (document.querySelector('#vet-problem-container')) {
    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()) > new Date() || new Date($(this).val()) < new Date($(this).attr('data-animal-birth'))) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $('.aa-label-warning').remove();
          $('.ar-btn-box').append(`<div class="aa-label-warning">× - Введите правильную дату</div>`)
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if (document.querySelector('.ar-selected-animals-block')) {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#multiple-animals-container').children().length > 0) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      } else {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input')) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      }
    });

    $('.ar-add-button').click(async function () {
      if (document.querySelector('.ar-selected-animals-block')) {

        let doneAnimals = 0;

        $('.ar-add-button').append(`<div class="mini-loader"></div>`);
        $('.mini-loader').css({
          'position': 'absolute',
          'right': '-35px'
        });

        let subId = randomstring.generate(12);

        $('#multiple-animals-container').children().each(async function () {
          let animalId = $(this).attr('data-id');
          let name = $('#name').val();
          let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
          let note = $('#note').val() === '' ? undefined : $('#note').val();

          const response = await addVetProblem(animalId, { name, date, note, subId });

          if (response) doneAnimals++;

          if (doneAnimals === $('#multiple-animals-container').children().length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            /* location.assign('/herd/all-animals'); */
          }
        });

      } else {
        let animalId = $(this).attr('data-animal-id');
        let name = $('#name').val();
        let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
        let note = $('#note').val();

        $(this).append(`<div class="mini-loader"></div>`);
        $('.mini-loader').css({
          'position': 'absolute',
          'right': '-35px'
        });

        const response = await addVetProblem(animalId, { name, date, note });

        if (response) {
          $('.mini-loader').hide();
          addConfirmationEmpty($('.animal-results-container'));
          setTimeout(() => {
            location.reload(true);
          }, 1500)

          /* location.assign('/herd/all-animals'); */
        }
      }
    })
  }

  ///////////////////////
  /* EDIT VET PROBLEM */
  ///////////////////////
  if (document.querySelector('#edit-vet-problem-container')) {
    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()) > new Date() || new Date($(this).val()) < new Date($(this).attr('data-animal-birth'))) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $('.aa-label-warning').remove();
          $('.ar-btn-box').append(`<div class="aa-label-warning">× - Введите правильную дату</div>`)
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if (document.querySelector('.ar-selected-animals-block')) {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#multiple-animals-container').children().length > 0) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      } else {
        if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input')) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      }
    });

    $('input').trigger('click');

    $('.ar-add-button').click(async function () {
      let problemId = $(this).attr('data-id');
      let name = $('#name').val();
      let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
      let note = $('#note').val();

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editVetProblem(problemId, { name, date, note });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    })
  }

  ///////////////////////
  /* ADD VET TREATMENT */
  ///////////////////////
  if (document.querySelector('#vet-treatment-container')) {
    /* Adding the dose input */
    $('#add-dose-input').click(function () {
      $(this).parent().hide();
      $('#dose-input').show()
      $('#dose-input').find('.aa-double-input-block').trigger('click');
    });

    /* Expanding the problem block */
    $('.ar-problem-expand-btn').click(function () {
      if ($(this).attr('data-state') === 'to-show') {
        $(this).find('ion-icon').css('transform', 'rotate(180deg)');
        $(this).css('border-bottom-right-radius', '0px');
        $('.ar-problem-text').show();
        $(this).attr('data-state', 'to-hide');
      } else {
        $(this).css('border-bottom-right-radius', '5px');
        $(this).find('ion-icon').css('transform', 'rotate(0deg)');
        $('.ar-problem-text').hide();
        $(this).attr('data-state', 'to-show');
      }
    });


    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()) < new Date($(this).attr('data-disease-date'))) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $('.aa-label-warning').remove();
          $('.ar-btn-box').append(`<div class="aa-label-warning">× - Введите правильную дату</div>`)
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#cured').find('.aa-pick-picked').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    $('.ar-add-button').click(async function () {

      let diseaseId = $(this).attr('data-disease-id');
      let name = $('#name').val();
      let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
      let note = $('#note').val();
      let cured = $('#cured').find('.aa-pick-picked').attr('id') === 'cured';
      let dose;
      if ($('#dose').val().length > 0) {
        dose = {
          amount: parseFloat($('#dose').val()),
          unit: $('#unit').val()
        }
      }

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await addVetTreatment(diseaseId, { name, date, note, dose, cured });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    })
  }

  ///////////////////////
  /* EDIT VET TREATMENT */
  ///////////////////////
  if (document.querySelector('#edit-vet-treatment-container')) {
    /* Adding the dose input */
    $('#add-dose-input').click(function () {
      $(this).parent().hide();
      $('#dose-input').show()
      $('#dose-input').find('.aa-double-input-block').trigger('click');
    });

    /* Expanding the problem block */
    $('.ar-problem-expand-btn').click(function () {
      if ($(this).attr('data-state') === 'to-show') {
        $(this).find('ion-icon').css('transform', 'rotate(180deg)');
        $(this).css('border-bottom-right-radius', '0px');
        $('.ar-problem-text').show();
        $(this).attr('data-state', 'to-hide');
      } else {
        $(this).css('border-bottom-right-radius', '5px');
        $(this).find('ion-icon').css('transform', 'rotate(0deg)');
        $('.ar-problem-text').hide();
        $(this).attr('data-state', 'to-show');
      }
    });


    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }

      if ($(this).attr('id') === 'date') {
        if (new Date($(this).val()) < new Date($(this).attr('data-disease-date'))) {
          $(this).parent().find('.aa-label *').css('color', '#D44D5C');
          $('.aa-label-warning').remove();
          $('.ar-btn-box').append(`<div class="aa-label-warning">× - Введите правильную дату</div>`)
          $(this).removeClass('valid-aa-input');
        } else {
          $(this).parent().find('.aa-label *').css('color', '#000000');
          $('.aa-label-warning').remove();
          $(this).addClass('valid-aa-input');
        }
      }
    });

    $('*').on('click focus blur change', function () {
      if ($('#name').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#cured').find('.aa-pick-picked').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    $('input').trigger('click');

    $('.ar-add-button').click(async function () {

      let treatmentId = $(this).attr('data-id');
      let name = $('#name').val();
      let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
      let note = $('#note').val();
      let cured = $('#cured').find('.aa-pick-picked').attr('id') === 'cured';
      let dose;
      if ($('#dose').val().length > 0) {
        dose = {
          amount: parseFloat($('#dose').val()),
          unit: $('#unit').val()
        }
      }

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editVetTreatment(treatmentId, { name, date, note, dose, cured });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    })
  }

  ///////////////////////
  /* ADD NEW VET SCHEME */
  ///////////////////////
  if (document.querySelector('.vet-scheme-container')) {
    $('#add-step').click(function () {
      let nextNumber = parseFloat($('.scheme-step-container').last().attr('data-step')) + 1;
      const markup = `<div class="scheme-step-container" data-step="${nextNumber}">
      <div class="scheme-step-container-label">#${nextNumber}</div>
      <div class="scheme-step-container-close">
        <ion-icon name="close"></ion-icon>
      </div>
      <div class="aa-input-block">
          <lable class="aa-label" for="name">
              <p>Название</p>
          </lable><input class="aa-text-input scheme-step-action" type="text" />
      </div>
      <div class="aa-input-block scheme-step">
          <lable class="aa-label">
              <p>Временной отрезок</p>
          </lable>
          <div class="aa-double-input-block"><input class="aa-double-input scheme-step-in" type="number" /><select class="aa-double-input scheme-step-unit">
                  <option value="h" selected="selected">Часов</option>
                  <option value="d">Дней</option>
              </select><select class="aa-double-input scheme-step-count">
                  <option value="start" selected="selected">От начала</option>
                  <option value="last-point">От пред. действия</option>
              </select></div>
      </div>
  </div>`;

      $(this).before(markup);
    });

    /* Removing scheme step */
    $('.main-section').delegate('.scheme-step-container-close', 'click', function () {
      $(this).parent().remove();
    });

    /* Validating form */
    $('.main-section').delegate('input', 'keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('.main-section').delegate('*', 'click keyup blur change', function () {
      let validSteps = 0;
      $('.scheme-step-container').each(function () {
        if ($(this).attr('data-step') !== '1' && $(this).find('.scheme-step-action').hasClass('valid-aa-input') && $(this).find('.scheme-step-in').hasClass('valid-aa-input')) {
          validSteps++;
        } else if ($(this).attr('data-step') === '1' && $(this).find('.scheme-step-action').hasClass('valid-aa-input')) {
          validSteps++;
        }
      });

      if ($('#name').hasClass('valid-aa-input') && $('.scheme-step-container').length === validSteps) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }

    });

    $('input').trigger('click');

  }

  ///////////////////////
  /* ADD VET SCHEME */
  ///////////////////////
  if (document.querySelector('#add-vet-scheme')) {
    $('.ar-add-button').click(async function () {
      let name = $('#name').val();
      let points = [];
      $('.scheme-step-container').each(function () {
        points.push({
          action: $(this).find('.scheme-step-action').val(),
          firstPoint: points.length === 0 ? true : false,
          scheduledIn: $(this).find('.scheme-step-in').val(),
          countFrom: $(this).find('.scheme-step-count').val(),
          timeUnit: $(this).find('.scheme-step-unit').val()
        });
      });

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await addVetScheme({ name, points });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }

    })
  }

  ///////////////////////
  /* EDIT VET SCHEME */
  ///////////////////////
  if (document.querySelector('#edit-vet-scheme')) {
    $('.ar-add-button').click(async function () {
      let schemeId = $(this).attr('data-id')
      let name = $('#name').val();
      let points = [];
      $('.scheme-step-container').each(function () {
        points.push({
          action: $(this).find('.scheme-step-action').val(),
          firstPoint: points.length === 0 ? true : false,
          scheduledIn: $(this).find('.scheme-step-in').val(),
          countFrom: $(this).find('.scheme-step-count').val(),
          timeUnit: $(this).find('.scheme-step-unit').val()
        });
      });

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editVetScheme(schemeId, { name, points });

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }

    })
  }

  ///////////////////////
  /* START A SCHEME */
  ///////////////////////
  if (document.querySelector('#vet-start-scheme-container')) {
    $('input').on('click focus change blur keyup', function () {
      if ($(this).attr('id') === 'date') {
        if ($(this).val() !== '') {
          $(this).addClass('valid-aa-input')
        } else {
          $(this).removeClass('valid-aa-input')
        }
      }

      if ($(this).attr('id') === 'scheme') {
        if ($(this).val() !== '' && $(this).attr('id') !== '') {
          $(this).addClass('valid-aa-input')
        } else {
          $(this).removeClass('valid-aa-input')
        }
      }

      if ($('.valid-aa-input').length === 2) {
        $('.ar-add-button').css({
          'pointer-events': 'auto',
          'filter': 'grayscale(0)'
        });
      } else {
        $('.ar-add-button').css({
          'pointer-events': 'none',
          'filter': 'grayscale(1)'
        });
      }
    });

    $('.ar-add-button').click(async function () {
      let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
      let schemeId = $('#scheme').attr('data-id');
      let animalId = $(this).attr('data-animal-id');

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await startVetScheme(animalId, schemeId, date);

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });
  };

  ///////////////////////
  /* EDIT STARTED SCHEME */
  ///////////////////////
  if (document.querySelector('#vet-edit-started-scheme-container')) {
    $('input').on('click focus change blur keyup', function () {
      if ($(this).attr('id') === 'date') {
        if ($(this).val() !== '') {
          $(this).addClass('valid-aa-input')
        } else {
          $(this).removeClass('valid-aa-input')
        }
      }

      if ($(this).attr('id') === 'scheme') {
        if ($(this).val() !== '' && $(this).attr('id') !== '') {
          $(this).addClass('valid-aa-input')
        } else {
          $(this).removeClass('valid-aa-input')
        }
      }

      if ($('.valid-aa-input').length === 2) {
        $('.ar-add-button').css({
          'pointer-events': 'auto',
          'filter': 'grayscale(0)'
        });
      } else {
        $('.ar-add-button').css({
          'pointer-events': 'none',
          'filter': 'grayscale(1)'
        });
      }
    });
    $('input').trigger('click');

    $('.ar-add-button').click(async function () {
      let date = new Date(moment(new Date($('#date').val())).hour(parseFloat($('#hour').val())).minute(parseFloat($('#minute').val())));
      let schemeId = $('#scheme').attr('data-id');
      let firstSchemeActionId = $(this).attr('data-action-id');

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      const response = await editStartedVetScheme(firstSchemeActionId, schemeId, date);

      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });
  };

  ///////////////////////
  /* VET MAIN PAGE*/
  ///////////////////////
  if (document.querySelector('#mp-vet-container')) {
    /* Show empty text if needed*/
    if (document.querySelector('.to-show-empty-block')) {
      $('.mp-empty-block').css('display', 'flex');
    }

    /* Working with a calendar */
    /* Working with a big calendar */
    let selectedMonth = moment();
    $('.mp-calendar-btn').on('click', async function () {
      if ($(this).attr('data-state') !== 'first-click') {
        if ($(this).attr('id') === 'prev-month') {
          selectedMonth = moment(selectedMonth).subtract(1, 'months')
        } else if ($(this).attr('id') === 'next-month') {
          selectedMonth = moment(selectedMonth).add(1, 'months')
        }
      } else {
        $(this).attr('data-state', 'not-first-click');
      }


      /* Set current month and year */
      let curRusMonth = moment(selectedMonth).locale('ru').format('MMMM');
      let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
      const curYear = moment(selectedMonth).format('YYYY');
      $('.mp-calendar-title-line p').text(`${rusMonth} ${curYear}`);

      /* Clearing the calendar from previous month */
      $('.mp-calendar-dates-column').each(function () { $(this).empty() });

      /* Adding days of the month */
      let daysInMonth = moment(selectedMonth).daysInMonth();
      let daysBeforeMonth = moment(selectedMonth).date(1).day() === 0 ? 6 : moment(selectedMonth).date(1).day() - 1;
      let daysAfterMonth = 7 - moment(selectedMonth).date(daysInMonth).day()
      let totalDays = daysInMonth + daysBeforeMonth + daysAfterMonth;

      let visCalStart = moment(selectedMonth).date(1 - daysBeforeMonth);

      for (let i = 0; i < totalDays; i++) {
        let date = moment(visCalStart).add(i, 'days');
        let monthDay = moment(date).date();
        let weekDay = moment(date).day();

        let otherMonth = moment(date).month() !== moment(selectedMonth).month() ? 'mp-calendar-other' : '';
        //let pastDay = moment(date) < moment() ? 'bc-date-past' : '';

        let isToday = date.startOf('day').isSame(moment().startOf('day')) ? 'mp-calendar-today' : '';

        $(`#mp-calendar-column-${weekDay}`).append(`
        <div class="mp-calendar-date ${otherMonth} ${isToday}" data-date="${new Date(date)}">${monthDay}</div>
      `)
      }

      let allDates = $('.mp-calendar-date');
      let from = new Date(moment($(allDates[0]).attr('data-date')).startOf('day'));
      let to = new Date(moment($(allDates[allDates.length - 1]).attr('data-date')).endOf('day'));

      const reminders = await getModuleAndPeriod('vet', from, to);

      let allActions = [...reminders];
      allActions.sort((a, b) => a.date - b.date);

      /* Adding quick info about each day reminders */
      $('.mp-calendar-date').each(async function () {
        const date = moment($(this).attr('data-date'));

        let start = new Date(date.startOf('day'));
        let end = new Date(date.endOf('day'));

        let dayActions = [];
        allActions.forEach((action) => {
          let actionDate = new Date(action.date);
          if (start <= actionDate && actionDate <= end) {
            dayActions.push(action)
          }
        });


        if (dayActions.length > 0) {
          $(this).addClass('mp-calendar-full')
          dayActions.forEach(action => {
            $(this).append(`
            <div class="mp-calendar-quick">
              <div class="mp-calendar-quick-time">${moment(action.date).format('HH:mm')}</div>
              <div class="mp-calendar-quick-title">${action.name}</div>
            </div>
          `);
          });

        }

      });

    });

    $('#prev-month').trigger('click');

    $('.mp-calendar-dates-column').on('click', '.mp-calendar-date', function () {

      $('.mp-calendar-date-active').removeClass('mp-calendar-date-active');
      $(this).addClass('mp-calendar-date-active');

      $('.mp-calendar-day-number').text(moment($(this).attr('data-date')).format('DD'));
      $('.mp-calendar-day-month').text(moment($(this).attr('data-date')).lang('ru').format('MMMM, YYYY').toUpperCase());
    });

    /* Working with a history block */
    /* Sorting elements by date */
    $('.mp-history-item').each(function () {
      let thisEl = $(this);
      let thisDate = new Date($(this).attr('data-date'));

      $('.mp-history-item').each(function () {
        let curDate = new Date($(this).attr('data-date'));

        if (thisDate < curDate) {
          let moveEl = thisEl;
          thisEl.detach();
          $(this).after(moveEl);
        }
      });
    });

    $('.mph-type-selector').on('change', function () {
      let value = $(this).val()
      if (value === 'all') {
        $('.mp-history-item').css('display', 'flex');
      } else {
        $('.mp-history-item').each(function () {
          if ($(this).attr('data-type') === value) {
            $(this).css('display', 'flex');
          } else {
            $(this).hide();
          }
        });
      }
    });

    $('.mp-scheme-i').each(function () {
      let thisEl = $(this);
      let thisDate = new Date($(this).attr('data-date'));

      $('.mp-scheme-i').each(function () {
        let curDate = new Date($(this).attr('data-date'));

        if (thisDate < curDate) {
          let moveEl = thisEl;
          thisEl.detach();
          $(this).after(moveEl);
        }
      });
    });

    $('.mp-problem-i').each(function () {
      let thisEl = $(this);
      let thisDate = new Date($(this).attr('data-date'));

      $('.mp-problem-i').each(function () {
        let curDate = new Date($(this).attr('data-date'));

        if (thisDate < curDate) {
          let moveEl = thisEl;
          thisEl.detach();
          $(this).after(moveEl);
        }
      });
    });

    $('.mp-scheme-item').on('click', function () {
      if ($(this).find('.mp-scheme-points-block').css('display') === 'none') {
        $(this).find('.mp-scheme-points-block').show()
        $(this).find('.mp-scheme-icon').css('transform', 'rotate(180deg)');
      } else {
        $(this).find('.mp-scheme-points-block').hide()
        $(this).find('.mp-scheme-icon').css('transform', 'rotate(0deg)');
      }
    });





    /* Working with scheme block */
    /* $('.mp-scheme-points-block').each(function () {
      //Sorting elements in scheme points blocks
      let parentEl = $(this);

      $(this).find('.mp-scheme-point').each(function () {
        let currentEl = $(this);
        let currectDate = new Date($(this).attr('data-date'));

        $(this).siblings().each(function () {
          let date = new Date($(this).attr('data-date'));

          if (currectDate > date) {
            let newEl = currentEl;
            currentEl.detach();
            $(this).after(newEl);
          }
        });
      });
    }); */


    /* Working with problems and treatments */
    /* $('.mp-problem-treatments-block').each(function () {
      //Sorting elements in scheme points blocks
      let parentEl = $(this);

      $(this).find('.mp-problem-treatment').each(function () {
        let currentEl = $(this);
        let currectDate = new Date($(this).attr('data-date'));

        $(this).siblings().each(function () {
          let date = new Date($(this).attr('data-date'));

          if (currectDate > date) {
            let newEl = currentEl;
            currentEl.detach();
            $(this).after(newEl);
          }
        });
      });

    }); */


  }

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* WAREHOUSE MODULE */
  /////////////////////////
  /////////////////////////
  /////////////////////////

  ///////////////////////
  /* BOTH ADD/EDIT INVENTORY PAGE*/
  ///////////////////////

  if (document.querySelector('#add-inventory-container') || document.querySelector('#edit-inventory-container')) {
    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('*').on('click focus blur change', function () {
      if ($('#name').hasClass('valid-aa-input') && $('#quantity').hasClass('valid-aa-input') && $('#type').find('.aa-pick-picked').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if (document.querySelector('#edit-inventory-container')) {
      $('input').click();
    }

    /* Adding hidden blocks on click */
    $('.aa-add-more').click(function () {
      $(this).hide();
      $(`#${$(this).attr('id')}-input`).show();
    });

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      const name = $('#name').val();
      const quantity = parseFloat($('#quantity').val());
      const inventoryType = $('#type').find('.aa-pick-picked').attr('id');
      let date, expDate, cost, note = undefined

      if ($('#date').val() !== '') {
        date = new Date($('#date').val());
      }
      if ($('#exp-date').val() !== '') {
        expDate = new Date($('#exp-date').val());
      }
      if ($('#cost').val() !== '') {
        cost = parseFloat($('#cost').val());
      }
      if ($('#note').val() !== '') {
        note = $('#note').val();
      }




      let response;

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      /* Submiting data to ADD inventory */
      if (document.querySelector('#add-inventory-container')) {
        response = await addInventory({ name, quantity, inventoryType, date, expDate, cost, note })
      }

      /* Submiting data to EDIT inventory */
      if (document.querySelector('#edit-inventory-container')) {
        response = await editInventory($(this).attr('data-inventory-id'), { name, quantity, inventoryType, date, expDate, cost, note })
      }


      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        /* location.assign('/herd/all-animals'); */
      }
    });

  }

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* DISTRIBUTION MODULE */
  /////////////////////////
  /////////////////////////
  /////////////////////////

  ///////////////////////
  /* BOTH ADD/EDIT CLIENT PAGE*/
  ///////////////////////

  if (document.querySelector('#add-client-container') || document.querySelector('#edit-client-container')) {
    /* Validating form */
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    /* Preventing double selection */
    $('body').on('click', '.aa-select-option', function () {
      let selectedOption = $(this);
      $('.aa-select-option').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-val') === selectedOption.attr('data-val')) {
          $(this).addClass('aa-select-option-taken');
        } else if ($(this).attr('data-val') === selectedOption.parent().attr('data-val')) {
          $(this).removeClass('aa-select-option-taken');
        }
      });
      $(this).parent().attr('data-val', $(this).attr('data-val'))
    });

    /* Adding new product inputs */
    $('#add-product-input').on('click', function () {
      $(this).parent().before(`
      <div class="aa-input-united-block"> 
      <div class="aa-input-block"> 
        <label class="aa-label" for="type">
          <p>Наименование продукта</p>
        </label>
        <div class="aa-select-box aa-select-box-one" data-default-text="Выберите продукт">
          <div class="aa-select-text">Выберите продукт</div>
          <ion-icon name="chevron-down"></ion-icon>
          <div class="aa-select-options-box">
            <div class="aa-select-option" data-val="milk">Молоко</div>
            <div class="aa-select-option" data-val="meat">Мясо</div>
            <div class="aa-select-option" data-val="cottage-cheese">Творог</div>
            <div class="aa-select-option" data-val="butter">Масло </div>
            <div class="aa-select-option" data-val="cream">Сливки </div>
            <div class="aa-select-option" data-val="cheese">Сыр</div>
            <div class="aa-select-option" data-val="milk-serum">Сыворотка </div>
            <div class="aa-select-option" data-val="sour-cream">Сметана </div>
          </div>
        </div>
      </div>
      <div class="aa-input-block">
        <lable class="aa-label" for="price"> 
          <p>Цена продукта</p>
        </lable>
        <div class="aa-double-input-block">
          <input class="aa-double-input price-input" type="number"/>
          <select class="aa-double-input unit-input">
            <option value="l" selected="selected">Л.</option>
            <option value="kg">Кг. </option>
          </select>
        </div>
      </div>
    </div>
      `)

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    });

    /* Validating the phone number */
    $('#phone-number').on('keyup', function () {
      if ($(this).val().length === 0 || $(this).val().length === 10) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#phone-number').on('blur', function () {
      if ($(this).val().length > 0 && $(this).val().length !== 10) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите правильный номер телефона</div>`);
      }
    });

    /* Validating the email */
    $('#email').on('keyup', function () {
      if ($(this).val().length === 0 || validator.isEmail($(this).val())) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#email').on('blur', function () {
      if ($(this).val().length > 0 && !validator.isEmail($(this).val())) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите правильную электронную почту</div>`);
      }
    });

    $('*').on('click keyup focus blur change', function () {
      if ($('#name').hasClass('valid-aa-input') && $('body').find('.aa-input-ps-warning').length === 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if (document.querySelector('#edit-client-container')) {
      $('input').trigger('click');
      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    }

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      const name = $('#name').val();
      let adress, phoneNumber, phoneNumberCode, email, note = undefined;
      let products = [];

      if ($('#adress').val() !== '') {
        adress = $('#adress').val();
      }
      if ($('#phone-number').val() !== '') {
        phoneNumber = $('#phone-number').val();
        phoneNumberCode = $('#phone-number-code').val();
      }
      if ($('#email').val() !== '') {
        email = $('#email').val();
      }
      if ($('#note').val() !== '') {
        note = $('#note').val();
      }

      $('.aa-input-united-block').each(function () {
        if ($(this).find('.aa-select-option-selected') && $(this).find('.price-input').val().length > 0) {
          products.push({
            productName: $(this).find('.aa-select-option-selected').attr('data-val'),
            pricePer: parseFloat($(this).find('.price-input').val()),
            unit: $(this).find('.unit-input').val()
          });
        }
      });


      let response;

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      /* Submiting data to ADD inventory */
      if (document.querySelector('#add-client-container')) {
        response = await addClient({ name, adress, phoneNumber, phoneNumberCode, email, note, products })
      }

      /* Submiting data to EDIT inventory */
      if (document.querySelector('#edit-client-container')) {
        response = await editClient($(this).attr('data-client-id'), { name, adress, phoneNumber, phoneNumberCode, email, note, products })
      }


      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        //location.assign('/herd/all-animals');
      }
    });

  }

  ///////////////////////
  /* BOTH ADD/EDIT RAW PRODUCT PAGE*/
  ///////////////////////

  if (document.querySelector('#add-raw-product-container') || document.querySelector('#edit-raw-product-container')) {
    /* Switch between types */
    $('.ar-switch-btn').on('click', function () {
      if (!$(this).hasClass('ar-switch-btn-active')) {
        $('.ar-switch-btn-active').removeClass('ar-switch-btn-active');
        $(this).addClass('ar-switch-btn-active');

        $('#size').parent().parent().find('.aa-label p').text($(this).attr('id') === 'milk' ? 'Объем' : 'Вес')
        $('#size').parent().find('.aa-double-price-text').text($(this).attr('id') === 'milk' ? 'л.' : 'кг.')
        $('#size').attr('data-unit', $(this).attr('id') === 'milk' ? 'l' : 'kg')
      }
    });

    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    /* Validating the size */
    $('#size').on('keyup', function () {
      if (parseFloat($(this).val()) !== 0) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#size').on('blur', function () {
      if (parseFloat($(this).val()) === 0) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите число больше 0</div>`);
      }
    });

    /* Validating the exp date */
    $('#exp-date').on('keyup', function () {
      if (parseFloat($(this).val()) !== 0) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#exp-date').on('blur', function () {
      if (parseFloat($(this).val()) === 0) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите число больше 0</div>`);
      }
    });

    /* Validating the date */
    $('#date').on('keyup click change', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) <= new Date()) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#date').on('blur', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) >= new Date()) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите правильную дату</div>`);
      }
    });

    $('*').on('click keyup focus blur change', function () {
      if ($('#size').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('#exp-date').hasClass('valid-aa-input') && $('body').find('.aa-input-ps-warning').length === 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if (document.querySelector('#edit-raw-product-container')) {
      $('input').trigger('click');
    }

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      const product = $('.ar-switch-btn-active').attr('id');
      const size = $('#size').val();
      const unit = $('#size').attr('data-unit')
      const date = new Date($('#date').val());
      let note = undefined;
      if ($('#note').val().length > 0) {
        note = $('#note').val();
      }

      let response;

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      /* Submiting data to ADD raw product */
      if (document.querySelector('#add-raw-product-container')) {
        response = await addProduct({ product, size, unit, date, note })
      }

      /* Submiting data to EDIT raw product */
      if (document.querySelector('#edit-raw-product-container')) {
        response = await editProduct($(this).attr('data-product-id'), { product, size, unit, date, note })
      }


      if (response) {
        $('.mini-loader').hide();
        addConfirmationEmpty($('.animal-results-container'));
        setTimeout(() => {
          location.reload(true);
        }, 1500)

        //location.assign('/herd/all-animals');
      }
    });


  }

  ///////////////////////
  /* BOTH ADD/EDIT PROCESS PAGE*/
  ///////////////////////

  if (document.querySelector('#add-process-container') || document.querySelector('#edit-process-container')) {
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    /* Validating size */
    $('#size').on('keyup change', function () {
      let percent = Math.round(parseFloat($(this).val()) / (parseFloat($('.aa-total-milk-line-inner').attr('data-total')) / 100));

      $('.aa-total-milk-line-inner').stop();
      $('.aa-total-milk-line-inner').animate({ 'width': `${percent}%` }, 250);

      if (parseFloat($(this).val()) > parseFloat($('.aa-total-milk-line-inner').attr('data-total'))) {
        $('.aa-total-milk-line-inner').css('background-color', '#D44D5C');
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Количество не должно превышать общее количество продукта</div>`);
      } else {
        $(`#${$(this).attr('id')}-warning`).remove();
        $('.aa-total-milk-line-inner').css('background-color', '#f4a26180');

      }
    });

    /* Preventing selection of a raw product */
    $('body').on('click', '.aa-select-box', function () {
      $('.aa-select-option').each(function () {
        if ($(this).attr('data-val') === $('.animal-results-container').attr('data-raw')) {
          $(this).addClass('aa-select-option-taken');
        }
      });
    });

    /* Preventing double selection */
    $('body').on('click', '.aa-select-option', function () {
      let selectedOption = $(this);
      $('.aa-select-option').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-val') === selectedOption.attr('data-val')) {
          $(this).addClass('aa-select-option-taken');
        } else if ($(this).attr('data-val') === selectedOption.parent().attr('data-val')) {
          $(this).removeClass('aa-select-option-taken');
        }
      });
      $(this).parent().attr('data-val', $(this).attr('data-val'))
    });

    $('#add-product-input').on('click', function () {
      $(this).parent().before(`
        <div class="aa-input-united-block" data-new="true"> 
        <div class="aa-input-block"> 
          <label class="aa-label" for="type">
            <p>Продукт</p>
          </label>
          <div class="aa-select-box aa-select-box-one">
            <div class="aa-select-text">Выберите продукт</div>
            <ion-icon name="chevron-down"></ion-icon>
            <div class="aa-select-options-box">
              <div class="aa-select-option" data-val="cottage-cheese">Творог</div>
              <div class="aa-select-option" data-val="butter">Масло </div>
              <div class="aa-select-option" data-val="cream">Сливки </div>
              <div class="aa-select-option" data-val="cheese">Сыр  </div>
              <div class="aa-select-option" data-val="whey">Сыворотка </div>
              <div class="aa-select-option" data-val="sour-cream">Сметана  </div>
            </div>
          </div>
        </div>
        <div class="aa-input-block">
          <lable class="aa-label" for="price"> 
            <p>Вес | Объем</p>
          </lable>
          <div class="aa-double-input-block">
            <input class="aa-double-input size-input" type="number" />
            <select class="aa-double-input unit-input">
              <option value="l" selected="selected">Л.</option>
              <option value="kg">Кг.  </option>
            </select>
          </div>
        </div>
        <div class="aa-iu-remove">  
          <ion-icon name="close"></ion-icon>
        </div>
      </div>
      `);

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    });

    $('body').on('click', '.aa-iu-remove', async function () {
      if ($(this).parent().attr('data-new') === 'false') {
        $(this).find('ion-icon').remove();
        $(this).append(`<div class="mini-loader"></div>`);

        let response = await deleteProduct($(this).parent().attr('data-id'));
        if (response) $(this).parent().remove();

      } else if ($(this).parent().attr('data-new') === 'true') {
        $(this).parent().remove();
      }
    });

    $('*').on('click focus blur change keyup', function () {
      $('.aa-input-united-block ').each(function () {
        if ($(this).find('.aa-select-option-selected').length > 0 && parseFloat($(this).find('.size-input').val()) > 0) {
          $(this).addClass('aa-input-united-block-valid')
        } else {
          $(this).removeClass('aa-input-united-block-valid')
        }
      });

      if ($('#size').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('body').find('.aa-input-ps-warning').length === 0 && $('.aa-input-united-block-valid').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if (document.querySelector('#edit-process-container')) {
      $('input').trigger('click');
      $('#size').trigger('keyup');

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    }

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      const size = parseFloat($('#size').val());
      const date = new Date($('#date').val());
      const type = 'decrease';
      const distributionResult = 'processed';
      const unit = $('.animal-results-container').attr('data-unit');
      const product = $('.animal-results-container').attr('data-raw');
      let note = undefined;
      if ($('#note').val().length > 0) {
        note = $('#note').val();
      }


      let prod;

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      /* Submiting data to ADD inventory */
      if (document.querySelector('#add-process-container')) {
        prod = await addProductReturn({ size, date, type, distributionResult, unit, product, note });

        if (prod) {
          let counter = 0;
          $('.aa-input-united-block-valid').each(async function () {
            let response = await addProduct({
              size: parseFloat($(this).find('.size-input').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.unit-input').val(),
              product: $(this).find('.aa-select-option-selected').attr('data-val'),
              rawProduct: prod._id
            });

            if (response) counter++;
            if (counter === $('.aa-input-united-block-valid').length) {
              $('.mini-loader').hide();
              addConfirmationEmpty($('.animal-results-container'));
              setTimeout(() => {
                location.reload(true);
              }, 1500)

              //location.assign('/herd/all-animals');
            }

          });


        }
      }

      /* Submiting data to EDIT inventory */
      if (document.querySelector('#edit-process-container')) {
        prod = await editProductReturn($(this).attr('data-product-id'), { size, date, type, distributionResult, unit, product, note });

        if (prod) {
          let counter = 0;
          $('.aa-input-united-block-valid').each(async function () {
            let response;
            if ($(this).attr('data-new') === 'false') {
              response = await editProduct($(this).attr('data-id'), {
                size: parseFloat($(this).find('.size-input').val()),
                date: new Date($('#date').val()),
                unit: $(this).find('.unit-input').val(),
                product: $(this).find('.aa-select-option-selected').attr('data-val'),
                rawProduct: prod._id
              });
            } else if ($(this).attr('data-new') === 'true') {
              response = await addProduct({
                size: parseFloat($(this).find('.size-input').val()),
                date: new Date($('#date').val()),
                unit: $(this).find('.unit-input').val(),
                product: $(this).find('.aa-select-option-selected').attr('data-val'),
                rawProduct: prod._id
              });
            }


            if (response) counter++;
            if (counter === $('.aa-input-united-block-valid').length) {
              $('.mini-loader').hide();
              addConfirmationEmpty($('.animal-results-container'));
              setTimeout(() => {
                location.reload(true);
              }, 1500)

              //location.assign('/herd/all-animals');
            }

          });


        }
      }
    });



  }

  ///////////////////////
  /* BOTH ADD/EDIT ORDER PAGE*/
  ///////////////////////

  if (document.querySelector('#add-order-container') || document.querySelector('#edit-order-container')) {
    $('.ar-switch-btn').on('click', function () {
      if (!$(this).hasClass('ar-switch-btn-active')) {
        $('.ar-switch-btn-active').removeClass('ar-switch-btn-active');
        $(this).addClass('ar-switch-btn-active');

        $('.date-block').hide();
        $(`#${$(this).attr('data-el')}`).css('display', $(`#${$(this).attr('data-el')}`).attr('data-display'))

      }
    });

    $('.ar-switch-btn-first').trigger('click')

    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    /* Preventing double selection */
    $('body').on('click', '.aa-select-option', function () {
      let selectedOption = $(this);
      $('.aa-select-option').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-val') === selectedOption.attr('data-val')) {
          $(this).addClass('aa-select-option-taken');
        } else if ($(this).attr('data-val') === selectedOption.parent().attr('data-val')) {
          $(this).removeClass('aa-select-option-taken');
        }
      });
      $(this).parent().attr('data-val', $(this).attr('data-val'))
    });

    $('#add-product-input').on('click', function () {
      $(this).parent().before(`
        <div class="aa-input-united-block" data-new="true"> 
        <div class="aa-input-block"> 
          <label class="aa-label" for="type">
            <p>Продукт</p>
          </label>
          <div class="aa-select-box aa-select-box-one">
            <div class="aa-select-text">Выберите продукт</div>
            <ion-icon name="chevron-down"></ion-icon>
            <div class="aa-select-options-box">
              <div class="aa-select-option" data-val="milk">Молоко</div>
              <div class="aa-select-option" data-val="cottage-cheese">Творог</div>
              <div class="aa-select-option" data-val="butter">Масло </div>
              <div class="aa-select-option" data-val="cream">Сливки </div>
              <div class="aa-select-option" data-val="cheese">Сыр  </div>
              <div class="aa-select-option" data-val="whey">Сыворотка </div>
              <div class="aa-select-option" data-val="sour-cream">Сметана  </div>
              <div class="aa-select-option" data-val="meat">Мясо  </div>
            </div>
          </div>
        </div>
        <div class="aa-input-block">
          <lable class="aa-label" for="price"> 
            <p>Вес | Объем</p>
          </lable>
          <div class="aa-double-input-block">
            <input class="aa-double-input size-input" type="number" />
            <select class="aa-double-input unit-input">
              <option value="l" selected="selected">Л.</option>
              <option value="kg">Кг.  </option>
            </select>
          </div>
        </div>
        <div class="aa-iu-remove">  
          <ion-icon name="close"></ion-icon>
        </div>
      </div>
      `);

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    });

    $('.main-section').on('click', '.aa-iu-remove', async function () {
      if ($(this).parent().attr('data-new') === 'false') {
        $(this).find('ion-icon').remove();
        $(this).append(`<div class="mini-loader"></div>`);

        let response = await deleteReminder($(this).parent().attr('data-id'));
        if (response) $(this).parent().remove();

      } else if ($(this).parent().attr('data-new') === 'true') {
        $(this).parent().remove();
      }
    });

    /* Validating the date */
    $('#date').on('keyup click change', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) > new Date()) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#date').on('blur', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) <= new Date()) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите правильную дату</div>`);
      }
    });

    $('*').on('click focus blur change keyup', function () {
      $('.aa-input-united-block ').each(function () {
        if ($(this).find('.aa-select-option-selected').length > 0 && parseFloat($(this).find('.size-input').val()) > 0) {
          $(this).addClass('aa-input-united-block-valid')
        } else {
          $(this).removeClass('aa-input-united-block-valid')
        }
      });

      if ($('.ar-switch-btn-active').attr('id') === 'once') {
        if ($('#date').hasClass('valid-aa-input') && $('body').find('.aa-input-ps-warning').length === 0 && $('.aa-input-united-block-valid').length > 0) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      } else {
        if ($('body').find('.aa-input-ps-warning').length === 0 && $('.aa-input-united-block-valid').length > 0) {
          $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
        } else {
          $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
        }
      }
    });

    if (document.querySelector('#edit-order-container')) {
      $('input').trigger('click');
      $('input').trigger('click');

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');

      $('#rec-date').find('option').each(function () {
        if ($(this).attr('value') === $('#rec-date').attr('data-val')) {
          $(this).attr('selected', true)
        }
      });
    }

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      let note = undefined;
      if ($('#note').val().length > 0) {
        note = $('#note').val();
      }


      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });



      /* Submiting data to ADD order */
      if (document.querySelector('#add-order-container')) {
        let subId = randomstring.generate(12);

        let counter = 0;
        $('.aa-input-united-block-valid').each(async function () {
          let response;
          if ($('.ar-switch-btn-active').attr('id') === 'once') {
            response = await addReminder({
              size: parseFloat($(this).find('.size-input').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.unit-input').val(),
              product: $(this).find('.aa-select-option-selected').attr('data-val'),
              subId: subId,
              module: 'order',
              client: $('#client').attr('data-id'),
              note: note
            });
          } else {
            response = await addReminder({
              size: parseFloat($(this).find('.size-input').val()),
              recuring: true,
              recuringDay: parseFloat($('#rec-date').val()),
              recuringHour: parseFloat($('#rec-hour').val()),
              recuringMinute: parseFloat($('#rec-minute').val()),
              unit: $(this).find('.unit-input').val(),
              product: $(this).find('.aa-select-option-selected').attr('data-val'),
              subId: subId,
              module: 'order',
              client: $('#client').attr('data-id'),
              note: note
            });
          }


          if (response) counter++;
          if (counter === $('.aa-input-united-block-valid').length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            //location.assign('/herd/all-animals');
          }

        });

      }

      /* Submiting data to EDIT inventory */
      if (document.querySelector('#edit-order-container')) {
        let subId = $(this).attr('data-order-id');
        let counter = 0;
        $('.aa-input-united-block-valid').each(async function () {
          let response;
          if ($(this).attr('data-new') === 'false') {
            if ($('.ar-switch-btn-active').attr('id') === 'once') {
              response = await editReminder($(this).attr('data-id'), {
                size: parseFloat($(this).find('.size-input').val()),
                date: new Date($('#date').val()),
                unit: $(this).find('.unit-input').val(),
                product: $(this).find('.aa-select-option-selected').attr('data-val'),
                subId: subId,
                module: 'order',
                client: $('#client').attr('data-id'),
                note: note,
                recuring: false,
              });
            } else {
              response = await editReminder($(this).attr('data-id'), {
                size: parseFloat($(this).find('.size-input').val()),
                recuring: true,
                recuringDay: parseFloat($('#rec-date').val()),
                recuringHour: parseFloat($('#rec-hour').val()),
                recuringMinute: parseFloat($('#rec-minute').val()),
                unit: $(this).find('.unit-input').val(),
                product: $(this).find('.aa-select-option-selected').attr('data-val'),
                subId: subId,
                module: 'order',
                client: $('#client').attr('data-id'),
                note: note
              });
            }
          } else if ($(this).attr('data-new') === 'true') {
            if ($('.ar-switch-btn-active').attr('id') === 'once') {
              response = await addReminder({
                size: parseFloat($(this).find('.size-input').val()),
                date: new Date($('#date').val()),
                unit: $(this).find('.unit-input').val(),
                product: $(this).find('.aa-select-option-selected').attr('data-val'),
                subId: subId,
                module: 'order',
                client: $('#client').attr('data-id'),
                note: note
              });
            } else {
              response = await addReminder({
                size: parseFloat($(this).find('.size-input').val()),
                recuring: true,
                recuringDay: parseFloat($('#rec-date').val()),
                recuringHour: parseFloat($('#rec-hour').val()),
                recuringMinute: parseFloat($('#rec-minute').val()),
                unit: $(this).find('.unit-input').val(),
                product: $(this).find('.aa-select-option-selected').attr('data-val'),
                subId: subId,
                module: 'order',
                client: $('#client').attr('data-id'),
                note: note
              });
            }
          }

          if (response) counter++;
          if (counter === $('.aa-input-united-block-valid').length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            //location.assign('/herd/all-animals');
          }

        });
      }
    });



  }

  ///////////////////////
  /* BOTH ADD/EDIT SALE PAGE*/
  ///////////////////////

  if (document.querySelector('#add-sale-container') || document.querySelector('#edit-sale-container')) {
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    /* Working with prices in each product */
    $('body').on('click change keyup', '.size-input, .price-input', function () {
      if ($(this).hasClass('size-input') && parseFloat($(this).val()) > parseFloat($(this).attr('data-max'))) {
        $(this).val(parseFloat($(this).attr('data-max')));
      }

      let parent = $(this).parent().parent().parent();
      let size = parseFloat(parent.find('.size-input').val().length === 0 ? 0 : parent.find('.size-input').val());
      let price = parseFloat(parent.find('.price-input').val().length === 0 ? 0 : parent.find('.price-input').val());
      parent.find('.price-text').html(`₽ &nbsp; = &nbsp; ${size * price}₽`)
      parent.attr('data-total', size * price)
    });

    /* Hiding elements if quantity is 0 */
    $('body').on('click', '.aa-select-box', function () {
      $('.aa-select-option').each(function () {
        let selectEl = $(this);
        $('.arc-inventory-data').each(function () {
          if (selectEl.attr('data-val') === $(this).attr('data-product') && $(this).attr('data-quantity') == 0) {
            selectEl.hide();
          }
        });
      });
    });

    /* Preventing double selection */
    $('body').on('click', '.aa-select-option', function () {
      let selectedOption = $(this);
      $('.aa-select-option').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-val') === selectedOption.attr('data-val')) {
          $(this).addClass('aa-select-option-taken');
        } else if ($(this).attr('data-val') === selectedOption.parent().attr('data-val')) {
          $(this).removeClass('aa-select-option-taken');
        }
      });
      $(this).parent().attr('data-val', $(this).attr('data-val'))

      $('.arc-inventory-data').each(function () {
        if (selectedOption.attr('data-val') === $(this).attr('data-product') && $(this).attr('data-quantity') != 0) {
          selectedOption.parent().parent().parent().parent().find('.range-text').html(`/ &nbsp; ${$(this).attr('data-quantity')}`)
          selectedOption.parent().parent().parent().parent().find('.size-input').attr('data-max', $(this).attr('data-quantity'))
          selectedOption.parent().parent().parent().parent().find('.size-input').trigger('change')
        }
      });
    });

    $('#add-product-input').on('click', function () {
      $(this).parent().before(`
        <div class="aa-input-united-block" data-new="true"> 
        <div class="aa-input-block"> 
          <label class="aa-label" for="type">
            <p>Продукт</p>
          </label>
          <div class="aa-select-box aa-select-box-one">
            <div class="aa-select-text">Выберите продукт</div>
            <ion-icon name="chevron-down"></ion-icon>
            <div class="aa-select-options-box">
              <div class="aa-select-option" data-val="milk">Молоко</div>
              <div class="aa-select-option" data-val="cottage-cheese">Творог</div>
              <div class="aa-select-option" data-val="butter">Масло </div>
              <div class="aa-select-option" data-val="cream">Сливки </div>
              <div class="aa-select-option" data-val="cheese">Сыр  </div>
              <div class="aa-select-option" data-val="whey">Сыворотка </div>
              <div class="aa-select-option" data-val="sour-cream">Сметана  </div>
              <div class="aa-select-option" data-val="meat">Мясо  </div>
            </div>
          </div>
        </div>
        <div class="aa-input-block">
          <lable class="aa-label" for="price"> 
            <p>Вес | Объем</p>
          </lable>
          <div class="aa-double-input-block">
            <input class="aa-double-input size-input" type="number" />
            <p class="aa-double-price-text range-text">/ &nbsp;</p>
            <select class="aa-double-input unit-input">
              <option value="l" selected="selected">Л.</option>
              <option value="kg">Кг.  </option>
            </select>
          </div>
        </div>
        <div class="aa-input-block">
          <lable class="aa-label" for="size"> 
            <p>Цена / л.</p>
          </lable>
          <div class="aa-double-input-block aa-double-price-block">
            <input class="aa-double-price-input price-input" type="number" />
            <p class="aa-double-price-text price-text">₽ &nbsp; = &nbsp; 0₽</p>
          </div>
        </div>
        <div class="aa-iu-remove">  
          <ion-icon name="close"></ion-icon>
        </div>
      </div>
      `);

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    });

    $('body').on('click', '.aa-iu-remove', async function () {
      if ($(this).parent().attr('data-new') === 'false') {
        $(this).find('ion-icon').remove();
        $(this).append(`<div class="mini-loader"></div>`);

        let response = await deleteProduct($(this).parent().attr('data-id'));
        if (response) $(this).parent().remove();

      } else if ($(this).parent().attr('data-new') === 'true') {
        $(this).parent().remove();
      }
    });



    $('body').on('click change', '.unit-input', function () {
      let parent = $(this).parent().parent().parent();
      parent.find('.price-input').parent().parent().find('.aa-label p').text(`Цена / ${$(this).val() === 'l' ? 'л.' : 'кг.'}`)

    });

    /* Pre setting price */
    $('body').on('click', '.aa-select-option', function () {
      let parent = $(this).parent().parent().parent().parent();
      let product = $(this).attr('data-val');
      /* parent.find('.price-input').val(0) */

      if ($('#client').val().length > 0 && $('#client').attr('data-id') !== '') {
        if (parent.find('.price-input').val().length === 0 || parseFloat(parent.find('.price-input').val()) === 0) {
          $('.animal-search-item').each(function () {
            if ($(this).attr('data-id') === $('#client').attr('data-id')) {
              $(this).find('.asi-hidden').each(function () {
                if ($(this).attr('data-product') === product) {
                  parent.find('.price-input').val(parseFloat($(this).attr('data-price')))
                }
              });
            }
          });
        }
      }

      parent.find('.price-input').trigger('click')
    });

    $('.animal-search-item').on('click', function () {
      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    })

    /* Validating the date */
    /* $('#date').on('keyup click change', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) > new Date()) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#date').on('blur', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) <= new Date()) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите правильную дату</div>`);
      }
    }); */

    $('*').on('click focus blur change keyup', function () {
      $('.aa-input-united-block ').each(function () {
        if ($(this).find('.aa-select-option-selected').length > 0 && parseFloat($(this).find('.size-input').val()) > 0 && parseFloat($(this).find('.price-input').val()) > 0) {
          $(this).addClass('aa-input-united-block-valid')
        } else {
          $(this).removeClass('aa-input-united-block-valid')
        }
      });
      let total = 0;
      $('.aa-input-united-block-valid').each(function () {
        total += parseFloat($(this).attr('data-total'));
      });

      $('#total').attr('data-total', total)
      $('#total').text(`${total}₽`)

      if ($('#date').hasClass('valid-aa-input') && $('body').find('.aa-input-ps-warning').length === 0 && $('.aa-input-united-block-valid').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if (document.querySelector('#edit-sale-container')) {
      $('input').trigger('click');
      $('input').trigger('click');

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    }

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      let note = undefined;
      if ($('#note').val().length > 0) {
        note = $('#note').val();
      }


      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });



      /* Submiting data to ADD sale */
      if (document.querySelector('#add-sale-container')) {
        let subId = randomstring.generate(12);

        let counter = 0;
        $('.aa-input-united-block-valid').each(async function () {
          let response = await addProduct({
            size: parseFloat($(this).find('.size-input').val()),
            date: new Date($('#date').val()),
            unit: $(this).find('.unit-input').val(),
            product: $(this).find('.aa-select-option-selected').attr('data-val'),
            type: 'decrease',
            distributionResult: 'sold',
            pricePer: parseFloat($(this).find('.price-input').val()),
            price: parseFloat($(this).attr('data-total')),
            client: $('#client').attr('data-id') === '' ? undefined : $('#client').attr('data-id'),
            subId,
            note
          });

          if (response) counter++;
          if (counter === $('.aa-input-united-block-valid').length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            //location.assign('/herd/all-animals');
          }

        });

      }

      /* Submiting data to EDIT inventory */
      if (document.querySelector('#edit-sale-container')) {
        let subId = $(this).attr('data-sale-id');

        let counter = 0;
        $('.aa-input-united-block-valid').each(async function () {
          let response;
          if ($(this).attr('data-new') === 'false') {
            response = await editProduct($(this).attr('data-id'), {
              size: parseFloat($(this).find('.size-input').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.unit-input').val(),
              product: $(this).find('.aa-select-option-selected').attr('data-val'),
              type: 'decrease',
              distributionResult: 'sold',
              pricePer: parseFloat($(this).find('.price-input').val()),
              price: parseFloat($(this).attr('data-total')),
              client: $('#client').attr('data-id') === '' ? undefined : $('#client').attr('data-id'),
              subId,
              note
            });
          } else if ($(this).attr('data-new') === 'true') {
            response = await addProduct({
              size: parseFloat($(this).find('.size-input').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.unit-input').val(),
              product: $(this).find('.aa-select-option-selected').attr('data-val'),
              type: 'decrease',
              distributionResult: 'sold',
              pricePer: parseFloat($(this).find('.price-input').val()),
              price: parseFloat($(this).attr('data-total')),
              client: $('#client').attr('data-id') === '' ? undefined : $('#client').attr('data-id'),
              subId,
              note
            });
          }

          if (response) counter++;
          if (counter === $('.aa-input-united-block-valid').length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            //location.assign('/herd/all-animals');
          }

        });
      }
    });



  }

  ///////////////////////
  /* BOTH ADD/EDIT CONSUMPTION PAGE*/
  ///////////////////////

  if (document.querySelector('#add-consumption-container') || document.querySelector('#edit-consumption-container')) {
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    /* Switch between types */
    $('.ar-switch-btn').on('click', function () {
      if (!$(this).hasClass('ar-switch-btn-active')) {
        $('.ar-switch-btn-active').removeClass('ar-switch-btn-active');
        $(this).addClass('ar-switch-btn-active');
      }
    });

    /* Working with prices in each product */
    $('body').on('click change keyup', '.size-input', function () {
      if ($(this).hasClass('size-input') && parseFloat($(this).val()) > parseFloat($(this).attr('data-max'))) {
        $(this).val(parseFloat($(this).attr('data-max')));
      }
    });

    /* Hiding elements if quantity is 0 */
    $('body').on('click', '.aa-select-box', function () {
      $('.aa-select-option').each(function () {
        let selectEl = $(this);
        $('.arc-inventory-data').each(function () {
          if (selectEl.attr('data-val') === $(this).attr('data-product') && $(this).attr('data-quantity') == 0) {
            selectEl.hide();
          }
        });
      });
    });

    /* Preventing double selection */
    $('body').on('click', '.aa-select-option', function () {
      let selectedOption = $(this);
      $('.aa-select-option').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-val') === selectedOption.attr('data-val')) {
          $(this).addClass('aa-select-option-taken');
        } else if ($(this).attr('data-val') === selectedOption.parent().attr('data-val')) {
          $(this).removeClass('aa-select-option-taken');
        }
      });
      $(this).parent().attr('data-val', $(this).attr('data-val'))

      $('.arc-inventory-data').each(function () {
        if (selectedOption.attr('data-val') === $(this).attr('data-product') && $(this).attr('data-quantity') != 0) {
          selectedOption.parent().parent().parent().parent().find('.range-text').html(`/ &nbsp; ${$(this).attr('data-quantity')}`)
          selectedOption.parent().parent().parent().parent().find('.size-input').attr('data-max', $(this).attr('data-quantity'))
          selectedOption.parent().parent().parent().parent().find('.size-input').trigger('change')
        }
      });
    });

    $('#add-product-input').on('click', function () {
      $(this).parent().before(`
        <div class="aa-input-united-block" data-new="true"> 
        <div class="aa-input-block"> 
          <label class="aa-label" for="type">
            <p>Продукт</p>
          </label>
          <div class="aa-select-box aa-select-box-one">
            <div class="aa-select-text">Выберите продукт</div>
            <ion-icon name="chevron-down"></ion-icon>
            <div class="aa-select-options-box">
              <div class="aa-select-option" data-val="milk">Молоко</div>
              <div class="aa-select-option" data-val="cottage-cheese">Творог</div>
              <div class="aa-select-option" data-val="butter">Масло </div>
              <div class="aa-select-option" data-val="cream">Сливки </div>
              <div class="aa-select-option" data-val="cheese">Сыр  </div>
              <div class="aa-select-option" data-val="whey">Сыворотка </div>
              <div class="aa-select-option" data-val="sour-cream">Сметана  </div>
              <div class="aa-select-option" data-val="meat">Мясо  </div>
            </div>
          </div>
        </div>
        <div class="aa-input-block">
          <lable class="aa-label" for="price"> 
            <p>Вес | Объем</p>
          </lable>
          <div class="aa-double-input-block">
            <input class="aa-double-input size-input" type="number" />
            <p class="aa-double-price-text range-text">/ &nbsp;</p>
            <select class="aa-double-input unit-input">
              <option value="l" selected="selected">Л.</option>
              <option value="kg">Кг.  </option>
            </select>
          </div>
        </div>
        <div class="aa-iu-remove">  
          <ion-icon name="close"></ion-icon>
        </div>
      </div>
      `);

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    });

    $('body').on('click', '.aa-iu-remove', async function () {
      if ($(this).parent().attr('data-new') === 'false') {
        $(this).find('ion-icon').remove();
        $(this).append(`<div class="mini-loader"></div>`);

        let response = await deleteProduct($(this).parent().attr('data-id'));
        if (response) $(this).parent().remove();

      } else if ($(this).parent().attr('data-new') === 'true') {
        $(this).parent().remove();
      }
    });

    /* Validating the date */
    /* $('#date').on('keyup click change', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) > new Date()) {
        $(this).addClass('valid-aa-input');
        $(`#${$(this).attr('id')}-warning`).remove();
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    $('#date').on('blur', function () {
      if ($(this).val().length !== 0 && new Date($(this).val()) <= new Date()) {
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Введите правильную дату</div>`);
      }
    }); */

    $('*').on('click focus blur change keyup', function () {
      $('.aa-input-united-block ').each(function () {
        if ($(this).find('.aa-select-option-selected').length > 0 && parseFloat($(this).find('.size-input').val()) > 0) {
          $(this).addClass('aa-input-united-block-valid')
        } else {
          $(this).removeClass('aa-input-united-block-valid')
        }
      });

      if ($('#date').hasClass('valid-aa-input') && $('body').find('.aa-input-ps-warning').length === 0 && $('.aa-input-united-block-valid').length > 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if (document.querySelector('#edit-consumption-container')) {
      $('input').trigger('click');
      $('input').trigger('click');

      $('.aa-select-option-selected').trigger('click');
      $('.aa-select-option-selected').trigger('click');
    }

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      let note = undefined;
      if ($('#note').val().length > 0) {
        note = $('#note').val();
      }


      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });



      /* Submiting data to ADD consumption */
      if (document.querySelector('#add-consumption-container')) {
        let subId = randomstring.generate(12);

        let counter = 0;
        $('.aa-input-united-block-valid').each(async function () {
          let response = await addProduct({
            size: parseFloat($(this).find('.size-input').val()),
            date: new Date($('#date').val()),
            unit: $(this).find('.unit-input').val(),
            product: $(this).find('.aa-select-option-selected').attr('data-val'),
            type: 'decrease',
            distributionResult: $('.ar-switch-btn-active').attr('id'),
            subId,
            note
          });

          if (response) counter++;
          if (counter === $('.aa-input-united-block-valid').length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            //location.assign('/herd/all-animals');
          }

        });

      }

      /* Submiting data to EDIT consumption */
      if (document.querySelector('#edit-consumption-container')) {
        let subId = $(this).attr('data-consumption-id');

        let counter = 0;
        $('.aa-input-united-block-valid').each(async function () {
          let response;
          if ($(this).attr('data-new') === 'false') {
            response = await editProduct($(this).attr('data-id'), {
              size: parseFloat($(this).find('.size-input').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.unit-input').val(),
              product: $(this).find('.aa-select-option-selected').attr('data-val'),
              type: 'decrease',
              distributionResult: $('.ar-switch-btn-active').attr('id'),
              subId,
              note
            });
          } else if ($(this).attr('data-new') === 'true') {
            response = await addProduct({
              size: parseFloat($(this).find('.size-input').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.unit-input').val(),
              product: $(this).find('.aa-select-option-selected').attr('data-val'),
              type: 'decrease',
              distributionResult: $('.ar-switch-btn-active').attr('id'),
              subId,
              note
            });
          }

          if (response) counter++;
          if (counter === $('.aa-input-united-block-valid').length) {
            $('.mini-loader').hide();
            addConfirmationEmpty($('.animal-results-container'));
            setTimeout(() => {
              location.reload(true);
            }, 1500)

            //location.assign('/herd/all-animals');
          }

        });
      }
    });



  }

  ///////////////////////
  /* ALL PRODUCTS PAGE*/
  ///////////////////////
  if (document.querySelector('#all-products-page')) {
    /* Showing detailed info on click */
    $('.dist-info-list-item').on('click', function () {
      if (!$(this).hasClass('dist-info-list-item-active')) {
        $(this).addClass('dist-info-list-item-active');
      } else {
        $(this).removeClass('dist-info-list-item-active');
      }
    });

    /* Working with categories */
    $('.dist-info-btn').on('click', function () {
      $(this).addClass('dist-info-btn-active')
      $(this).siblings().removeClass('dist-info-btn-active')

      const btn = $(this);
      let total = 0;
      let totalAvg = 0;
      let counterAvg = 0;
      let totalSize = 0;
      $('.dist-info-list-item').each(function () {
        if ($(this).attr('data-product') === btn.attr('data-product')) {
          $(this).css('display', 'flex')
        } else {
          $(this).css('display', 'none')
        }

        if ($(this).attr('data-product') === btn.attr('data-product') && $(this).attr('data-sold') === 'true') {
          total += parseFloat($(this).attr('data-total'));
          totalAvg += parseFloat($(this).attr('data-price'));
          counterAvg++;
          totalSize += parseFloat($(this).attr('data-size'));
        }
      });

      $('#sold-month p').text(totalSize);
      $('#sold-month').find('.dist-info-number-unit').text(btn.attr('data-unit') === 'l' ? 'Литров' : 'Килограмм')
      if (totalSize === 0) $('#sold-month p').text('-');

      $('#avg-month  p').text((totalAvg / counterAvg).toFixed(1));
      if (isNaN(totalAvg / counterAvg)) $('#avg-month p').text('-');

      $('#total-month  p').text(total < 100000 ? total : total.toFixed(1));
      $('#total-month').find('.dist-info-number-unit').text(total < 100000 ? 'Рублей' : 'Тыс. рублей')
      if (total === 0) $('#total-month p').text('-');
    });

    $('.dist-info-btn-click').trigger('click');
  }

  ///////////////////////
  /* ALL CLIENTS PAGE*/
  ///////////////////////
  const productsToRus = {
    milk: 'Молоко',
    meat: 'Мясо',
    cottagecheese: 'Творог',
    cream: 'Сливки',
    butter: 'Масло',
    cheese: 'Сыр',
    whey: 'Сыворотка'
  }

  if (document.querySelector('#all-clients-page')) {
    const data = [];
    $('.dist-client-info-hidden').each(function () {
      data.push({
        client: $(this).attr('data-client'),
        product: $(this).attr('data-product'),
        size: parseFloat($(this).attr('data-size')),
        date: new Date($(this).attr('data-date')),
        unit: $(this).attr('data-unit'),
        price: parseFloat($(this).attr('data-price')),
        pricePer: parseFloat($(this).attr('data-price-per')),
      });
    });

    let generalTotal = 0;
    data.forEach(el => generalTotal += el.price);

    let clientsData = [];

    $('.dist-client-item').each(function () {
      let clientTotal = 0;
      data.forEach(el => {
        if (el.client === $(this).attr('data-id')) {
          clientTotal += el.price;
        }
      });

      $(this).attr('data-client-total', clientTotal);

      let clientPercent = parseFloat((clientTotal / (generalTotal / 100)).toFixed(1));
      let clientColor;

      if (clientPercent <= 10) {
        clientColor = '#D44D5C';
      } else if (clientPercent > 10 && clientPercent <= 40) {
        clientColor = '#FFD700';
      } else if (clientPercent > 40) {
        clientColor = '#0EAD69';
      }
      $(this).find('.dcir-line-inner').css({
        "width": `${clientPercent}%`,
        "background-color": clientColor
      });
      $(this).find('.dist-client-item-result').find('p').text(`${clientPercent}%`)

      clientsData.push({
        client: $(this).attr('data-id'),
        total: clientTotal
      });

    });

    clientsData.sort((a, b) => b.total - a.total);

    /* Changing info on click */
    $('.dist-client-item').on('click', function () {
      let clientId = $(this).attr('data-id');
      let clientTotal = $(this).attr('data-client-total');

      $('.dist-client-item-active').removeClass('dist-client-item-active');
      $(this).addClass('dist-client-item-active');

      /* Adding key info in animal card */
      $('#name').text($(this).attr('data-name'));
      $('#adress').text($(this).attr('data-adress') !== 'undefined' ? $(this).attr('data-adress') : '');
      $('#phone').text($(this).attr('data-phone') !== 'undefined' ? $(this).attr('data-phone') : '');
      $('#email').text($(this).attr('data-email') !== 'undefined' ? $(this).attr('data-email') : '');

      $('.dist-client-card-edit').attr('href', `/distribution/edit-client/${clientId}`)

      $('.dist-client-card-product-box').empty();
      $(this).find('.dist-client-item-hidden').each(function () {
        let rusName = $(this).attr('data-product');
        let price = $(this).attr('data-price');
        $('.dist-client-card-product-box').append(`<div class="dist-client-card-product">${productsToRus[rusName.replace('-', '')]} - ${price}₽</div>`)
      });

      /* Working with products */
      clientsData.forEach((el, inx) => {
        if (el.client === clientId) {
          $('#place').text(inx + 1)
        }
      });

      let selClientData = []

      data.forEach((el) => {
        if (el.client === clientId) selClientData.push(el);
      });
      selClientData.sort((a, b) => b.date - a.date)

      /* Adding historical info */
      $('.dcd-purchases-block').empty();
      selClientData.forEach((el, inx, arr) => {

        if (inx === 0 || moment(el.date).dayOfYear() !== moment(arr[inx - 1].date).dayOfYear() || moment(el.date).year() !== moment(arr[inx - 1].date).year()) {
          if (moment().year() === moment(el.date).year()) {
            $('.dcd-purchases-block').append(`<div class="dcd-purchases-date">${moment(el.date).lang('ru').format('DD MMMM')}</div>`)
          } else {
            $('.dcd-purchases-block').append(`<div class="dcd-purchases-date">${moment(el.date).lang('ru').format('DD MMMM YYYY')}</div>`)
          }
        }
        $('.dcd-purchases-block').append(`
          <div class="dcd-purchases-item">      
            <div class="dcd-purchases-item-info">     
              <div class="dcd-purchases-item-title">${productsToRus[el.product.replace('-', '')]}</div>
              <div class="dcd-purchases-item-size">${el.size} ${el.unit === 'l' ? 'л.' : 'кг.'}</div>
            </div>
            <div class="dcd-purchases-item-sum">+ ${el.price} ₽</div>
          </div>
          `)

      });

      let selClientDataSorted = [];

      selClientData.forEach(el => {
        if (!selClientDataSorted.find(prod => prod.product === el.product)) {
          selClientDataSorted.push({
            product: el.product,
            unit: el.unit,
            allData: [el]
          })
        } else {
          selClientDataSorted.find(prod => prod.product === el.product).allData.push(el)
        }
      });

      let clientTotalStr = clientTotal.split('').reverse().join('').replace(/.{3}/g, '$&,').split('').reverse().join('');
      if (clientTotalStr.startsWith(',')) clientTotalStr = clientTotalStr.split('').slice(1).join('');
      $('.dcd-total-block-header p').text(`${clientTotalStr} ₽`)

      $('.dcd-products-break-box').empty();
      $('.dcd-total-products-box').empty();
      selClientDataSorted.forEach((data, inx) => {
        let totalSize = 0;
        let totalPrice = 0;
        let totalMoney = 0;

        data.allData.forEach(allEl => {
          totalSize += allEl.size;
          totalPrice += allEl.pricePer;
          totalMoney += allEl.price;
        })
        $('.dcd-products-break-box').append(`
            <div class="dcd-break-product" data-inx="${inx}">
            <div class="dcd-break-product-title">${productsToRus[data.product.replace('-', '')]}</div>
            <div class="dcd-break-product-info-box">
            <div class="dcd-break-product-info">
            <div class="dcd-break-product-info-title">Кол-во</div>
            <div class="dcd-break-product-info-text">${totalSize} ${data.unit === 'l' ? 'л.' : 'кг.'}</div>
            </div>
            <div class="dcd-break-product-info">
            <div class="dcd-break-product-info-title">Цена</div>
            <div class="dcd-break-product-info-text">${Math.round(totalPrice / data.allData.length)}₽</div>
              </div>
            </div>
            </div>
            `);

        $('.dcd-total-products-box').append(`
          <div class="dcd-total-product" data-percent="${totalMoney / (clientTotal / 100)}">
            <div class="dcd-total-product-line"></div>
            <div class="dcd-total-product-title">${productsToRus[data.product.replace('-', '')]}</div>
            <div class="dcd-total-product-info">${(totalMoney / (clientTotal / 100)).toFixed(1)}%
              <div class="dcd-total-product-info-hidden">${totalMoney} ₽</div>
            </div>
          </div>
        `);
      });

      const breakProductColors = ['#fb8d34', '#ff5230', '#9d4b9f', '#606ae5', '#43d7e5']
      $('.dcd-break-product').each(function () {
        $(this).find('.dcd-break-product-title').css('color', breakProductColors[parseFloat($(this).attr('data-inx'))]);
      });

      $('.dcd-total-product').each(function () {
        $(this).find('.dcd-total-product-line').css('width', `${parseFloat($(this).attr('data-percent'))}%`);
      });

    });

    $('.dist-client-item-active').trigger('click');

    /* Changing the time period */
    $('.main-page-header-period').on('change', function () {
      if ($("#start-date").val() !== '' && $("#end-date").val() !== '') {
        location.assign(`/distribution/all-clients/?start=${new Date($("#start-date").val())}&end=${new Date($("#end-date").val())}`)
      }
    });
  }

  ///////////////////////
  /* BOTH ADD/EDIT WRITE OFF PAGE*/
  ///////////////////////

  if (document.querySelector('#add-write-off-container') || document.querySelector('#edit-write-off-container')) {
    $('input').on('keyup change blur click', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('valid-aa-input');
      } else {
        $(this).removeClass('valid-aa-input');
      }
    });

    /* Validating size */
    $('#size').on('keyup change', function () {
      let percent = Math.round(parseFloat($(this).val()) / (parseFloat($('.aa-total-milk-line-inner').attr('data-total')) / 100));

      $('.aa-total-milk-line-inner').stop();
      $('.aa-total-milk-line-inner').animate({ 'width': `${percent}%` }, 250);

      if (parseFloat($(this).val()) > parseFloat($('.aa-total-milk-line-inner').attr('data-total'))) {
        $('.aa-total-milk-line-inner').css('background-color', '#D44D5C');
        $(`#${$(this).attr('id')}-warning`).remove();
        $(this).parent().after(`<div class="aa-input-ps aa-input-ps-warning" id="${$(this).attr('id')}-warning">Количество не должно превышать общее количество продукта</div>`);
      } else {
        $(`#${$(this).attr('id')}-warning`).remove();
        $('.aa-total-milk-line-inner').css('background-color', '#f4a26180');

      }
    });

    $('*').on('click focus blur change keyup', function () {

      if ($('#size').hasClass('valid-aa-input') && $('#date').hasClass('valid-aa-input') && $('body').find('.aa-input-ps-warning').length === 0) {
        $('.ar-add-button').css({ 'pointer-events': 'auto', 'background-color': '#000000' });
      } else {
        $('.ar-add-button').css({ 'pointer-events': 'none', 'background-color': '#afafaf' });
      }
    });

    if (document.querySelector('#edit-write-off-container')) {
      $('input').trigger('click');
      $('#size').trigger('keyup');

    }

    /* Submiting data */
    $('.ar-add-button').click(async function () {
      const size = parseFloat($('#size').val());
      const date = new Date($('#date').val());
      const type = 'decrease';
      const distributionResult = 'write-off';
      const unit = $('.animal-results-container').attr('data-unit');
      const product = $('.animal-results-container').attr('data-product');
      let note = undefined;
      if ($('#note').val().length > 0) {
        note = $('#note').val();
      }


      let response;

      $(this).append(`<div class="mini-loader"></div>`);
      $('.mini-loader').css({
        'position': 'absolute',
        'right': '-35px'
      });

      /* Submiting data to ADD write off */
      if (document.querySelector('#add-write-off-container')) {
        response = await addProduct({ size, date, type, distributionResult, unit, product, note });

        if (response) {
          $('.mini-loader').hide();
          addConfirmationEmpty($('.animal-results-container'));
          setTimeout(() => {
            location.reload(true);
          }, 1500)

          //location.assign('/herd/all-animals');
        }

      }

      /* Submiting data to EDIT write off */
      if (document.querySelector('#edit-write-off-container')) {
        response = await editProduct($(this).attr('data-product-id'), { size, date, type, distributionResult, unit, product, note });

        if (response) {
          $('.mini-loader').hide();
          addConfirmationEmpty($('.animal-results-container'));
          setTimeout(() => {
            location.reload(true);
          }, 1500)

          //location.assign('/herd/all-animals');
        }
      }
    });



  }

  ///////////////////////
  /* DIST MAIN PAGE*/
  ///////////////////////
  if (document.querySelector('#dist-main-page')) {
    /* Getting the data */
    let productData = [];

    $('.dm-hidden-info').each(function () {
      productData.push({
        product: $(this).attr('data-product'),
        productRus: productsToRus[$(this).attr('data-product').replace('-', '')],
        type: $(this).attr('data-type'),
        size: parseFloat($(this).attr('data-size')),
        unit: $(this).attr('data-unit'),
        date: new Date($(this).attr('data-date')),
        distResult: $(this).attr('data-dist'),
        client: $(this).attr('data-client'),
        clientName: $(this).attr('data-client-name'),
        price: parseFloat($(this).attr('data-price')),
        pricePer: parseFloat($(this).attr('data-price-per'))
      });
    });

    $('.dmm-btn').on('click', function () {
      $('.dmm-btn-active').removeClass('dmm-btn-active');
      $(this).addClass('dmm-btn-active');

      /* For income total */
      let productClientData = [];
      if ($(this).attr('id') === 'dmm-income') {
        let incomeTotal = 0;
        productData.forEach((el) => {
          if (el.distResult === 'sold') {
            /* Counting total */
            incomeTotal += el.price;

            /* Working with clients share */
            if (productClientData.find(client => client.id === el.client)) {
              productClientData.find(client => client.id === el.client).products.push(el);
              productClientData.find(client => client.id === el.client).total += el.price;
            } else {
              productClientData.push({
                id: el.client,
                name: el.clientName,
                total: el.price,
                products: [el]
              })
            }
          }

        });

        productClientData.forEach(client => {
          client.share = parseFloat((client.total / (incomeTotal / 100)).toFixed(1))
        });

        productClientData.sort((a, b) => b.share - a.share)

        $('.dmm-list-block').empty();
        productClientData.forEach((client, inx) => {
          let clientTotalStr = client.total.toFixed(2).split('').reverse().join('').replace(/.{3}/g, '$&,').split('').reverse().join('');
          if (clientTotalStr.startsWith(',')) clientTotalStr = clientTotalStr.split('').slice(1).join('');
          clientTotalStr = clientTotalStr.replace(',.', '.')

          $('.dmm-list-block').append(`
            <div class="dmm-list-item ${inx + 1 < 5 ? `dmm-list-item-${inx + 1}` : 'dmm-list-item-5'}" style="width: ${60 + client.share * 0.4}%">
              <div class="dmm-list-item-group">
                <div class="dmm-list-item-number">#${inx + 1}</div>
                <div class="dmm-list-item-text">${client.name}</div>
              </div>
              <div class="dmm-list-item-group">
                <div class="dmm-list-item-sub-text">${clientTotalStr} ₽</div>
                <div class="dmm-list-item-text">${client.share}%</div>
              </div>
            </div>
          `);
        })


        let incomeTotalStr = incomeTotal.toFixed(2).split('').reverse().join('').replace(/.{3}/g, '$&,').split('').reverse().join('');
        if (incomeTotalStr.startsWith(',')) incomeTotalStr = incomeTotalStr.split('').slice(1).join('');
        incomeTotalStr = incomeTotalStr.replace(',.', '.')
        $('.dmm-big-info-title').text(`${incomeTotalStr} ₽`);
        $('.dmm-big-info-title').append('<div class="dmm-big-info-sub-title">общий доход</div>');
      } else if ($(this).attr('id') === 'dmm-products') {
        let productTotal = 0;
        productData.forEach((el) => {
          if (el.distResult === 'sold') {
            /* Counting total */
            productTotal += el.size;

            /* Working with clients share */
            if (productClientData.find(client => client.id === el.client)) {
              productClientData.find(client => client.id === el.client).products.push(el);
              productClientData.find(client => client.id === el.client).total += el.size;
            } else {
              productClientData.push({
                id: el.client,
                name: el.clientName,
                total: el.size,
                products: [el]
              })
            }
          }

        });

        productClientData.forEach(client => {
          client.share = parseFloat((client.total / (productTotal / 100)).toFixed(1))
        });

        productClientData.sort((a, b) => b.share - a.share)

        $('.dmm-list-block').empty();
        productClientData.forEach((client, inx) => {
          let clientTotalStr = client.total.toString().split('').reverse().join('').replace(/.{3}/g, '$&,').split('').reverse().join('');
          if (clientTotalStr.startsWith(',')) clientTotalStr = clientTotalStr.split('').slice(1).join('');

          $('.dmm-list-block').append(`
            <div class="dmm-list-item ${inx + 1 < 5 ? `dmm-list-item-${inx + 1}` : 'dmm-list-item-5'}" style="width: ${60 + client.share * 0.4}%">
              <div class="dmm-list-item-group">
                <div class="dmm-list-item-number">#${inx + 1}</div>
                <div class="dmm-list-item-text">${client.name}</div>
              </div>
              <div class="dmm-list-item-group">
                <div class="dmm-list-item-sub-text">${clientTotalStr} кг. / л.</div>
                <div class="dmm-list-item-text">${client.share}%</div>
              </div>
            </div>
          `);
        })


        let productTotalStr = productTotal.toString().split('').reverse().join('').replace(/.{3}/g, '$&,').split('').reverse().join('');
        if (productTotalStr.startsWith(',')) productTotalStr = productTotalStr.split('').slice(1).join('');
        $('.dmm-big-info-title').text(`${productTotalStr}`);
        $('.dmm-big-info-title').append('<div class="dmm-big-info-sub-title">всего продано (кг. или л.)</div>');
      }
    });
    $('.dmm-btn-active').trigger('click');

    /* Working with products break down */
    $('.dist-main-product-btns-block').empty();
    let productsSorted = [];

    productData.forEach(el => {
      if (productsSorted.find(product => product.productRus === el.productRus)) {
        productsSorted.find(product => product.productRus === el.productRus).products.push(el);
      } else {
        productsSorted.push({
          product: el.product,
          productRus: el.productRus,
          products: [el],
          unit: el.unit
        })
      }
    });

    productsSorted.forEach((el, inx, arr) => {
      el.sold = 0;
      el.processed = 0;
      el.writeOff = 0;
      el.used = 0;

      el.products.forEach(prod => {
        if (prod.distResult === 'sold') el.sold += prod.size;
        if (prod.distResult === 'processed') el.processed += prod.size;
        if (prod.distResult === 'personal-use' || prod.distResult === 'calf-feeding') el.used += prod.size;
        if (prod.distResult === 'write-off') el.writeOff += prod.size;
      });

      el.popularIndex = el.sold + el.processed;
    });

    productsSorted.sort((a, b) => b.popularIndex - a.popularIndex)


    productsSorted.forEach(el => {
      $('.dist-main-product-btns-block').append(`<div class="dmp-btn" data-sold="${el.sold}" data-processed="${el.processed}" data-write-off="${el.writeOff}" data-used="${el.used}" data-unit-rus="${el.unit === 'l' ? 'ЛИТРОВ' : 'КИЛОГРАММ'}">${el.productRus.toUpperCase()}</div>`)
    });

    let interval;

    $('body').on('click', '.dmp-btn', function () {
      $('.dmp-btn-active').removeClass('dmp-btn-active');
      $(this).addClass('dmp-btn-active')

      $('#dist-sold').text($(this).attr('data-sold'));
      $('#dist-processed').text($(this).attr('data-processed'));
      $('#dist-write-off').text($(this).attr('data-write-off'));
      $('#dist-used').text($(this).attr('data-used'));
      $('.dmp-text-sub-title').text($(this).attr('data-unit-rus'));

      clearInterval(interval);
      $('.dist-main-product-block').animate({ 'opacity': '1' }, 500)

      let counter = 1;
      interval = setInterval(() => {
        $(`.dist-info-${counter}`).animate({ 'opacity': '0' }, 500)

        if (counter === 4) {
          counter = 1;
          $('.dist-main-product-block').animate({ 'opacity': '1' }, 500)
        } else {
          counter++;
        }
      }, 5000);
    });

    $('.dmp-btn').first().trigger('click');



    /* Working with order calendar */
    let ordersData = [];
    $('.dm-hidden-order').each(function () {
      ordersData.push({
        product: $(this).attr('data-product'),
        productRus: productsToRus[$(this).attr('data-product').replace('-', '')],
        size: parseFloat($(this).attr('data-size')),
        unit: $(this).attr('data-unit'),
        date: new Date($(this).attr('data-date')),
        client: $(this).attr('data-client'),
        clientName: $(this).attr('data-client-name'),
        clientAdress: $(this).attr('data-client-adress'),
        clientPhone: $(this).attr('data-client-phone'),
        subId: $(this).attr('data-sub-id')
      });
    });
    let recOrdersData = [];
    $('.dm-hidden-rec-order').each(function () {
      recOrdersData.push({
        product: $(this).attr('data-product'),
        productRus: productsToRus[$(this).attr('data-product').replace('-', '')],
        size: parseFloat($(this).attr('data-size')),
        unit: $(this).attr('data-unit'),
        client: $(this).attr('data-client'),
        clientName: $(this).attr('data-client-name'),
        clientAdress: $(this).attr('data-client-adress'),
        clientPhone: $(this).attr('data-client-phone'),
        day: parseFloat($(this).attr('data-day')),
        hour: parseFloat($(this).attr('data-hour')),
        minute: parseFloat($(this).attr('data-minute')),
        subId: $(this).attr('data-sub-id')
      });
    });
    let ordersDataSorted = []
    ordersData.forEach(el => {
      if (ordersDataSorted.find(order => order.subId === el.subId)) {
        ordersDataSorted.find(order => order.subId === el.subId).orders.push(el);
      } else {
        ordersDataSorted.push({
          subId: el.subId,
          date: el.date,
          clientName: el.clientName,
          clientArdess: el.clientArdess,
          clientPhone: el.clientPhone,
          orders: [el]
        })
      }
    });

    let recOrdersDataSorted = []
    recOrdersData.forEach(el => {
      if (recOrdersDataSorted.find(order => order.subId === el.subId)) {
        recOrdersDataSorted.find(order => order.subId === el.subId).orders.push(el);
      } else {
        recOrdersDataSorted.push({
          subId: el.subId,
          day: el.day,
          hour: el.hour,
          minute: el.minute,
          clientName: el.clientName,
          clientArdess: el.clientArdess,
          clientPhone: el.clientPhone,
          orders: [el]
        })
      }
    });


    $('.dmc-week-row').empty()
    for (let i = 1; i < 8; i++) {
      let date;
      let day;
      if (i === 7) {
        date = new Date(moment().day(0 + 7));
        day = 0;
      } else {
        date = new Date(moment().day(i));
        day = i;
      }

      $('.dmc-week-row').append(`
        <div class="dmc-week-item" data-date="${date}" data-day="${day}">
          <div class="dmc-week-item-title">${moment(date).lang('ru').format('dddd').toUpperCase()}</div>
          <div class="dmc-week-item-day">${moment(date).lang('ru').format('DD')}</div>
          <div class="dmc-week-item-month">${moment(date).lang('ru').format('MMMM YYYY').toUpperCase()}</div>
        </div>
      `)
    }

    $('body').on('click', '.dmc-week-item', function () {
      $('.dmc-week-item-active').removeClass('dmc-week-item-active')
      $(this).addClass('dmc-week-item-active')

      $('.dmc-order').remove();

      let start = new Date(moment($(this).attr('data-date')).startOf('day'));
      let end = new Date(moment($(this).attr('data-date')).endOf('day'));

      let orders = [...ordersDataSorted.filter(order => start <= order.date && order.date < end), ...recOrdersDataSorted.filter(order => order.day === parseFloat($(this).attr('data-day')))]

      if (orders.length > 0) {
        $('.dmc-orders-row').css('justify-content', 'start')
        ordersDataSorted.filter(order => start <= order.date && order.date < end).forEach(order => {
          let el = $('.dmc-orders-row').append(`
            <div class="dmc-order">
              <div class="dmc-order-header">
                <div class="dmc-order-header-name">${order.clientName !== undefined ? order.clientName : ''}</div>
                <div class="dmc-order-header-info">${order.clientAdress !== undefined ? order.clientAdress : ''}</div>
                <div class="dmc-order-header-info">${order.clientPhone !== undefined ? `+7 ${order.clientPhone}` : ''}</div>
              </div>
              <div class="dmc-order-time">${moment(order.date).format('hh:mm')}</div>
              <div class="dmc-order-details">
              </div>
            </div>
          `)

          order.orders.forEach(prod => {
            el.find('.dmc-order-details').append(`
              <div class="dmc-order-details-line">
                <p>${prod.productRus}</p>
                <p>${prod.size} ${prod.unit === 'l' ? 'л.' : 'кг.'}</p>
              </div>
            `)
          });
        });

        recOrdersDataSorted.filter(order => order.day === parseFloat($(this).attr('data-day'))).forEach(order => {
          let el = $('.dmc-orders-row').append(`
            <div class="dmc-order">
              <div class="dmc-order-header">
                <div class="dmc-order-header-name">${order.clientName !== undefined ? order.clientName : ''}</div>
                <div class="dmc-order-header-info">${order.clientAdress !== undefined ? order.clientAdress : ''}</div>
                <div class="dmc-order-header-info">${order.clientPhone !== undefined ? `+7 ${order.clientPhone}` : ''}</div>
              </div>
              <div class="dmc-order-time">${order.hour}:${order.minute.toString().length === 1 ? `0${order.minute}` : order.minute}</div>
              <div class="dmc-order-details">
              </div>
            </div>
          `)

          order.orders.forEach(prod => {
            el.find('.dmc-order-details').append(`
              <div class="dmc-order-details-line">
                <p>${prod.productRus}</p>
                <p>${prod.size} ${prod.unit === 'l' ? 'л.' : 'кг.'}</p>
              </div>
            `)
          });
        });
      } else {
        $('.dmc-orders-row').css('justify-content', 'center')
      }
    });

    $('.dmc-week-item').each(function () {
      let start = new Date(moment($(this).attr('data-date')).startOf('day'));
      let end = new Date(moment($(this).attr('data-date')).endOf('day'));

      let remindersCounter = 0
      ordersDataSorted.forEach(order => { if (start <= order.date && order.date < end) remindersCounter++ });
      recOrdersDataSorted.forEach(order => { if (order.day === parseFloat($(this).attr('data-day'))) remindersCounter++ });

      $(this).addClass(remindersCounter < 5 ? `dmc-week-item-${remindersCounter}` : `dmc-week-item-4`)

      if (start < new Date() && new Date() < end) {
        $(this).trigger('click')
      }

    });


    /* Changing the time period */
    $('.main-page-header-period').on('change', function () {
      if ($("#start-date").val() !== '' && $("#end-date").val() !== '') {
        location.assign(`/distribution/?start=${new Date($("#start-date").val())}&end=${new Date($("#end-date").val())}`)
      }
    });

  }





});
