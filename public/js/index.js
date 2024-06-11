import $ from 'jquery';
import '../style/main.scss';
import 'animate.css';
import anime from 'animejs/lib/anime.es.js';
import * as d3 from "d3";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment, { max, months } from 'moment';
import validator from 'validator';
import randomstring from 'randomstring';
import { simpleLineChart, threeLinesChart, doughnutChart, multipleLinesChart, multipleLinesChartOneActive, mainPageCharts } from './charts';
import { addAnimal, editAnimal, addAnimalResults, editAnimalResults, deleteAnimalResults, writeOffAnimal, writeOffMultipleAnimals, bringBackAnimal, getAnimalByNumber, checkByField, getAnimalsForGraph, getAnimalData, getAnimalsByCategory, addMilkQuality, editMilkQuality, getMilkQuality } from './animalHandler';
import { addVetAction, editVetAction, addVetProblem, editVetProblem, addVetTreatment, editVetTreatment, addVetScheme, startVetScheme, editStartedVetScheme, editVetScheme, deleteVetDoc, getStartedScheme, getVetProblem, addVetRecord, editVetRecord } from './vetHandler';
import { addReminder, editReminder, deleteReminder, getModuleAndPeriod, getFarmReminders, deleteSubIdReminders } from './calendarHandler';
import { addInventory, editInventory } from './inventoryHandler'
import { login, logout, checkEmail } from './authHandler';
import { editFarm, editUser, addCategory, addBuilding } from './manageHandler';
import { addConfirmationEmpty, askAus, emptyBlock, removeEmptyBlock, loadingBlock, removeloadingBlock, quickTitle, quickTitleLeft, quickTitleRight, getIcons } from './interaction';
import { multiLinearChart, renderLineGraph, renderProgressChart, graphBase, graphBaseNoDate } from './chartConstructor';
import { getMilkingProjection, getFarmProjections } from './projections';
import { addClient, editClient, addProduct, addProductReturn, editProduct, editProductReturn, deleteProduct, deleteSubIdProducts, getClient } from './distributionHandler';
import { addFeedSampleOrRecord, editFeedSampleOrRecord, getOneRecord, getFeedRecords } from './feedHandler';
import { searchEngine } from './search';
import { getNotifications, updateNotification, deleteNotification } from './notifications';


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

  /* Closing detailed info */
  $('body').on('click', '.dib-close', function () {
    $('.detailed-info-window').remove();
  });

  /* Quick titles */
  quickTitle();
  quickTitleLeft();
  quickTitleRight();


  ///////////////////////
  /* NOTIFICATIONS */
  /////////////////////// 
  if (document.querySelector('.notification-btn')) {
    const notifications = await getNotifications();

    $('.notifications-block').empty();

    if (notifications.length === 0) $('.notification-background').append(`<div class="notifications-empty">Уведомления отсутствуют</div>`);

    notifications.forEach(notif => {
      if (notif.module !== 'calendar') {
        let append = true;

        $('.notification-item').each(function () {
          if ($(this).attr('data-sub-id') === notif.subId.toString()) {
            $(this).find('.ni-list-line').append(`<a class="ni-ll-item" data-id="${notif._id}" href="${notif.link}">#${notif.animal.number}</a>`)
            append = false;
          }
        });

        if (!append) return;

        let daysAgo = (Date.now() - new Date(notif.notifyAt).getTime()) / 24 / 60 / 60 / 1000;
        let textDate = daysAgo < 1 ? 'Сегодня' : `${Math.floor(daysAgo)} дн. назад`;

        $('.notifications-block').append(`
          <div class="notification-item" data-sub-id="${notif.subId}" data-seen="${notif.seen}">
            <div class="ni-btn ni-btn-delete">Удалить</div>
            <div class="ni-btn ni-btn-later">Позже</div>
            <div class="ni-header"><img class="ni-icon" src="/img/icons/${notif.icon}"/>
              <div class="ni-header-title">${notif.title}</div>
              <div class="ni-header-date">${textDate}</div>
            </div>
            <div class="ni-list-line">
              <a class="ni-ll-item" data-id="${notif._id}" href="${notif.link}">#${notif.animal.number}</a>
            </div>
          </div>
        `);
      } else if (notif.module === 'calendar') {
        let daysAgo = (Date.now() - new Date(notif.notifyAt).getTime()) / 24 / 60 / 60 / 1000;
        let textDate = daysAgo < 1 ? 'Сегодня' : `${Math.floor(daysAgo)} дн. назад`;

        $('.notifications-block').append(`
          <div class="notification-item" data-sub-id="${notif.subId}" data-seen="${notif.seen}">
            <div class="ni-btn ni-btn-delete">Удалить</div>
            <div class="ni-btn ni-btn-later">Позже</div>
            <div class="ni-header"><img class="ni-icon" src="/img/icons/${notif.icon}"/>
              <div class="ni-header-title">${notif.title}</div>
              <div class="ni-header-date">${textDate}</div>
            </div>
            <div class="ni-list-line">
              <a class="ni-ll-item" data-id="${notif._id}" href="${notif.link}">Напоминание</a>
            </div>
          </div>
        `);

      }

    });

    let seenCount = 0;
    $('.notification-item').each(function () { if ($(this).attr('data-seen') === 'false') seenCount++ });

    if (seenCount > 0) $('.notification-btn').append(`<div class="notif-count">${seenCount}</div>`);


    $('.notification-btn').on('click', async function () {
      if ($(this).find('i').hasClass('ph-bell')) {
        if ($('.notifications-block').children().length === 0) return;

        $(this).find('i').removeClass('ph-bell').addClass('ph-x');

        $('.notification-background').show();
        $('.notifications-block').css('display', 'flex');
        $('.notification-item').each(function () {
          $(this).find('.ni-ll-item').each(async function () {
            await updateNotification({ seen: true }, $(this).attr('data-id'));
          });
        });
        $('.notif-count').remove();
      } else {
        $(this).find('i').removeClass('ph-x').addClass('ph-bell');

        $('.notification-background').hide();
        $('.notifications-block').css('display', 'none');
      }
    });

    $('.notifications-block').on('click', '.ni-btn-later', function () {
      $(this).parent().find('.ni-ll-item').each(async function () {
        await updateNotification({ notifyAt: new Date(moment().add(3, 'day')), seen: false }, $(this).attr('data-id'));
      });

      $(this).parent().remove();
      if ($('.notifications-block').children().length === 0) $('.notification-btn').trigger('click');
    });

    $('.notifications-block').on('click', '.ni-btn-delete', function () {
      $(this).parent().find('.ni-ll-item').each(async function () {
        await updateNotification({ deleteAt: new Date(moment().add(1, 'month')), show: false }, $(this).attr('data-id'));
      });

      $(this).parent().remove();
      if ($('.notifications-block').children().length === 0) $('.notification-btn').trigger('click');
    });

    /* $('.notification-item').on('click', function() {
      $('.notification-background').append(`
        <div class="notification-detailed">
          <div class="nd-header"><img class="nd-icon" src="${$(this).find('.ni-icon').attr('src')}"/>
            <div class="nd-header-title">${$(this).find('.ni-header-title').text()}</div>
            <div class="nd-header-date">${$(this).find('.ni-header-date').text()}</div>
          </div>
          <div class="nd-items-container"></div>
          <div class="nd-footer">
            <div class="nd-footer-btn nd-footer-later">Позже</div>
            <div class="nd-footer-btn nd-footer-delete">Удалить</div>
          </div>
        </div>
      `);

      $(this).find('.ni-ll-item').each(function() {
        $('.nd-items-container').append(`<a class="nd-item" data-id="${$(this).attr('data-id')}" href="${$(this).attr('href')}">${$(this).text()}</a>`);
      });
    }); */

  }

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
    $('.mit-btn').on('click', function () {
      if (!$(this).parent().parent().hasClass('menu-item-box-openned')) {
        $('.menu-item-link').removeClass('animate__animated animate__fadeIn animate__fadeOut');
        $('.menu-item-link').hide();
        $('.menu-item-box-openned').removeClass('menu-item-box-openned');
        $(this).parent().parent().addClass('menu-item-box-openned');
        $(this).parent().parent().find('.menu-item-link').addClass('animate__animated animate__fadeIn').show();
      } else {
        $(this).parent().parent().removeClass('menu-item-box-openned');
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
      history.back(-1);

      localStorage.setItem('to-reload', 'true');
    });

    if (localStorage.getItem('to-reload') === 'true') {
      localStorage.setItem('to-reload', 'false');
      location.reload(true);
    }

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
  if (document.querySelector('#rcm')) {
    $('body').on('mousedown', function (e) {
      if (e.which === 3) {
        let hor = '0%';
        let ver = '0%';
        if (e.pageX + parseFloat($('#rcm').width()) > parseFloat($(window).width())) {
          hor = '-100%'
        }
        if (e.pageY + parseFloat($('#rcm').height()) > parseFloat($(window).height())) {
          ver = '-100%'
        }
        $('#rcm').css({
          'top': e.pageY,
          'left': e.pageX,
          'transform': `translate(${hor}, ${ver})`
        }).show(0);

      }
    });

    $(window).on('scroll', function () {
      $('#rcm').hide()
    });

    $('body').click(function (e) {
      let toHide = false;
      if (e.target.id !== 'rcm') toHide = true;
      if (e.target.parentElement && e.target.parentElement.id !== 'rcm') toHide = true;
      if (e.target.parentElement.parentElement && e.target.parentElement.parentElement.id !== 'rcm') toHide = true;

      if (toHide) {
        $('#rcm').hide()
        $('#rcm').find('.rc-one-time').remove();
      }
    });

    /* Adding specific data to some objects */
    $('body').on('mousedown', '*', function (e) {
      if (e.which !== 3) return;


      if ($(this).attr('rc-title') === undefined) return;

      $('#rcm').find('.rc-one-time').remove();

      if ($(this).attr('rc-link') === undefined) {
        $('#rcm').append(`
              <div class="rc-menu-devider rc-one-time"></div>
              <div class="rc-menu-item rc-one-time" id="${$(this).attr('rc-id')}"> 
                <ion-icon name="caret-forward"></ion-icon>
                <p>${$(this).attr('rc-title')}</p>
              </div>
        `);
      } else {
        $('#rcm').append(`
              <div class="rc-menu-devider rc-one-time"></div>
              <a class="rc-menu-item rc-one-time" href="${$(this).attr('rc-link')}"> 
                <ion-icon name="caret-forward"></ion-icon>
                <p>${$(this).attr('rc-title')}</p>
              </a>
        `);
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
    $('.ai-form-container').on('click keyup change', '.ai-input-select', function () {
      $('.ai-input-block-select').each(function () {
        $(this).find('.ai-select-block').hide();
        $(this).attr('data-state', 'hide');
        anime({ targets: $(this).find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });
      });

      $(this).parent().find('.ai-select-block').show();
      $(this).parent().attr('data-state', 'show');
      anime({ targets: $(this).parent().find('.ai-select-line')[0], width: ['80%'], opacity: 0, easing: 'easeOutQuint' });

    });

    $('body').on('click', function (e) {
      if (!e.target.classList.value.includes('ai-input-select')) {
        $('.ai-input-block-select').each(function () {
          $(this).find('.ai-select-block').hide();
          $(this).attr('data-state', 'hide');
          anime({ targets: $(this).find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });
        });
      }
    });

    $('.ai-form-container').on('keyup change', '.ai-input-select', function () {
      let val = $(this).val().toLowerCase();
      let container = $(this).parent().find('.ai-select-block');
      $(this).parent().find('.ai-select-item').each(function () {
        let name = $(this).find('.ai-select-name').text().replace('#', '').toLowerCase();
        let subName = $(this).find('.ai-select-sub-name').text().replace('#', '').toLowerCase()

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

    $('.ai-form-container').on('click', '.ai-select-item', function () {
      $(this).parent().find('.ai-select-item-selected').removeClass('ai-select-item-selected');
      $(this).addClass('ai-select-item-selected')
      $(this).parent().hide();
      $(this).parent().parent().attr('data-state', 'hide');
      anime({ targets: $(this).parent().parent().find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });

      if (!$(this).parent().hasClass('ai-input-validation')) {
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

        if ($(this).find('.ai-select-sub-name').text().length > 0) {
          $(this).parent().parent().find('.ai-input-select').val(`${$(this).find('.ai-select-name').text()} | ${$(this).find('.ai-select-sub-name').text()}`);
        } else {
          $(this).parent().parent().find('.ai-input-select').val(`${$(this).find('.ai-select-name').text()}`);
        }
      }


      /* Select action for different select inputs */
      /* Breed */
      if ($(this).parent().parent().hasClass('breed-select')) {
        $(this).parent().parent().find('.ai-input-select').attr('data-rus', $(this).attr('data-rus'));
        $(this).parent().parent().find('.ai-input-select').attr('data-eng', $(this).attr('data-eng'));
      }

      /* Selectors with id */
      if ($(this).parent().parent().hasClass('id-select')) {
        $(this).parent().parent().find('.ai-input-select').attr('data-id', $(this).attr('data-id'));
      }

    });

    /* Small select input */
    $('.ai-form-container').on('click', '.ai-small-select', function () {
      if ($(this).attr('data-state') !== 'show') {
        $(this).find('.ai-small-select-block').show();
        $(this).attr('data-state', 'show');
        anime({ targets: $(this).find('.ai-select-line')[0], width: ['80%'], opacity: 0, easing: 'easeOutQuint' });
      } else {
        $(this).find('.ai-small-select-block').hide();
        $(this).attr('data-state', 'hide');
        anime({ targets: $(this).find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });
      }

    });

    $('.ai-form-container').on('click', '.ai-small-select-item', function () {
      $(this).parent().find('.ai-small-select-item-selected').removeClass('ai-small-select-item-selected');
      $(this).addClass('ai-small-select-item-selected');
      $(this).parent().parent().find('p').text($(this).text());
      anime({ targets: $(this).parent().parent().find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });


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

    /* Switch block */
    $('.ai-switch-btn').on('click', function () {
      if (!$(this).hasClass('ai-switch-btn-active')) {
        $(this).addClass('ai-switch-btn-active')
        $(this).siblings().removeClass('ai-switch-btn-active')
        if ($(this).hasClass('ai-switch-btn-left')) {
          anime({ targets: $(this).parent().find('.ai-switch-btn-slider')[0], left: '0%', easing: 'easeOutQuint', duration: 50 });
        } else if ($(this).hasClass('ai-switch-btn-right')) {
          anime({ targets: $(this).parent().find('.ai-switch-btn-slider')[0], left: '50%', easing: 'easeOutQuint', duration: 50 });
        }
      }
    });

    /* Radio buttons */
    $('.ai-radio').on('click', function () {
      $(this).toggleClass('ai-radio-active');
    });

    /* Pre-setting selected animals */
    setTimeout(() => {
      $('.ai-selected-animals-pre-set').each(function () {
        let number = $(this).attr('data-number');
        $('.ai-select-item').each(function () {
          if ($(this).attr('data-number') === number) $(this).trigger('click');
        });
      });
    }, 0)

    /* Input navigation by keys */
    /* $('input').on('keyup', function(e) {
      if(e.which === 39 || e.which === 40 || e.which === 13) {
        console.log($(this).nextAll('input').first())
        $(this).nextAll('input').first().trigger('focus');
      } else if(e.which === 37 || e.which === 38) {
        $(this).prevAll('input').first().trigger('focus');
      }
    }); */

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

      let allDates = $('.bc-reminder-container');
      let from = moment($(allDates[0]).attr('data-date')).startOf('day');
      let to = moment($(allDates[allDates.length - 1]).attr('data-date')).endOf('day');
      let farmId = $('.big-calendar-container').attr('data-farm-id');

      loadingBlock($('.bc-main-calendar-box'));
      const reminders = await getFarmReminders(from, to);
      removeloadingBlock($('.bc-main-calendar-box'));
      removeloadingBlock($('.big-calendar-container'));

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

        dayActions.forEach((action) => {
          $(this).append(`
            <div class="bc-date-quick bc-date-quick-${action.module}">
              <div class="bc-date-quick-title">
              ${action.name}
              <span>${moment(action.date).format('HH:mm')}</span>
              </div>
            </div>
          `);
        });

      });

    });

    /* Today button */
    $('#today-btn').on('click', async function () {
      selectedMonth = moment();

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

      let allDates = $('.bc-reminder-container');
      let from = moment($(allDates[0]).attr('data-date')).startOf('day');
      let to = moment($(allDates[allDates.length - 1]).attr('data-date')).endOf('day');
      let farmId = $('.big-calendar-container').attr('data-farm-id');

      loadingBlock($('.bc-main-calendar-box'));
      const reminders = await getFarmReminders(from, to);
      removeloadingBlock($('.bc-main-calendar-box'));

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

        dayActions.forEach((action) => {
          $(this).append(`
            <div class="bc-date-quick bc-date-quick-${action.module}">
              <div class="bc-date-quick-title">
              ${action.name}
              <span>${moment(action.date).format('HH:mm')}</span>
              </div>
            </div>
          `);
        });

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
      if (allActions.length > 0) {
        $('.bc-info-reminders-conatiner').css({ 'display': 'block' });

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
      } else {
        $('.bc-info-reminders-conatiner').css({ 'display': 'flex', 'align-items': 'center', 'justify-content': 'center' });
        $('.bc-info-reminders-conatiner').append('<div class="bc-info-empty-text">Нет напоминаний</div>')
      }
    });

    /* Showing detailed reminder */
    $('.bc-info-reminders-conatiner').on('click', '.bc-info-reminder', function () {
      $('.bc-info-detailed').show();
      $('.bc-info-detailed').css('background-color', $(this).find('.bc-info-reminder-time').css('color') !== 'rgb(84, 84, 84)' ? $(this).find('.bc-info-reminder-time').css('color') : '#d9d9d9');
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
  /* ADD AND EDIT GENERAL REMINDER */
  ///////////////////////
  if (document.querySelector('#general-reminder-container') || document.querySelector('#edit-general-reminder-container')) {

    /* Adding multiple animals */
    $('#multiple-animals').find('.ai-select-item').on('click', function () {
      $(this).addClass('ai-select-item-unvail');
      $('.ai-selected-animals-block').append(`
        <div class="ai-selected-animals-item" data-id="${$(this).attr('data-id')}">${$(this).find('.ai-select-name').text()}
          <div class="ai-selected-animals-remove"> 
            <ion-icon name="close"></ion-icon>
          </div>
        </div>
      `)
      if ($('.ai-selected-animals-block').css('display') === 'none') {
        $('.ai-selected-animals-block').css({ 'display': 'block', 'opacity': '0' });
        anime({ targets: $('.ai-selected-animals-block')[0], opacity: 1, easing: 'easeInOutQuad', duration: 500 })
      }
    });

    $('.ai-selected-animals-block').on('click', '.ai-selected-animals-remove', function () {
      const id = $(this).parent().attr('data-id');
      $('#multiple-animals').find('.ai-select-item').each(function () { if ($(this).attr('data-id') === id) $(this).removeClass('ai-select-item-unvail') });
      $(this).parent().remove();

      if ($('.ai-selected-animals-block').find('.ai-selected-animals-item').length === 0) {
        $('.ai-selected-animals-block').hide();
      }
    });

    /* Adding icons */
    $('.icon-selected-box').on('click', async function () {
      let files;
      if ($('.ai-input-icons-container').children().length === 0) {
        files = await getIcons();

        files.forEach(file => {
          $('.ai-input-icons-container').append(`<div class="ai-input-icon-selector select-icon"><img src="/img/svgs/${file}"></div>`)
        });
      }
      $('.ai-input-icons-container').toggle();
    });

    $('.ai-input-icons-container').on('click', '.select-icon', function () {
      $('.icon-selected-box').find('img').attr('src', $(this).find('img').attr('src'));
      $('.ai-input-icons-container').hide();
    });


    /* Validating form */
    $('*').on('click change keyup mouseenter', function () {
      if ($('#name').hasClass('ai-valid-input') && $('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-general-reminder-container')) {
      $('.ai-input').trigger('keyup')
      $('.ai-textarea').trigger('keyup')
      $('ai-select-item-selected').trigger('click');
    }

    if (document.querySelector('#general-reminder-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let subId = randomstring.generate(12);
        if ($('.ai-selected-animals-item').length > 0) {
          let doneAnimals = 0;

          $(this).empty();
          $(this).append(`<div class="mini-loader"></div>`);
          anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });


          $('#multiple-animals-container').find('.ai-selected-animals-item').each(async function () {
            let animalId = $(this).attr('data-id');
            let name = $('#name').val();
            let date = new Date($('#date').val());
            let note = $('#note').val() === '' ? undefined : $('#note').val();
            let icon = ($('.icon-selected-box').find('img').attr('src')).replace('/img/svgs/', '');
            let module = $('#type').find('.ai-select-item-selected').attr('data-value');

            const response = await addReminder({ animalId, name, date, note, icon, module, subId });

            if (response) doneAnimals++;

            if (doneAnimals === $('#multiple-animals-container').find('.ai-selected-animals-item').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });

        } else {
          let name = $('#name').val();
          let date = new Date($('#date').val());
          let note = $('#note').val() === '' ? undefined : $('#note').val();
          let icon = ($('.icon-selected-box').find('img').attr('src')).replace('/img/svgs/', '');
          let module = $('#type').find('.ai-select-item-selected').attr('data-value');

          const response = await addReminder({ name, date, note, icon, module, subId });

          if (response) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.reload(true); }, 1500)
          }
        }
      })
    } else if (document.querySelector('#edit-general-reminder-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let id = $(this).attr('data-reminder-id');
        let name = $('#name').val();
        let date = new Date($('#date').val());
        let note = $('#note').val() === '' ? undefined : $('#note').val();
        let icon = ($('.icon-selected-box').find('img').attr('src')).replace('/img/svgs/', '');
        let module = $('#type').find('.ai-select-item-selected').attr('data-value');

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editReminder(id, { name, date, note, icon, module });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      })
    }

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
  ///////////////////////
  ///////////////////////
  ///////////////////////
  /* THE MAIN PAGE  */
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  ///////////////////////
  /* MAIN | WELCOME SECTION */
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

  ///////////////////////
  /* MAIN | HERD SECTION */
  ///////////////////////
  if (document.querySelector('.main-herd-section')) {
    const animals = await getAnimalsForGraph($('.main-page-container').attr('data-farm-id'));
    let last12Months = [
      { month: 0, total: 0, day: 0, results: 0, average: 0 },
      { month: 1, total: 0, day: 0, results: 0, average: 0 },
      { month: 2, total: 0, day: 0, results: 0, average: 0 },
      { month: 3, total: 0, day: 0, results: 0, average: 0 },
      { month: 4, total: 0, day: 0, results: 0, average: 0 },
      { month: 5, total: 0, day: 0, results: 0, average: 0 },
      { month: 6, total: 0, day: 0, results: 0, average: 0 },
      { month: 7, total: 0, day: 0, results: 0, average: 0 },
      { month: 8, total: 0, day: 0, results: 0, average: 0 },
      { month: 9, total: 0, day: 0, results: 0, average: 0 },
      { month: 10, total: 0, day: 0, results: 0, average: 0 },
      { month: 11, total: 0, day: 0, results: 0, average: 0 },
    ]
    animals.cows.forEach(cow => {
      for (let i = 0; i < 12; i++) {
        let results = 0;
        let total = 0;

        /*  */
        /*  */
        /*  */
        /*  */
        /*  */
        let requiredMonth = moment(new Date(moment())).subtract(i, 'month');

        cow.milkingResults.forEach(result => {
          if (moment(result.date).month() !== moment(requiredMonth).month() || moment(result.date).year() !== moment(requiredMonth).year()) return;

          results++;
          total += result.result;
        });

        if (results === 0) return;

        let month = last12Months.find(mon => mon.month === i);
        month.day += total / results;
        month.total = month.day * 30;
        month.results++;
        month.average = month.day / month.results;
      }
    });

    console.log(last12Months);

    $('.mhs-mi-text-block-months').empty();
    $('.mhs-mi-text-block-results').empty();
    let max = 0;
    last12Months.forEach((month, inx) => {
      if (inx === 0) {
        max = month.total;
      } else {
        if (max < month.total) max = month.total;
      }

    })
    last12Months.forEach(month => {

      $('.mhs-mi-text-block-months').append(`<div class="mhs-mi-text" data-month="${month.month}">${moment().subtract(month.month, 'month').locale('ru').format('MMM').replace('.', '').toUpperCase()}</div>`)

      let monthTotal;

      if (month.total < 1000) {
        monthTotal = month.total
      } else if (month.total >= 1000 && month.total < 100000) {
        monthTotal = `${(month.total / 1000).toFixed(1)} к`;
      } else if (month.total >= 100000 && month.total < 1000000) {
        monthTotal = `${Math.round(month.total / 1000)} к`
      } else if (month.total >= 1000000) {
        monthTotal = `${(month.total / 1000000).toFixed(1)} кк`;
      }
      $('.mhs-mi-text-block-results').append(`<div class="mhs-mi-text" data-month="${month.month}">${monthTotal}</div>`)

      $('.mhs-mi-graph-item').each(function () {
        if (parseFloat($(this).attr('data-month')) !== month.month) return;

        $(this).attr('day', Math.round(month.day)).attr('average', (month.average).toFixed(1)).css({ 'background-color': `rgb(251, 141, 52, ${Math.round(month.total / (max / 100)) > 50 ? Math.round(month.total / (max / 100)) / 100 : 0.50})` });

        anime({ targets: $(this)[0], height: `${50 + (300 * (Math.round(month.total / (max / 100)) / 100))}px`, duration: 100, delay: 50 * (11 - month.month), easing: 'easeOutQuint' });
      });
    });


    $('.mhs-mi-graph-item').on('mouseenter', function () {
      const number = parseFloat($(this).attr('data-month'));

      $('.mhs-mi-text-block').scrollTop(number * 78);
      $('#day').text(`${$(this).attr('day')} л.`)
      $('#average').text(`${$(this).attr('average')} л.`)

    });

    $('.mhs-main-info-block').on('mouseleave', function () {
      $('.mhs-mi-graph-item').last().trigger('mouseenter');
    });
    $('.mhs-main-info-block').trigger('mouseleave');

    /* Working with sliding block */
    setInterval(() => {
      let curEl = $('.mhs-bi-item-switch-active');
      let nextEl = $('.mhs-bi-item-switch-active').hasClass('mhs-bi-item-switch-last') ? $('.mhs-bi-item-switch-first') : $('.mhs-bi-item-switch-active').next();


      curEl.addClass('animate__animated animate__fadeOutDown');
      document.querySelector('.mhs-bi-item-switch-active').addEventListener('animationend', () => {
        curEl.removeClass('animate__animated animate__fadeOutDown animate__fadeInDown mhs-bi-item-switch-active');
        curEl.hide();
        nextEl.removeClass('animate__animated animate__fadeOutDown animate__fadeInDown');
        nextEl.addClass('mhs-bi-item-switch-active');
        nextEl.addClass('animate__animated animate__fadeInDown').css({ 'display': 'flex' });;
      })

    }, 5000)

  }
  ///////////////////////
  /* MAIN | VET SECTION */
  ///////////////////////
  if (document.querySelector('.main-vet-section')) {
    const animals = await getAnimalsForGraph($('.main-page-container').attr('data-farm-id'));
    let data = {
      toInsem: [],
      over: [],
      inseminated: [],
      wait: [],
      total: 0
    }
    animals.cows.forEach(cow => {
      if (cow.inseminations.length === 0 && cow.lactations.length === 0 && new Date() < new Date(moment(cow.birthDate).add(18, 'month'))) return;

      let lastInsem = cow.inseminations.length > 0 ? new Date(cow.inseminations.at(-1).date) : undefined;
      let lastInsemResult = cow.inseminations.length > 0 ? cow.inseminations.at(-1).success : undefined;
      let lastLact = cow.lactations.length > 0 ? new Date(cow.lactations.at(-1).startDate) : undefined;


      /* Dry period */
      if (lastInsem && lastInsemResult === undefined && lastInsem > lastLact || lastInsem && lastInsemResult === undefined && lastInsem > new Date(moment(cow.birthDate).add(18, 'month'))) data.wait.push(cow);

      data.total++;

      /* Insemination after lactation */
      if (lastLact) {
        if (!lastInsem || !lastInsemResult || lastInsemResult && lastLact > lastInsem) {
          /* To inseminate */
          if (new Date() > new Date(moment(lastLact).add(50, 'day')) && new Date() < new Date(moment(lastLact).add(5, 'month'))) data.toInsem.push(cow);

          /* Over staying */
          if (new Date() > new Date(moment(lastLact).add(5, 'month'))) data.over.push(cow);
        }
      }

      /* Insemination at certain age */
      if (!lastLact && new Date() > new Date(moment(cow.birthDate).add(18, 'month')) && !lastInsemResult) data.toInsem.push(cow);

      /* Inseminated */
      if (lastInsemResult && lastLact && lastInsem > lastLact || lastInsemResult && new Date() > new Date(moment(cow.birthDate).add(18, 'month'))) data.inseminated.push(cow);
    });

    /* Creating a graph */
    let max = 0;
    if (data.toInsem.length / data.total > max) max = data.toInsem.length / data.total;
    if (data.over.length / data.total > max) max = data.over.length / data.total;
    if (data.inseminated.length / data.total > max) max = data.inseminated.length / data.total;
    if (data.wait.length / data.total > max) max = data.wait.length / data.total;

    if (max < 0.5) data.total = data.total / 1.5;

    $(window).on('resize', function () {
      $('.basic-graph-svg').remove();

      const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svg.classList.add('basic-graph-svg')
      $('.mvs-info-graph').append(svg);
      svg.style.width = $('.mvs-info-graph').width();
      svg.style.height = $('.mvs-info-graph').height();

      let verCenter = $('.mvs-info-graph').width() / 2;
      let horCenter = $('.mvs-info-graph').height() / 2;

      let line1 = document.createElementNS("http://www.w3.org/2000/svg", 'line');
      line1.classList.add('mvs-svg-line');
      line1.setAttribute('x1', 0);
      line1.setAttribute('x2', $('.mvs-info-graph').width());
      line1.setAttribute('y1', horCenter);
      line1.setAttribute('y2', horCenter);
      svg.append(line1);
      let line2 = document.createElementNS("http://www.w3.org/2000/svg", 'line');
      line2.classList.add('mvs-svg-line');
      line2.setAttribute('x1', verCenter);
      line2.setAttribute('x2', verCenter);
      line2.setAttribute('y1', 0);
      line2.setAttribute('y2', $('.mvs-info-graph').height());
      svg.append(line2);

      let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.classList.add('mvs-svg-path');

      path.setAttribute('d', `M ${verCenter} ${horCenter - horCenter * (data.toInsem.length / data.total)}`)

      path.setAttribute('d', `${path.getAttribute('d')} L ${verCenter + verCenter * (data.inseminated.length / data.total)} ${horCenter}`);

      path.setAttribute('d', `${path.getAttribute('d')} L ${verCenter} ${horCenter + horCenter * (data.wait.length / data.total)}`);

      path.setAttribute('d', `${path.getAttribute('d')} L ${verCenter - verCenter * (data.over.length / data.total)} ${horCenter} Z`);

      svg.append(path);
    });
    $(window).trigger('resize');
    removeloadingBlock($('.mvs-info-graph'));

    $('.mvs-ig-text').on('mouseenter', function () {
      let el = $(this).attr('data-el');
      let text = $(this).text();

      $('.basic-graph-svg').css('filter', 'blur(4px)');
      $('.mvs-ig-details-block').css('display', 'flex');
      $('.mvs-ig-details-block-title').text(text);
      $('.mvs-ig-details-block-count').html(`Количество: &nbsp; ${data[el].length}`);
    });

    $('.mvs-ig-text').on('mouseleave', function () {
      $('.basic-graph-svg').css('filter', 'unset');
      $('.mvs-ig-details-block').css('display', 'none');
    });
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

        if (moment(date).isSame(new Date(), 'day')) {
          $(this).find('.history-page-date').text(`${moment(date).format('HH:mm')}`)
        } else if (moment(date).isSame(new Date(moment().subtract('1', 'day')), 'day')) {
          $(this).find('.history-page-date').text(`Вчера`)
        } else {
          let curRusMonth = moment(date).locale('ru').format('MMMM');
          let rusMonth = curRusMonth.replace(`${curRusMonth.split('')[0]}`, curRusMonth.split('')[0].toUpperCase())
          let curDay = moment(date).format('DD');
          $(this).find('.history-page-date').text(`${rusMonth}, ${curDay}`)
        }
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
    removeloadingBlock($('.all-animals-container'));

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

      if (searchValue.length === 0) return $('.history-page-searched').hide();;

      $('.history-page-item-outter').each(function () {
        let itemName = $(this).find('.hpl-name').text().toLowerCase();
        let animal = $(this).find('.hpl-animal').text().toLowerCase().replace('#', '');
        if (itemName.includes(searchValue)) {
          $(this).clone().appendTo('.history-page-searched')
        }
        if (animal.includes(searchValue)) {
          $(this).clone().appendTo('.history-page-searched')
        }
        if (itemName.match(searchValue)) {
          $(this).clone().appendTo('.history-page-searched')
        }
        if (animal.match(searchValue)) {
          $(this).clone().appendTo('.history-page-searched')
        }
      });



      if ($('.history-page-searched').children().length > 0) {
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
        defineMonthsText();
      }

      if (document.querySelector('#herd-history-container')) {
        let type = $(this).parent().parent().attr('data-doc-type');
        let animalId = $(this).parent().parent().attr('data-animal-id');
        let id = $(this).parent().parent().attr('data-doc-id');

        let result = await deleteAnimalResults(type, animalId, id);

        if (result) $(this).parent().parent().remove();
        defineMonthsText();
      }

    });
  }

  ///////////////////////
  /* EDIT FARM PAGE */
  ///////////////////////
  if (document.querySelector('#edit-farm-container')) {
    $('.ai-input').trigger('keyup');
    $('.ai-to-pick').trigger('click');
    $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });

    $('.ai-input-submit-btn').click(async function () {
      const farmId = $(this).attr('data-farm-id');
      const name = $('#name').val().length > 0 ? $('#name').val() : undefined;
      const liquidUnit = $('#liquid-unit').find('.ai-pick-active').attr('id');
      const weightUnit = $('#weight-unit').find('.ai-pick-active').attr('id');
      const butcherWeight = {
        male: $('#male-weight').val().length > 0 ? parseFloat($('#male-weight').val()) : undefined,
        female: $('#female-weight').val().length > 0 ? parseFloat($('#female-weight').val()) : undefined
      }
      const butcherAge = {
        male: $('#male-age').val().length > 0 ? parseFloat($('#male-age').val()) : undefined,
        female: $('#female-age').val().length > 0 ? parseFloat($('#female-age').val()) : undefined
      }
      const milkingResultExpectancy = $('#milking-result').val().length > 0 ? parseFloat($('#milking-result').val()) : undefined;

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editFarm(farmId, { name, liquidUnit, weightUnit, butcherWeight, butcherAge, milkingResultExpectancy });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)
      }
    });
  }

  ///////////////////////
  /* EDIT USER PAGE */
  ///////////////////////
  if (document.querySelector('#edit-user-container')) {

    /* Validating email */
    $('#email').on('keyup change', async function () {
      if ($(this).hasClass('ai-input-validation')) {
        if ($(this).val().length > 0) {

          if (!validator.isEmail($(this).val())) {
            $(this).parent().find('.ai-input-marker-s').remove();
            if ($(this).parent().find('.ai-input-marker-f').length === 0) {
              $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
            }

            if ($(this).parent().find('.ai-warning-text').length === 0) {
              $(this).parent().append(`<div class="ai-warning-text">Введите действительную электронную почту</div>`)
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
      }
    });

    /* Validation from */
    $('*').on('click change keyup mouseenter', function () {
      if ($('#first-name').hasClass('ai-valid-input') && $('#last-name').hasClass('ai-valid-input') && $('#email').hasClass('ai-valid-input') && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input').trigger('keyup');

    $('.ai-input-submit-btn').click(async function () {
      const userId = $(this).attr('data-user-id');
      const firstName = $('#first-name').val();
      const lastName = $('#last-name').val();
      const email = $('#email').val();
      const birthDate = new Date($('#birth-date').val());

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editUser(userId, { firstName, lastName, email, birthDate });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)
      }
    });
  }

  ///////////////////////
  /* CHANGE RESTRICTIONS */
  ///////////////////////
  if (document.querySelector('#change-rest-container')) {
    $('.ai-to-pick').trigger('click');
    $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });

    $('.ai-input-submit-btn').click(async function () {
      const userId = $(this).attr('data-user-id');
      const accessBlocks = [];
      $('#modules').find('.ai-pick-active').each(function () {
        accessBlocks.push($(this).attr('id'));
      });
      const editData = $('#edit-data').hasClass('ai-radio-active');
      const editOther = $('#edit-other').hasClass('ai-radio-active');

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editUser(userId, { accessBlocks, editData, editOther });

      if (response) {
        addConfirmationEmpty($('.animal-results-window'));
        setTimeout(() => { location.reload(true); }, 1500)
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
      if ($(this).attr('id') !== 'dead') {
        $(`.${$(this).attr('id')}-input`).css('display', 'flex');
        $('#add-animal-container').attr('data-state', $(this).attr('id'));

        $('.ai-decide-block').removeClass('animate__animated').removeClass('animate__fadeOut').removeClass('animate__animated').removeClass('animate__fadeIn');
        $('.ai-decide-block').addClass('animate__animated').addClass('animate__fadeOut').css('display', 'none');;
        $('.add-animal-form-alive').removeClass('animate__animated').removeClass('animate__fadeIn').removeClass('animate__animated').removeClass('animate__fadeOut');
        $('.add-animal-form-alive').addClass('animate__animated').addClass('animate__fadeIn').css('display', 'flex');

        $('.main-section').attr('data-dead-birth', 'false');
      } else {
        $('.ai-decide-block').removeClass('animate__animated').removeClass('animate__fadeOut').removeClass('animate__animated').removeClass('animate__fadeIn');
        $('.ai-decide-block').addClass('animate__animated').addClass('animate__fadeOut').css('display', 'none');;
        $('.add-animal-form-dead').removeClass('animate__animated').removeClass('animate__fadeIn').removeClass('animate__animated').removeClass('animate__fadeOut');
        $('.add-animal-form-dead').addClass('animate__animated').addClass('animate__fadeIn').css('display', 'flex');

        $('.main-section').attr('data-dead-birth', 'true');
      }
    });

    /* Adding warning text to mother's death */
    $('#mother-death').on('click', function () {
      if (!$(this).hasClass('ai-radio-active')) return $('#mother-death-write-off-block').css('display', 'none');

      $('#mother-death-write-off-block').css('display', 'flex');
    });

    /* Ability to add a lactation */
    let selectedMother;
    let unfinishedLact = false;
    $('#mother-select').find('.ai-select-item').on('click', async function () {
      let lastSelection = selectedMother ? selectedMother._id : '';
      if (lastSelection === '') {
        $('#add-lactation').parent().css('display', 'flex');
      }

      selectedMother = await getAnimalData($(this).attr('data-id'));
      selectedMother = selectedMother.animal;

      if (selectedMother._id !== lastSelection) {
        $('#add-lactation').parent().css('display', 'flex');
        $('.ai-combined-block-1').css('display', 'none');
        $('#add-lactation').parent().find('.ai-warning-text').remove();
        $('#start-date').val('');
        $('#finish-date').val('');
        $('#lactation-number').find('.ai-pick-active').removeClass('ai-pick-active');
        unfinishedLact = false;
      }
      $('#birth-date').trigger('click')

      if (!selectedMother.lactations.at(-1).finishDate) unfinishedLact = true;

      selectedMother.lactations.forEach(lact => {
        $('#lactation-number').find('.ai-pick').each(function () {
          if (parseFloat($(this).text()) === lact.number) $(this).addClass('ai-pick-unav');
        });
      });
    });

    $('#add-lactation').on('click', function () {
      if (!unfinishedLact) {
        $('#add-lactation').parent().css('display', 'none');
        $('.ai-combined-block-1').css('display', 'flex');
      } else {
        if ($(this).parent().find('.ai-warning-text').length === 0) $(this).parent().append(`<div class="ai-warning-text">У данного животного не окончена последняя лактация</div>`)
      }
    });

    $('#lactation-number').find('.ai-pick').off();
    $('#lactation-number').find('.ai-pick').on('click', function () {
      if ($(this).hasClass('ai-pick-active')) return;

      $('#lactation-number').find('.ai-pick-active').removeClass('ai-pick-active');
      $(this).addClass('ai-pick-active');
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
    $('*').on('click change keyup', function () {
      if ($('#start-date').val() !== '' && $('#lactation-number').find('.ai-pick-active').length > 0) {
        $('.ai-combined-block-1').addClass('ai-combined-block-valid');
      } else {
        $('.ai-combined-block-1').removeClass('ai-combined-block-valid');
      }

      if ($('.main-section').attr('data-dead-birth') === 'false') {
        if ($('#number').hasClass('ai-valid-input') && $('#birth-date').hasClass('ai-valid-input') && $('#gender').find('.ai-pick-active').length > 0) {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
        } else {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
        }
      } else {
        if ($('#date').hasClass('ai-valid-input') && $('#gender-dead').find('.ai-pick-active').length > 0) {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
        } else {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
        }
      }
    })

    /* Pre-setting mother*/
    if ($('.main-section').attr('data-mother') !== 'undefined') {
      $('#birth').trigger('click');
      $('#mother-select').find('.ai-select-item-selected').trigger('click');
    }

    /* Pre-setting start of lactation */
    $('#birth-date').on('click keyup change', function () {
      if ($(this).val() === '') return;

      $('#start-date').val(moment($(this).val()).format('yyyy-MM-DD'));
    });


    /* Submitting data */
    $('.ai-input-submit-btn').on('click', async function () {
      if ($('.main-section').attr('data-dead-birth') === 'false') {
        let aNumber = $('#number').val();
        let name = $('#name').val() !== '' ? $('#name').val() : undefined;
        let buyCost = $('#buy-cost').val() !== '' ? $('#buy-cost').val() : undefined;
        let mother = $('#mother-select').find('.ai-select-item-selected').length > 0 ? $('#mother-select').find('.ai-select-item-selected').attr('data-id') : undefined;
        let father = $('#father-select').find('.ai-select-item-selected').length > 0 ? $('#father-select').find('.ai-select-item-selected').attr('data-id') : undefined;
        let birthDate = $('#birth-date').val() !== '' ? $('#birth-date').val() : undefined;
        let gender = $('#gender').find('.ai-pick-active').attr('id');
        let colors = [];
        $('#colors').find('.ai-pick-active').each(function () { colors.push($(this).attr('id')) });
        let breedRussian = $('#breed').attr('data-rus');
        let breedEnglish = $('#breed').attr('data-eng');
        let note = $('#note').val();


        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });
        let response1;
        if ($('.ai-combined-block-valid').length > 0) {
          response1 = await addAnimalResults('lactation', mother, {
            startDate: new Date($('#start-date').val()),
            finishDate: $('#finish-date').val() !== '' ? new Date($('#finish-date').val()) : undefined,
            number: parseFloat($('#lactation-number').find('.ai-pick-active').text())
          });
        }
        let response2 = await addAnimal({ number: aNumber, name, buyCost, mother, father, birthDate, breedRussian, breedEnglish, gender, colors, notes: [{ text: note, date: new Date() }] });

        if (response1 && response2) {

          $('.add-animal-form-alive').removeClass('animate__animated animate__fadeIn animate__fadeOut');
          $('.add-animal-form-alive').addClass('animate__animated animate__fadeOut').css('display', 'none');;
          $('.ai-success-block ').removeClass('animate__animated animate__fadeIn animate__fadeOut');
          $('.ai-success-block ').addClass('animate__animated animate__fadeIn').css('display', 'flex');

          //setTimeout(() => { location.assign(`/herd/animal-card/${response2._id}`) }, 2000)
          setTimeout(() => { location.reload(true) }, 2000)

        }
      } else {
        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });
        const response = await addAnimal({
          status: 'dead-birth',
          deadBirthDate: new Date($('#date').val()),
          mother: $('#mother-select-dead').find('.ai-select-item-selected').length > 0 ? $('#mother-select-dead').find('.ai-select-item-selected').attr('data-id') : undefined,
          father: $('#father-select-dead').find('.ai-select-item-selected').length > 0 ? $('#father-select-dead').find('.ai-select-item-selected').attr('data-id') : undefined,
          deadBirthMultipleFetuses: $('#multiple-fetuses').hasClass('ai-radio-active') ? true : false,
          deadBirthMotherDeath: $('#mother-death').hasClass('ai-radio-active') ? true : false,
          deadBirthMotherDeathAuto: $('#mother-death-write-off').hasClass('ai-radio-active') ? true : false,
          deadBirthSize: $('#size').find('.ai-pick-active').attr('id'),
          gender: $('#gender-dead').find('.ai-pick-active').attr('id'),
          deadBirthNote: $('#note-dead').val()
        });

        if (response) {
          if ($('#mother-death').hasClass('ai-radio-active') && $('#mother-death-write-off').hasClass('ai-radio-active') && $('#mother-select-dead').find('.ai-select-item-selected').length) {
            const response2 = await writeOffAnimal($('#mother-select-dead').find('.ai-select-item-selected').length > 0 ? $('#mother-select-dead').find('.ai-select-item-selected').attr('data-id') : undefined, { writeOffReason: 'birth-death', writeOffDate: new Date($('#date').val()) });

            if (response2) {

              $('.add-animal-form-dead').removeClass('animate__animated animate__fadeIn animate__fadeOut');
              $('.add-animal-form-dead').addClass('animate__animated animate__fadeOut').css('display', 'none');
              $('.ai-success-block ').removeClass('animate__animated animate__fadeIn animate__fadeOut');
              $('.ai-success-block ').addClass('animate__animated animate__fadeIn').css('display', 'flex');
              setTimeout(() => { location.reload(true) }, 2000)
            }
          } else {
            $('.add-animal-form-dead').removeClass('animate__animated animate__fadeIn animate__fadeOut');
            $('.add-animal-form-dead').addClass('animate__animated animate__fadeOut').css('display', 'none');
            $('.ai-success-block ').removeClass('animate__animated animate__fadeIn animate__fadeOut');
            $('.ai-success-block ').addClass('animate__animated animate__fadeIn').css('display', 'flex');
            setTimeout(() => { location.reload(true) }, 2000)
          }
        }
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

      let result = await editAnimal($(this).attr('data-id'), { number: aNumber, name, buyCost, mother, father, birthDate, breedRussian, breedEnglish, gender, colors });

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
  /* EDIT DEAD BIRTH PAGE */
  ///////////////////////
  if (document.querySelector('#edit-dead-birth-container')) {
    $('#mother-death').on('click', function () {
      if (!$(this).hasClass('ai-radio-active')) return $('#mother-death-write-off-block').css('display', 'none');

      $('#mother-death-write-off-block').css('display', 'flex');
    });


    /* Bringing mother back if choosen to */
    $('#mother-death-write-off').on('click', function () {
      if ($(this).attr('data-original') === 'true' && !$(this).hasClass('ai-radio-active')) {
        $(this).parent().append(`<div class="ai-warning-text">Списание матери будет отменено</div>`)
      } else {
        $(this).parent().find('.ai-warning-text').remove();
      }
    });

    /* Allow submit if requirments filled */
    $('*').on('click change keyup', function () {
      if ($('#date').hasClass('ai-valid-input') && $('#gender-dead').find('.ai-pick-active').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input').trigger('keyup');
    $('.ai-select-item-selected').trigger('click');
    $('.ai-to-pick').trigger('click').removeClass('.ai-to-pick');
    $('.ai-radio-active').trigger('click').trigger('click');

    /* Submitting data */
    $('.ai-input-submit-btn').on('click', async function () {
      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      const response = await editAnimal($(this).attr('data-id'), {
        status: 'dead-birth',
        deadBirthDate: new Date($('#date').val()),
        mother: $('#mother-select-dead').find('.ai-select-item-selected').length > 0 ? $('#mother-select-dead').find('.ai-select-item-selected').attr('data-id') : undefined,
        father: $('#father-select-dead').find('.ai-select-item-selected').length > 0 ? $('#father-select-dead').find('.ai-select-item-selected').attr('data-id') : undefined,
        deadBirthMultipleFetuses: $('#multiple-fetuses').hasClass('ai-radio-active') ? true : false,
        deadBirthMotherDeath: $('#mother-death').hasClass('ai-radio-active') ? true : false,
        deadBirthMotherDeathAuto: $('#mother-death-write-off').hasClass('ai-radio-active') ? true : false,
        deadBirthSize: $('#size').find('.ai-pick-active').attr('id'),
        gender: $('#gender-dead').find('.ai-pick-active').attr('id'),
        deadBirthNote: $('#note-dead').val()
      });

      if (response) {
        if ($('#mother-death').hasClass('ai-radio-active') && $('#mother-death-write-off').hasClass('ai-radio-active') && $('#mother-select-dead').find('.ai-select-item-selected').length > 0) {

          if ($('#mother-death-write-off').attr('data-original') === 'true' && $('#mother-death-write-off').attr('data-mother') !== 'undefined' && $('#mother-death-write-off').attr('data-mother') === $('#mother-select-dead').find('.ai-select-item-selected').attr('data-id')) {
            return;
          } else if ($('#mother-death-write-off').attr('data-mother') !== 'undefined' && $('#mother-death-write-off').attr('data-mother') !== $('#mother-select-dead').find('.ai-select-item-selected').attr('data-id')) {
            await writeOffAnimal($('#mother-select-dead').find('.ai-select-item-selected').length > 0 ? $('#mother-select-dead').find('.ai-select-item-selected').attr('data-id') : undefined, { writeOffReason: 'birth-death', writeOffDate: new Date($('#date').val()) });

            await bringBackAnimal($('#mother-death-write-off').attr('data-mother'));
          } else {
            await writeOffAnimal($('#mother-select-dead').find('.ai-select-item-selected').length > 0 ? $('#mother-select-dead').find('.ai-select-item-selected').attr('data-id') : undefined, { writeOffReason: 'birth-death', writeOffDate: new Date($('#date').val()) });
          }

        } else if (!$('#mother-death-write-off').hasClass('ai-radio-active') && $('#mother-death-write-off').attr('data-mother') !== 'undefined') {
          await bringBackAnimal($('#mother-death-write-off').attr('data-mother'));
        }

        addConfirmationEmpty($('#edit-dead-birth-container'));
        setTimeout(() => { location.reload(true) }, 2000)

      }
    });
  }

  ///////////////////////
  /* FOR ALL MILKING RESULTS PAGE */
  ///////////////////////
  if (document.querySelector('#milking-resultss-container') || document.querySelector('#edit-milking-resultss-container')) {
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
        $('.hgt-edit-btn').attr('href', `/herd/edit-milking-results/${$(this).attr('data-animal-id')}/${$(this).attr('data-index')}`)
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
  if (document.querySelector('#milking-resultss-container')) {

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

      const response = await addAnimalResults('milking-resultss', animalId, { date, result, lactationNumber });

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
      if ($('#start-date').hasClass('ai-valid-input') && $('#lactation-number').find('.ai-pick-active').length > 0 && $('.ai-form-container').find('.ai-big-warning-text').length === 0) {
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
    
    /* UNFINISHED LACTATION BLOCK */
  if (document.querySelector('.ai-detail-info-block')) {
    if(new Date() > new Date(moment($('.ai-di-date').attr('data-date')).add(1, 'year'))) {
      $('.ai-di-date').text(moment($('.ai-di-date').attr('data-date')).locale('ru').format('DD MMMM YYYY'));
    } else {
      $('.ai-di-date').text(moment($('.ai-di-date').attr('data-date')).locale('ru').format('DD MMMM'));
    }

    $('.ai-pick').on('click', function() {
      let number = parseFloat($(this).text());

      if(number > parseFloat($('.ai-detail-info-block').attr('data-number'))) {
        if($('.ai-form-container').find('.ai-big-warning-text').length === 0) {
          $('.ai-form-container').append(`<div class="ai-big-warning-text">Нельзя добавить новую лактацию до окончания текущей</div>`)
        }
        return;
      }

      $('.ai-form-container').find('.ai-big-warning-text').remove();
    });
  }

  

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
        success = $('#insemination').find('.ai-pick-active').attr('id');
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
    $('#all-animals-search').on('keyup', function () {
      $('.al-animal').each(function () {
        let name = $(this).find('.al-item-name').text().toLowerCase();
        let number = $(this).find('.al-item-number').text();
        let searchValue = $('#all-animals-search').val().toLowerCase()

        if (name.includes(searchValue) || number.includes(searchValue)) {
          $(this).detach().prependTo($('.animals-list-block'));
        }
        if (name.startsWith(searchValue) || number.startsWith(searchValue)) {
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

    /* Animal actions */
    $('.al-add-action-btn').on('click', function (e) {
      e.preventDefault();

      if ($(this).find('ion-icon').attr('name') === 'ellipsis-horizontal') {
        $('.al-add-action-btn').find('ion-icon').attr('name', 'ellipsis-horizontal').css('transform', 'rotate(0deg)');
        $('.animal-actions-block').hide();
        $(this).find('ion-icon').attr('name', 'close').css('transform', 'rotate(90deg)');
        $(this).parent().find('.animal-actions-block').css({ 'display': 'block', "right": '100px', "left": 'unset', 'top': '10px' });
      } else {
        $(this).find('ion-icon').attr('name', 'ellipsis-horizontal').css('transform', 'rotate(0deg)');
        $(this).parent().find('.animal-actions-block').hide();
      }
    });

    $('body').on('click', function (e) {
      if (e.target.classList[0] !== 'animal-actions-block' && e.target.classList[0] !== 'al-add-action-btn') {
        $('.animal-actions-block').hide()
        $('.al-add-action-btn').find('ion-icon').attr('name', 'ellipsis-horizontal').css('transform', 'rotate(0deg)');
      }
    });

    /* Multiple animals selection */
    $('.al-animal-select-box ').on('click', function () {
      if (!$(this).hasClass('al-animal-select-box-selected')) {
        $(this).addClass('al-animal-select-box-selected');
        $(this).parent().addClass('al-animal-selected-animal');
      } else {
        $(this).removeClass('al-animal-select-box-selected');
        $(this).parent().removeClass('al-animal-selected-animal');
      }

      if ($('.al-animal-selected-animal').length > 0) {
        $('.al-selected-animal-line').css('display', 'flex');
        $('.al-sl-text').text(`Выбрано животных: ${$('.al-animal-selected-animal').length}`)

      } else {
        $('.al-selected-animal-line').css('display', 'none');
        $('.al-sl-text').text(`Выбрано животных: ${$('.al-animal-selected-animal').length}`)
      }
    });

    $('.al-sl-action-selector').on('click', function () {
      if ($('.al-sl-action-list').css('display') === 'none') {
        $('.al-sl-action-list').show();
      } else {
        $('.al-sl-action-list').hide();
      }
    });

    $(document).on('scroll', function () {
      $('.al-sl-action-list').hide();
    });

    $('.al-sl-action-item').on('click', function () {
      if ($(this).hasClass('al-sl-action-item-selected')) return;

      $('.al-sl-action-item-selected').removeClass('al-sl-action-item-selected');
      $(this).addClass('al-sl-action-item-selected');
      $('.al-sl-action-selector p').text($(this).text());
    });

    $('.al-sl-btn').on('click', function () {
      if ($('.al-sl-action-item-selected').length === 0) return;

      let link = $('.al-sl-action-item-selected').attr('data-link');
      $('.al-animal-selected-animal').each(function () {
        link = `${link}${$(this).attr('data-number')},`
      });

      location.assign(link)
    });

    $('.al-animal').each(function() {
      if($('.animals-list-block').find('.al-animal').index($(this)) % 2 !== 0) $(this).css('background-color', '#f6f6f6');
    });
  }

  ///////////////////////
  /* ANIMAL CARD PAGE */
  ///////////////////////
  if (document.querySelector('.animal-card-section')) {
    /* Actions block */
    $('.acp-action-btn').on('click', function () {
      if ($('.aih-actions-background').css('display') === 'none') {
        $('.aih-actions-background').css('display', 'flex');
        $(this).find('ion-icon').css('transform', 'rotate(45deg)');
        $(this).attr('qtl', 'Скрыть');

        $(this).trigger('mouseleave');
        $(this).trigger('mouseenter');
      } else {
        $('.aih-actions-background').css('display', 'none');
        $(this).find('ion-icon').css('transform', 'rotate(0deg)');
        $(this).attr('qtl', 'Добавить действие');
        $(this).trigger('mouseleave');
        $(this).trigger('mouseenter');
      }
    });

    $(window).on('scroll', function () {
      $('.aih-actions-background').css('display', 'none');
      $('.acp-action-btn').find('ion-icon').css('transform', 'rotate(0deg)');
      $('.acp-action-btn').attr('qtl', 'Добавить действие');
    });
    /* CHanging Date of calves */
    $('.birth-date').each(function () {
      $(this).text(moment($(this).attr('data-date')).locale('ru').format('DD MMMM YYYY'));
    });
    /* Current lactation info */
    const curStartDate = new Date($('.current-animal-info-block').attr('data-date'))
    $('#cur-lact-date').text(moment(curStartDate).locale('ru').format('DD MMMM YYYY'));
    $('#cur-lact-day').text(Math.round((Date.now() - curStartDate.getTime()) / 24 / 60 / 60 / 1000));

    if (parseFloat($('#cur-lact-day').text()) < 300) {
      $('#cur-lact-day').addClass('cai-item-title-green')
    } else if (parseFloat($('#cur-lact-day').text()) >= 300 && parseFloat($('#cur-lact-day').text()) < 350) {
      $('#cur-lact-day').addClass('cai-item-title-yellow')
    } else if (parseFloat($('#cur-lact-day').text()) >= 350) {
      $('#cur-lact-day').addClass('cai-item-title-red')
    }

    let biggestDays = 0;
    $('.lact-comp-item').each(function () {
      $(this).find('.start').text(moment($(this).attr('data-start-date')).locale('ru').format('DD MMMM YYYY'));

      let days;
      if ($(this).attr('data-finish-date') !== 'undefined') {
        days = Math.round((new Date($(this).attr('data-finish-date')).getTime() - new Date($(this).attr('data-start-date')).getTime()) / 24 / 60 / 60 / 1000)
        $(this).find('.finish').text(moment($(this).attr('data-finish-date')).locale('ru').format('DD MMMM YYYY'));
        $(this).find('.day').text(`${days} дн.`);
        $(this).find('.day').attr('data-day', days);
      } else {
        days = Math.round((Date.now() - new Date($(this).attr('data-start-date')).getTime()) / 24 / 60 / 60 / 1000)
        $(this).find('.finish').text('');
        $(this).find('.day').text(`${days} дн.`);
        $(this).find('.day').attr('data-day', days);
      }

      if (days > biggestDays) biggestDays = days;
    });

    $('.lact-comp-item').each(function () {
      let days = parseFloat($(this).find('.day').attr('data-day'));
      $(this).css('width', `${50 + (days / (biggestDays / 100) / 2)}%`);

      if (days >= 300 && days < 350) {
        $(this).find('.lact-visual-line').addClass('lact-visual-line-yellow')
      } else if (days >= 350) {
        $(this).find('.lact-visual-line').addClass('lact-visual-line-red')
      }
    });


    /* Working with animal's notes */
    $('.acp-note-btn').on('click', function () {
      if ($('.acp-notes-block').css('display') === 'none') {
        $('.acp-notes-block').css('display', 'flex');
        $(this).find('ion-icon').attr('name', 'add');
        $(this).find('ion-icon').css('transform', 'rotate(45deg)');
        $('#note-text').trigger('focus');
      } else {
        $('.acp-notes-block').css('display', 'none');
        $(this).find('ion-icon').attr('name', 'attach-outline');
        $(this).find('ion-icon').css('transform', 'rotate(0deg)');
        $('#note-text').trigger('blur');
      }
    });
    
    $(window).on('scroll', function () {
      $('.acp-notes-block').css('display', 'none');
      $('.acp-note-btn').find('ion-icon').attr('name', 'attach-outline');
      $('.acp-note-btn').find('ion-icon').css('transform', 'rotate(0deg)');
    });

    $('#note-text').on('keyup change', function (e) {
      if ($(this).val().length > 0) {
        $('#add-note').css({ 'filter': 'grayscale(0)', 'pointer-events': 'auto' });
      } else {
        $('#add-note').css({ 'filter': 'grayscale(1)', 'pointer-events': 'none' });
      }

      if(e.which === 13) $('#add-note').trigger('click');
    });

    $('#add-note').on('click', async function () {
      let response = await addAnimalResults('note', $('.main-section').attr('data-animal-id'), { text: $('#note-text').val() });

      if (response) {
        $('.acp-notes-container').append(`
          <div class="acp-note-item" data-id="${response.notes.at(-1)._id}">
            <p class="acp-note-text">${$('#note-text').val()}</p>
            <p class="acp-note-date">Сейчас</p>
            <div class="acp-note-delete-btn"> 
              <ion-icon name="trash"></ion-icon>
            </div>
          </div>
        `);

        $('.acp-notes-empty').remove();
        $('#note-text').val('');
        $('#note-text').trigger('change');
      }
    });

    $('.acp-notes-block').on('click', '.acp-note-delete-btn', async function () {
      let response = await deleteAnimalResults('note', $('.main-section').attr('data-animal-id'), $(this).parent().attr('data-id'))

      if (response) {
        $(this).parent().remove();

        if ($('.acp-notes-container').children().length === 0) {
          $('.acp-notes-container').append(`<div class="acp-notes-empty">Заметки отсутствуют</div>`)
        }
      }
    });

    $('.acp-note-date').each(function () {
      if (!$(this).attr('data-date')) return;

      const date = new Date($(this).attr('data-date'));

      if (new Date() < new Date(moment(date).endOf('day'))) {
        $(this).text('Сегодня');
      } else if (new Date() > new Date(moment(date).endOf('day')) && new Date() < new Date(moment(date).add(1, 'day').endOf('day'))) {
        $(this).text('Вчера');
      } else {
        $(this).text(moment(date).locale('ru').format('DD MMM.'))
      }
    });

    /* Animal's additional info*/
    $('.aih-ai-item').on('click', function (e) {
      if ($(this).find('.aih-ai-select-block').length === 0) return;

      if ($(this).find('.aih-ai-select-block').css('display') === 'none') {
        $('.aih-ai-select-block').hide();
        $(this).find('.aih-ai-select-block').css('display', 'flex');
        $(this).find('.invis-div').css('transform', 'rotate(180deg)');
      } else {
        $('.aih-ai-select-block').hide();
        $('.invis-div').css('transform', 'rotate(0deg)');
      }
    });

    $('body').on('click', function (e) {
      if (e.target.classList.value.includes('aih-ai-item') || e.target.classList.value.includes('aih-input') || e.target.classList.value.includes('aih-ai-select-item-btn')) return;

      $('.aih-ai-select-block').hide();
      $('.invis-div').css('transform', 'rotate(0deg)');
    });
    $(window).on('scroll', function (e) {
      $('.aih-ai-select-block').hide();
      $('.invis-div').css('transform', 'rotate(0deg)');
    });

    /* Adding more results to farm model */
    $('.aih-ai-select-item-btn').on('click', async function () {
      if ($(this).parent().find('input').val().length === 0) return;
      let value = $(this).parent().find('input').val();
      let res = false;
      if ($(this).parent().parent().attr('id') === 'category') {
        res = await addCategory($('.main-section').attr('data-farm-id'), value)
      } else if ($(this).parent().parent().attr('id') === 'building') {
        res = await addBuilding($('.main-section').attr('data-farm-id'), value)
      }

      if (res) {
        $(this).parent().before(`<div class="aih-ai-select-item"><p>${value}</p></div>`);
        $(this).parent().find('input').val('')
      }
    });

    /* Changing the data for the animal */
    $('.aih-ai-select-item').on('click', async function () {
      let value = $(this).find('p').text();
      let res = false;

      if ($(this).parent().attr('id') === 'category') {
        res = await editAnimal($('.main-section').attr('data-animal-id'), { category: value })
      } else if ($(this).parent().attr('id') === 'building') {
        res = await editAnimal($('.main-section').attr('data-animal-id'), { building: value })
      }

      if (res) {
        $(this).parent().hide();
        $(this).parent().parent().find('.aih-ai-item-text').text(value);
      }
    });

    /* Changing the spot for the animal */
    $('#spot-input').on('focus', function () {
      if ($(this).text() === 'Место') $(this).text('');
    });
    $('#spot-input').on('blur', function () {
      if ($(this).text().length === 0) $(this).text('Место');
    });

    $('#spot-input').on('keyup change', async function () {
      await editAnimal($('.main-section').attr('data-animal-id'), { spot: $(this).text() });
    });

    /* Formating dates */
    $('.ac-vp-body-point-date').each(function () {
      let dateFormat = moment($(this).attr('data-date')).lang('ru').format('MMMM DD YYYY, HH:mm');
      $(this).text(dateFormat.charAt(0).toUpperCase() + dateFormat.slice(1))
    });
    $('.ac-vp-body-date').each(function () {
      let dateFormat = moment($(this).attr('data-date')).lang('ru').format('MMMM DD YYYY, HH:mm');
      $(this).text(dateFormat.charAt(0).toUpperCase() + dateFormat.slice(1))
    });

    /* Placing problems in date order */

    /* $('.ac-vet-problems-item').each(function() {
      let date = new Date($(this).attr('data-date'));
      let el = $(this);
      $('.ac-vet-problems-item').each(function() {
        if($(this).is(el)) return;
 
        if(date > new Date($(this).attr('data-date'))) {
          el.detach();
          $(this).before(el);
        }
      });
    }); */
    $('.ac-vet-problems-item').each(function () {
      if ($(this).attr('data-cured') === 'true') return;

      $(this).detach()
      $('.ac-vet-problems-container').prepend($(this));
    });

    /* Placing treatments in date order */
    $('.ac-vp-body-point-block').each(function () {
      let parent = $(this);
      parent.find('.ac-vp-body-point').each(function () {
        let date = new Date($(this).attr('data-date'));
        let el = $(this);
        parent.find('.ac-vp-body-point').each(function () {
          if ($(this).is(el)) return;

          if (date < new Date($(this).attr('data-date'))) {
            el.detach();
            $(this).before(el);
          }
        });
      });
    })

    /* Showing the problems body */
    $('.ac-vp-header-more').on('click', function () {
      if ($(this).attr('data-state') === 'closed') {
        $('.ac-vp-header-more').attr('data-state', 'closed');
        $('.ac-vp-header-more').css('transform', 'rotate(0deg)');
        $('.ac-vp-body').css('display', 'none');

        $(this).css('transform', 'rotate(180deg)');
        $(this).parent().parent().find('.ac-vp-body').css('display', 'block');
        $(this).attr('data-state', 'opened');
      } else {
        $(this).css('transform', 'rotate(0deg)');
        $(this).parent().parent().find('.ac-vp-body').css('display', 'none');
        $(this).attr('data-state', 'closed');

      }
    });

    $('.ac-vet-problems-item').first().find('.ac-vp-header-more').trigger('click');

    if (document.querySelector('.ac-vet-scheme-block')) {
      /* Working with scheme block */
      $('.ac-big-point-date').each(function () {
        let dateFormat = moment($(this).attr('data-date')).lang('ru').format('MMMM DD YYYY, HH:mm');
        $(this).text(dateFormat.charAt(0).toUpperCase() + dateFormat.slice(1))
      });

      /* Making the line work */
      let last = 0
      let width = $('.ac-vs-progress-line').width() / parseFloat($('.ac-vs-progress-line').attr('data-total'));
      $('.ac-vs-progress-point').each(function () {
        if (!$(this).hasClass('ac-vs-progress-point-over')) return;
        last = parseFloat($(this).attr('data-index'));
      });
      $('.ac-vs-progress-line-inner').width(last * width);
      $('.ac-big-points-block').scrollLeft((last + 1) * 370);

      /* drag scroll */
      const slider = document.querySelector('.ac-big-points-block');
      let isDown = false;
      let startX;
      let scrollLeft;

      slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        slider.style.cursor = "grabbing";
      });
      slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
      });
      slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        slider.style.cursor = "pointer";
      });
      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 3; //scroll-fast
        slider.scrollLeft = scrollLeft - walk;
      });

    }

    /* Creating an event for unconfirmed insemination */
    let uiDate = new Date($('.ac-id-text').find('span').attr('data-date'));
    if(new Date() > new Date(moment(uiDate).add(1, 'year'))) {
      $('.ac-id-text').find('span').text(moment(uiDate).locale('ru').format('DD MMMM YYYY').toUpperCase());
    } else {
      $('.ac-id-text').find('span').text(moment(uiDate).locale('ru').format('DD MMMM').toUpperCase());
    }
    
    $('.ac-id-btn').on('click', async function () {
      const animalId = $(this).parent().attr('data-animal-id');
      const index = $(this).parent().attr('data-index');
      let success;
      if($(this).attr('id') === 'insem-success') {
         success = 'true';
      } else {
         success = 'false';
      }

      const response = await editAnimalResults('insemination', animalId, index, { success });

      if (response) location.reload(true);
    });

    /* Showing action block */
    $('.aih-actions-btn').on('click', function () {
      if ($(this).attr('data-state') === 'show') {
        $('.aih-actions-block').css('display', 'grid');
        $(this).find('p').text('Скрыть');
        $(this).find('span').css('transform', 'rotate(45deg)');
        $(this).attr('data-state', 'hide');
      } else {
        $('.aih-actions-block').css('display', 'none');
        $(this).find('p').text('Добавить');
        $(this).find('span').css('transform', 'rotate(0deg)');
        $(this).attr('data-state', 'show');
      }
    });
    /* Working with bring back animal block */
    
    if (document.querySelector('.animal-write-off-disclaimer')) {
      /* Format date */
      $('.awo-date').text(moment($('.awo-date').attr('data-date')).locale('ru').format('DD MMMM, YYYY'));

      $('#bring-back').click(async function () {
        let animalId = $(this).attr('data-animal-id');

        let result = await bringBackAnimal(animalId);

        if (result) location.reload(true);
      });


    }
  }

  /* Animal card milking graph */
  if (document.querySelector('#card-milking-graph')) {
    /* Projection milking tile graph */
    let milkingProjection = await getMilkingProjection($('.main-section').attr('data-animal-id'));
    let animalData = await getAnimalData($('.main-section').attr('data-animal-id'));
    let farmData = await getAnimalsForGraph($('.main-section').attr('data-farm-id'));
    let milkingDataByLact = [];
    
    if($('.main-section').attr('data-status') === 'diseased') {
      milkingProjection = milkingProjection.filter(el => el.type !== 'projected');
    }

    removeloadingBlock($('.animal-card-graph-block'));

    let firstRes, lastRes;
    /* Getting the milking data and sorting it by lactations */
    animalData.animal.milkingResults.forEach(res => {
      if (!milkingDataByLact.find(el => el.lactationNumber === res.lactationNumber)) {
        milkingDataByLact.push({
          lactationNumber: res.lactationNumber,
          results: [res],
          lactationStart: animalData.animal.lactations.find(lact => lact.number === res.lactationNumber).startDate
        });
      } else {
        milkingDataByLact.find(el => el.lactationNumber === res.lactationNumber).results.push(res);
      }

      if (!firstRes || firstRes > res.date) firstRes = res.date;
      if (!lastRes || lastRes < res.date) lastRes = res.date;
    });
    /* Getting farm milking data and sorting it by lactations */
    let milkingDataAverage = [];
    farmData.cows.forEach(cow => {
      cow.milkingResults.forEach(res => {
        if (res.date < firstRes || res.date > lastRes) return;

        if (!milkingDataAverage.find(el => moment(el.date).isSame(res.date, 'month'))) {
          milkingDataAverage.push({
            date: res.date,
            results: [res]
          });
        } else {
          milkingDataAverage.find(el => moment(el.date).isSame(res.date, 'month')).results.push(res);
        }
      });
    });
    milkingDataAverage.forEach(month => {
      let total = 0;
      month.results.forEach(res => {
        total += res.result;
      });
      month.result = Math.round(total / month.results.length);
    });

    /* Sorting projected data by lactations*/
    let milkingProjectionByLact = [];

    milkingProjection.forEach(data => {
      if (milkingProjectionByLact.find(el => el.lactation === data.lactation)) {
        milkingProjectionByLact.find(el => el.lactation === data.lactation).results.push(data);
      } else {
        milkingProjectionByLact.push({
          lactation: data.lactation,
          results: [data]
        });
      }
    });

    /* Getting milking results by day */
    let milkingDataByDay = [];
    milkingDataByLact.forEach((lact, index, array) => {
      let results = [];
      lact.results.sort((a, b) => new Date(a.date) - new Date(b.date));
      lact.results.forEach((res, inx, arr) => {
        results.push({
          date: new Date(res.date),
          result: res.result,
          type: 'actual'
        })
        if (inx + 1 > arr.length - 1) return;
        let daysSpan = (new Date(arr[inx + 1].date).getTime() - new Date(res.date).getTime()) / 24 / 60 / 60 / 1000;
        let increment = parseFloat(((arr[inx + 1].result - res.result) / daysSpan).toFixed(2));

        for (let i = 1; i <= daysSpan; i++) {
          /* Do not create projected element for the days where actual data present */

          let date = new Date(moment(res.date).add(i, 'days'));

          if (results.find(res => new Date(moment(date).startOf('day')) <= date && date > new Date(moment(date).endOf('day')))) return;

          results.push({
            date,
            result: res.result + i * increment,
            type: 'projected'
          });
        }

      });

      milkingDataByDay.push({
        lactationNumber: lact.lactationNumber,
        lactationStart: lact.lactationStart,
        results
      });

    });

    milkingDataByLact.sort((a, b) => a.lactationNumber - b.lactationNumber);
    milkingProjectionByLact.sort((a, b) => a.lactation - b.lactation);
    milkingDataByDay.sort((a, b) => a.lactationNumber - b.lactationNumber);
    milkingDataAverage.sort((a, b) => new Date(a.date) - new Date(b.date));

    milkingDataByLact.forEach(data => {
      data.results.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    milkingProjectionByLact.forEach(data => {
      data.results.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    milkingDataByDay.forEach(data => {
      data.results.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    /* console.log(milkingDataByLact)
    console.log(milkingProjectionByLact) 
    console.log(milkingDataByDay)
    console.log(milkingDataAverage)*/

    /* Working with a graph */
    $('#card-milking-graph .mp-hg-btn').on('click', function () {
      if ($(this).hasClass('mp-hg-btn-active')) return;
      $('.mp-hg-btn-active').removeClass('mp-hg-btn-active');
      $(this).addClass('mp-hg-btn-active');

      let colors = ['#fb8d34', '#ff5230', '#9d4b9f', '#606ae5', '#43d7e5', '#6DA34D', '#48A9A6', '#613F75', '#22333B', '#5E503F'];

      /* Cleaning previously created graph */
      $('#main-column').find('.mp-herd-legend-item').remove();
      $('#additional-column').find('.mp-herd-legend-item').remove();
      let maxDays;
      let start, end;
      let max = 0, min = 0;
      if ($(this).attr('data-graph') === 'months') {
        milkingDataByLact.forEach(lact => {
          lact.results.forEach(res => {
            if (res.result > max) max = res.result

            if (!start) start = res.date;
            if (!end) end = res.date;

            if (start > res.date) start = res.date;
            if (end < res.date) end = res.date;
          })
        });
        max = Math.ceil(max / 10) * 10 * 1.5;

        /* Adding graph base */
        const graphObj = graphBase('#card-milking-graph', min, max, new Date(start), new Date(end), true, false);

        /* Adding average data */
        milkingDataAverage.forEach((month, index) => {
          let currentDaysSpan = Math.round((new Date(month.date).getTime() - new Date(graphObj.start).getTime()) / 1000 / 60 / 60 / 24);

          let path;
          if (index === 0) {
            path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path.classList.add('basic-graph-point-line');
            path.classList.add('average-graph-data');
            path.style.stroke = '#d9d9d9';
            graphObj.svg.append(path);
            path.setAttribute('d', `M ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (month.result / (graphObj.max / 100) / 100))}`)

            path.setAttribute('id', `graph-average-line`);
          } else {
            path = document.getElementById(`graph-average-line`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (month.result / (graphObj.max / 100) / 100))}`)

          }

        });
        $('#additional-column').append(`
        <div class="mp-herd-legend-item" data-rel-element='graph-average-line' id="legend-item-average">
          <div class="mp-herd-li-mark">
            <div class="mp-herd-li-mark-average"></div>
          </div>
          <div class="mp-herd-li-text">Средний результат</div>
        </div>
        `)
        $(`#legend-item-average`).find('.mp-herd-li-mark-average').css('border-color', '#d9d9d9');

        /* Adding data */
        $('.ac-results-block').empty();
        milkingDataByLact.forEach((lact, index) => {
          let circleTimer = 0;
          $('.ac-results-block').append(`<div class="ac-rb-container"></div>`)
          let resultCont = $('.ac-rb-container').last();


          lact.results.forEach((res, inx) => {
            let currentDaysSpan = Math.round((new Date(res.date).getTime() - new Date(graphObj.start).getTime()) / 1000 / 60 / 60 / 24);

            resultCont.append(`
            
              <div class="ac-rb-result" data-index="${inx + 1}" data-lact="${index + 1}" data-rel="${index}-${inx}">
                <div class="ac-rb-result-body">
                  <div class="ac-rb-result-body-text"> <span>Лактация: </span>&nbsp; #${index + 1}</div>
                  <div class="ac-rb-result-body-text"> <span>Дата: </span>&nbsp; ${moment(res.date).locale('ru').format('DD MMMM YYYY')}</div>
                </div>
                <div class="ac-rb-result-number" style="color:${colors[index]}">${res.result}</div>
              </div>
            `)
            /* Adding data line */
            let path;
            if (inx === 0) {
              path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
              path.classList.add('basic-graph-point-line');
              path.classList.add('average-graph-data');
              path.style.stroke = colors[index];
              graphObj.svg.append(path);
              path.setAttribute('d', `M ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.result / (graphObj.max / 100) / 100))}`)

              path.classList.add(`lact-months-${index}`);
            } else {
              path = document.querySelector(`.lact-months-${index}`);
              path.setAttribute('d', `${path.getAttribute('d')} L ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.result / (graphObj.max / 100) / 100))}`)

            }

            /* Adding data points */
            const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.classList.add('basic-graph-point')
            circle.classList.add('average-graph-data');
            circle.style.stroke = colors[index];
            graphObj.svg.append(circle);
            circle.setAttribute('cx', graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100)))
            circle.setAttribute('cy', graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.result / (graphObj.max / 100) / 100)))

            circle.setAttribute('r', 4);
            circle.setAttribute('data-result', res.result);
            circle.setAttribute('data-date', res.date);
            circle.setAttribute('data-lact', lact.lactationNumber);
            circle.setAttribute('data-rel', `${index}-${inx}`)
            circle.classList.add(`lact-months-${index}`);

            circle.style.animation = `fadeIn ${circleTimer}s ease-out`
            circleTimer += 0.1;
          });

          $('#main-column').append(`
            <div class="mp-herd-legend-item" data-rel-element='lact-months-${index}' id="legend-item-${index}">
              <div class="mp-herd-li-mark">
                <div class="mp-herd-li-mark-average"></div>
              </div>
              <div class="mp-herd-li-text">Лактация #${lact.lactationNumber}</div>
            </div>
            `)
          $(`#legend-item-${index}`).find('.mp-herd-li-mark-average').css('border-color', colors[index]);
        });


        anime({
          targets: '.basic-graph-point-line',
          strokeDashoffset: [2000, 0],
          easing: 'easeInOutSine',
          duration: 1500,
          delay: function (el, i) { return i * 250 },
        });





        $('.basic-graph-point').off()
        $('.basic-graph-point').on('mouseenter', function ({ clientX, clientY }) {

          $('.ac-graph-tooltip').empty();
          $('.ac-graph-tooltip').append(`
          <div class="ac-graph-tooltip-title">ЛАКТАЦИЯ:</div>
          <div class="ac-graph-tooltip-res">#${$(this).attr('data-lact')}</div>
          <div class="ac-graph-tooltip-title">РЕЗУЛЬТАТ:</div>
          <div class="ac-graph-tooltip-res">${parseFloat($(this).attr('data-result')).toFixed(1)}</div>
          <div class="ac-graph-tooltip-title">ДАТА:</div>
          <div class="ac-graph-tooltip-res">${moment($(this).attr('data-date')).lang('ru').format('MMMM, YYYY').toUpperCase()}</div>
          `)
          $('.ac-graph-tooltip-res').css({ 'color': $(this).css('stroke') })

          /* 350 is an average width of tooltip for this graph */
          if (parseFloat($(this).attr('cx')) + 20 + 350 < $('#card-milking-graph').width()) {
            $('.ac-graph-tooltip').css({ 'top': parseFloat($(this).attr('cy')), 'left': parseFloat($(this).attr('cx')) + 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(0%, -50%)' })
          } else {
            $('.ac-graph-tooltip').css({ 'top': parseFloat($(this).attr('cy')), 'left': parseFloat($(this).attr('cx')) - 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(-100%, -50%)' })
          }

          $('.ac-graph-tooltip').css('display', 'flex');
        });

        $('.basic-graph-point').on('mouseleave', function ({ clientX, clientY }) {
          $('.ac-graph-tooltip').hide();
        });

        /* Adding result point selections */
        $('.basic-graph-point').off();
        $('.basic-graph-point').on('mouseenter', function () {
          const rel = $(this).attr('data-rel');
          $('.ac-rb-result').each(function () {
            if ($(this).attr('data-rel') === rel) {
              $('.ac-rb-result').css('opacity', '0.5')
              $(this).css('opacity', '1');
              $('.ac-results-block').scrollTop($('.ac-rb-result').index($(this)) * 80)

            }
          });
        });
        $('.basic-graph-point').on('mouseleave', function () {
          $('.ac-rb-result').css('opacity', '1')
        });

      } else if ($(this).attr('data-graph') === 'compare') {
        min = 100;
        milkingProjectionByLact.forEach(lact => {
          lact.results.forEach((res, inx, arr) => {
            if (res.average > max) max = res.average;
            if (res.average < min) min = res.average;

            let days = Math.round((new Date(res.date).getTime() - new Date(arr[0].date).getTime()) / 24 / 60 / 60 / 1000)
            if (!maxDays || days > maxDays) maxDays = days;
          })
        });
        max = Math.ceil(max * 1.1);
        min = Math.floor(min * 0.9);


        /* Adding graph base */
        const graphObj = graphBaseNoDate('#card-milking-graph', min, max, maxDays, true, false);

        /* Adding data */
        $('.ac-results-block').empty();
        milkingProjectionByLact.forEach((lact, index) => {
          let circleTimer = 0;
          $('.ac-results-block').append(`<div class="ac-rb-container"></div>`)
          let resultCont = $('.ac-rb-container').last();

          lact.results.forEach((res, inx, arr) => {
            let currentDaysSpan = Math.round((new Date(res.date).getTime() - new Date(arr[0].date).getTime()) / 1000 / 60 / 60 / 24);

            resultCont.append(`
              <div class="ac-rb-result ${res.type === 'projected' ? 'ac-rb-result-proj' : ''}" data-index="${inx + 1}" data-lact="${index + 1}" data-rel="${index}-${inx}" qt="Спрогнозированные данные">
                <div class="ac-rb-result-body">
                  <div class="ac-rb-result-body-text"> <span>Лактация: </span>&nbsp; #${index + 1}</div>
                  <div class="ac-rb-result-body-text"> <span>Дата: </span>&nbsp; ${moment(res.date).locale('ru').format('DD MMMM YYYY')}</div>
                </div>
                <div class="ac-rb-result-number" style="color:${colors[index]}">${res.total ? res.total : Math.round(res.average)}</div>
              </div>
            `)

            /* Adding data line */
            let path;
            if (inx === 0) {
              path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
              path.classList.add('basic-graph-point-line');
              path.classList.add('average-graph-data');
              path.style.stroke = colors[index];
              graphObj.svg.append(path);
              path.setAttribute('d', `M ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.average / (graphObj.max / 100) / 100))}`)

              path.classList.add(`lact-months-${index}`);
            } else {
              path = document.querySelector(`.lact-months-${index}`);
              path.setAttribute('d', `${path.getAttribute('d')} L ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.average / (graphObj.max / 100) / 100))}`)

            }

            /* Adding data points */
            const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.classList.add('basic-graph-point')
            circle.classList.add('average-graph-data');
            if (res.type === 'projected') circle.classList.add('projected-graph-data');
            circle.style.stroke = colors[index];
            graphObj.svg.append(circle);
            circle.setAttribute('cx', graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100)))
            circle.setAttribute('cy', graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.average / (graphObj.max / 100) / 100)))

            circle.setAttribute('r', 4);
            circle.setAttribute('data-result', res.average);
            circle.setAttribute('data-date', res.date);
            circle.setAttribute('data-lact', lact.lactation);
            circle.setAttribute('data-rel', `${index}-${inx}`)
            circle.classList.add(`lact-months-${index}`);

            circle.style.animation = `fadeIn ${circleTimer}s ease-out`
            circleTimer += 0.1;
          });

          $('#main-column').append(`
            <div class="mp-herd-legend-item" data-rel-element='lact-months-${index}' id="legend-item-${index}">
              <div class="mp-herd-li-mark">
                <div class="mp-herd-li-mark-average"></div>
              </div>
              <div class="mp-herd-li-text">Лактация #${lact.lactation}</div>
            </div>
            `)
          $(`#legend-item-${index}`).find('.mp-herd-li-mark-average').css('border-color', colors[index]);
        });


        anime({
          targets: '.basic-graph-point-line',
          strokeDashoffset: [2000, 0],
          easing: 'easeInOutSine',
          duration: 1500,
          delay: function (el, i) { return i * 250 },
        });

        $('.basic-graph-point').off()
        $('.basic-graph-point').on('mouseenter', function ({ clientX, clientY }) {

          $('.ac-graph-tooltip').empty();
          $('.ac-graph-tooltip').append(`
          <div class="ac-graph-tooltip-title">ЛАКТАЦИЯ:</div>
          <div class="ac-graph-tooltip-res">#${$(this).attr('data-lact')}</div>
          <div class="ac-graph-tooltip-title">РЕЗУЛЬТАТ:</div>
          <div class="ac-graph-tooltip-res">${parseFloat($(this).attr('data-result')).toFixed(1)}</div>
          <div class="ac-graph-tooltip-title">ДАТА:</div>
          <div class="ac-graph-tooltip-res">${moment($(this).attr('data-date')).lang('ru').format('MMMM, YYYY').toUpperCase()}</div>
          `)
          $('.ac-graph-tooltip-res').css({ 'color': $(this).css('stroke') })

          /* 350 is an average width of tooltip for this graph */
          if (parseFloat($(this).attr('cx')) + 20 + 350 < $('#card-milking-graph').width()) {
            $('.ac-graph-tooltip').css({ 'top': parseFloat($(this).attr('cy')), 'left': parseFloat($(this).attr('cx')) + 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(0%, -50%)' })
          } else {
            $('.ac-graph-tooltip').css({ 'top': parseFloat($(this).attr('cy')), 'left': parseFloat($(this).attr('cx')) - 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(-100%, -50%)' })
          }

          $('.ac-graph-tooltip').css('display', 'flex');
        });

        $('.basic-graph-point').on('mouseleave', function ({ clientX, clientY }) {
          $('.ac-graph-tooltip').hide();
        });

        /* Adding result point selections */
        $('.basic-graph-point').off();
        $('.basic-graph-point').on('mouseenter', function () {
          const rel = $(this).attr('data-rel');
          $('.ac-rb-result').each(function () {
            if ($(this).attr('data-rel') === rel) {
              $('.ac-rb-result').css('opacity', '0.5')
              $(this).css('opacity', '1');
              $('.ac-results-block').scrollTop($('.ac-rb-result').index($(this)) * 80)
            }
          });
        });
        $('.basic-graph-point').on('mouseleave', function () {
          $('.ac-rb-result').css('opacity', '1')
        });
      } else if ($(this).attr('data-graph') === 'days') {
        milkingDataByDay.forEach(lact => {
          lact.results.forEach(res => {
            if (res.result > max) max = res.result

            let days = Math.round((new Date(res.date).getTime() - new Date(lact.lactationStart).getTime()) / 24 / 60 / 60 / 1000)
            if (!maxDays) maxDays = days;

            if (days > maxDays) maxDays = days;
          })
        });
        max = Math.ceil(max / 10) * 10 * 1.5;

        /* Adding graph base */
        const graphObj = graphBaseNoDate('#card-milking-graph', min, max, maxDays, true, true);

        /* Adding data */
        milkingDataByDay.forEach((lact, index) => {
          let circleTimer = 0;
          lact.results.forEach((res, inx) => {
            let currentDaysSpan = Math.round((new Date(res.date).getTime() - new Date(lact.lactationStart).getTime()) / 1000 / 60 / 60 / 24);

            /* Adding data line */
            let path;
            if (inx === 0) {
              path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
              path.classList.add('basic-graph-point-line');
              path.classList.add('average-graph-data');
              path.style.stroke = colors[index];
              graphObj.svg.append(path);
              path.setAttribute('d', `M ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.result / (graphObj.max / 100) / 100))}`)

              path.classList.add(`lact-days-${index}`);
            } else {
              path = document.querySelector(`.lact-days-${index}`);
              path.setAttribute('d', `${path.getAttribute('d')} L ${graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100))} ${graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.result / (graphObj.max / 100) / 100))}`)

            }

            /* Adding data points */
            const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.classList.add('basic-graph-average-dot')
            circle.classList.add('average-graph-data');
            circle.style.fill = `#a2a2a200`;
            graphObj.svg.append(circle);
            circle.setAttribute('cx', graphObj.horGap + Math.round(graphObj.workingAreaWidth * (currentDaysSpan / (graphObj.daysSpan / 100) / 100)))
            circle.setAttribute('cy', graphObj.workingAreaHeight + graphObj.horGap - Math.round(graphObj.workingAreaHeight * (res.result / (graphObj.max / 100) / 100)))

            circle.setAttribute('r', 3);
            circle.setAttribute('data-result', res.result);
            circle.setAttribute('data-date', currentDaysSpan);
            circle.setAttribute('data-lact', lact.lactationNumber);
            circle.setAttribute('data-color', colors[index]);
            circle.classList.add(`lact-days-${index}`);

            circle.style.animation = `fadeIn ${circleTimer}s ease-out`
            circleTimer += 0.01;
          });

          $('#main-column').append(`
            <div class="mp-herd-legend-item" data-rel-element='lact-days-${index}' id="legend-item-${index}">
              <div class="mp-herd-li-mark">
                <div class="mp-herd-li-mark-average"></div>
              </div>
              <div class="mp-herd-li-text">Лактация #${lact.lactationNumber}</div>
            </div>
            `)
          $(`#legend-item-${index}`).find('.mp-herd-li-mark-average').css('border-color', colors[index]);
        });


        anime({
          targets: '.basic-graph-point-line',
          strokeDashoffset: [2000, 0],
          easing: 'easeInOutSine',
          duration: 1500,
          delay: function (el, i) { return i * 250 },
        });


        $('.basic-graph-average-dot').on('mouseenter', function (evt) {
          let point = graphObj.svg.createSVGPoint();

          point.x = evt.clientX; point.y = evt.clientY;
          point = point.matrixTransform(graphObj.svg.getScreenCTM().inverse());

          let currentPoint = { dataPoints: [], diff: 0 };

          $('.basic-graph-average-dot').each(function () {
            const dataPointX = parseFloat($(this).attr('cx'));

            let diff = Math.abs(dataPointX - point.x);
            if (currentPoint.dataPoints.length === 0 || currentPoint.diff > diff) {
              currentPoint.dataPoints = [];
              currentPoint.dataPoints.push($(this));
              currentPoint.diff = diff;
            } else if (currentPoint.dataPoints.length > 0 && currentPoint.diff === diff) {
              currentPoint.dataPoints.push($(this));
            }
          });

          $('.ac-graph-tooltip').empty();
          $('.ac-graph-tooltip').append(`<div class="ac-graph-tooltip-inner-block"></div>`);
          currentPoint.dataPoints.forEach((point) => {
            $('.ac-graph-tooltip-inner-block').append(`
            <div class="ac-graph-tooltip-inner">
              <div class="ac-graph-tooltip-title">ЛАКТАЦИЯ:</div>
              <div class="ac-graph-tooltip-res" style="color:${$(point).attr('data-color')}">#${$(point).attr('data-lact')}</div>
              <div class="ac-graph-tooltip-title">РЕЗУЛЬТАТ:</div>
              <div class="ac-graph-tooltip-res" style="color:${$(point).attr('data-color')}">${parseFloat($(point).attr('data-result')).toFixed(1)}</div>
              <div class="ac-graph-tooltip-title">ДАТА:</div>
              <div class="ac-graph-tooltip-res" style="color:${$(point).attr('data-color')}">${$(point).attr('data-date')} день</div>
            </div>
            `);
          });

          /* 350 is an average width of tooltip for this graph */
          if (point.x + 20 + 350 < $('#card-milking-graph').width()) {
            $('.ac-graph-tooltip').css({ 'top': point.y, 'left': point.x + 20, 'border-color': $(this).css('data-color'), 'transform': 'translate(0%, -50%)' })
          } else {
            $('.ac-graph-tooltip').css({ 'top': point.y, 'left': point.x - 20, 'border-color': $(this).css('data-color'), 'transform': 'translate(-100%, -50%)' })
          }

          $('.ac-graph-tooltip').css('display', 'flex');
        });

        $('.basic-graph-average-dot').on('mouseleave', function () {
          $('.ac-graph-tooltip').css('display', 'none');
        });
      }
    });

    $('.mp-hg-btn-first').trigger('click');


    /* $('.acb-tile-graph').empty();
    milkingProjectionByLact.forEach(lact => {
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
    }); */
  }

  /* INSEMINATION TIMELINE */
  if (document.querySelector('.ac-insemination-block')) {
    let animalData = await getAnimalData($('.main-section').attr('data-animal-id'));
    let bundledData = [];

    animalData.animal.inseminations.forEach((res, index) => {
      bundledData.push({
        type: 'insemination',
        date: new Date(res.date),
        result: res.success,
        index,
        animalId: animalData.animal._id
      })
    });
    animalData.animal.lactations.forEach((res, index) => {
      bundledData.push({
        type: 'lactation',
        date: new Date(res.startDate),
        number: res.number,
        index,
        animalId: animalData.animal._id,
        finish: false
      });

      if (res.finishDate) {
        bundledData.push({
          type: 'lactation',
          date: new Date(res.finishDate),
          number: res.number,
          index,
          animalId: animalData.animal._id,
          finish: true
        });
      }
    });
    /* Get the percentage for each insemination */
    bundledData.sort((a, b) => a.date - b.date);

    let totalInsems = 0;
    let sucInsems = 0;
    bundledData.forEach(data => {
      if (data.type === 'insemination') {
        totalInsems++;
        if (data.result === 'true') sucInsems++;
      }

      data.percent = totalInsems === 0 ? 0 : Math.round((sucInsems / totalInsems) * 100);
    });

    bundledData.sort((a, b) => b.date - a.date);

    bundledData.forEach((data, index, arr) => {
      if (index === 0) return;

      data.months = Math.round(parseFloat((arr[index - 1].date.getTime() - data.date.getTime()) / 1000 / 60 / 60 / 24 / 30 / 3));
    });

    $('.ac-ib-timeline-block ').empty();
    bundledData.forEach(data => {
      for (let i = 0; i < data.months; i++) {
        $('.ac-ib-timeline-block').append(`<div class="ac-ib-timeline-empty"></div>`)
      }

      let name;
      if (data.type === 'insemination') {
        name = 'ОСЕМЕНЕНИЕ';
      } else if (data.type === 'lactation' && !data.finish) {
        name = `НАЧАЛО ЛАКТАЦИИ #${data.number}`;
      } else if (data.type === 'lactation' && data.finish) {
        name = `ОКОНЧАНИЕ ЛАКТАЦИИ #${data.number}`;
      }



      $('.ac-ib-timeline-block').append(`
        <div class="ac-ib-timeline-line">
          <div class="ac-ib-ti-percent ${data.percent < 30 ? 'ac-ib-ti-percent-fail' : 'ac-ib-ti-percent-suc'}" qtr="Процент осеменяемости">${data.percent}%</div>
          <div class="ac-ib-ti-icon"><img src="/img/images/${data.type === 'insemination' ? 'needle' : 'milking-cow'}-icon.png"/></div>
          ${data.type === 'insemination' && data.result === 'undefined' ? '<div class="ac-ib-ti-icon" qtr="Результат не указан"><img src="/img/svgs/question-mark.svg"/></div>' : ''}
          ${data.type === 'insemination' && data.result === 'true' ? '<div class="ac-ib-ti-icon" qtr="Успешно"><img src="/img/svgs/check.svg"/></div>' : ''}
          ${data.type === 'insemination' && data.result === 'false' ? '<div class="ac-ib-ti-icon" qtr="Не успешно"><img src="/img/svgs/x.svg"/></div>' : ''}
          <div class="ac-ib-ti-text">${name}</div>
          <div class="ac-ib-ti-date">${moment(data.date).locale('ru').format('DD MMMM, YY').toUpperCase()}</div>
        </div>
      `);
    });

    removeloadingBlock($('.ac-insemination-block'))




  };

  /* WEIGHT BLOCK */
  if (document.querySelector('.ac-weight-info-block')) {
    $('.ac-all-weight-date').each(function() {
      let date = new Date($(this).attr('data-date'));

      if(date > new Date(moment().subtract(1, 'year'))) {
        $(this).text(moment(date).locale('ru').format('DD MMMM').toUpperCase());
      } else {
        $(this).text(moment(date).locale('ru').format('DD MMMM YYYY').toUpperCase());
      }
    });

    let maxWeight = 0;
    $('.ac-all-weight').each(function() {
      let res = parseFloat($(this).attr('data-res'));
      
      if(res > maxWeight) maxWeight = res;
    }); 
    
    $('.ac-all-weight').each(function() {
      let res = parseFloat($(this).attr('data-res'));
      $(this).css('background-color', `rgb(251, 141, 52, ${res / maxWeight})`)
      $(this).css('height', `calc(${(res / maxWeight) * 100}% - 20px)`)

    }); 
  }
  ///////////////////////
  /* ANIMAL RESULTS HISTORY BLOCK */
  ///////////////////////
  if (document.querySelector('.ar-history-block')) {
    $('.ar-history-block').find('.date-format').each(function () {
      let date = new Date($(this).attr('data-date'));
      let year = new Date() > new Date(moment(date).add(1, 'year'));
      $(this).text(year ? moment(date).locale('ru').format('DD MMM, YY').toUpperCase().replace('.', '') : moment(date).locale('ru').format('DD MMM').toUpperCase().replace('.', ''));
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
  if (document.querySelector('#edit-milking-resultss-container')) {

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

      const response = await editAnimalResults('milking-resultss', animalId, index, { date, result, lactationNumber });

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
        success = $('#insemination').find('.ai-pick-active').attr('id');
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
  let animals;
  if (document.querySelector('#mp-herd')) {
    animals = await getAnimalsForGraph($('#mp-herd').attr('data-farm-id'));
    /* Working with projectrion data */
    await getFarmProjections($('#mp-herd').attr('data-farm-id'), 10);
    removeloadingBlock($('.herd-mp-quick-info-block'));
    let slideInterval;
    /* Working with quick info */
    $('.herd-mp-quick-info-counter').on('click', function () {
      clearInterval(slideInterval);
      $(this).siblings().removeClass('herd-mp-quick-info-counter-active')
      $(this).addClass('herd-mp-quick-info-counter-active')

      $('.herd-mp-quick-info-item').each(function () {
        if ($(this).attr('data-index') === $('.herd-mp-quick-info-counter-active').attr('data-index')) {
          anime({
            targets: '.herd-mp-quick-info-item',
            opacity: '0',
            easing: 'easeInOutQuad',
            duration: 500
          });
          anime({
            targets: $(this)[0],
            opacity: '1',
            easing: 'easeInOutQuad',
            delay: 650,
            duration: 750
          });
          anime({
            targets: $(this).find('.herd-mp-quick-info-item-res')[0],
            innerText: [0, parseFloat($(this).attr('data-res'))],
            round: true,
            delay: 1000,
            duration: 500
          });
        }
      });

      slideInterval = setInterval(() => {
        if ($('.herd-mp-quick-info-counter-active').next().length !== 0) {
          $('.herd-mp-quick-info-counter-active').removeClass('herd-mp-quick-info-counter-active').next().addClass('herd-mp-quick-info-counter-active');
        } else {
          $('.herd-mp-quick-info-counter-active').removeClass('herd-mp-quick-info-counter-active');
          $('.herd-mp-quick-info-counter-first').addClass('herd-mp-quick-info-counter-active');
        }

        $('.herd-mp-quick-info-item').each(function () {
          if ($(this).attr('data-index') === $('.herd-mp-quick-info-counter-active').attr('data-index')) {
            anime({
              targets: '.herd-mp-quick-info-item',
              opacity: '0',
              easing: 'easeInOutQuad',
              duration: 500
            });
            anime({
              targets: $(this)[0],
              opacity: '1',
              easing: 'easeInOutQuad',
              delay: 650,
              duration: 750
            });
            anime({
              targets: $(this).find('.herd-mp-quick-info-item-res')[0],
              innerText: [0, parseFloat($(this).attr('data-res'))],
              round: true,
              delay: 1000,
              duration: 500
            });
          }
        });
      }, 5000)
    });
    $('.herd-mp-quick-info-counter-active').trigger('click');


    $('.mp-recent-item').each(function () {
      anime({
        targets: $(this).find('.mp-recent-number')[0],
        innerText: [0, parseFloat($(this).find('.mp-recent-number').attr('data-number'))],
        round: true,
        delay: parseFloat($(this).attr('data-counter')) * 200,
        duration: 1000
      });
    });

    const bdAnimals = await getAnimalsForGraph($('#mp-herd').attr('data-farm-id'));

    $('#herd-breakdown').find('.mp-block-outside-header-btn').on('click', function () {
      $('#herd-breakdown').find('.mp-block-outside-header-btn-active').removeClass('mp-block-outside-header-btn-active');
      $(this).addClass('mp-block-outside-header-btn-active');

      const type = $(this).attr('id');
      let total = 0;
      let dataArr = [];
      if (type === 'category') {
        bdAnimals.animals.forEach(animal => {
          if (!animal.category) return;

          total++;
          if (dataArr.find(el => el.value === animal.category)) {
            let el = dataArr.find(el => el.value === animal.category);
            el.count++;
            el.animals.push(animal)
          } else {
            dataArr.push({
              value: animal.category,
              count: 1,
              animals: [animal]
            });
          }
        });
        dataArr.sort((a, b) => b.count - a.count);
        removeEmptyBlock($('.herd-breakdown-block'));
        if (dataArr.length === 0) emptyBlock($('.herd-breakdown-block'), 'Данные отсутсвуют', 'Добавьте больше данных чтобы увидеть статистику')


        $('.hbb-line').remove();
        dataArr.forEach((data, inx) => {
          $('.herd-breakdown-block').append(`
            <div class="hbb-line hbb-line-${inx}">
              <div class="hbb-line-text">${data.value}</div>
              <div class="hbb-line-text-second">${(data.count / (total / 100)).toFixed(1)}%</div>
              <div class="hbb-animals-block"></div>
            </div>
          `)
          data.animals.forEach(animal => {
            $(`.hbb-line-${inx}`).find('.hbb-animals-block').append(`<div class="hbb-animal-item"></div>`)
          });
        });
      } else if (type === 'gender') {
        bdAnimals.animals.forEach(animal => {
          if (!animal.gender) return;

          total++;
          if (dataArr.find(el => el.value === animal.gender)) {
            let el = dataArr.find(el => el.value === animal.gender);
            el.count++;
            el.animals.push(animal)
          } else {
            dataArr.push({
              value: animal.gender,
              count: 1,
              animals: [animal]
            });
          }
        });
        dataArr.sort((a, b) => b.count - a.count);
        removeEmptyBlock($('.herd-breakdown-block'));
        if (dataArr.length === 0) emptyBlock($('.herd-breakdown-block'), 'Данные отсутсвуют', 'Добавьте больше данных чтобы увидеть статистику')

        $('.hbb-line').remove();
        dataArr.forEach((data, inx) => {
          $('.herd-breakdown-block').append(`
            <div class="hbb-line hbb-line-${inx}">
              <div class="hbb-line-text">${data.value === 'male' ? 'Мужской' : 'Женский'}</div>
              <div class="hbb-line-text-second">${(data.count / (total / 100)).toFixed(1)}%</div>
              <div class="hbb-animals-block"></div>
            </div>
          `)
          data.animals.forEach(animal => {
            $(`.hbb-line-${inx}`).find('.hbb-animals-block').append(`<div class="hbb-animal-item"></div>`)
          });
        });
      } else if (type === 'age') {
        bdAnimals.animals.forEach(animal => {
          if (!animal.birthDate) return;

          let age = Math.floor((new Date().getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 365)
          total++;
          if (dataArr.find(el => el.value === age)) {
            let el = dataArr.find(el => el.value === age);
            el.count++;
            el.animals.push(animal)
          } else {
            dataArr.push({
              value: age,
              count: 1,
              animals: [animal]
            });
          }
        });
        dataArr.sort((a, b) => b.count - a.count);
        removeEmptyBlock($('.herd-breakdown-block'));
        if (dataArr.length === 0) emptyBlock($('.herd-breakdown-block'), 'Данные отсутсвуют', 'Добавьте больше данных чтобы увидеть статистику')

        $('.hbb-line').remove();
        dataArr.forEach((data, inx) => {
          $('.herd-breakdown-block').append(`
            <div class="hbb-line hbb-line-${inx}">
              <div class="hbb-line-text">${data.value} г.</div>
              <div class="hbb-line-text-second">${(data.count / (total / 100)).toFixed(1)}%</div>
              <div class="hbb-animals-block"></div>
            </div>
          `)
          data.animals.forEach(animal => {
            $(`.hbb-line-${inx}`).find('.hbb-animals-block').append(`<div class="hbb-animal-item"></div>`)
          });
        });
      } else if (type === 'breed') {
        bdAnimals.animals.forEach(animal => {
          if (!animal.breedRussian) return;

          total++;
          if (dataArr.find(el => el.value === animal.breedRussian)) {
            let el = dataArr.find(el => el.value === animal.breedRussian);
            el.count++;
            el.animals.push(animal)
          } else {
            dataArr.push({
              value: animal.breedRussian,
              count: 1,
              animals: [animal]
            });
          }
        });
        dataArr.sort((a, b) => b.count - a.count);
        removeEmptyBlock($('.herd-breakdown-block'));
        if (dataArr.length === 0) emptyBlock($('.herd-breakdown-block'), 'Данные отсутсвуют', 'Добавьте больше данных чтобы увидеть статистику')

        $('.hbb-line').remove();
        dataArr.forEach((data, inx) => {
          $('.herd-breakdown-block').append(`
            <div class="hbb-line hbb-line-${inx}">
              <div class="hbb-line-text">${data.value}</div>
              <div class="hbb-line-text-second">${(data.count / (total / 100)).toFixed(1)}%</div>
              <div class="hbb-animals-block"></div>
            </div>
          `)
          data.animals.forEach(animal => {
            $(`.hbb-line-${inx}`).find('.hbb-animals-block').append(`<div class="hbb-animal-item"></div>`)
          });
        });
      }

      removeloadingBlock($('#herd-breakdown'));
    });

    $('#herd-breakdown').find('.mp-block-outside-header-btn-active').trigger('click');

    /* MILKING RESULTS BLOCK */
    if (document.querySelector('.mp-milking-results-block')) {
      let lastResDate = undefined;
      animals.cows.forEach(cow => {
        cow.milkingResults.forEach(res => {
          if (!lastResDate || new Date(res.date) > lastResDate) lastResDate = new Date(res.date);
        })
      })

      if (!lastResDate) lastResDate = new Date();

      removeloadingBlock($('.mp-milking-results-block'));

      $('#mp-mr-date').val(moment(lastResDate).format('YYYY-MM'));
      $('#mp-mr-date').on('change', function () {

        let animalsResultsSorted = [];
        animals.cows.forEach(cow => {
          /* Change back */
          let start = new Date(moment($(this).val()).startOf('month'));
          let end = new Date(moment($(this).val()).endOf('month'));
          /* let start = new Date(moment($(this).val()).subtract(5, 'year').startOf('year'));
          let end = new Date(moment($(this).val()).endOf('year')); */
          let cowTotal = 0;
          let cowCount = 0;
          let lactationNumber;
          cow.milkingResults.forEach(result => {
            const date = new Date(result.date);
            if (start < date && date < end) {
              cowTotal += result.result;
              cowCount++;
              lactationNumber = result.lactationNumber;
            }
          });

          if (cowCount === 0) return;
          animalsResultsSorted.push({
            cow,
            result: parseFloat((cowTotal / cowCount).toFixed(1)),
            lactationNumber
          });
        });

        if (animalsResultsSorted.length === 0) return emptyBlock($('.mp-mr-animals-block'), 'Данные отсутствуют', 'Результаты за данный период отсутствуют');

        removeEmptyBlock($('.mp-mr-animals-block'));

        animalsResultsSorted.sort((a, b) => b.result - a.result);
        $('.mp-mr-animals-block').empty();
        let counter = 1;
        let counterMax = 1;
        $('.mp-mr-animals-block').append('<div class="mp-mr-ab-line mp-mr-ab-line-1"></div>');
        if (animalsResultsSorted.length > 20) {
          $('.mp-mr-animals-block').append('<div class="mp-mr-ab-line mp-mr-ab-line-2"></div>');
          counterMax++;
        }
        if (animalsResultsSorted.length > 30) {
          $('.mp-mr-animals-block').append('<div class="mp-mr-ab-line mp-mr-ab-line-3"></div>');
          counterMax++;
        }

        animalsResultsSorted.forEach(res => {
          $(`.mp-mr-ab-line-${counter}`).append(`

            <div class="mp-mr-ab-item" data-result="${res.result}">
              <div class="mp-mr-ab-item-info">
                <div class="mp-mr-ab-item-info-line"><img src="/img/svgs/hash-straight.svg"/>
                  <p>${res.cow.number}</p>
                </div>
                <div class="mp-mr-ab-item-info-line"> <img src="/img/svgs/tree-structure.svg"/>
                  <p>${res.lactationNumber}</p>
                </div>
              </div>
              <div>${res.result} л.</div>
            </div>
          `)

          if (counter !== counterMax) {
            counter++
          } else {
            counter = 1;
          }
        });

        $('.mp-mr-ab-item').each(function () {
          let result = parseFloat($(this).attr('data-result'));
          if (result >= 16) {
            $(this).css('background-color', `rgb(14, 173, 105, ${result / 20 / 1.15})`);
          } else if (result <= 13) {
            $(this).css('background-color', `rgb(212, 77, 92, ${10 / result / 1.15})`);
          }
        });


      });
      $('#mp-mr-date').trigger('change');
    }
  }

  //////////////////////////
  //////////////////////////
  //////////////////////////
  /* INSEM AND CALV LISTS */
  //////////////////////////
  //////////////////////////
  if (document.querySelector('.herd-mp-list-block-combined')) {

    /* Working with lists */
    $('.herd-mp-list-block-insem').find('.herd-mp-list-line').each(function () {
      if ($(this).attr('data-first') === 'false') {
        const date = new Date($(this).find('.date-format').attr('data-date'));
        $(this).find('.date-format').text(moment(date).format('DD.MM.YYYY'));
        $(this).find('.date').text(moment(date).add(60, 'days').format('DD.MM.YYYY'));
        $(this).find('.day').text(`${Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000)} дн.`);
        $(this).find('.day').attr('data-days', Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000));
      } else {
        const date = new Date($(this).find('.date-format').attr('data-date'));
        $(this).find('.date').text(moment(date).add(18, 'months').format('DD.MM.YYYY'));
        $(this).find('.day').text(`${Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000)} дн.`);
        $(this).find('.day').attr('data-days', Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000));
      }

    });
    $('.herd-mp-list-block-calv').find('.herd-mp-list-line').each(function () {
      const date = new Date($(this).find('.date-format').attr('data-date'));
      $(this).find('.date-format').text(moment(date).format('DD.MM.YYYY'));
      $(this).find('.date').text(moment(date).add(283, 'days').format('DD.MM.YYYY'));
      $(this).find('.day').text(`${Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000)} дн.`);
      $(this).find('.day').attr('data-days', Math.round((date.getTime() - Date.now()) / 24 / 60 / 60 / 1000));
    });

    $('.herd-mp-list-line').each(function () {
      if (parseFloat($(this).find('.day').attr('data-days')) <= 0) {
        $(this).addClass('herd-mp-list-line-red');
        $(this).append(`<div class="herd-mp-list-line-indicator"></div>`)
      } else if (parseFloat($(this).find('.day').attr('data-days')) > 0 && parseFloat($(this).find('.day').attr('data-days')) <= 30) {
        $(this).addClass('herd-mp-list-line-yellow');
        $(this).append(`<div class="herd-mp-list-line-indicator"></div>`)
      }
      let el = $(this);
      let elDays = parseFloat($(this).find('.day').attr('data-days'))
      let shifted = false;

      $(this).parent().find('.herd-mp-list-line').each(function () {
        if (shifted) return;
        if (elDays < parseFloat($(this).find('.day').attr('data-days'))) {
          el.detach()
          $(this).before(el);
          shifted = true;
        }
      });
    });

    $('.herd-mp-list-block-insem').find('.herd-mp-list-line').each(function () {
      if ($('.herd-mp-list-block-insem').find('.herd-mp-list-line').index($(this)) % 2 === 0) {
        $(this).css('background-color', '#e4e4e4')
      }
    });
    $('.herd-mp-list-block-calv').find('.herd-mp-list-line').each(function () {
      if ($('.herd-mp-list-block-calv').find('.herd-mp-list-line').index($(this)) % 2 === 0) {
        $(this).css('background-color', '#e4e4e4')
      }
    });

    $('#table-btns').find('.mp-block-outside-header-btn').on('click', function () {
      $('#table-btns').find('.mp-block-outside-header-btn-active').removeClass('mp-block-outside-header-btn-active');
      $(this).addClass('mp-block-outside-header-btn-active');

      if ($(this).attr('id') === 'insem') {
        $('.herd-mp-list-block-insem').show();
        $('.herd-mp-list-block-calv').hide();
        $('#table-title').text('Ближайшее осеменение')
      } else {
        $('.herd-mp-list-block-calv').show();
        $('.herd-mp-list-block-insem').hide();
        $('#table-title').text('Ближайший отел')
      }

      anime({
        targets: '.herd-mp-list-line-indicator',
        opacity: [
          { value: 1, duration: 500 },
          { value: 0, duration: 1500, delay: 500 }
        ],
        easing: 'easeOutQuint',
        delay: 500
      });
      anime({
        targets: '.herd-mp-list-line-red .herd-mp-list-line-indicator-text',
        color: '#D44D5C',
        easing: 'easeOutQuint',
        duration: 1500,
        delay: 1000
      });
      anime({
        targets: '.herd-mp-list-line-yellow .herd-mp-list-line-indicator-text',
        color: '#f6b91d',
        easing: 'easeOutQuint',
        duration: 1500,
        delay: 1000
      });
    });

    removeloadingBlock($('.herd-mp-list-block-combined'));
    $('#table-btns').find('.mp-block-outside-header-btn-active').trigger('click');
  }
  //////////////////////////
  //////////////////////////
  //////////////////////////
  /* Herd main page graph milking results */
  //////////////////////////
  //////////////////////////
  if (document.querySelector('#mp-results-graph')) {
    removeloadingBlock($('.mp-herd-graph-block'));
    let data = [];
    animals.cows.forEach((animal) => {
      animal.milkingResults.forEach(res => {
        data.push({ result: res.result, date: new Date(res.date), lactationNumber: res.lactationNumber, animal: animal._id, number: animal.number, name: animal.name });
      });
    });
    if (data.length < 5) emptyBlock($('.mp-herd-graph-block'), 'Недостаточно данных', 'Добавьте больше результатов для отображения статистики')

    /* Counting average and total by each month */
    let dataByMonth = [];
    data.forEach(res => {
      if (dataByMonth.length === 0) return dataByMonth.push({ date: new Date(moment(res.date).endOf('month')), results: [res], total: res.result, average: res.result });
      if (dataByMonth.find(resMonth => moment(res.date).isSame(resMonth.date, 'month'))) {
        dataByMonth.find(resMonth => moment(res.date).isSame(resMonth.date, 'month')).results.push(res);
        dataByMonth.find(resMonth => moment(res.date).isSame(resMonth.date, 'month')).total += res.result;
        dataByMonth.find(resMonth => moment(res.date).isSame(resMonth.date, 'month')).average = dataByMonth.find(resMonth => moment(res.date).isSame(resMonth.date, 'month')).total / dataByMonth.find(resMonth => moment(res.date).isSame(resMonth.date, 'month')).results.length;
      } else {
        dataByMonth.push({ date: new Date(moment(res.date).endOf('month')), results: [res], total: res.result, average: res.result });
      }
    });

    /* Counting daily average and total */
    let dataByMonthLactation = [];
    data.forEach(res => {
      if (!res.lactationNumber) return;

      if (dataByMonthLactation.length === 0) return dataByMonthLactation.push({ date: new Date(moment(res.date).endOf('month')), lactations: [{ number: res.lactationNumber, results: [res], total: res.result, average: res.result }] });

      if (dataByMonthLactation.find(resMonth => moment(res.date).isSame(resMonth.date, 'month'))) {
        let el = dataByMonthLactation.find(resMonth => moment(res.date).isSame(resMonth.date, 'month'));

        if (el.lactations.find(lact => lact.number === res.lactationNumber)) {
          el.lactations.find(lact => lact.number === res.lactationNumber).results.push(res);
          el.lactations.find(lact => lact.number === res.lactationNumber).total += res.result;
          el.lactations.find(lact => lact.number === res.lactationNumber).average = el.lactations.find(lact => lact.number === res.lactationNumber).total / el.lactations.find(lact => lact.number === res.lactationNumber).results.length;
        } else {
          el.lactations.push({ number: res.lactationNumber, results: [res], total: res.result, average: res.result })
        }
      } else {
        dataByMonthLactation.push({ date: new Date(moment(res.date).endOf('month')), lactations: [{ number: res.lactationNumber, results: [res], total: res.result, average: res.result }] });
      }

    });

    /* Sorting monthly data by year */
    let dataByMonthAndYear = [];
    dataByMonth.forEach(res => {
      if (dataByMonthAndYear.length === 0) return dataByMonthAndYear.push({ date: new Date(moment(res.date).endOf('year')), results: [res] });

      if (dataByMonthAndYear.find(resMonth => moment(res.date).isSame(resMonth.date, 'year'))) {
        dataByMonthAndYear.find(resMonth => moment(res.date).isSame(resMonth.date, 'year')).results.push(res);
      } else {
        dataByMonthAndYear.push({ date: new Date(moment(res.date).endOf('year')), results: [res] });
      }
    });

    /* Counting top and bottom 10 percent */
    dataByMonth.forEach(data => {
      data.results.sort((a, b) => b.result - a.result);
      let topArr = data.results.slice(0, data.results.length * 0.1)
      data.results.sort((a, b) => a.result - b.result);
      let bottomArr = data.results.slice(0, data.results.length * 0.1)

      data.top10Res = topArr.length === 0 ? undefined : 0;
      topArr.forEach(res => {
        data.top10Res += res.result
        res.top = true;
      });
      data.top10Res = parseFloat((data.top10Res / topArr.length).toFixed(1))

      data.bottom10Res = bottomArr.length === 0 ? undefined : 0;
      bottomArr.forEach(res => {
        data.bottom10Res += res.result
        res.bottom = true;
      });
      data.bottom10Res = parseFloat((data.bottom10Res / topArr.length).toFixed(1))
    });


    dataByMonth.sort((a, b) => a.date - b.date);

    /* console.log('Data by month', dataByMonth);
    console.log('Data by month broke by lactations', dataByMonthLactation);
    console.log('Data by month and year', dataByMonthAndYear); */


    // //////////////////// //
    // //////////////////// //
    // //////////////////// //
    // //////////////////// //
    // WORKING WITH A GRAPH //

    $('#mp-results-graph .mp-hg-btn').on('click', function () {
      $(this).addClass('mp-hg-btn-active');
      $(this).siblings().removeClass('mp-hg-btn-active');
      const graphState = $('#mp-results-graph').find('.graph-btns').find('.mp-hg-btn-active').attr('data-graph') === 'average' ? 'average' : 'total';

      /* Allowing time buttons with 5 and more results */
      $('#mp-results-graph').find('.months-btns').find('.mp-hg-btn').each(function () {
        if ($(this).attr('data-months') === 'all') return;
        let startDate = new Date(moment().subtract(parseFloat($(this).attr('data-months')), 'months'));
        if (dataByMonth.filter(el => el.date >= startDate).length < 5) {
          $(this).addClass('mp-hg-btn-unav')
        } else {
          $(this).removeClass('mp-hg-btn-unav')
        }
      });

      if ($('#mp-results-graph').find('.months-btns').find('.mp-hg-btn-active').length === 0) {
        $('#mp-results-graph').find('.months-btns').find('.mp-hg-btn').not('.mp-hg-btn-unav').first().addClass('mp-hg-btn-active');
      }

      let workingArr
      if ($('#mp-results-graph').find('.months-btns').find('.mp-hg-btn-active').attr('data-months') !== 'all') {
        let startDate = new Date(moment().subtract(parseFloat($('#mp-results-graph').find('.months-btns').find('.mp-hg-btn-active').attr('data-months')), 'months'));
        workingArr = dataByMonth.filter(el => el.date >= startDate);
      } else {
        workingArr = dataByMonth;
      }

      /* Setting max and min */
      let max, min;
      max = 0;
      min = 0;

      workingArr.forEach(el => {
        if (graphState === 'average') {
          if (max < el.average) max = el.average;
          if (min > el.average) min = el.average;
        } else {
          if (max < el.total) max = el.total;
          if (min > el.total) min = el.total;
        }
      });
      max = Math.ceil(max / 10) * 10 * 1.5;

      /* Cleaning previously created graph */
      $('#mp-results-graph').find('.main-column').find('.mp-herd-legend-item').remove();
      $('#mp-results-graph').find('.additional-column').find('.mp-herd-legend-item').remove();

      $('#mp-results-graph').find('.basic-graph-svg').remove()

      /* Adding main SVG */
      const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svg.classList.add('basic-graph-svg')
      $('.mp-herd-graph-container').append(svg);
      svg.style.width = $('.mp-herd-graph-container').width();
      svg.style.height = $('.mp-herd-graph-container').height();

      /* Creating showlines */
      const showLineHor = document.createElementNS("http://www.w3.org/2000/svg", 'line');
      showLineHor.classList.add('basic-graph-show-line')
      showLineHor.setAttribute('id', 'graph-show-line-hor')
      svg.append(showLineHor);

      const showLineVer = document.createElementNS("http://www.w3.org/2000/svg", 'line');
      showLineVer.classList.add('basic-graph-show-line')
      showLineVer.setAttribute('id', 'graph-show-line-ver')
      svg.append(showLineVer);

      /* Creating ticks */
      const tickHor = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      tickHor.classList.add('basic-graph-tick');
      svg.append(tickHor);
      const tickVer = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      tickVer.classList.add('basic-graph-tick-date');
      svg.append(tickVer);

      /* Counting the horizontal gap */
      let horGap = parseFloat($('.mp-herd-graph-container').height()) / 12;

      const workingAreaHeight = Math.round($('.mp-herd-graph-container').height() - horGap * 2);
      const workingAreaWidth = Math.round($('.mp-herd-graph-container').width() - horGap * 2);

      /* Adding horizontal grid lines and ticks */
      for (let i = 11; i >= 1; i--) {
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        gridLine.classList.add('basic-graph-grid-line')
        svg.append(gridLine);
        gridLine.setAttribute('x1', 0)
        gridLine.setAttribute('y1', i * horGap)
        gridLine.setAttribute('x2', parseFloat($('.mp-herd-graph-container').width()))
        gridLine.setAttribute('y2', i * horGap)
      }

      /* Adding the vertical grid lines */
      for (let i = 1; i <= parseFloat($('.mp-herd-graph-container').width()) / horGap; i++) {
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        gridLine.classList.add('basic-graph-grid-line')
        svg.append(gridLine);
        gridLine.setAttribute('x1', i * horGap)
        gridLine.setAttribute('y1', 0)
        gridLine.setAttribute('x2', i * horGap)
        gridLine.setAttribute('y2', parseFloat($('.mp-herd-graph-container').height()))
      }

      /* Adding data */
      let start = workingArr[0].date;
      let end = workingArr[workingArr.length - 1].date;

      let daysSpan = Math.round((end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);

      /* Adding all data dots */

      $('.mp-herd-graph-info-item').remove();

      workingArr.forEach((data, inx, arr) => {
        data.results.sort((a, b) => a.date - b.date);
        data.results.forEach(res => {
          let id = randomstring.generate(10);
          let resDaysSpan = Math.round((res.date.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);
          if (graphState === 'average') {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.classList.add('basic-graph-average-dot')
            if (res.top) circle.classList.add('basic-graph-average-dot-top')
            if (res.bottom) circle.classList.add('basic-graph-average-dot-bottom')
            svg.append(circle);
            circle.setAttribute('cx', horGap + Math.round(workingAreaWidth * (resDaysSpan / (daysSpan / 100) / 100)))
            circle.setAttribute('cy', workingAreaHeight + horGap - Math.round(workingAreaHeight * (res.result / (max / 100) / 100)))
            circle.setAttribute('r', 4);
            circle.setAttribute('data-id', id);
            circle.style.animation = `fadeIn ${Math.floor(Math.random() * (3 - 1 + 1) + 1)}s ease-in`
          }
          let mode = '';
          if (res.top) mode = 'mp-herd-graph-info-item-top';
          if (res.bottom) mode = 'mp-herd-graph-info-item-bottom';
          $('.mp-herd-graph-info-block').append(`
            <div class="mp-herd-graph-info-item ${mode}" data-id="${id}" qt="${moment(res.date).locale('ru').format('DD MMMM, YY')}">
              <div class="mp-herd-graph-info-item-group">
                <div class="mp-herd-graph-info-text">#${res.number}</div>
                <div class="mp-herd-graph-info-sub-text">${res.name ? res.name : ''}</div>
              </div>
              <div class="mp-herd-graph-info-item-group">
                <div class="mp-herd-graph-info-item-label">10%</div>
                <div class="mp-herd-graph-info-text">${res.result}</div>
              </div>
            </div>
          `)

        });
      });


      let circleTimer = 0;
      workingArr.forEach((data, inx, arr) => {
        let currentDaysSpan = Math.round((data.date.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);

        /* Adding data line */
        let path;
        if (inx === 0) {
          path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('basic-graph-point-line');
          path.classList.add('average-graph-data');
          svg.append(path);
          if (graphState === 'average') {
            path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)
          } else {
            path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.total / (max / 100) / 100))}`)
          }
          path.setAttribute('id', `graph-line-average`);
        } else {
          path = document.getElementById(`graph-line-average`);
          if (graphState === 'average') {
            path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)
          } else {
            path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.total / (max / 100) / 100))}`)
          }
        }

        /* Adding data points */
        const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.classList.add('basic-graph-point')
        circle.classList.add('average-graph-data');
        svg.append(circle);
        circle.setAttribute('cx', horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100)))
        if (graphState === 'average') {
          circle.setAttribute('cy', workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100)))
        } else {
          circle.setAttribute('cy', workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.total / (max / 100) / 100)))
        }
        circle.setAttribute('r', 4);
        circle.setAttribute('data-average', data.average);
        circle.setAttribute('data-total', data.total);
        circle.setAttribute('data-results', data.results.length);
        circle.setAttribute('data-date', data.date);

        circle.style.animation = `fadeIn ${circleTimer}s ease-out`
        circleTimer += 0.1;

        /* Adding top and bottom results */
        if (graphState === 'average') {
          if (!isNaN(data.top10Res)) {
            if (!document.getElementById(`graph-line-top`)) {
              path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
              path.classList.add('basic-graph-top-line');
              svg.append(path);
              path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.top10Res / (max / 100) / 100))}`)
              path.setAttribute('id', `graph-line-top`);
            } else {
              path = document.getElementById(`graph-line-top`);
              path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.top10Res / (max / 100) / 100))}`)
            }
          }

          if (!isNaN(data.bottom10Res)) {
            if (!document.getElementById(`graph-line-bottom`)) {
              path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
              path.classList.add('basic-graph-bottom-line');
              svg.append(path);
              path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.bottom10Res / (max / 100) / 100))}`)
              path.setAttribute('id', `graph-line-bottom`);
            } else {
              path = document.getElementById(`graph-line-bottom`);
              path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.bottom10Res / (max / 100) / 100))}`)
            }
          }
        }
      });

      anime({
        targets: '.basic-graph-point-line',
        strokeDashoffset: [2000, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: function (el, i) { return i * 250 },
      });
      anime({
        targets: '.basic-graph-top-line',
        strokeDashoffset: [2000, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: function (el, i) { return i * 250 },
      });
      anime({
        targets: '.basic-graph-bottom-line',
        strokeDashoffset: [2000, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: function (el, i) { return i * 250 },
      });

      /* Adding result point selections */
      $('.basic-graph-average-dot').off();
      $('.basic-graph-average-dot').on('mouseenter', function () {
        const id = $(this).attr('data-id');
        $('.mp-herd-graph-info-item').each(function () {
          if ($(this).attr('data-id') === id) {
            $(this).css('border-color', '#0a0a0a');
            $('.mp-herd-graph-info-block').scrollTop($('.mp-herd-graph-info-item').index($(this)) * 42)
          }
        });
      });
      $('.basic-graph-average-dot').on('mouseleave', function () {
        $('.mp-herd-graph-info-item').css('border-color', '#00000000');
      });

      /* Adding result point selections reverse */
      $('.mp-herd-graph-info-item').on('mouseenter', function () {
        const id = $(this).attr('data-id');
        $(this).css('border-color', '#0a0a0a');
        $('.basic-graph-average-dot').each(function () {
          if ($(this).attr('data-id') !== id) return;

          if ($(this).hasClass('basic-graph-average-dot-top')) return $(this).css('fill', '#0EAD69');

          if ($(this).hasClass('basic-graph-average-dot-bottom')) return $(this).css('fill', '#D44D5C');

          $(this).css('fill', '#0a0a0a');
        });
      });

      $('.mp-herd-graph-info-item').on('mouseleave', function () {
        $(this).css('border-color', '#00000000');
        $('.basic-graph-average-dot').css('fill', '#a2a2a280');
      });

      /* Adding ticks on mousemove */
      $('.mp-herd-graph-container').off()
      $('.mp-herd-graph-container').on('mousemove', '.basic-graph-svg', function ({ clientX, clientY }) {
        let point = svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        point = point.matrixTransform(svg.getScreenCTM().inverse());


        let xStop = false;
        let yStop = false;
        if (point.x < horGap) {
          showLineVer.setAttribute('x1', horGap + 1);
          showLineVer.setAttribute('x2', horGap + 1);
          showLineVer.setAttribute('y1', 0)
          showLineVer.setAttribute('y2', parseFloat($('.mp-herd-graph-container').height()) - horGap)
          xStop = true;
        }
        if (point.y < horGap) {
          showLineHor.setAttribute('y1', horGap + 1);
          showLineHor.setAttribute('y2', horGap + 1);
          showLineHor.setAttribute('x1', horGap);
          showLineHor.setAttribute('x2', parseFloat($('.mp-herd-graph-container').width()));
          yStop = true;
        }
        if (point.x > parseFloat($('.mp-herd-graph-container').width()) - horGap) {
          showLineVer.setAttribute('x1', parseFloat($('.mp-herd-graph-container').width()) - horGap);
          showLineVer.setAttribute('x2', parseFloat($('.mp-herd-graph-container').width()) - horGap);
          showLineVer.setAttribute('y1', 0)
          showLineVer.setAttribute('y2', parseFloat($('.mp-herd-graph-container').height()) - horGap)
          xStop = true;
        }
        if (point.y > parseFloat($('.mp-herd-graph-container').height()) - horGap) {
          showLineHor.setAttribute('y1', parseFloat($('.mp-herd-graph-container').height()) - horGap - 1);
          showLineHor.setAttribute('y2', parseFloat($('.mp-herd-graph-container').height()) - horGap - 1);
          showLineHor.setAttribute('x1', horGap);
          showLineHor.setAttribute('x2', parseFloat($('.mp-herd-graph-container').width()));
          yStop = true;
        }


        if (!yStop) {
          showLineHor.setAttribute('y1', point.y);
          showLineHor.setAttribute('y2', point.y);
          showLineHor.setAttribute('x1', horGap);
          showLineHor.setAttribute('x2', parseFloat($('.mp-herd-graph-container').width()));
        }

        if (!xStop) {
          showLineVer.setAttribute('x1', point.x);
          showLineVer.setAttribute('x2', point.x);
          showLineVer.setAttribute('y1', 0)
          showLineVer.setAttribute('y2', parseFloat($('.mp-herd-graph-container').height()) - horGap)
        }


        tickHor.textContent = Math.round(max - max * ((parseFloat(showLineHor.getAttribute('y1')) - horGap) / (workingAreaHeight / 100) / 100));
        tickHor.setAttribute('x', 10)
        tickHor.setAttribute('y', parseFloat(showLineHor.getAttribute('y1')) + 4)

        tickVer.textContent = moment(start).add(Math.round(daysSpan * ((parseFloat(showLineVer.getAttribute('x1')) - horGap) / (workingAreaWidth / 100) / 100)), 'day').lang('ru').format('DD MMMM, YY')
        tickVer.setAttribute('x', parseFloat(showLineVer.getAttribute('x1')))
        tickVer.setAttribute('y', $('.mp-herd-graph-container').height() - 10)

      });

      $('.mp-herd-graph-container').on('mouseleave', '.basic-graph-svg', function () {
        showLineVer.setAttribute('x1', 0);
        showLineVer.setAttribute('x2', 0);
        showLineVer.setAttribute('y1', 0);
        showLineVer.setAttribute('y2', 0);
        showLineHor.setAttribute('x1', 0);
        showLineHor.setAttribute('x2', 0);
        showLineHor.setAttribute('y1', 0);
        showLineHor.setAttribute('y2', 0);
        tickHor.textContent = '';
        tickVer.textContent = '';
      });

      /* Adding tooltips on mouse hover */
      $('.basic-graph-point').off()
      $('.basic-graph-point').on('mouseenter', function ({ clientX, clientY }) {
        $('.mp-graph-tooltip').css('height', workingAreaHeight - 30);

        if (parseFloat($(this).attr('cx')) + 20 + $('.mp-graph-tooltip').width() < $('.mp-herd-graph-container').width()) {
          $('.mp-graph-tooltip').css({ 'top': horGap, 'left': parseFloat($(this).attr('cx')) + 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(0%)' })
        } else {
          $('.mp-graph-tooltip').css({ 'top': horGap, 'left': parseFloat($(this).attr('cx')) - 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(-100%)' })
        }

        $('.mp-graph-tooltip').empty();
        if (graphState === 'average') {
          $('.mp-graph-tooltip').append(`
            <div class="mp-graph-tooltip-res">${parseFloat($(this).attr('data-average')).toFixed(1)}</div>
            <div class="mp-graph-tooltip-title">Средний результат</div>
            <div class="mp-graph-tooltip-gap"></div>
            <div class="mp-graph-tooltip-sub-res">${Math.round(parseFloat($(this).attr('data-total')))}</div>
            <div class="mp-graph-tooltip-title">Всего молока</div>
            <div class="mp-graph-tooltip-sub-res">${parseFloat($(this).attr('data-results'))}</div>
            <div class="mp-graph-tooltip-title">Кол-во результатов</div>
            <div class="mp-graph-tooltip-date">${moment($(this).attr('data-date')).lang('ru').format('MMMM, YYYY').toUpperCase()}</div>
          `)
        } else {
          $('.mp-graph-tooltip').append(`
            <div class="mp-graph-tooltip-res">${Math.round(parseFloat($(this).attr('data-total')))} </div>
            <div class="mp-graph-tooltip-title">Всего молока</div>
            <div class="mp-graph-tooltip-gap"></div>
            <div class="mp-graph-tooltip-sub-res">${parseFloat($(this).attr('data-average')).toFixed(1)}</div>
            <div class="mp-graph-tooltip-title">Средний результат </div>
            <div class="mp-graph-tooltip-sub-res">${parseFloat($(this).attr('data-results'))}</div>
            <div class="mp-graph-tooltip-title">Кол-во результатов</div>
            <div class="mp-graph-tooltip-date">${moment($(this).attr('data-date')).lang('ru').format('MMMM, YYYY').toUpperCase()}</div>
          `)
        }


        $('.mp-graph-tooltip').show();
      });

      $('.basic-graph-point').on('mouseleave', function ({ clientX, clientY }) {
        $('.mp-graph-tooltip').hide();
      });

      /* Making legend work */
      $('.legend-btn').off('click')
      $('.legend-btn').on('click', function () {
        if ($('.mp-herd-legend').css('display') === 'flex') {
          $('.mp-herd-legend').hide()
        } else {
          $('.mp-herd-legend').css('display', 'flex')
        }
      });

      if (graphState === 'average') {
        $('#mp-results-graph').find('.main-column').append(`
          <div class="mp-herd-legend-item" data-rel-element='average-graph-data'>
            <div class="mp-herd-li-mark">
              <div class="mp-herd-li-mark-average"></div>
            </div>
            <div class="mp-herd-li-text">Средний результат</div>
          </div>
        `)
      } else {
        $('#mp-results-graph').find('.main-column').append(`
          <div class="mp-herd-legend-item" data-rel-element='average-graph-data'>
            <div class="mp-herd-li-mark">
              <div class="mp-herd-li-mark-average"></div>
            </div>
            <div class="mp-herd-li-text">Всего молока</div>
          </div>
        `)

      }

      if (graphState === 'average') {
        $('#mp-results-graph').find('.additional-column').append(`
        <div class="mp-herd-legend-item" data-rel-element='basic-graph-average-dot'>
          <div class="mp-herd-li-mark">
            <div class="mp-herd-li-mark-average-dot"></div>
          </div>
          <div class="mp-herd-li-text">Индивидуальный рез.</div>
        </div>
        <div class="mp-herd-legend-item" data-rel-element='basic-graph-top-line'>
          <div class="mp-herd-li-mark">
            <div class="mp-herd-li-mark-top-line"></div>
          </div>
          <div class="mp-herd-li-text">Лучшие 10%</div>
        </div>
        <div class="mp-herd-legend-item" data-rel-element='basic-graph-bottom-line'>
          <div class="mp-herd-li-mark">
            <div class="mp-herd-li-mark-bottom-line"></div>
          </div>
          <div class="mp-herd-li-text">Худшие 10%</div>
        </div>
      `)
      }


      $('.mp-herd-graph-container').off('click')
      $('.mp-herd-graph-container').on('click', '.mp-herd-legend-item', function () {
        if ($(this).hasClass('mp-herd-legend-item-non-click')) return;

        if (!$(this).hasClass('mp-herd-legend-item-off')) {
          $(`.${$(this).attr('data-rel-element')}`).hide();

          $(this).addClass('mp-herd-legend-item-off')
        } else {
          $(`.${$(this).attr('data-rel-element')}`).show();

          $(this).removeClass('mp-herd-legend-item-off')
        }
      });
    });

    $('#mp-results-graph').find('.graph-btns').find('.mp-hg-btn-active').trigger('click');




  }

  //////////////////////////
  //////////////////////////
  //////////////////////////
  /* Herd main page PROJECTION graph */
  //////////////////////////
  //////////////////////////
  //////////////////////////
  if (document.querySelector('#mp-herd-projection-chart')) {


    let projData = await getFarmProjections($('#mp-herd').attr('data-farm-id'), 5);

    let prevProj = JSON.parse(localStorage.getItem('herdProjection'));

    if (!prevProj || projData[0].animals.length === prevProj[0].animals.length) {
      projData = prevProj;
    } else {
      localStorage.setItem('herdProjection', JSON.stringify(projData));
    }

    removeloadingBlock($('.mp-projection-block'));
    const projDataFormat = [];

    projData.forEach((el, inx, arr) => {
      let animals = { count: 0, change: 0 };
      let cows = { count: 0, change: 0 };
      let bulls = { count: 0, change: 0 };
      let milkingCows = { count: 0, change: 0 };
      let calves = { count: 0, change: 0 };
      let writeOff = { count: 0, change: 0 };


      el.animals.forEach(animal => {
        if (animal.status === 'alive') animals.count++;
        if (animal.status === 'alive' && animal.gender === 'female' && ((new Date(moment().add(el.year, 'year')).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30) > 12) cows.count++;
        if (animal.status === 'alive' && animal.gender === 'male' && ((new Date(moment().add(el.year, 'year')).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30) > 12) bulls.count++;
        if (animal.status === 'alive' && animal.gender === 'female' && animal.lastLact) milkingCows.count++;
        if (animal.status === 'alive' && ((new Date(moment().add(el.year, 'year')).getTime() - new Date(animal.birthDate).getTime()) / 1000 / 60 / 60 / 24 / 30) < 12) calves.count++;
        if (animal.status === 'diseased' && new Date(animal.dateOfDeath) > new Date(moment().add(el.year - 1, 'year')) && new Date(animal.dateOfDeath) < new Date(moment().add(el.year, 'year'))) writeOff.count++;


      });

      projDataFormat.push({
        year: el.year,
        animals,
        cows,
        bulls,
        milkingCows,
        calves,
        writeOff
      });
    });
    if (projDataFormat[0].animals.count < 10) emptyBlock($('.mp-projection-block'), 'Проекция не возможна', 'Добавьте минимум 10 животных чтобы увидеть результат')

    projDataFormat.forEach((el, inx, arr) => {
      let prevYear = inx === 0 ? undefined : arr[inx - 1];
      if (!prevYear) return;

      el.animals.change = el.animals.count - prevYear.animals.count;
      el.cows.change = el.cows.count - prevYear.cows.count;
      el.bulls.change = el.bulls.count - prevYear.bulls.count;
      el.milkingCows.change = el.milkingCows.count - prevYear.milkingCows.count;
      el.calves.change = el.calves.count - prevYear.calves.count;
      el.writeOff.change = el.writeOff.count - prevYear.writeOff.count;
    });

    /* WORKING WITH CHART */
    let maxes = {
      animals: 0,
      cows: 0,
      bulls: 0,
      milkingCows: 0,
      writeOff: 0,
    }
    projDataFormat.forEach(el => {
      if (el.animals.count > maxes.animals) maxes.animals = el.animals.count
      if (el.cows.count > maxes.cows) maxes.cows = el.cows.count
      if (el.bulls.count > maxes.bulls) maxes.bulls = el.bulls.count
      if (el.milkingCows.count > maxes.milkingCows) maxes.milkingCows = el.milkingCows.count
      if (el.writeOff.count > maxes.writeOff) maxes.writeOff = el.writeOff.count
    })

    $('.mp-projection-graph-working-area').on('mouseenter', '.mp-projection-graph-item', function () {
      let change, changeClass;
      if (parseFloat($(this).attr('data-change')) > 0) {
        change = `+${$(this).attr('data-change')}`;
        changeClass = `span-success`;
      } else if (parseFloat($(this).attr('data-change')) < 0) {
        change = `${$(this).attr('data-change')}`;
        changeClass = `span-fail`;
      } else {
        change = `${$(this).attr('data-change')}`;
        changeClass = ``;
      }
      $(`.mp-projection-info-item-active`).find('.mp-projection-info-item-res').text($(this).attr('data-count'));
      $(`.mp-projection-info-item-active`).find('.mp-projection-info-item-title span').text(change).removeClass().addClass(changeClass);

      $(this).find('.mp-projection-graph-item-bar').css('opacity', '1');
      $(this).siblings().find('.mp-projection-graph-item-bar').css('opacity', '0.5');
    });

    $('.mp-projection-graph-working-area').on('mouseleave', '.mp-projection-graph-item', function () {
      $('.mp-projection-graph-item-bar').css('opacity', '1')
    });

    $('.mp-projection-info-item').on('click', function () {
      if ($(this).hasClass('mp-projection-info-item-active')) return;

      $(this).siblings().addClass('mp-projection-info-item-transp').removeClass('mp-projection-info-item-active');
      $(this).removeClass('mp-projection-info-item-transp').addClass('mp-projection-info-item-active');

      const unit = $(this).attr('data-unit');
      $('.mp-projection-info-item-animals').find('.mp-projection-info-item-res').text(projDataFormat.at(-1).animals.count)
      $(`.mp-projection-info-item-animals`).find('.mp-projection-info-item-title span').text(projDataFormat.at(-1).animals.change).removeClass().addClass(projDataFormat.at(-1).animals.change < 0 ? 'span-fail' : 'span-success');
      $('.mp-projection-info-item-cows').find('.mp-projection-info-item-res').text(projDataFormat.at(-1).cows.count)
      $(`.mp-projection-info-item-cows`).find('.mp-projection-info-item-title span').text(projDataFormat.at(-1).cows.change).removeClass().addClass(projDataFormat.at(-1).cows.change < 0 ? 'span-fail' : 'span-success');
      $('.mp-projection-info-item-bulls').find('.mp-projection-info-item-res').text(projDataFormat.at(-1).bulls.count)
      $(`.mp-projection-info-item-bulls`).find('.mp-projection-info-item-title span').text(projDataFormat.at(-1).bulls.change).removeClass().addClass(projDataFormat.at(-1).bulls.change < 0 ? 'span-fail' : 'span-success');
      $('.mp-projection-info-item-milkingCows').find('.mp-projection-info-item-res').text(projDataFormat.at(-1).milkingCows.count)
      $(`.mp-projection-info-item-milkingCows`).find('.mp-projection-info-item-title span').text(projDataFormat.at(-1).milkingCows.change).removeClass().addClass(projDataFormat.at(-1).milkingCows.change < 0 ? 'span-fail' : 'span-success');
      $('.mp-projection-info-item-writeOff').find('.mp-projection-info-item-res').text(projDataFormat.at(-1).writeOff.count)
      $(`.mp-projection-info-item-writeOff`).find('.mp-projection-info-item-title span').text(projDataFormat.at(-1).writeOff.change).removeClass().addClass(projDataFormat.at(-1).writeOff.change < 0 ? 'span-fail' : 'span-success');


      $('.mp-projection-graph-working-area').empty();
      projDataFormat.forEach((year, inx) => {
        if (year.year === 0) return;
        $('.mp-projection-graph-working-area').append(`
        <div class="mp-projection-graph-item" data-count="${year[unit].count}" data-change="${year[unit].change}">
        <div class="mp-projection-graph-item-title">${year.year} г.</div>
        <div class="mp-projection-graph-item-bar">
        <div class="mp-projection-graph-item-bar-inside mp-projection-graph-item-bar-inside-${year.year}"></div>
        </div>
        </div>
        `)

        anime({
          targets: $(`.mp-projection-graph-item-bar-inside-${year.year}`)[0],
          height: `${year[unit].count / (maxes[unit] / 100)}%`,
          easing: 'easeInOutSine',
          duration: 200,
          delay: (year.year - 1) * 100,
        });
      });
      $('.mp-projection-graph-working-area').find('.mp-projection-graph-item').last().trigger('mouseenter');
    });

    $('#mp-herd-projection-chart').on('mouseleave', function () {
      $('.mp-projection-graph-working-area').find('.mp-projection-graph-item').last().trigger('mouseenter');
    })

    $('#detail').on('click', function () {
      if ($(this).text() === 'Подробнее') {
        $(this).text('Скрыть')
        $('.mp-detail-text-block').show();
      } else {
        $(this).text('Подробнее')
        $('.mp-detail-text-block').hide();
      }
    });

    $('.mp-projection-info-item').first().trigger('click');

  }

  //////////////////////////
  //////////////////////////
  //////////////////////////
  /* MILKING QUALITY GRAPH */
  //////////////////////////
  //////////////////////////
  //////////////////////////
  if (document.querySelector('#milk-quality-graph')) {
    /* Info and suggestions about each item */
    $('.mqg-info-btn').on('click', function () {
      if ($(this).find('ion-icon').attr('name') === 'help') {
        $(this).find('ion-icon').attr('name', 'close');
        $('.mqg-info-block').show();
      } else {
        $(this).find('ion-icon').attr('name', 'help');
        $('.mqg-info-block').hide();
      }
    });

    const milkQualitySuggestions = [
      {
        item: 'water',
        name: 'Вода',
        text: 'Вода является основным компонентом молока, ее содержание в коровьем молоке обычно составляет около 87-88%. Оптимальное количество воды в молоке зависит от индивидуальных потребностей и предпочтений каждого человека. Для некоторых людей может быть предпочтительнее молоко с более низким содержанием воды, например, обезжиренное или полужирное молоко, в то время как другие могут предпочитать молоко с более высоким содержанием воды, такое как молоко с высоким содержанием белка или обогащенное витаминами и минералами.'
      },
      {
        item: 'fat',
        name: 'Жиры',
        text: 'Оптимальное количество жира в молоке может варьироваться в зависимости от индивидуальных предпочтений и целей питания. В целом, молоко с низким содержанием жира (около 1-2% жира) может быть более подходящим для людей, следящих за своим весом или уровнем холестерина, в то время как молоко со средним содержанием жира (около 2-3% жира) считается наиболее сбалансированным для большинства людей. Однако, если вы стремитесь к получению определенных питательных веществ, которые содержатся в жире, таком как витамин K2 и конъюгированная линолевая кислота, то вам может подойти молоко с более высоким содержанием жира (3,25-4% жира). В конечном итоге, выбор жирности молока должен основываться на ваших индивидуальных потребностях и целях питания.'
      },
      {
        item: 'dryResidue',
        name: 'Сухой остаток',
        text: 'Сухие вещества молока - это все вещества, которые остаются в молоке после удаления из него воды. Содержание сухих веществ в молоке составляет около 11-12%. Оптимальное количество сухого остатка в молоке зависит от многих факторов, таких как возраст, здоровье и индивидуальные потребности животного. В целом, чем больше сухого остатка в молоке, тем больше в нем питательных веществ и витаминов. Однако слишком высокое содержание сухого остатка может привести к снижению качества молока и его вкусовых свойств.'
      },
      {
        item: 'casein',
        name: 'Казеин',
        text: 'Казеин - это один из основных белков, содержащихся в молоке. Его содержание в коровьем молоке составляет около 2-4%. Оптимальное количество казеина в молоке зависит от потребностей организма и индивидуальных особенностей каждого человека. Некоторые люди могут иметь повышенную чувствительность к казеину или аллергию на него, в этом случае им может быть рекомендовано молоко с низким содержанием казеина или без него вообще. Однако для большинства людей молоко с естественным уровнем казеина является оптимальным выбором.'
      },
      {
        item: 'sugar',
        name: 'Сахар',
        text: 'В молоке содержится небольшое количество сахара, в основном лактозы. Оптимальное количество сахара в молоке зависит от возраста, состояния здоровья и индивидуальных потребностей человека. В целом, молоко с естественным содержанием сахара подходит большинству людей. Однако если у человека есть непереносимость лактозы или аллергия на молоко, то ему может потребоваться молоко без сахара или с пониженным его содержанием.'
      },
      {
        item: 'phosphatides',
        name: 'Фосфатиды',
        text: 'В молоке содержатся различные виды жиров, включая фосфатиды. Оптимальное количество фосфатидов в молоке зависит от множества факторов, включая породу коровы, ее рацион, возраст и состояние здоровья. Обычно содержание фосфатидов в молоке находится в пределах от 0,1 до 0,5%. Однако более точные значения могут быть определены только для конкретного образца молока.'
      },
      {
        item: 'sterols',
        name: 'Стерины',
        text: 'В молоке содержатся стерины, которые являются одной из форм холестерина. Оптимальное количество стеринов в молоке зависит от индивидуальных потребностей человека и может варьироваться. В среднем, содержание стеринов в коровьем молоке составляет около 0,5-1%. Однако, если у человека есть заболевания, связанные с холестерином, ему может потребоваться молоко с более низким содержанием стеринов.'
      },
      {
        item: 'albumen',
        name: 'Альбумин',
        text: 'Альбумин - это белок, который содержится в молоке. Оптимальное количество альбумина в молоке зависит от многих факторов, включая здоровье коровы, ее питание и генетику. Обычно содержание альбумина в коровьем молоке колеблется 0,02-0,04%. Для людей с аллергией на альбумин может быть полезно молоко с более низким содержанием альбумина. Однако для большинства людей молоко с естественным уровнем альбумина является оптимальным выбором.'
      },
      {
        item: 'otherProteins',
        name: 'Другие белки',
        text: 'В молоке содержатся различные белки, включая казеин, альбумин и глобулин. Оптимальное количество белков в молоке зависит от индивидуальных потребностей человека и его целей. В целом, молоко с естественным содержанием белков подходит большинству людей. Однако, если у человека есть аллергия на определенные белки, ему может потребоваться молоко, которое было обработано для удаления этих аллергенов.'
      },
      {
        item: 'nonProteinCompounds',
        name: 'Небелковые соединения',
        text: 'В молоке содержится множество небелковых соединений, включая жиры, углеводы, витамины, минералы и другие вещества. Оптимальное количество этих соединений зависит от индивидуальных потребностей и целей человека. Для людей, стремящихся к снижению веса или контролю уровня холестерина, нежирное молоко (с низким содержанием жиров) может быть оптимальным выбором. Для тех, кто нуждается в определенных питательных веществах, таких как витамин K2 или конъюгированная линолевая кислота, может быть предпочтительным молоко с более высоким содержанием жиров. Для большинства людей подходит молоко со средним содержанием жиров, так как оно является наиболее сбалансированным по питательным веществам.'
      },
      {
        item: 'saltsOfInorganicAcids',
        name: 'Соли неорганических кислот',
        text: 'В молоке содержатся соли неорганических кислот, такие как фосфаты, хлориды, сульфаты и другие. Оптимальное количество солей в молоке зависит от породы коровы, ее рациона, возраста и состояния здоровья. Обычно содержание солей в молоке находится в пределах нормы и не требует коррекции. Однако, если у человека есть заболевание, связанное с нарушением солевого обмена, ему может потребоваться молоко с пониженным содержанием солей.'
      },
      {
        item: 'ash',
        name: 'Зола',
        text: 'Зола - это остаток, который образуется после сжигания молока. Она содержит минеральные вещества, такие как кальций, фосфор, магний, калий, натрий, хлор и другие. Количество золы в молоке зависит от содержания минеральных веществ в исходном сырье и может колебаться в довольно широких пределах. Однако, обычно содержание золы в коровьем молоке находится в диапазоне 0.5-1.5%. Для большинства людей молоко с естественным содержанием золы является оптимальным выбором, однако, если у вас есть особые потребности в минеральных веществах, вы можете выбрать молоко с повышенным содержанием определенных минералов.'
      },
      {
        item: 'pigments',
        name: 'Пигменты',
        text: 'В молоке содержатся пигменты, которые придают ему определенный цвет. Оптимальное количество пигментов в молоке зависит от многих факторов, включая породу коровы, её рацион и условия содержания. Обычно молоко имеет белый или слегка желтоватый цвет, и содержание пигментов в нем не превышает нескольких микрограммов на литр. Если вы хотите получить молоко с более интенсивным цветом, можно выбрать молоко от коров, которые пасутся на полях с большим количеством цветущих растений. Однако следует помнить, что слишком большое количество пигментов может негативно сказаться на вкусе и качестве молока.'
      },
    ]


    /* Get the milking quality data */
    const records = await getMilkQuality();
    removeloadingBlock($('.milk-quality-graph-container'));
    if (records.length === 0) emptyBlock($('.milk-quality-graph-container'), 'Недостаточно данных', 'Информация появится когда будет добавленно больше данных')

    if (records.length > 0) {

      records.sort((a, b) => new Date(b.date) - new Date(a.date));

      $('#water').find('.milk-quality-info-res').text(`${records[0].water ? records[0].water : '-'}%`)
      $('#fat').find('.milk-quality-info-res').text(`${records[0].fat ? records[0].fat : '-'}%`)
      $('#dryResidue').find('.milk-quality-info-res').text(`${records[0].dryResidue ? records[0].dryResidue : '-'}%`)
      $('#casein').find('.milk-quality-info-res').text(`${records[0].casein ? records[0].casein : '-'}%`)
      $('#sugar').find('.milk-quality-info-res').text(`${records[0].sugar ? records[0].sugar : '-'}%`)
      $('#phosphatides').find('.milk-quality-info-res').text(`${records[0].phosphatides ? records[0].phosphatides : '-'}%`)
      $('#sterols').find('.milk-quality-info-res').text(`${records[0].sterols ? records[0].sterols : '-'}%`)
      $('#albumen').find('.milk-quality-info-res').text(`${records[0].albumen ? records[0].albumen : '-'}%`)
      $('#otherProteins').find('.milk-quality-info-res').text(`${records[0].otherProteins ? records[0].otherProteins : '-'}%`)
      $('#nonProteinCompounds').find('.milk-quality-info-res').text(`${records[0].nonProteinCompounds ? records[0].nonProteinCompounds : '-'}%`)
      $('#saltsOfInorganicAcids').find('.milk-quality-info-res').text(`${records[0].saltsOfInorganicAcids ? records[0].saltsOfInorganicAcids : '-'}%`)
      $('#ash').find('.milk-quality-info-res').text(`${records[0].ash ? records[0].ash : '-'}%`)
      $('#pigments').find('.milk-quality-info-res').text(`${records[0].pigments ? records[0].pigments : '-'}%`)

      /* Making an event for parameter change */
      $('.milk-quality-info-item').on('click', function () {
        let item = $(this).attr('id');
        milkQualitySuggestions.forEach(sug => {
          if (sug.item !== item) return;

          $('.mqg-info-title').text(sug.name);
          $('.mqg-info-text').text(sug.text);
        });

        if ($(this).hasClass('milk-quality-info-item-active')) return;
        removeEmptyBlock($('#milk-quality-graph'))

        $('.milk-quality-info-item-active').removeClass('milk-quality-info-item-active');
        $(this).addClass('milk-quality-info-item-active');

        const component = $(this).attr('id');

        let hide = true;

        let max = 0;
        let min = 50;
        records.forEach(el => {
          if (max < el[component]) max = el[component];
          if (min > el[component]) min = el[component];

          if (el[component]) hide = false
        });
        max = Math.ceil(max / 10) * 10;

        if (hide) return emptyBlock($('#milk-quality-graph'), 'Недостаточно данных', 'Данные этого компонента отсутствуют')

        $('#milk-quality-graph').find('.basic-graph-svg').remove()

        /* Adding main SVG */
        const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svg.classList.add('basic-graph-svg')
        $('#milk-quality-graph').append(svg);
        svg.style.height = '400px';
        let expandedWidth = 0;
        records.forEach(rec => {
          if (rec[component] !== null) {
            expandedWidth += 200
          }
        });
        svg.style.width = $('#milk-quality-graph').width() > expandedWidth ? $('#milk-quality-graph').width() : expandedWidth;
        /* Counting the horizontal gap */
        let horGap = parseFloat($('#milk-quality-graph').height()) / 12;

        const workingAreaHeight = Math.round($('#milk-quality-graph').height() - horGap * 2);
        const workingAreaWidth = Math.round($('#milk-quality-graph').find('.basic-graph-svg').width() - horGap * 2);

        /* Adding horizontal grid lines and ticks */
        for (let i = 11; i >= 1; i--) {
          const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
          gridLine.classList.add('basic-graph-grid-line')
          svg.append(gridLine);
          gridLine.setAttribute('x1', 0)
          gridLine.setAttribute('y1', i * horGap)
          gridLine.setAttribute('x2', parseFloat($('#milk-quality-graph').find('.basic-graph-svg').width()))
          gridLine.setAttribute('y2', i * horGap)
        }

        /* Adding the vertical grid lines */
        for (let i = 1; i <= parseFloat($('#milk-quality-graph').find('.basic-graph-svg').width()) / horGap; i++) {
          const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
          gridLine.classList.add('basic-graph-grid-line')
          svg.append(gridLine);
          gridLine.setAttribute('x1', i * horGap)
          gridLine.setAttribute('y1', 0)
          gridLine.setAttribute('x2', i * horGap)
          gridLine.setAttribute('y2', parseFloat($('#milk-quality-graph').height()))
        }

        /* Adding data */



        let timer = 0;
        records.forEach((data, inx, arr) => {

          /* Adding data line */
          let path;
          if (inx === 0) {
            path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path.classList.add('basic-graph-point-line-trans');
            path.classList.add('milking-quality-line');
            svg.append(path);
            path.setAttribute('d', `M ${horGap + ((inx) * 200)} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data[component] / (max / 100) / 100))}`)

            path.setAttribute('id', `milking-quality-line`);
          } else {
            path = document.getElementById(`milking-quality-line`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + ((inx) * 200)} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data[component] / (max / 100) / 100))}`)

          }

          /* Adding DATA text */
          const textTitle = document.createElementNS("http://www.w3.org/2000/svg", 'text');
          textTitle.classList.add('basic-graph-text')
          svg.append(textTitle);
          textTitle.setAttribute('x', horGap + ((inx) * 200))
          textTitle.setAttribute('y', workingAreaHeight + horGap - Math.round(workingAreaHeight * (data[component] / (max / 100) / 100)))
          textTitle.setAttribute('fill', '#fb8d34')
          textTitle.textContent = `${data[component]}%`
          textTitle.setAttribute(`data-number`, inx)

          textTitle.style.animation = `fadeIn ${timer}s ease-out`
          timer += 0.1;

          /* Adding date text */
          const textDate = document.createElementNS("http://www.w3.org/2000/svg", 'text');
          textDate.classList.add('basic-graph-text-date')
          svg.append(textDate);
          textDate.setAttribute('x', horGap + ((inx) * 200))
          textDate.setAttribute('y', workingAreaHeight + (horGap * 2) - Math.round(workingAreaHeight * (data[component] / (max / 100) / 100)))
          textDate.textContent = moment(data.date).lang('ru').format('MMMM DD, YY').charAt(0).toUpperCase() + moment(data.date).lang('ru').format('MMMM DD, YY').slice(1)
          textDate.classList.add(`milking-date-${inx}`)

        });

        anime({
          targets: '.milking-quality-line',
          strokeDashoffset: [2000, 0],
          easing: 'easeInOutSine',
          duration: 1500,
          delay: function (el, i) { return i * 250 },
        });

        $('#milk-quality-graph').off('mouseenter').off('mouseleave');
        $('#milk-quality-graph').on('mouseenter', function () {
          $(`.basic-graph-text-date`).css('opacity', 1);
        });
        $('#milk-quality-graph').on('mouseleave', function () {
          $(`.basic-graph-text-date`).css('opacity', 0);
        });



      });


      $('#fat').trigger('click');
    }
  }
  ///////////////////////
  ///////////////////////
  ///////////////////////
  /* WEIGHT GRAPH */
  ///////////////////////
  ///////////////////////
  ///////////////////////
  if (document.querySelector('#hm-weight-graph')) {
    removeloadingBlock($('#hm-weight-graph'))
    const weightAverage = [];
    const weightCows = [];
    const weightBulls = [];
    const currentWeightData = [];

    animals.animals.forEach((animal) => {
      if (animal.weightResults.length === 0) return;
      /* Prepare adata for current animal weight items */
      animal.weightResults.sort((a, b) => b.date - a.date);
      currentWeightData.push({
        animal,
        currentWeightResult: animal.weightResults[0]
      });

      animal.weightResults.forEach(result => {
        result.animal = animal;
        if (weightAverage.find(el => moment(el.date).isSame(result.date, 'month'))) {
          let res = weightAverage.find(el => moment(el.date).isSame(result.date, 'month'));
          res.results.push(result);
          res.total += result.result;
          res.average = parseFloat((res.total / res.results.length).toFixed(1));
        } else {
          weightAverage.push({
            results: [result],
            total: result.result,
            average: result.result,
            date: new Date(result.date)
          })
        }
      });
    });
    animals.cows.forEach((animal) => {
      if (animal.weightResults.length === 0) return;

      animal.weightResults.forEach(result => {
        if (weightCows.find(el => moment(el.date).isSame(result.date, 'month'))) {
          let res = weightCows.find(el => moment(el.date).isSame(result.date, 'month'));
          res.results.push(result);
          res.total += result.result;
          res.average = parseFloat((res.total / res.results.length).toFixed(1));
        } else {
          weightCows.push({
            results: [result],
            total: result.result,
            average: result.result,
            date: new Date(result.date)
          })
        }
      });
    });
    animals.bulls.forEach((animal) => {
      if (animal.weightResults.length === 0) return;

      animal.weightResults.forEach(result => {
        if (weightBulls.find(el => moment(el.date).isSame(result.date, 'month'))) {
          let res = weightBulls.find(el => moment(el.date).isSame(result.date, 'month'));
          res.results.push(result);
          res.total += result.result;
          res.average = parseFloat((res.total / res.results.length).toFixed(1));
        } else {
          weightBulls.push({
            results: [result],
            total: result.result,
            average: result.result,
            date: new Date(result.date)
          })
        }
      });
    });
    weightAverage.sort((a, b) => a.date - b.date);
    weightCows.sort((a, b) => a.date - b.date);
    weightBulls.sort((a, b) => a.date - b.date);
    ////////////////////////
    ////////////////////////
    ////////////////////////
    /* Current weight results block */
    ////////////////////////
    ////////////////////////
    ////////////////////////
    $('.weight-results-block').empty();
    currentWeightData.forEach(data => {
      $('.weight-results-block').append(`
      <div class="wrb-item-outter ${data.animal.butcherSuggestion ? 'wrb-item-outter-ready' : ''}" rc-title="Списать животное" rc-link='/herd/write-off-animal/${data.animal._id}' qt="Текущий вес на ${moment(data.currentWeightResult.date).locale('ru').format('DD.MM.YYYY')}">
        <div class="wrb-item" >
          <div class="wrb-item-image"> <img src="/img/images/default-cow-image.png"/></div>
          <div class="wrb-item-text">#${data.animal.number}</div>
          <div class="wrb-item-text wrb-item-res">${data.currentWeightResult.result} кг.</div>
        </div>
        ${data.animal.butcherSuggestion ? `<div class="wrb-item-disclaimer">${data.animal.gender === 'male' ? 'Бык готов' : 'Корова готова'} для забоя</div>` : ''}
      </div>
    `);
    });


    ////////////////////////
    ////////////////////////
    ////////////////////////
    /* Working with graph */
    ////////////////////////
    ////////////////////////
    ////////////////////////

    $('#hm-weight-graph .mp-hg-btn').on('click', function () {
      removeloadingBlock($('.weight-graph-block'));
      $(this).addClass('mp-hg-btn-active');
      $(this).siblings().removeClass('mp-hg-btn-active');

      /* Allowing time buttons with 5 and more results */
      $('#hm-weight-graph').find('.months-btns').find('.mp-hg-btn').each(function () {
        if ($(this).attr('data-months') === 'all') return;
        let startDate = new Date(moment().subtract(parseFloat($(this).attr('data-months')), 'months'));
        if (weightAverage.filter(el => el.date >= startDate).length < 5) {
          $(this).addClass('mp-hg-btn-unav')
        } else {
          $(this).removeClass('mp-hg-btn-unav')
        }
      });

      if ($('#hm-weight-graph').find('.months-btns').find('.mp-hg-btn-active').length === 0) {
        $('#hm-weight-graph').find('.months-btns').find('.mp-hg-btn').not('.mp-hg-btn-unav').first().addClass('mp-hg-btn-active');
      }

      let workingArr, workingArrCows, workingArrBulls;
      if ($('#hm-weight-graph').find('.months-btns').find('.mp-hg-btn-active').attr('data-months') !== 'all') {
        let startDate = new Date(moment().subtract(parseFloat($('#hm-weight-graph').find('.months-btns').find('.mp-hg-btn-active').attr('data-months')), 'months'));
        workingArr = weightAverage.filter(el => el.date >= startDate);
        workingArrCows = weightCows.filter(el => el.date >= startDate);
        workingArrBulls = weightBulls.filter(el => el.date >= startDate);
      } else {
        workingArr = weightAverage;
        workingArrCows = weightCows;
        workingArrBulls = weightBulls;
      }

      /* Setting max and min */
      let max, min;
      max = 0;
      min = 0;

      workingArr.forEach(el => {
        if (max < el.average) max = el.average;
        if (min > el.average) min = el.average;

      });
      max = Math.ceil(max / 100) * 100 * 1.5;

      /* Cleaning previously created graph */
      $('#hm-weight-graph').find('.main-column').find('.mp-herd-legend-item').remove();
      $('#hm-weight-graph').find('.additional-column').find('.mp-herd-legend-item').remove();

      $('#hm-weight-graph').find('.basic-graph-svg').remove()

      /* Adding main SVG */
      const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svg.classList.add('basic-graph-svg')
      $('#hm-weight-graph').append(svg);
      svg.style.width = $('#hm-weight-graph').width();
      svg.style.height = '400px';

      /* Creating showlines */
      const showLineHor = document.createElementNS("http://www.w3.org/2000/svg", 'line');
      showLineHor.classList.add('basic-graph-show-line')
      showLineHor.setAttribute('id', 'graph-show-line-hor')
      svg.append(showLineHor);

      const showLineVer = document.createElementNS("http://www.w3.org/2000/svg", 'line');
      showLineVer.classList.add('basic-graph-show-line')
      showLineVer.setAttribute('id', 'graph-show-line-ver')
      svg.append(showLineVer);

      /* Creating ticks */
      const tickHor = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      tickHor.classList.add('basic-graph-tick');
      svg.append(tickHor);
      const tickVer = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      tickVer.classList.add('basic-graph-tick-date');
      svg.append(tickVer);

      /* Counting the horizontal gap */
      let horGap = parseFloat($('#hm-weight-graph').height()) / 12;

      const workingAreaHeight = Math.round($('#hm-weight-graph').height() - horGap * 2);
      const workingAreaWidth = Math.round($('#hm-weight-graph').width() - horGap * 2);

      /* Adding horizontal grid lines and ticks */
      for (let i = 11; i >= 1; i--) {
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        gridLine.classList.add('basic-graph-grid-line')
        svg.append(gridLine);
        gridLine.setAttribute('x1', 0)
        gridLine.setAttribute('y1', i * horGap)
        gridLine.setAttribute('x2', parseFloat($('#hm-weight-graph').width()))
        gridLine.setAttribute('y2', i * horGap)
      }

      /* Adding the vertical grid lines */
      for (let i = 1; i <= parseFloat($('#hm-weight-graph').width()) / horGap; i++) {
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        gridLine.classList.add('basic-graph-grid-line')
        svg.append(gridLine);
        gridLine.setAttribute('x1', i * horGap)
        gridLine.setAttribute('y1', 0)
        gridLine.setAttribute('x2', i * horGap)
        gridLine.setAttribute('y2', parseFloat($('#hm-weight-graph').height()))
      }

      /* Adding data */
      let start = workingArr[0].date;
      let end = workingArr[workingArr.length - 1].date;

      let daysSpan = Math.round((end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);

      /* Adding all data dots */

      workingArr.forEach((data, inx, arr) => {
        data.results.sort((a, b) => a.date - b.date);
        data.results.forEach(res => {
          let id = randomstring.generate(10);
          let resDaysSpan = Math.round((new Date(res.date).getTime() - start.getTime()) / 1000 / 60 / 60 / 24);
          const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
          circle.classList.add('basic-graph-average-dot')
          svg.append(circle);
          circle.setAttribute('cx', horGap + Math.round(workingAreaWidth * (resDaysSpan / (daysSpan / 100) / 100)))
          circle.setAttribute('cy', workingAreaHeight + horGap - Math.round(workingAreaHeight * (res.result / (max / 100) / 100)))
          circle.setAttribute('r', 4);
          circle.setAttribute('data-id', id);
          circle.style.animation = `fadeIn ${Math.floor(Math.random() * (3 - 1 + 1) + 1)}s ease-in`;

        });
      });

      /* Adding male and female lines */
      workingArrCows.forEach((data, inx, arr) => {
        let currentDaysSpan = Math.round((data.date.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);
        /* Adding data line */
        let path;
        if (inx === 0) {
          path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('basic-graph-point-line-female');
          path.classList.add('weight-female-graph-data');
          svg.append(path);
          path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)

          path.setAttribute('id', `weight-graph-line-average-cows`);
        } else {
          path = document.getElementById(`weight-graph-line-average-cows`);
          path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)

        }
      });
      workingArrBulls.forEach((data, inx, arr) => {
        let currentDaysSpan = Math.round((data.date.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);
        /* Adding data line */
        let path;
        if (inx === 0) {
          path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('basic-graph-point-line-male');
          path.classList.add('weight-male-graph-data');
          svg.append(path);
          path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)

          path.setAttribute('id', `weight-graph-line-average-bulls`);
        } else {
          path = document.getElementById(`weight-graph-line-average-bulls`);
          path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)

        }
      });

      /* Adding main line and data */
      let circleTimer = 0;
      workingArr.forEach((data, inx, arr) => {
        let currentDaysSpan = Math.round((data.date.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);

        /* Adding data line */
        let path;
        if (inx === 0) {
          path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('basic-graph-point-line');
          path.classList.add('weight-average-graph-data');
          svg.append(path);
          path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)

          path.setAttribute('id', `weight-graph-line-average`);
        } else {
          path = document.getElementById(`weight-graph-line-average`);
          path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100))}`)

        }

        /* Adding data points */
        const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circle.classList.add('basic-graph-point')
        circle.classList.add('weight-average-graph-data');
        svg.append(circle);
        circle.setAttribute('cx', horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100)))
        circle.setAttribute('cy', workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.average / (max / 100) / 100)))

        circle.setAttribute('r', 4);
        circle.setAttribute('data-average', data.average);
        circle.setAttribute('data-total', data.total);
        circle.setAttribute('data-results', data.results.length);
        circle.setAttribute('data-date', data.date);

        circle.style.animation = `fadeIn ${circleTimer}s ease-out`
        circleTimer += 0.1;

      });

      anime({
        targets: '#weight-graph-line-average',
        strokeDashoffset: [2000, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: function (el, i) { return i * 250 },
      });
      anime({
        targets: '#weight-graph-line-average-cows',
        strokeDashoffset: [2000, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: function (el, i) { return i * 250 },
      });
      anime({
        targets: '#weight-graph-line-average-bulls',
        strokeDashoffset: [2000, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: function (el, i) { return i * 250 },
      });


      /* Adding ticks on mousemove */
      $('#hm-weight-graph').off()
      $('#hm-weight-graph').on('mousemove', '.basic-graph-svg', function ({ clientX, clientY }) {
        let point = svg.createSVGPoint();
        point.x = clientX;
        point.y = clientY;
        point = point.matrixTransform(svg.getScreenCTM().inverse());


        let xStop = false;
        let yStop = false;
        if (point.x < horGap) {
          showLineVer.setAttribute('x1', horGap + 1);
          showLineVer.setAttribute('x2', horGap + 1);
          showLineVer.setAttribute('y1', 0)
          showLineVer.setAttribute('y2', parseFloat($('#hm-weight-graph').height()) - horGap)
          xStop = true;
        }
        if (point.y < horGap) {
          showLineHor.setAttribute('y1', horGap + 1);
          showLineHor.setAttribute('y2', horGap + 1);
          showLineHor.setAttribute('x1', horGap);
          showLineHor.setAttribute('x2', parseFloat($('#hm-weight-graph').width()));
          yStop = true;
        }
        if (point.x > parseFloat($('#hm-weight-graph').width()) - horGap) {
          showLineVer.setAttribute('x1', parseFloat($('#hm-weight-graph').width()) - horGap);
          showLineVer.setAttribute('x2', parseFloat($('#hm-weight-graph').width()) - horGap);
          showLineVer.setAttribute('y1', 0)
          showLineVer.setAttribute('y2', parseFloat($('#hm-weight-graph').height()) - horGap)
          xStop = true;
        }
        if (point.y > parseFloat($('#hm-weight-graph').height()) - horGap) {
          showLineHor.setAttribute('y1', parseFloat($('#hm-weight-graph').height()) - horGap - 1);
          showLineHor.setAttribute('y2', parseFloat($('#hm-weight-graph').height()) - horGap - 1);
          showLineHor.setAttribute('x1', horGap);
          showLineHor.setAttribute('x2', parseFloat($('#hm-weight-graph').width()));
          yStop = true;
        }


        if (!yStop) {
          showLineHor.setAttribute('y1', point.y);
          showLineHor.setAttribute('y2', point.y);
          showLineHor.setAttribute('x1', horGap);
          showLineHor.setAttribute('x2', parseFloat($('#hm-weight-graph').width()));
        }

        if (!xStop) {
          showLineVer.setAttribute('x1', point.x);
          showLineVer.setAttribute('x2', point.x);
          showLineVer.setAttribute('y1', 0)
          showLineVer.setAttribute('y2', parseFloat($('#hm-weight-graph').height()) - horGap)
        }


        tickHor.textContent = Math.round(max - max * ((parseFloat(showLineHor.getAttribute('y1')) - horGap) / (workingAreaHeight / 100) / 100));
        tickHor.setAttribute('x', 10)
        tickHor.setAttribute('y', parseFloat(showLineHor.getAttribute('y1')) + 4)

        tickVer.textContent = moment(start).add(Math.round(daysSpan * ((parseFloat(showLineVer.getAttribute('x1')) - horGap) / (workingAreaWidth / 100) / 100)), 'day').lang('ru').format('DD MMMM, YY')
        tickVer.setAttribute('x', parseFloat(showLineVer.getAttribute('x1')))
        tickVer.setAttribute('y', $('#hm-weight-graph').height() - 10)

      });

      $('#hm-weight-graph').on('mouseleave', '.basic-graph-svg', function () {
        showLineVer.setAttribute('x1', 0);
        showLineVer.setAttribute('x2', 0);
        showLineVer.setAttribute('y1', 0);
        showLineVer.setAttribute('y2', 0);
        showLineHor.setAttribute('x1', 0);
        showLineHor.setAttribute('x2', 0);
        showLineHor.setAttribute('y1', 0);
        showLineHor.setAttribute('y2', 0);
        tickHor.textContent = '';
        tickVer.textContent = '';
      });

      /* Adding tooltips on mouse hover */
      $('.basic-graph-point').off()
      $('.basic-graph-point').on('mouseenter', function ({ clientX, clientY }) {
        $('.mp-graph-tooltip').css('height', workingAreaHeight - 30);

        if (parseFloat($(this).attr('cx')) + 20 + $('.mp-graph-tooltip').width() < $('#hm-weight-graph').width()) {
          $('.mp-graph-tooltip').css({ 'top': horGap, 'left': parseFloat($(this).attr('cx')) + 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(0%)' })
        } else {
          $('.mp-graph-tooltip').css({ 'top': horGap, 'left': parseFloat($(this).attr('cx')) - 20, 'border-color': $(this).css('stroke'), 'transform': 'translate(-100%)' })
        }

        $('.mp-graph-tooltip').empty();
        $('.mp-graph-tooltip').append(`
            <div class="mp-graph-tooltip-res">${parseFloat($(this).attr('data-average'))}</div>
            <div class="mp-graph-tooltip-title">Средний результат</div>
            <div class="mp-graph-tooltip-gap"></div>
            <div class="mp-graph-tooltip-sub-res">${parseFloat($(this).attr('data-results'))}</div>
            <div class="mp-graph-tooltip-title">Кол-во результатов</div>
            <div class="mp-graph-tooltip-date">${moment($(this).attr('data-date')).lang('ru').format('MMMM, YYYY').toUpperCase()}</div>
          `)


        $('.mp-graph-tooltip').show();
      });

      $('.basic-graph-point').on('mouseleave', function ({ clientX, clientY }) {
        $('.mp-graph-tooltip').hide();
      });

      /* Making legend work */
      $('.legend-btn').off('click')
      $('.legend-btn').on('click', function () {
        if ($('.mp-herd-legend').css('display') === 'flex') {
          $('.mp-herd-legend').hide()
        } else {
          $('.mp-herd-legend').css('display', 'flex')
        }
      });


      $('#hm-weight-graph').find('.main-column').append(`
          <div class="mp-herd-legend-item" data-rel-element='weight-average-graph-data'>
            <div class="mp-herd-li-mark">
              <div class="mp-herd-li-mark-average"></div>
            </div>
            <div class="mp-herd-li-text">Средний результат</div>
          </div>
        `)

      $('#hm-weight-graph').find('.additional-column').append(`
        <div class="mp-herd-legend-item" data-rel-element='basic-graph-average-dot'>
          <div class="mp-herd-li-mark">
            <div class="mp-herd-li-mark-average-dot"></div>
          </div>
          <div class="mp-herd-li-text">Индивидуальный рез.</div>
        </div>
        <div class="mp-herd-legend-item" data-rel-element='weight-female-graph-data'>
          <div class="mp-herd-li-mark">
            <div class="mp-herd-li-mark-female-line"></div>
          </div>
          <div class="mp-herd-li-text">Коровы</div>
        </div>
        <div class="mp-herd-legend-item" data-rel-element='weight-male-graph-data'>
          <div class="mp-herd-li-mark">
            <div class="mp-herd-li-mark-male-line"></div>
          </div>
          <div class="mp-herd-li-text">Быки</div>
        </div>
      `)


      $('#hm-weight-graph').off('click')
      $('#hm-weight-graph').on('click', '.mp-herd-legend-item', function () {
        if ($(this).hasClass('mp-herd-legend-item-non-click')) return;

        if (!$(this).hasClass('mp-herd-legend-item-off')) {
          $(`.${$(this).attr('data-rel-element')}`).hide();

          $(this).addClass('mp-herd-legend-item-off')
        } else {
          $(`.${$(this).attr('data-rel-element')}`).show();

          $(this).removeClass('mp-herd-legend-item-off')
        }
      });
    });

    if (weightAverage.length < 5) {
      emptyBlock($('.weight-graph-block'), 'Недостаточно данных', 'Информация появится когда будет добавлено больше данных');
      removeloadingBlock($('.weight-graph-block'));
    } else {
      $('#hm-weight-graph').find('.months-btns').find('.mp-hg-btn-trig').trigger('click');
    }

  }

  ///////////////////////
  ///////////////////////
  ///////////////////////
  /* SLAUGHTER BLOCK */
  ///////////////////////
  ///////////////////////
  ///////////////////////
  if (document.querySelector('.herd-slaughter-block')) {
    const slaughterData = [];
    animals.animals.forEach(animal => {
      if (animal.status !== 'alive') return;

      let monthReadyIn;
      if (animal.gender === 'male') {
        monthReadyIn = Math.round((new Date(moment(animal.birthDate).add(2, 'year')).getTime() - Date.now()) / 1000 / 60 / 60 / 24 / 30);
      } else {
        monthReadyIn = Math.round((new Date(moment(animal.birthDate).add(6, 'year')).getTime() - Date.now()) / 1000 / 60 / 60 / 24 / 30);
      }
      monthReadyIn = monthReadyIn < 0 ? 0 : monthReadyIn;

      if (animal.gender === 'female') {
        if (!slaughterData.find(data => data.readyIn === monthReadyIn)) {
          slaughterData.push({
            readyIn: monthReadyIn,
            cows: [animal],
            bulls: []
          })
        } else {
          slaughterData.find(data => data.readyIn === monthReadyIn).cows.push(animal);
        }
      }
      if (animal.gender === 'male') {
        if (!slaughterData.find(data => data.readyIn === monthReadyIn)) {
          slaughterData.push({
            readyIn: monthReadyIn,
            cows: [],
            bulls: [animal]
          })
        } else {
          slaughterData.find(data => data.readyIn === monthReadyIn).bulls.push(animal);
        }
      }
    });

    slaughterData.sort((a, b) => a.readyIn - b.readyIn);

    removeloadingBlock($('.herd-slaughter-block'));
    $('.sb-container').empty();
    slaughterData.forEach(data => {
      let monthTextFormat;
      let cond2 = ['2', '3', '4'];
      let cond3 = ['5', '6', '7', '8', '9', '0'];
      if (data.readyIn.toString().split('').at(-1) === '1') {
        monthTextFormat = 'МЕСЯЦ'
      } else if (cond2.some(cond => data.readyIn.toString().split('').at(-1).includes(cond))) {
        monthTextFormat = 'МЕСЯЦА'
      } else if (cond3.some(cond => data.readyIn.toString().split('').at(-1).includes(cond))) {
        monthTextFormat = 'МЕСЯЦЕВ'
      }

      $('.sb-container').append(`
        <div class="sb-item ${data.readyIn === 0 ? 'sb-item-ready' : ''}">
        ${data.cows.length > 0 ? `<div class="sb-item-top">
        <div class="b-text">${data.cows.length}</div>
        <div class="s-text">${data.readyIn > 0 ? 'КОРОВ БУДУТ ГОТОВЫ ДЛЯ ЗАБОЯ ЧЕРЕЗ' : 'КОРОВ ГОТОВЫ ДЛЯ ЗАБОЯ'} </div><img src="/img/icons/herd-cow.png"/>
      </div>` : ''}
        ${data.bulls.length > 0 ? `<div class="sb-item-top">
        <div class="b-text">${data.bulls.length}</div>
        <div class="s-text">${data.readyIn > 0 ? 'БЫКОВ БУДУТ ГОТОВЫ ДЛЯ ЗАБОЯ ЧЕРЕЗ' : 'БЫКОВ ГОТОВЫ ДЛЯ ЗАБОЯ'} </div><img src="/img/icons/herd-bull.png"/>
      </div>` : ''}
          ${data.readyIn === 0 ? `
          <div class="sb-item-bottom">
            <a class="sb-list-btn" href="/herd/all-animals/?filter=slaughter">СПИСОК </a>
          </div>
          ` : `
          <div class="sb-item-bottom">
            <div class="b-text">${data.readyIn}</div>
            <div class="s-text">${monthTextFormat} </div>
          </div>
          `}
          
        </div>
      `);
    });

  }



  ///////////////////////
  /* HERD LIST MILKING RESULTS */
  ///////////////////////
  if (document.querySelector('#list-milking-resultss-container')) {
    $('.ail-small-lact').each(function () {
      let start = moment($(this).attr('data-start-date')).locale('ru').format('DD.MM.YY');
      let finish = $(this).attr('data-finish-exist') === 'true' ? moment($(this).attr('data-finish-date')).locale('ru').format('DD.MM.YY') : '...';

      $(this).attr('qt', `${start} - ${finish}`);
    });

    $('#search').on('keyup change', function () {
      let value = $(this).val();

      if (value.length > 0) {
        $('.ai-list-item').each(function () {
          let container = $('.ai-box-list');
          let name = $(this).find('.ail-item-name').text().toLowerCase();
          let number = $(this).find('.ail-item-number').text().toLowerCase();

          if (name.includes(value.toLowerCase()) || number.includes(value.toLowerCase())) {
            $(this).detach().prependTo(container);
          }
        });
      }
    });

    $('#date').on('keyup change', function () {
      let date = new Date($(this).val());

      $('.ail-small-lact').each(function () {
        $(this).removeClass('ail-small-lact-active')
        if (new Date($(this).attr('data-start-date')) < date && date < new Date($(this).attr('data-finish-date'))) {
          $(this).addClass('ail-small-lact-active');
        }
      });

      $('.ai-list-item').each(function () {
        if ($(this).find('.ail-small-lact-active').length === 0) {
          $(this).addClass('ai-list-item-unav');
        } else {
          $(this).removeClass('ai-list-item-unav');
        }
      });
    });

    $('#date').trigger('change');

    $('*').on('click change keyup mouseenter', function () {
      $('.ai-list-item').each(function () {
        if ($(this).find('.ail-small-lact-active').length > 0 && $(this).find('.result').val().length > 0) {
          $(this).addClass('ai-list-item-valid')
          if ($(this).find('.ai-input-marker-s').length === 0) {
            $(this).append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }
        } else {
          $(this).removeClass('ai-list-item-valid')
          $(this).find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $(this).find('.ai-input-marker-s').remove() }, 800)
        }
      });

      if ($('.ai-list-item-valid').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input-submit-btn').on('click', function () {
      let doneAnimals = 0;

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      let subId = randomstring.generate(12);

      $('.ai-list-item-valid').each(async function () {
        let date = new Date($('#date').val());
        let result = parseFloat($(this).find('.result').val());
        let lactationNumber = parseFloat($(this).find('.ail-small-lact-active').attr('data-number'));
        let animalId = $(this).attr('data-id');
        let note = $(this).find('.note').val();

        const response = await addAnimalResults('milking-results', animalId, { date, lactationNumber, result, note, subId });

        if (response) doneAnimals++;

        if (doneAnimals === $('.ai-list-item-valid').length) {
          /* addConfirmationEmpty($('.animal-results-window')); */
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    });
  }

  ///////////////////////
  /* HERD LIST INSEMINATIONS */
  ///////////////////////
  if (document.querySelector('#list-inseminations-container')) {
    $('.ail-input-select').on('click', function () {
      if ($(this).attr('data-state') !== 'hide') {
        $('.ail-select-box').hide();
        $('.ail-input-select').attr('data-state', 'show');
        $('.ai-select-line').each(function () { anime({ targets: $(this)[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint' }); })

        $(this).parent().find('.ail-select-box').show();
        anime({ targets: $(this).parent().find('.ai-select-line')[0], width: ['80%'], opacity: 0, easing: 'easeOutQuint' });

        $(this).attr('data-state', 'hide');
      } else {
        $(this).parent().find('.ail-select-box').hide();
        anime({ targets: $(this).parent().find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint' });

        $(this).attr('data-state', 'show');
      }
    });
    $('.ail-input-select').on('keyup', function () {
      $('.ail-select-box').hide();
      $('.ail-input-select').attr('data-state', 'show');
      $('.ai-select-line').each(function () { anime({ targets: $(this)[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint' }); })

      $(this).parent().find('.ail-select-box').show();
      anime({ targets: $(this).parent().find('.ai-select-line')[0], width: ['80%'], opacity: 0, easing: 'easeOutQuint' });

      $(this).attr('data-state', 'hide');

      let value = $(this).val();
      let container = $(this).parent().find('.ail-select-box');
      if (value.length > 0) {
        $(this).parent().find('.ail-select-item').each(function () {
          if ($(this).text().includes(value)) {
            $(this).detach().prependTo(container);
          }
        });
      }
    });

    $('.ail-select-item').on('click', function () {
      $(this).parent().find('.ail-select-item-active').removeClass('ail-select-item-active');
      $(this).addClass('ail-select-item-active');

      $(this).parent().parent().find('.ail-input-select').val($(this).text());

      $(this).parent().hide();
      anime({ targets: $(this).parent().parent().find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint' });

      $(this).parent().parent().find('.ail-input-select').attr('data-state', 'show');
    });

    $('*').on('click change keyup mouseenter', function () {
      $('.ai-list-item').each(function () {
        if ($(this).find('.date').val() !== '') {
          $(this).addClass('ai-list-item-valid')
          if ($(this).find('.ai-input-marker-s').length === 0) {
            $(this).append(`
            <div class="ai-input-marker ai-input-marker-s animate__animated animate__flipInY">
            <ion-icon name="checkmark-sharp"></ion-icon>
            </div>`)
          }
        } else {
          $(this).removeClass('ai-list-item-valid')
          $(this).find('.ai-input-marker-s').removeClass('animate__animated animate__flipInY').addClass('animate__animated animate__flipOutY animate__fast')
          setTimeout(() => { $(this).find('.ai-input-marker-s').remove() }, 800)
        }
      });

      if ($('.ai-list-item-valid').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });



    $('.ai-input-submit-btn').on('click', function () {
      let doneAnimals = 0;

      $(this).empty();
      $(this).append(`<div class="mini-loader"></div>`);
      anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

      let subId = randomstring.generate(12);

      $('.ai-list-item-valid').each(async function () {
        let date = new Date($(this).find('.date').val());
        let success = $(this).find('.success').find('.ail-select-item-active').attr('data-val');
        let type = $(this).find('.type').find('.ail-select-item-active').attr('data-val');
        const bull = $(this).find('.bull').find('.ail-select-item-active').attr('data-val');
        let animalId = $(this).attr('data-id');

        const response = await addAnimalResults('insemination', animalId, { date, success, bull, type });

        if (response) doneAnimals++;

        if (doneAnimals === $('.ai-list-item-valid').length) {
          /* addConfirmationEmpty($('.animal-results-window')); */
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    });

  }

  ///////////////////////
  /* WRITE OFF ONE ANIMAL */
  ///////////////////////
  if (document.querySelector('#write-off-container')) {
    /* Adding multiple animals */
    $('#multiple-animals').find('.ai-select-item').on('click', function () {
      $(this).addClass('ai-select-item-unvail');
      $('.ai-selected-animals-block').append(`
        <div class="ai-selected-animals-item" data-id="${$(this).attr('data-id')}">${$(this).find('.ai-select-name').text()}
          <div class="ai-selected-animals-remove"> 
            <ion-icon name="close"></ion-icon>
          </div>
        </div>
      `)
      if ($('.ai-selected-animals-block').css('display') === 'none') {
        $('.ai-selected-animals-block').css({ 'display': 'block', 'opacity': '0' });
        anime({ targets: $('.ai-selected-animals-block')[0], opacity: 1, easing: 'easeInOutQuad', duration: 500 })
      }
    });

    $('.ai-selected-animals-block').on('click', '.ai-selected-animals-remove', function () {
      const id = $(this).parent().attr('data-id');
      $('#multiple-animals').find('.ai-select-item').each(function () { if ($(this).attr('data-id') === id) $(this).removeClass('ai-select-item-unvail') });
      $(this).parent().remove();

      if ($('.ai-selected-animals-block').find('.ai-selected-animals-item').length === 0) {
        $('.ai-selected-animals-block').hide();
      }
    });

    /* Showing a sub reason block */
    $('#reason').find('.ai-pick').on('click', function () {
      if ($('#reason').find('.ai-pick-active').attr('id') === 'sold') {
        $('#sub-reason-sold').css('display', 'flex');
        $('#client').css('display', 'flex');
      } else {
        $('#sub-reason-sold').hide();
        $('#client').hide();
      }
    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('#reason').find('.ai-pick-active').length > 0 && $('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    $('.ai-input-submit-btn').click(async function () {
      if (document.querySelector('.ai-selected-animals-block')) {
        let doneAnimals = 0;

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        $('#multiple-animals-container').find('.ai-selected-animals-item').each(async function () {
          let animalId = $(this).attr('data-id');
          let writeOffReason = $('#reason').find('.ai-pick-active').attr('id');
          let writeOffSubReason = undefined;
          if (writeOffReason === 'sold') {
            writeOffSubReason = $('#sub-reason-sold').find('.ai-pick-active').attr('id');

          }
          let writeOffDate = new Date($('#date').val());
          let writeOffNote = $('#note').val() === '' ? undefined : $('#note').val();
          let client = $('#client').find('.ai-select-item-selected').attr('data-id');

          const response = await writeOffAnimal(animalId, { writeOffReason, writeOffSubReason, writeOffDate, writeOffNote, client });

          if (response) doneAnimals++;

          if (doneAnimals === $('#multiple-animals-container').find('.ai-selected-animals-item').length) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.assign('/herd/all-animals/?filter=all') }, 1500)
          }
        });

      } else {
        let animalId = $(this).attr('data-animal-id');
        let writeOffReason = $('#reason').find('.ai-pick-active').attr('id');
        let writeOffSubReason = undefined;
        if (writeOffReason === 'sold') {
          writeOffSubReason = $('#sub-reason-sold').find('.ai-pick-active').attr('id');

        }
        let writeOffDate = new Date($('#date').val());
        let writeOffNote = $('#note').val() === '' ? undefined : $('#note').val();

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await writeOffAnimal(animalId, { writeOffReason, writeOffSubReason, writeOffDate, writeOffNote });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
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
  /* VET ACTION */
  ///////////////////////
  if (document.querySelector('#vet-action-container') || document.querySelector('#edit-vet-action-container')) {
    /* Adding the dose input */
    $('#add-dose-input').click(function () {
      $(this).parent().hide();
      $('#dose-input').css({ 'display': 'flex', 'opacity': '0' });
      anime({ targets: $('#dose-input')[0], opacity: 1, easing: 'easeInOutQuad', duration: 500 })
    });

    /* Adding multiple animals */
    $('#multiple-animals').find('.ai-select-item').on('click', function () {
      $(this).addClass('ai-select-item-unvail');
      $('.ai-selected-animals-block').append(`
        <div class="ai-selected-animals-item" data-id="${$(this).attr('data-id')}">${$(this).find('.ai-select-name').text()}
          <div class="ai-selected-animals-remove"> 
            <ion-icon name="close"></ion-icon>
          </div>
        </div>
      `)
      if ($('.ai-selected-animals-block').css('display') === 'none') {
        $('.ai-selected-animals-block').css({ 'display': 'block', 'opacity': '0' });
        anime({ targets: $('.ai-selected-animals-block')[0], opacity: 1, easing: 'easeInOutQuad', duration: 500 })
      }
    });

    $('.ai-selected-animals-block').on('click', '.ai-selected-animals-remove', function () {
      const id = $(this).parent().attr('data-id');
      $('#multiple-animals').find('.ai-select-item').each(function () { if ($(this).attr('data-id') === id) $(this).removeClass('ai-select-item-unvail') });
      $(this).parent().remove();

      if ($('.ai-selected-animals-block').find('.ai-selected-animals-item').length === 0) {
        $('.ai-selected-animals-block').hide();
      }
    });

    /* Validating start date */
    $('#date').on('keyup change', async function () {
      if ($(this).hasClass('ai-input-validation')) {
        if ($(this).val() !== '') {

          if (new Date($(this).val()) <= new Date($(this).attr('data-animal-birth'))) {
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
      }


    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('#name').hasClass('ai-valid-input') && $('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-vet-action-container')) {
      $('.ai-input').trigger('keyup')
      $('.ai-textarea').trigger('keyup')
    }


    if (document.querySelector('#vet-action-container')) {
      $('.ai-input-submit-btn').click(async function () {
        if (document.querySelector('.ai-selected-animals-block')) {


          let doneAnimals = 0;

          $(this).empty();
          $(this).append(`<div class="mini-loader"></div>`);
          anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

          let subId = randomstring.generate(12);

          $('#multiple-animals-container').find('.ai-selected-animals-item').each(async function () {
            let animalId = $(this).attr('data-id');
            let name = $('#name').val();
            let date = new Date($('#date').val());
            let note = $('#note').val() === '' ? undefined : $('#note').val();
            let dose;
            if ($('#dose').val().length > 0) {
              dose = {
                amount: parseFloat($('#dose').val()),
                unit: $('#unit').find('.ai-small-select-item-selected').attr('data-val')
              }
            }

            const response = await addVetAction(animalId, { name, date, note, dose, subId });

            if (response) doneAnimals++;

            if (doneAnimals === $('#multiple-animals-container').find('.ai-selected-animals-item').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });

        } else {
          let animalId = $(this).attr('data-animal-id');
          let name = $('#name').val();
          let date = new Date($('#date').val());
          let note = $('#note').val();
          let dose;
          if ($('#dose').val().length > 0) {
            dose = {
              amount: parseFloat($('#dose').val()),
              unit: $('#unit').find('.ai-small-select-item-selected').attr('data-val')
            }
          }

          $(this).empty();
          $(this).append(`<div class="mini-loader"></div>`);
          anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

          const response = await addVetAction(animalId, { name, date, note, dose });

          if (response) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.reload(true); }, 1500)
          }
        }
      })
    } else if (document.querySelector('#edit-vet-action-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let id = $(this).attr('data-action-id');
        let name = $('#name').val();
        let date = new Date($('#date').val());
        let note = $('#note').val();
        let dose;
        if ($('#dose').val().length > 0) {
          dose = {
            amount: parseFloat($('#dose').val()),
            unit: $('#unit').find('.ai-small-select-item-selected').attr('data-val')
          }
        }

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editVetAction(id, { name, date, note, dose });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      })
    }


  }

  ///////////////////////
  /* VET PROBLEM */
  ///////////////////////
  if (document.querySelector('#vet-problem-container') || document.querySelector('#edit-vet-problem-container')) {
    /* Adding multiple animals */
    $('#multiple-animals').find('.ai-select-item').on('click', function () {
      $(this).addClass('ai-select-item-unvail');
      $('.ai-selected-animals-block').append(`
        <div class="ai-selected-animals-item" data-id="${$(this).attr('data-id')}">${$(this).find('.ai-select-name').text()}
          <div class="ai-selected-animals-remove"> 
            <ion-icon name="close"></ion-icon>
          </div>
        </div>
      `)
      if ($('.ai-selected-animals-block').css('display') === 'none') {
        $('.ai-selected-animals-block').css({ 'display': 'block', 'opacity': '0' });
        anime({ targets: $('.ai-selected-animals-block')[0], opacity: 1, easing: 'easeInOutQuad', duration: 500 })
      }
    });

    $('.ai-selected-animals-block').on('click', '.ai-selected-animals-remove', function () {
      const id = $(this).parent().attr('data-id');
      $('#multiple-animals').find('.ai-select-item').each(function () { if ($(this).attr('data-id') === id) $(this).removeClass('ai-select-item-unvail') });
      $(this).parent().remove();

      if ($('.ai-selected-animals-block').find('.ai-selected-animals-item').length === 0) {
        $('.ai-selected-animals-block').hide();
      }
    });

    /* Validating date */
    $('#date').on('keyup change', async function () {
      if ($(this).hasClass('ai-input-validation')) {
        if ($(this).val() !== '') {

          if (new Date($(this).val()) <= new Date($(this).attr('data-animal-birth'))) {
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
      }


    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('#name').hasClass('ai-valid-input') && $('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-vet-problem-container')) {
      $('.ai-input').trigger('keyup')
      $('.ai-textarea').trigger('keyup')
    }

    if (document.querySelector('#vet-problem-container')) {
      $('.ai-input-submit-btn').click(async function () {
        if (document.querySelector('.ai-selected-animals-block')) {


          let doneAnimals = 0;

          $(this).empty();
          $(this).append(`<div class="mini-loader"></div>`);
          anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

          let subId = randomstring.generate(12);

          $('#multiple-animals-container').find('.ai-selected-animals-item').each(async function () {
            let animalId = $(this).attr('data-id');
            let name = $('#name').val();
            let date = new Date($('#date').val());
            let note = $('#note').val() === '' ? undefined : $('#note').val();

            const response = await addVetProblem(animalId, { name, date, note, subId });

            if (response) doneAnimals++;

            if (doneAnimals === $('#multiple-animals-container').find('.ai-selected-animals-item').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });

        } else {
          let animalId = $(this).attr('data-animal-id');
          let name = $('#name').val();
          let date = new Date($('#date').val());
          let note = $('#note').val();

          $(this).empty();
          $(this).append(`<div class="mini-loader"></div>`);
          anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

          const response = await addVetProblem(animalId, { name, date, note });

          if (response) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.reload(true); }, 1500)
          }
        }
      })
    } else if (document.querySelector('#edit-vet-problem-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let id = $(this).attr('data-problem-id');
        let name = $('#name').val();
        let date = new Date($('#date').val());
        let note = $('#note').val();

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editVetProblem(id, { name, date, note });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      })
    }
  }

  ///////////////////////
  /* VET TREATMENT */
  ///////////////////////
  if (document.querySelector('#vet-treatment-container') || document.querySelector('#edit-vet-treatment-container')) {
    /* Adding the dose input */
    $('#add-dose-input').click(function () {
      $(this).parent().hide();
      $('#dose-input').css({ 'display': 'flex', 'opacity': '0' });
      anime({ targets: $('#dose-input')[0], opacity: 1, easing: 'easeInOutQuad', duration: 500 })
    });

    /* Formating date in problem */
    $('#problem-date').text(moment($('#problem-date').attr('data-date')).lang('ru').format('DD MMMM YYYY, hh:mm'))

    /* Showing note in problem */
    $('.ai-problem-block').on('click', function () {
      if ($(this).attr('data-state') === 'show') {
        $(this).find('.ai-problem-detail').show()
        anime({ targets: $(this).find('.ai-select-line')[0], width: ['80%'], opacity: 0, easing: 'easeOutQuint' });

        $(this).attr('data-state', 'hide');
      } else {
        $(this).find('.ai-problem-detail').hide()
        anime({ targets: $(this).find('.ai-select-line')[0], width: ['10%'], opacity: 1, easing: 'easeOutQuint', duration: 200 });

        $(this).attr('data-state', 'show');
      }
    });

    /* Validating date */
    $('#date').on('keyup change', async function () {
      if ($(this).hasClass('ai-input-validation')) {
        if ($(this).val() !== '') {

          if (new Date($(this).val()) <= new Date($(this).attr('data-disease-date'))) {
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
      }
    });

    $('*').on('click change keyup mouseenter', function () {
      if ($('#name').hasClass('ai-valid-input') && $('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-vet-treatment-container')) {
      $('.ai-input').trigger('keyup')
      $('.ai-textarea').trigger('keyup')
      $('.ai-to-pick').trigger('click');
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
    }


    if (document.querySelector('#vet-treatment-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let diseaseId = $(this).attr('data-disease-id');
        let name = $('#name').val();
        let date = new Date($('#date').val());
        let note = $('#note').val();
        let cured = $('#cured').find('.ai-pick-active').attr('id') === 'cured';
        let dose;
        if ($('#dose').val().length > 0) {
          dose = {
            amount: parseFloat($('#dose').val()),
            unit: $('#unit').find('.ai-small-select-item-selected').attr('data-val')
          }
        }


        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addVetTreatment(diseaseId, { name, date, note, dose, cured });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    } else if (document.querySelector('#edit-vet-treatment-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let treatmentId = $(this).attr('data-treatment-id');
        let name = $('#name').val();
        let date = new Date($('#date').val());
        let note = $('#note').val();
        let cured = $('#cured').find('.ai-pick-active').attr('id') === 'cured';
        let dose;
        if ($('#dose').val().length > 0) {
          dose = {
            amount: parseFloat($('#dose').val()),
            unit: $('#unit').find('.ai-small-select-item-selected').attr('data-val')
          }
        }


        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editVetTreatment(treatmentId, { name, date, note, dose, cured });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    }

  }

  ///////////////////////
  /* NEW VET SCHEME */
  ///////////////////////
  if (document.querySelector('#vet-scheme-container') || document.querySelector('#edit-vet-scheme-container')) {
    $('#add-step').on('click', function () {
      const markup = `
      <div class="ai-combined-block" data-step="${parseFloat($('.ai-combined-block').last().attr('data-step')) + 1}">
      <div class="ai-combined-block-title">ШАГ #${parseFloat($('.ai-combined-block').last().attr('data-step')) + 1}</div>
      <div class="ai-combined-block-remove"><ion-icon name="close"></ion-icon></div>
      <div class="ai-input-block ai-input-block-text">
        <div class="ai-input-label">Действие</div>
        <input class="ai-input ai-input-text ai-input-validation name" type="text"/>
      </div>
      <div class="ai-input-block ai-input-block-small-select">
        <div class="ai-input-label">Временной отрезок</div>
        <input class="ai-input ai-input-text ai-input-small-select ai-input-block-triple ai-input-validation step-in" type="number"/>
        <div class="ai-small-select ai-input-block-triple step-unit">
          <p>Дней</p>
          <div class="ai-select-line"></div>
          <div class="ai-small-select-block shadow">
            <div class="ai-small-select-item" data-val="h">Часов</div>
            <div class="ai-small-select-item ai-small-select-item-selected" data-val="d">Дней</div>
          </div>
        </div>
        <div class="ai-small-select ai-input-block-triple step-count">
          <p>От начала</p>
          <div class="ai-select-line"></div>
          <div class="ai-small-select-block shadow">
            <div class="ai-small-select-item ai-small-select-item-selected" data-val="start">От начала</div>
            <div class="ai-small-select-item" data-val="last-point">От пред. действия</div>
          </div>
        </div>
      </div>
    </div>`;

      $(this).before(markup);
    });

    /* Removing scheme step */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-step')) + 1 !== parseFloat($(this).attr('data-step'))) {
          $(this).attr('data-step', parseFloat($(this).prev().attr('data-step')) + 1);
          $(this).find('.ai-combined-block-title').text(`ШАГ #${parseFloat($(this).prev().attr('data-step')) + 1}`)
        }
      });
    });

    /* Validationg from */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).attr('id') === 'ai-combined-block-1' && $(this).find('.name').val().length > 0 || $(this).attr('id') !== 'ai-combined-block-1' && $(this).find('.name').val().length > 0 && $(this).find('.step-in').val().length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });

      if ($('#name').hasClass('ai-valid-input') && $('#ai-combined-block-1').hasClass('ai-combined-block-valid') && $('#ai-combined-block-2').hasClass('ai-combined-block-valid')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-vet-scheme-container')) {
      $('.ai-input').trigger('keyup')
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
    }

    if (document.querySelector('#vet-scheme-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let name = $('#name').val();
        let points = [];
        $('.ai-combined-block').each(function () {
          points.push({
            action: $(this).find('.name').val(),
            firstPoint: points.length === 0 ? true : false,
            scheduledIn: $(this).find('.step-in').val(),
            countFrom: $(this).find('.step-count').find('.ai-small-select-item-selected').attr('data-val'),
            timeUnit: $(this).find('.step-unit').find('.ai-small-select-item-selected').attr('data-val')
          });
        });

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addVetScheme({ name, points });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    } else if (document.querySelector('#edit-vet-scheme-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let schemeId = $(this).attr('data-scheme-id');
        let name = $('#name').val();
        let points = [];
        $('.ai-combined-block').each(function () {
          points.push({
            action: $(this).find('.name').val(),
            firstPoint: points.length === 0 ? true : false,
            scheduledIn: $(this).find('.step-in').val(),
            countFrom: $(this).find('.step-count').find('.ai-small-select-item-selected').attr('data-val'),
            timeUnit: $(this).find('.step-unit').find('.ai-small-select-item-selected').attr('data-val')
          });
        });

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editVetScheme(schemeId, { name, points });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    }


  }


  ///////////////////////
  /* START A SCHEME */
  ///////////////////////
  if (document.querySelector('#vet-start-scheme-container') || document.querySelector('#edit-vet-start-scheme-container')) {
    /* Adding multiple animals */
    $('#multiple-animals').find('.ai-select-item').on('click', function () {
      $(this).addClass('ai-select-item-unvail');
      $('.ai-selected-animals-block').append(`
        <div class="ai-selected-animals-item" data-id="${$(this).attr('data-id')}">${$(this).find('.ai-select-name').text()}
          <div class="ai-selected-animals-remove"> 
            <ion-icon name="close"></ion-icon>
          </div>
        </div>
      `)
      if ($('.ai-selected-animals-block').css('display') === 'none') {
        $('.ai-selected-animals-block').css({ 'display': 'block', 'opacity': '0' });
        anime({ targets: $('.ai-selected-animals-block')[0], opacity: 1, easing: 'easeInOutQuad', duration: 500 })
      }
    });

    $('.ai-selected-animals-block').on('click', '.ai-selected-animals-remove', function () {
      const id = $(this).parent().attr('data-id');
      $('#multiple-animals').find('.ai-select-item').each(function () { if ($(this).attr('data-id') === id) $(this).removeClass('ai-select-item-unvail') });
      $(this).parent().remove();

      if ($('.ai-selected-animals-block').find('.ai-selected-animals-item').length === 0) {
        $('.ai-selected-animals-block').hide();
      }
    });

    /* Validating date */
    $('#date').on('keyup change', async function () {
      if ($(this).hasClass('ai-input-validation')) {
        if ($(this).val() !== '') {

          if (new Date($(this).val()) <= new Date($(this).attr('data-animal-birth'))) {
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
      }
    });

    $('*').on('click change keyup mouseenter', function () {
      if (document.querySelector('#multiple-animals-container')) {
        if ($('#date').hasClass('ai-valid-input') && $('#scheme').find('.ai-select-item-selected').length > 0 && $('#multiple-animals-container').find('.ai-selected-animals-item').length > 0) {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
        } else {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
        }
      } else {
        if ($('#date').hasClass('ai-valid-input') && $('#scheme').find('.ai-select-item-selected').length > 0) {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
        } else {
          $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
        }
      }

    });

    if (document.querySelector('#edit-vet-start-scheme-container')) {
      $('.ai-input').trigger('keyup')
      $('.ai-select-item-selected').trigger('click').trigger('click');
    }

    if (document.querySelector('#vet-start-scheme-container')) {
      $('.ai-input-submit-btn').on('click', async function () {
        if (document.querySelector('#multiple-animals-container')) {
          $(this).empty();
          $(this).append(`<div class="mini-loader"></div>`);
          anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });
          let counter = 0;
          $('#multiple-animals-container').find('.ai-selected-animals-item').each(async function () {
            let date = new Date($('#date').val());
            let schemeId = $('#scheme').find('.ai-select-item-selected').attr('data-id');
            let animalId = $(this).attr('data-id');

            const response = await startVetScheme(animalId, schemeId, date);;

            if (response) {
              counter++;
            }
            if (counter === $('#multiple-animals-container').find('.ai-selected-animals-item').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });
        } else {
          let date = new Date($('#date').val());
          let schemeId = $('#scheme').find('.ai-select-item-selected').attr('data-id');
          let animalId = $(this).attr('data-animal-id');

          $(this).empty();
          $(this).append(`<div class="mini-loader"></div>`);
          anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

          const response = await startVetScheme(animalId, schemeId, date);;

          if (response) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.reload(true); }, 1500)
          }
        }
      });
    } else if (document.querySelector('#edit-vet-start-scheme-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let date = new Date($('#date').val());
        let schemeId = $('#scheme').find('.ai-select-item-selected').attr('data-id');
        let firstSchemeActionId = $(this).attr('data-action-id');

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editStartedVetScheme(firstSchemeActionId, schemeId, date);

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    }

  };

  ///////////////////////
  /* VET MAIN PAGE*/
  ///////////////////////
  if (document.querySelector('#mp-vet-container')) {
    /* Formating dates */
    $('.format-date').each(function () {
      let date = moment($(this).attr('data-date')).lang('ru').format('MMM DD')
      $(this).text(date.charAt(0).toUpperCase() + date.slice(1))
    });

    /* Insem statistic sliding */
    setInterval(() => {
      const current = $('.vis-count-block-inner-active');
      let next;
      if (current.attr('data-last') === 'false') {
        next = current.next();
      } else {
        next = $('.vis-count-block-inner').first();
      }
      current.addClass(`animate__animated animate__slideOutLeft`);
      setTimeout(() => {
        current.css('display', 'none')
        next.addClass(`animate__animated animate__slideInRight`).css('display', 'flex');
        current.removeClass('vis-count-block-inner-active')
        next.addClass('vis-count-block-inner-active')
        current.removeClass('animate__animated animate__slideInRight animate__slideOutLeft')
      }, 500)
    }, 5000)

    /* Working with scheme container */
    $('.scheme-list').find('.vlc-item').on('click', async function () {
      loadingBlock($('.vet-scheme-dropdown-block'));
      const scheme = await getStartedScheme($(this).attr('data-id'));
      if (scheme) {
        removeloadingBlock($('.vet-scheme-dropdown-block'));
      } else {
        emptyBlock($('.vet-scheme-dropdown-block'), 'Схема не найдена', 'Попробуйте позже')
      }

      $('#scheme-title').text(scheme.scheme.name);
      $('#scheme-animal').text(`#${scheme.animal.number}`);
      $('#scheme-animal').attr('href', `/herd/animal-card/${scheme.animal._id}`);
      $('#scheme-date').text(moment(scheme.date).lang('ru').format('MMMM DD, YYYY').charAt(0).toUpperCase() + moment(scheme.date).lang('ru').format('MMMM DD, YYYY').slice(1));
      $('#scheme-edit').attr('href', `/vet/edit-started-scheme/${scheme._id}`)


      $('.vsd-items-container').empty();
      $('.vsd-items-container').append(`
        <div class="vsd-item">
          <div class="vsd-item-body">
            <div class="vsd-item-body-name">${scheme.name}</div>
            <div class="vsd-item-body-date">${moment(scheme.date).lang('ru').format('MMMM DD, YYYY').charAt(0).toUpperCase() + moment(scheme.date).lang('ru').format('MMMM DD, YYYY').slice(1)} </div>
          </div>
          <div class="vsd-item-number vsd-item-number-past">1</div>
        </div>
      `);

      scheme.otherPoints.forEach((point) => {
        $('.vsd-items-container').append(`
          <div class="vsd-item">
            <div class="vsd-item-body">
              <div class="vsd-item-body-name">${point.name}</div>
              <div class="vsd-item-body-date">${moment(point.date).lang('ru').format('MMMM DD, YYYY').charAt(0).toUpperCase() + moment(point.date).lang('ru').format('MMMM DD, YYYY').slice(1)} </div>
            </div>
            <div class="vsd-item-number ${new Date(point.date) < new Date ? 'vsd-item-number-past' : ''}">${scheme.otherPoints.indexOf(point) + 2}</div>
          </div>
        `);

      });

      $('.vsd-item').each(function () {
        if ($(this).prev().length === 0) return;

        if ($(this).prev().find('.vsd-item-number').hasClass('vsd-item-number-past') && !$(this).find('.vsd-item-number').hasClass('vsd-item-number-past')) $(this).find('.vsd-item-number').addClass('vsd-item-number-current')
      });
    });

    $('.scheme-list').find('.vlc-item').first().trigger('click');


    /* Showing detailed block on problem click */
    $('.problems-container').find('.vlc-item').on('click', async function () {
      const problem = await getVetProblem($(this).attr('data-id'));

      $('body').prepend(`
        <div class="detailed-info-window">
          <div class="detailed-info-block">
            <div class="dib-header">
              <img class="dib-header-image" src="/img/images/default-cow-image.png"/>
              <div class="dib-header-body"> 
                <div class="dib-header-upper">
                  <div class="dib-header-text-big">#${problem.animal.number}</div>
                  <div class="dib-header-text-big">${problem.animal.name ? problem.animal.name : ''}</div>
                  <a class="dib-edit-btn" href="/herd/animal-card/${problem.animal._id}">Карта</a>
                </div>
                <div class="dib-header-lower"></div>
              </div>
              <div class="dib-close"> <i class="ph ph-x"></i></div>
            </div>
            <div class="dib-body dib-body-with-btn"> 
              <div class="dib-body-title">${problem.name}</div>
              <div class="dib-body-text">${problem.note ? problem.note : ''}</div>
              ${problem.treatments.length > 0 ? '<div class="dib-body-container-devider"></div>' : ''}
              ${problem.treatments.length > 0 ? '<div class="dib-body-container-text">Лечения: </div>' : ''}
              
              
        
            </div><a class="dib-big-btn dib-big-btn-vet" href="/vet/add-treatment/${problem._id}">Добавить лечение</a>
            <div class="dib-footer">
              <div class="dib-footer-date">${moment(problem.date).lang('ru').format('MMMM DD, YYYY').charAt(0).toUpperCase() + moment(problem.date).lang('ru').format('MMMM DD, YYYY').slice(1)}</div>
              <a class="dib-footer-edit" href="/vet/edit-problem/${problem._id}">Редактировать</a>
            </div>
          </div>
        </div>
      `)

      problem.treatments.forEach(treat => {
        $('.dib-body').append(`
          <div class="dib-body-container-line">
            <div class="dib-line-indi ${treat.cured ? 'dib-line-indi-pos' : 'dib-line-indi-neg'}"></div>
            <div class="dib-line-text">${treat.name}</div><a class="dib-line-edit" href="/vet/edit-treatment/${treat._id}">Редактировать</a>
          </div>
        `)
      });
    });


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

  if (document.querySelector('#dist-client-container') || document.querySelector('#edit-dist-client-container')) {
    /* Validation phone number */
    $('#phone-number').on('keyup change', async function () {
      if ($(this).hasClass('ai-input-validation')) {
        if ($(this).val().length > 0) {

          if ($(this).val().length !== 10) {
            $(this).parent().find('.ai-input-marker-s').remove();
            if ($(this).parent().find('.ai-input-marker-f').length === 0) {
              $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
            }

            if ($(this).parent().find('.ai-warning-text').length === 0) {
              $(this).parent().append(`<div class="ai-warning-text">Номер телефона должен содержать 10 цифр</div>`)
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
      }
    });


    /* Validating email */
    $('#email').on('keyup change', async function () {
      if ($(this).hasClass('ai-input-validation')) {
        if ($(this).val().length > 0) {

          if (!validator.isEmail($(this).val())) {
            $(this).parent().find('.ai-input-marker-s').remove();
            if ($(this).parent().find('.ai-input-marker-f').length === 0) {
              $(this).parent().append(`
          <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
            <ion-icon name="close-sharp"></ion-icon>
          </div>`)
            }

            if ($(this).parent().find('.ai-warning-text').length === 0) {
              $(this).parent().append(`<div class="ai-warning-text">Введите действительную электронную почту</div>`)
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
      }
    });

    /* Preventing double selection */
    $('body').on('click', '.ai-select-item', function () {
      let selectedOption = $(this);
      $('.ai-select-item').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-value') === selectedOption.attr('data-value')) {
          $(this).addClass('ai-select-item-unvail');
        } else if ($(this).attr('data-value') === selectedOption.parent().attr('data-value')) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });
    });

    /* Adding new product inputs */
    $('#add-product-input').on('click', function () {
      let number = $('.ai-combined-block').length + 1;
      $(this).parent().before(`
      <div class="ai-combined-block" data-product="${number}">
        <div class="ai-combined-block-title">ПРОДУКТ #${number}</div>
        <div class="ai-combined-block-remove">
          <ion-icon name="close"></ion-icon>
        </div>
        <div class="ai-input-block ai-input-block-text">
          <div class="ai-input-label">Наименование продукта</div>
          <input class="ai-input ai-input-select ai-input-validation" type="text" placeholder="Выберите продукт"/>
          <div class="ai-select-block shadow ai-input-validation product">
            <div class="ai-select-item" data-value="milk">
              <p class="ai-select-name">Молоко</p>
            </div>
            <div class="ai-select-item" data-value="meat">
              <p class="ai-select-name">Мясо</p>
            </div>
            <div class="ai-select-item" data-value="cottage-cheese">
              <p class="ai-select-name">Творог</p>
            </div>
            <div class="ai-select-item" data-value="cheese">
              <p class="ai-select-name">Сыр</p>
            </div>
            <div class="ai-select-item" data-value="butter">
              <p class="ai-select-name">Масло</p>
            </div>
            <div class="ai-select-item" data-value="whey">
              <p class="ai-select-name">Сыворотка</p>
            </div>
            <div class="ai-select-item" data-value="cream">
              <p class="ai-select-name">Сливки</p>
            </div>
            <div class="ai-select-item" data-value="sour-cream">
              <p class="ai-select-name">Сметана</p>
            </div>
          </div>
        </div>
        <div class="ai-input-block ai-input-block-small-select">
          <div class="ai-input-label">Цена</div>
          <div class="ai-input-text-wraper">
            <input class="ai-input ai-input-text ai-input-small-select ai-input-validation price" type="number"/>
            <div class="ai-inside-text">₽</div>
          </div>
          <div class="ai-small-select unit">
            <p>л.</p>
            <div class="ai-select-line"></div>
            <div class="ai-small-select-block shadow">
              <div class="ai-small-select-item" data-val="kg">кг.</div>
              <div class="ai-small-select-item ai-small-select-item-selected" data-val="l">л.</div>
            </div>
          </div>
        </div>
      </div>
      `)

      $('.ai-select-item-selected').trigger('click').trigger('click');
    });

    /* Removing product */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      let product = $(this).parent().find('.ai-select-item-selected').attr('data-value');
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-product')) + 1 !== parseFloat($(this).attr('data-product'))) {
          $(this).attr('data-product', parseFloat($(this).prev().attr('data-product')) + 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #${parseFloat($(this).prev().attr('data-product')) + 1}`)
        } else if ($(this).prev() && !$(this).prev().hasClass('ai-combined-block')) {
          $(this).attr('data-product', 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #1`)
        }
      });

      $('.ai-select-item').each(function () {
        if (product && $(this).attr('data-value') === product) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });
    });


    /* Validation from */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).find('.price').val().length > 0 && $(this).find('.product').find('.ai-select-item-selected').length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });

      if ($('#name').hasClass('ai-valid-input') && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-dist-client-container')) {
      $('.ai-input').trigger('keyup')
      $('.ai-textarea').trigger('keyup')
      $('.ai-select-item-selected').trigger('click').trigger('click');
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
    }

    if (document.querySelector('#dist-client-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let name = $('#name').val();
        let adress = $('#adress').val();
        let phoneNumber = $('#phone-number').val();
        let phoneNumberCode = $('#phone-number-code').val();
        let email = $('#email').val();
        let note = $('#note').val();
        let products = [];
        $('.ai-combined-block-valid').each(function () {
          products.push({
            productName: $(this).find('.ai-select-item-selected').attr('data-value'),
            pricePer: parseFloat($(this).find('.price').val()),
            unit: $(this).find('.ai-small-select-item-selected').attr('data-val')
          });
        });

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addClient({ name, adress, phoneNumber, phoneNumberCode, email, note, products });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    } else if (document.querySelector('#edit-dist-client-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let clientId = $(this).attr('data-client-id');
        let name = $('#name').val();
        let adress = $('#adress').val();
        let phoneNumber = $('#phone-number').val();
        let phoneNumberCode = $('#phone-number-code').val();
        let email = $('#email').val();
        let note = $('#note').val();
        let products = [];
        $('.ai-combined-block-valid').each(function () {
          products.push({
            productName: $(this).find('.ai-select-item-selected').attr('data-value'),
            pricePer: parseFloat($(this).find('.price').val()),
            unit: $(this).find('.ai-small-select-item-selected').attr('data-val')
          });
        });

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editClient(clientId, { name, adress, phoneNumber, phoneNumberCode, email, note, products });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    }

  }

  ///////////////////////
  /* BOTH ADD/EDIT RAW PRODUCT PAGE*/
  ///////////////////////

  if (document.querySelector('#dist-raw-product-container') || document.querySelector('#edit-dist-raw-product-container')) {
    /* Switch between types */
    $('.ai-switch-btn').on('click', function () {
      $('#size').parent().find('.ai-input-label').text($('.ai-switch-btn-active').attr('id') === 'milk' ? 'Объем' : 'Вес')
      $('#size').parent().find('.ai-inside-text').text($('.ai-switch-btn-active').attr('id') === 'milk' ? 'л.' : 'кг.')
      $('#size').attr('data-unit', $('.ai-switch-btn-active').attr('id') === 'milk' ? 'l' : 'kg')
    });

    $('*').on('click keyup focus blur change', function () {
      if ($('#size').hasClass('ai-valid-input') && $('#date').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-dist-raw-product-container')) {
      $('.ai-input').trigger('keyup');
      $('.ai-switch-btn-to-pick').trigger('click').trigger('click');
    }

    if (document.querySelector('#dist-raw-product-container')) {
      $('.ai-input-submit-btn').click(async function () {
        const product = $('.ai-switch-btn-active').attr('id');
        const size = $('#size').val();
        const unit = $('#size').attr('data-unit')
        const date = new Date($('#date').val());
        let note = $('#note').val();

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addProduct({ product, size, unit, date, note });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    } else if (document.querySelector('#edit-dist-raw-product-container')) {
      $('.ai-input-submit-btn').click(async function () {
        const productId = $(this).attr('data-product-id');
        const product = $('.ai-switch-btn-active').attr('id');
        const size = $('#size').val();
        const unit = $('#size').attr('data-unit')
        const date = new Date($('#date').val());
        let note = $('#note').val();

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editProduct(productId, { product, size, unit, date, note });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    }
  }

  ///////////////////////
  /* BOTH ADD/EDIT PROCESS PAGE*/
  ///////////////////////

  if (document.querySelector('#dist-process-container') || document.querySelector('#edit-dist-process-container')) {


    /* Validating size */
    $('#size').on('keyup change', function () {
      let percent = Math.round(parseFloat($(this).val()) / (parseFloat($('.ai-total-product-line-inner').attr('data-total')) / 100));

      $('.ai-total-product-line-inner').stop();
      $('.ai-total-product-line-inner').animate({ 'width': `${percent}%` }, 250);

      if (parseFloat($(this).val()) > parseFloat($('.ai-total-product-line-inner').attr('data-total'))) {
        $(this).parent().find('.ai-input-marker-s').remove();
        if ($(this).parent().find('.ai-input-marker-f').length === 0) {
          $(this).parent().append(`
      <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
        <ion-icon name="close-sharp"></ion-icon>
      </div>`)
        }

        if ($(this).parent().find('.ai-warning-text').length === 0) {
          $(this).parent().append(`<div class="ai-warning-text">Количество не должно превышать общее количество продукта</div>`)
        }

        $('.ai-total-product-line-inner').addClass('ai-total-product-line-invalid');
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

        $('.ai-total-product-line-inner').removeClass('ai-total-product-line-invalid');
        $(this).addClass('ai-valid-input');
      }
    });

    /* Preventing selection of a raw product */
    $('body').on('click', '.product-input', function () {
      $('.ai-select-item').each(function () {
        if ($(this).attr('data-value') === $('.ai-form-container').attr('data-raw')) {
          $(this).addClass('ai-select-item-unvail');
          $(this).hide();
        }
      });
    });

    /* Preventing double selection */
    $('body').on('click', '.ai-select-item', function () {
      let selectedOption = $(this);
      $('.ai-select-item').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-value') === selectedOption.attr('data-value')) {
          $(this).addClass('ai-select-item-unvail');
        } else if ($(this).attr('data-value') === selectedOption.parent().attr('data-value')) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });
    });

    $('#add-product-input').on('click', function () {
      let number = $('.ai-combined-block').length + 1;
      $(this).parent().before(`
      <div class="ai-combined-block ai-combined-block-${number}" data-product="${number}">
        <div class="ai-combined-block-title">ПРОДУКТ #${number}</div>
        <div class="ai-combined-block-remove">
          <ion-icon name="close"></ion-icon>
        </div>
        <div class="ai-input-block ai-input-block-text">
          <div class="ai-input-label">Наименование продукта</div>
          <input class="ai-input ai-input-select ai-input-validation product-input" type="text" placeholder="Выберите продукт"/>
          <div class="ai-select-block shadow ai-input-validation product">
            <div class="ai-select-item" data-value="milk">
              <p class="ai-select-name">Молоко</p>
            </div>
            <div class="ai-select-item" data-value="meat">
              <p class="ai-select-name">Мясо</p>
            </div>
            <div class="ai-select-item" data-value="cottage-cheese">
              <p class="ai-select-name">Творог</p>
            </div>
            <div class="ai-select-item" data-value="cheese">
              <p class="ai-select-name">Сыр</p>
            </div>
            <div class="ai-select-item" data-value="butter">
              <p class="ai-select-name">Масло</p>
            </div>
            <div class="ai-select-item" data-value="whey">
              <p class="ai-select-name">Сыворотка</p>
            </div>
            <div class="ai-select-item" data-value="cream">
              <p class="ai-select-name">Сливки</p>
            </div>
            <div class="ai-select-item" data-value="sour-cream">
              <p class="ai-select-name">Сметана</p>
            </div>
          </div>
        </div>
        <div class="ai-input-block ai-input-block-small-select">
          <div class="ai-input-label">Вес | Объем</div>
          <div class="ai-input-text-wraper">
            <input class="ai-input ai-input-text ai-input-small-select ai-input-validation size" type="number"/>
            <div class="ai-inside-text range-text"></div>
          </div>
          <div class="ai-small-select unit">
            <p>л.</p>
            <div class="ai-select-line"></div>
            <div class="ai-small-select-block shadow">
              <div class="ai-small-select-item" data-val="kg">кг.</div>
              <div class="ai-small-select-item ai-small-select-item-selected" data-val="l">л.</div>
            </div>
          </div>
        </div>
      </div>
      `);

      $('.ai-select-item-selected').trigger('click').trigger('click');
    });

    /* Removing product */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      let product = $(this).parent().find('.ai-select-item-selected').attr('data-value');
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-product')) + 1 !== parseFloat($(this).attr('data-product'))) {
          $(this).attr('data-product', parseFloat($(this).prev().attr('data-product')) + 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #${parseFloat($(this).prev().attr('data-product')) + 1}`)
        } else if ($(this).prev() && !$(this).prev().hasClass('ai-combined-block')) {
          $(this).attr('data-product', 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #1`)
        }
      });

      $('.ai-select-item').each(function () {
        if (product && $(this).attr('data-value') === product) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });
    });

    /* Validation from */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).find('.size').val().length > 0 && $(this).find('.product').find('.ai-select-item-selected').length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });

      if ($('#date').hasClass('ai-valid-input') && $('#size').hasClass('ai-valid-input') && $('.ai-combined-block-valid').length > 0 && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-dist-process-container')) {
      $('.ai-input').trigger('keyup');
      $('.ai-select-item-selected').trigger('click').trigger('click');
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
    }

    if (document.querySelector('#dist-process-container')) {
      $('.ai-input-submit-btn').click(async function () {
        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const size = parseFloat($('#size').val());
        const date = new Date($('#date').val());
        const type = 'decrease';
        const distributionResult = 'processed';
        const unit = $('.ai-form-container').attr('data-unit');
        const product = $('.ai-form-container').attr('data-raw');
        let note = $('#note').val();

        let prod = await addProductReturn({ size, date, type, distributionResult, unit, product, note });

        let subId = randomstring.generate(12);

        if (prod) {
          let counter = 0;
          $('.ai-combined-block-valid').each(async function () {
            let response = await addProduct({
              size: parseFloat($(this).find('.size').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
              product: $(this).find('.ai-select-item-selected').attr('data-value'),
              rawProduct: prod._id,
              subId,
              note
            });

            if (response) counter++;

            if (counter === $('.ai-combined-block-valid').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });
        }
      });
    } else if (document.querySelector('#edit-dist-process-container')) {
      $('.ai-input-submit-btn').click(async function () {
        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });
        const size = parseFloat($('#size').val());
        const date = new Date($('#date').val());
        const type = 'decrease';
        const distributionResult = 'processed';
        const unit = $('.ai-form-container').attr('data-unit');
        const product = $('.ai-form-container').attr('data-raw');
        let note = $('#note').val();
        let id = $(this).attr('data-id');

        let prod = await editProductReturn(id, { size, date, type, distributionResult, unit, product, note });

        let subId = $(this).attr('data-sub-id');

        if (prod) {
          let delRes = await deleteSubIdProducts(subId);
          if (delRes) {
            let counter = 0;
            $('.ai-combined-block-valid').each(async function () {
              let response = await addProduct({
                size: parseFloat($(this).find('.size').val()),
                date: new Date($('#date').val()),
                unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
                product: $(this).find('.ai-select-item-selected').attr('data-value'),
                rawProduct: prod._id,
                subId,
                note
              });

              if (response) counter++;

              if (counter === $('.ai-combined-block-valid').length) {
                addConfirmationEmpty($('.animal-results-window'));
                setTimeout(() => { location.reload(true); }, 1500)
              }
            });
          }
        }

      });
    }
  }

  ///////////////////////
  /* BOTH ADD/EDIT ORDER PAGE*/
  ///////////////////////

  if (document.querySelector('#dist-order-container') || document.querySelector('#edit-dist-order-container')) {

    /* Toggling between once and recurring order */
    $('.ai-switch-btn').on('click', function () {

      if ($(this).attr('id') === 'once') {
        $('#once-date').css('display', 'flex');
        $('#recuring-date').hide();
      } else {
        $('#recuring-date').css('display', 'flex');
        $('#once-date').hide();
      }
    });

    /* Hiding elements if quantity is 0 */
    $('body').on('click', '.product-input', function () {
      $('.ai-select-item').each(function () {
        let selectEl = $(this);
        $('.arc-inventory-data').each(function () {
          if (selectEl.attr('data-value') === $(this).attr('data-product') && $(this).attr('data-quantity') == 0) {
            selectEl.hide();
          }
        });
      });
    });

    /* Preventing double selection */
    $('body').on('click', '.ai-select-item', function () {
      let selectedOption = $(this);
      $('.ai-select-item').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-value') === selectedOption.attr('data-value')) {
          $(this).addClass('ai-select-item-unvail');
        } else if ($(this).attr('data-value') === selectedOption.parent().attr('data-value')) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });

      $('.arc-inventory-data').each(function () {
        if (selectedOption.attr('data-value') === $(this).attr('data-product') && $(this).attr('data-quantity') != 0) {
          selectedOption.parent().parent().parent().find('.range-text').html(`/ ${parseFloat($(this).attr('data-quantity'))/* .toFixed(1) */}`);
          selectedOption.parent().parent().parent().find('.size').attr('data-max', $(this).attr('data-quantity')).trigger('change');
        }
      });
    });

    $('#add-product-input').on('click', function () {
      let number = $('.ai-combined-block').length + 1;
      $(this).parent().before(`
      <div class="ai-combined-block ai-combined-block-${number}" data-product="${number}">
        <div class="ai-combined-block-title">ПРОДУКТ #${number}</div>
        <div class="ai-combined-block-remove">
          <ion-icon name="close"></ion-icon>
        </div>
        <div class="ai-input-block ai-input-block-text">
          <div class="ai-input-label">Наименование продукта</div>
          <input class="ai-input ai-input-select ai-input-validation product-input" type="text" placeholder="Выберите продукт"/>
          <div class="ai-select-block shadow ai-input-validation product">
            <div class="ai-select-item" data-value="milk">
              <p class="ai-select-name">Молоко</p>
            </div>
            <div class="ai-select-item" data-value="meat">
              <p class="ai-select-name">Мясо</p>
            </div>
            <div class="ai-select-item" data-value="cottage-cheese">
              <p class="ai-select-name">Творог</p>
            </div>
            <div class="ai-select-item" data-value="cheese">
              <p class="ai-select-name">Сыр</p>
            </div>
            <div class="ai-select-item" data-value="butter">
              <p class="ai-select-name">Масло</p>
            </div>
            <div class="ai-select-item" data-value="whey">
              <p class="ai-select-name">Сыворотка</p>
            </div>
            <div class="ai-select-item" data-value="cream">
              <p class="ai-select-name">Сливки</p>
            </div>
            <div class="ai-select-item" data-value="sour-cream">
              <p class="ai-select-name">Сметана</p>
            </div>
          </div>
        </div>
        <div class="ai-input-block ai-input-block-small-select">
          <div class="ai-input-label">Вес | Объем</div>
          <div class="ai-input-text-wraper">
            <input class="ai-input ai-input-text ai-input-small-select ai-input-validation size" type="number"/>
            <div class="ai-inside-text range-text"></div>
          </div>
          <div class="ai-small-select unit">
            <p>л.</p>
            <div class="ai-select-line"></div>
            <div class="ai-small-select-block shadow">
              <div class="ai-small-select-item" data-val="kg">кг.</div>
              <div class="ai-small-select-item ai-small-select-item-selected" data-val="l">л.</div>
            </div>
          </div>
        </div>
      </div>
      `);

      $('.ai-select-item-selected').trigger('click').trigger('click');
    });

    /* Removing product */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      let product = $(this).parent().find('.ai-select-item-selected').attr('data-value');
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-product')) + 1 !== parseFloat($(this).attr('data-product'))) {
          $(this).attr('data-product', parseFloat($(this).prev().attr('data-product')) + 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #${parseFloat($(this).prev().attr('data-product')) + 1}`)
        } else if ($(this).prev() && !$(this).prev().hasClass('ai-combined-block')) {
          $(this).attr('data-product', 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #1`)
        }
      });

      $('.ai-select-item').each(function () {
        if (product && $(this).attr('data-value') === product) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });
    });

    /* Validation from */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).find('.size').val().length > 0 && $(this).find('.product').find('.ai-select-item-selected').length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });
      let dateValid = false;
      if ($('#once').hasClass('ai-switch-btn-active') && $('#date').val() !== '' || $('#recuring').hasClass('ai-switch-btn-active') && $('#time').val() !== '') dateValid = true;

      if (dateValid && $('.ai-combined-block-valid').length > 0 && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-dist-order-container')) {
      $('.ai-input').trigger('keyup');
      $('.ai-select-item-selected').trigger('click').trigger('click');
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
      $('.ai-switch-btn-to-active').trigger('click');
    }

    if (document.querySelector('#dist-order-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let note = $('#note').val();
        let subId = randomstring.generate(12);

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });
        let date;
        if ($('#once').hasClass('ai-switch-btn-active')) {
          date = { date: new Date($('#date').val()) };
        } else if ($('#recuring').hasClass('ai-switch-btn-active')) {
          date = {
            recuring: true,
            recuringDay: parseFloat($('#weekday').find('.ai-small-select-item-selected').attr('data-value')),
            recuringTime: $("#time").val(),
          }
        }

        let counter = 0;
        $('.ai-combined-block-valid').each(async function () {
          const response = await addReminder({
            client: $('#client').find('.ai-select-item-selected').attr('data-id'),
            size: parseFloat($(this).find('.size').val()),
            unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
            product: $(this).find('.ai-select-item-selected').attr('data-value'),
            subId,
            note,
            module: 'order',
            ...date
          });

          if (response) counter++;

          if (counter === $('.ai-combined-block-valid').length) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.reload(true); }, 1500)
          }
        });
      });
    } else if (document.querySelector('#edit-dist-order-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let note = $('#note').val();
        let subId = $(this).attr('data-sub-id');

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        let date;
        if ($('#once').hasClass('ai-switch-btn-active')) {
          date = {
            date: new Date($('#date').val()),
            recuring: false,
          };
        } else if ($('#recuring').hasClass('ai-switch-btn-active')) {
          date = {
            recuring: true,
            recuringDay: parseFloat($('#weekday').find('.ai-small-select-item-selected').attr('data-value')),
            recuringTime: $("#time").val(),
          }
        }

        let delRes = await deleteSubIdReminders(subId);
        if (delRes) {
          let counter = 0;
          $('.ai-combined-block-valid').each(async function () {
            let response = await addReminder({
              client: $('#client').find('.ai-select-item-selected').attr('data-id'),
              size: parseFloat($(this).find('.size').val()),
              unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
              product: $(this).find('.ai-select-item-selected').attr('data-value'),
              subId,
              note,
              module: 'order',
              ...date
            });

            if (response) counter++;

            if (counter === $('.ai-combined-block-valid').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });
        }

      });
    }










  }

  ///////////////////////
  /* BOTH ADD/EDIT SALE PAGE*/
  ///////////////////////

  if (document.querySelector('#dist-sale-container') || document.querySelector('#edit-dist-sale-container')) {
    /* Working with prices in each product */
    $('body').on('click change keyup', '.size, .price', function () {
      if ($(this).hasClass('size') && parseFloat($(this).val()) > parseFloat($(this).attr('data-max'))) {
        $(this).val(parseFloat($(this).attr('data-max')).toFixed(1));
      }

      let parent = $(this).parent().parent().parent();
      let size = parseFloat(parent.find('.size').val().length === 0 ? 0 : parent.find('.size').val());
      let price = parseFloat(parent.find('.price').val().length === 0 ? 0 : parent.find('.price').val());
      parent.find('.price-text').text(`= ${Math.round(size * price)}₽`)
      parent.attr('data-total', size * price)
    });

    /* Switching the unit */
    $('body').on('click', '.ai-small-select-item', function () {
      $(this).parent().parent().parent().parent().find('.per-text').text(`₽ / ${$(this).text()}`)
    });

    /* Hiding elements if quantity is 0 */
    $('body').on('click', '.product-input', function () {
      $('.ai-select-item').each(function () {
        let selectEl = $(this);
        $('.arc-inventory-data').each(function () {
          if (selectEl.attr('data-value') === $(this).attr('data-product') && $(this).attr('data-quantity') == 0) {
            selectEl.hide();
          }
        });
      });
    });

    /* Preventing double selection */
    $('body').on('click', '.ai-select-item', function () {
      let selectedOption = $(this);
      $('.ai-select-item').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-value') === selectedOption.attr('data-value')) {
          $(this).addClass('ai-select-item-unvail');
        } else if ($(this).attr('data-value') === selectedOption.parent().attr('data-value')) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });

      $('.arc-inventory-data').each(function () {
        if (selectedOption.attr('data-value') === $(this).attr('data-product') && $(this).attr('data-quantity') != 0) {
          selectedOption.parent().parent().parent().find('.range-text').html(`/ ${parseFloat($(this).attr('data-quantity')).toFixed(1)}`);
          selectedOption.parent().parent().parent().find('.size').attr('data-max', $(this).attr('data-quantity')).trigger('change');
        }
      });
    });

    $('#add-product-input').on('click', function () {
      let number = $('.ai-combined-block').length + 1;
      $(this).parent().before(`
      <div class="ai-combined-block ai-combined-block-${number}" data-product="${number}">
        <div class="ai-combined-block-title">ПРОДУКТ #${number}</div>
        <div class="ai-combined-block-remove">
          <ion-icon name="close"></ion-icon>
        </div>
        <div class="ai-input-block ai-input-block-text">
          <div class="ai-input-label">Наименование продукта</div>
          <input class="ai-input ai-input-select ai-input-validation product-input" type="text" placeholder="Выберите продукт"/>
          <div class="ai-select-block shadow ai-input-validation product">
            <div class="ai-select-item" data-value="milk">
              <p class="ai-select-name">Молоко</p>
            </div>
            <div class="ai-select-item" data-value="meat">
              <p class="ai-select-name">Мясо</p>
            </div>
            <div class="ai-select-item" data-value="cottage-cheese">
              <p class="ai-select-name">Творог</p>
            </div>
            <div class="ai-select-item" data-value="cheese">
              <p class="ai-select-name">Сыр</p>
            </div>
            <div class="ai-select-item" data-value="butter">
              <p class="ai-select-name">Масло</p>
            </div>
            <div class="ai-select-item" data-value="whey">
              <p class="ai-select-name">Сыворотка</p>
            </div>
            <div class="ai-select-item" data-value="cream">
              <p class="ai-select-name">Сливки</p>
            </div>
            <div class="ai-select-item" data-value="sour-cream">
              <p class="ai-select-name">Сметана</p>
            </div>
          </div>
        </div>
        <div class="ai-input-block ai-input-block-small-select">
          <div class="ai-input-label">Вес | Объем</div>
          <div class="ai-input-text-wraper">
            <input class="ai-input ai-input-text ai-input-small-select ai-input-validation size" type="number"/>
            <div class="ai-inside-text range-text"></div>
          </div>
          <div class="ai-small-select unit">
            <p>л.</p>
            <div class="ai-select-line"></div>
            <div class="ai-small-select-block shadow">
              <div class="ai-small-select-item" data-val="kg">кг.</div>
              <div class="ai-small-select-item ai-small-select-item-selected" data-val="l">л.</div>
            </div>
          </div>
        </div>
        <div class="ai-input-block ai-input-block-small-select">
          <div class="ai-input-label">Цена</div>
          <div class="ai-input-text-wraper">
            <input class="ai-input ai-input-text ai-input-small-select ai-input-validation price" type="number"/>
            <div class="ai-inside-text per-text">₽ / л.</div>
          </div>
          <div class="ai-inside-text price-text">= 0₽</div>
        </div>
      </div>
      `);

      $('.ai-select-item-selected').trigger('click').trigger('click');
    });

    /* Removing product */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      let product = $(this).parent().find('.ai-select-item-selected').attr('data-value');
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-product')) + 1 !== parseFloat($(this).attr('data-product'))) {
          $(this).attr('data-product', parseFloat($(this).prev().attr('data-product')) + 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #${parseFloat($(this).prev().attr('data-product')) + 1}`)
        } else if ($(this).prev() && !$(this).prev().hasClass('ai-combined-block')) {
          $(this).attr('data-product', 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #1`)
        }
      });

      $('.ai-select-item').each(function () {
        if (product && $(this).attr('data-value') === product) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });
    });


    /* Pre setting price */
    $('.ai-form-container').on('click', '.ai-select-item', function () {
      let parent = $(this).parent().parent().parent();
      let product = $(this).attr('data-value');
      /* parent.find('.price-input').val(0) */

      if ($('#client').find('.ai-select-item-selected').length > 0) {
        if (parent.find('.price').val().length === 0 || parseFloat(parent.find('.price').val()) === 0) {
          $('#client').find('.ai-select-item-selected').find('.asi-hidden').each(function () {
            if ($(this).attr('data-product') === product) {
              parent.find('.price').val(parseFloat($(this).attr('data-price')))
            }
          });
        }
      }

      parent.find('.price').trigger('click')
    });

    /* Validation from */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).find('.price').val().length > 0 && $(this).find('.size').val().length > 0 && $(this).find('.product').find('.ai-select-item-selected').length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });

      if ($('#date').hasClass('ai-valid-input') && $('.ai-combined-block-valid').length > 0 && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }

      let total = 0;
      $('.ai-combined-block-valid').each(function () {
        total += parseFloat($(this).attr('data-total'));
      });

      $('#total').attr('data-total', total)
      $('#total').text(`${total}₽`)
    });


    if (document.querySelector('#edit-dist-sale-container')) {
      $('.ai-input').trigger('keyup');
      $('.ai-select-item-selected').trigger('click').trigger('click');
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
    }


    if (document.querySelector('#dist-sale-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let note = $('#note').val();
        let subId = randomstring.generate(12);

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        let counter = 0;
        $('.ai-combined-block-valid').each(async function () {
          let response = await addProduct({
            size: parseFloat($(this).find('.size').val()),
            date: new Date($('#date').val()),
            unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
            product: $(this).find('.ai-select-item-selected').attr('data-value'),
            type: 'decrease',
            distributionResult: 'sold',
            pricePer: parseFloat($(this).find('.price').val()),
            price: parseFloat($(this).attr('data-total')),
            client: $('#client').find('.ai-select-item-selected').attr('data-id'),
            subId,
            note
          });

          if (response) counter++;

          if (counter === $('.ai-combined-block-valid').length) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.reload(true); }, 1500)
          }
        });
      });
    } else if (document.querySelector('#edit-dist-sale-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let note = $('#note').val();
        let subId = $(this).attr('data-sale-id');

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        let delRes = await deleteSubIdProducts(subId);
        if (delRes) {
          let counter = 0;
          $('.ai-combined-block-valid').each(async function () {
            let response = await addProduct({
              size: parseFloat($(this).find('.size').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
              product: $(this).find('.ai-select-item-selected').attr('data-value'),
              type: 'decrease',
              distributionResult: 'sold',
              pricePer: parseFloat($(this).find('.price').val()),
              price: parseFloat($(this).attr('data-total')),
              client: $('#client').find('.ai-select-item-selected').attr('data-id'),
              subId,
              note
            });

            if (response) counter++;

            if (counter === $('.ai-combined-block-valid').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });
        }

      });
    }

  }

  ///////////////////////
  /* BOTH ADD/EDIT CONSUMPTION PAGE*/
  ///////////////////////

  if (document.querySelector('#dist-consumption-container') || document.querySelector('#edit-dist-consumption-container')) {

    /* Working with quantity in each product */
    $('.ai-form-container').on('click change keyup', '.size', function () {
      if (parseFloat($(this).val()) > parseFloat($(this).attr('data-max'))) {
        $(this).val(parseFloat($(this).attr('data-max')).toFixed(1));
      }
    });

    /* Hiding elements if quantity is 0 */
    $('body').on('click', '.product-input', function () {
      $('.ai-select-item').each(function () {
        let selectEl = $(this);
        $('.arc-inventory-data').each(function () {
          if (selectEl.attr('data-value') === $(this).attr('data-product') && $(this).attr('data-quantity') == 0) {
            selectEl.hide();
          }
        });
      });
    });

    /* Preventing double selection */
    $('body').on('click', '.ai-select-item', function () {
      let selectedOption = $(this);
      $('.ai-select-item').each(function () {
        if (!$(this).is(selectedOption) && $(this).attr('data-value') === selectedOption.attr('data-value')) {
          $(this).addClass('ai-select-item-unvail');
        } else if ($(this).attr('data-value') === selectedOption.parent().attr('data-value')) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });

      $('.arc-inventory-data').each(function () {
        if (selectedOption.attr('data-value') === $(this).attr('data-product') && $(this).attr('data-quantity') != 0) {
          selectedOption.parent().parent().parent().find('.range-text').html(`/ ${parseFloat($(this).attr('data-quantity'))/* .toFixed(1) */}`);
          selectedOption.parent().parent().parent().find('.size').attr('data-max', $(this).attr('data-quantity')).trigger('change');
        }
      });
    });

    $('#add-product-input').on('click', function () {
      let number = $('.ai-combined-block').length + 1;
      $(this).parent().before(`
      <div class="ai-combined-block ai-combined-block-${number}" data-product="${number}">
        <div class="ai-combined-block-title">ПРОДУКТ #${number}</div>
        <div class="ai-combined-block-remove">
          <ion-icon name="close"></ion-icon>
        </div>
        <div class="ai-input-block ai-input-block-text">
          <div class="ai-input-label">Наименование продукта</div>
          <input class="ai-input ai-input-select ai-input-validation product-input" type="text" placeholder="Выберите продукт"/>
          <div class="ai-select-block shadow ai-input-validation product">
            <div class="ai-select-item" data-value="milk">
              <p class="ai-select-name">Молоко</p>
            </div>
            <div class="ai-select-item" data-value="meat">
              <p class="ai-select-name">Мясо</p>
            </div>
            <div class="ai-select-item" data-value="cottage-cheese">
              <p class="ai-select-name">Творог</p>
            </div>
            <div class="ai-select-item" data-value="cheese">
              <p class="ai-select-name">Сыр</p>
            </div>
            <div class="ai-select-item" data-value="butter">
              <p class="ai-select-name">Масло</p>
            </div>
            <div class="ai-select-item" data-value="whey">
              <p class="ai-select-name">Сыворотка</p>
            </div>
            <div class="ai-select-item" data-value="cream">
              <p class="ai-select-name">Сливки</p>
            </div>
            <div class="ai-select-item" data-value="sour-cream">
              <p class="ai-select-name">Сметана</p>
            </div>
          </div>
        </div>
        <div class="ai-input-block ai-input-block-small-select">
          <div class="ai-input-label">Вес | Объем</div>
          <div class="ai-input-text-wraper">
            <input class="ai-input ai-input-text ai-input-small-select ai-input-validation size" type="number"/>
            <div class="ai-inside-text range-text"></div>
          </div>
          <div class="ai-small-select unit">
            <p>л.</p>
            <div class="ai-select-line"></div>
            <div class="ai-small-select-block shadow">
              <div class="ai-small-select-item" data-val="kg">кг.</div>
              <div class="ai-small-select-item ai-small-select-item-selected" data-val="l">л.</div>
            </div>
          </div>
        </div>
      </div>
      `);

      $('.ai-select-item-selected').trigger('click').trigger('click');
    });

    /* Removing product */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      let product = $(this).parent().find('.ai-select-item-selected').attr('data-value');
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-product')) + 1 !== parseFloat($(this).attr('data-product'))) {
          $(this).attr('data-product', parseFloat($(this).prev().attr('data-product')) + 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #${parseFloat($(this).prev().attr('data-product')) + 1}`)
        } else if ($(this).prev() && !$(this).prev().hasClass('ai-combined-block')) {
          $(this).attr('data-product', 1);
          $(this).find('.ai-combined-block-title').text(`ПРОДУКТ #1`)
        }
      });

      $('.ai-select-item').each(function () {
        if (product && $(this).attr('data-value') === product) {
          $(this).removeClass('ai-select-item-unvail');
        }
      });
    });

    /* Validation from */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).find('.size').val().length > 0 && $(this).find('.product').find('.ai-select-item-selected').length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });

      if ($('#date').hasClass('ai-valid-input') && $('.ai-combined-block-valid').length > 0 && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-dist-consumption-container')) {
      $('.ai-input').trigger('keyup');
      $('.ai-select-item-selected').trigger('click').trigger('click');
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
      $('.ai-switch-btn-click').trigger('click');
    }

    if (document.querySelector('#dist-consumption-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let note = $('#note').val();
        let subId = randomstring.generate(12);

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        let counter = 0;
        $('.ai-combined-block-valid').each(async function () {
          let response = await addProduct({
            size: parseFloat($(this).find('.size').val()),
            date: new Date($('#date').val()),
            unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
            product: $(this).find('.ai-select-item-selected').attr('data-value'),
            type: 'decrease',
            distributionResult: $('.ai-switch-btn-active').attr('id'),
            subId,
            note
          });

          if (response) counter++;

          if (counter === $('.ai-combined-block-valid').length) {
            addConfirmationEmpty($('.animal-results-window'));
            setTimeout(() => { location.reload(true); }, 1500)
          }
        });
      });
    } else if (document.querySelector('#edit-dist-consumption-container')) {
      $('.ai-input-submit-btn').click(async function () {
        let note = $('#note').val();
        let subId = $(this).attr('data-id');

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        let delRes = await deleteSubIdProducts(subId);
        if (delRes) {
          let counter = 0;
          $('.ai-combined-block-valid').each(async function () {
            let response = await addProduct({
              size: parseFloat($(this).find('.size').val()),
              date: new Date($('#date').val()),
              unit: $(this).find('.ai-small-select-item-selected').attr('data-val'),
              product: $(this).find('.ai-select-item-selected').attr('data-value'),
              type: 'decrease',
              distributionResult: $('.ai-switch-btn-active').attr('id'),
              subId,
              note
            });

            if (response) counter++;

            if (counter === $('.ai-combined-block-valid').length) {
              addConfirmationEmpty($('.animal-results-window'));
              setTimeout(() => { location.reload(true); }, 1500)
            }
          });
        }

      });
    }



  }

  ///////////////////////
  /* ALL PRODUCTS PAGE*/
  ///////////////////////
  if (document.querySelector('#all-products-page')) {
    $('.mp-row-btn').on('click', function () {
      $('.mp-row-btn-active').removeClass('mp-row-btn-active')
      $(this).addClass('mp-row-btn-active')
      $('.dist-big-info-block-1').find('.dist-big-info-block-data ').text($(this).attr('data-total'));
      $('.dist-big-info-block-1').find('.dist-big-info-block-data ').append(`<span> ${$(this).attr('data-unit') === 'l' ? ' л.' : ' кг.'}</span>`)

      const product = $(this).attr('data-product');

      let soldCount = 0;
      let soldTotal = 0;
      let puCount = 0;
      let puTotal = 0;
      let woCount = 0;
      let woTotal = 0;
      let processCount = 0;
      let processTotal = 0;

      $('.dist-info-list-item').each(function () {
        if ($(this).attr('data-product') === product) {
          $(this).show()
          /* Counting sold */
          if ($(this).attr('data-dist-result') === 'sold') {
            soldTotal += parseFloat($(this).attr('data-size'))
            soldCount++;
          }
          /* Counting personal use */
          if ($(this).attr('data-dist-result') === 'personal-use') {
            puTotal += parseFloat($(this).attr('data-size'))
            puCount++;
          }
          /* Counting write-off */
          if ($(this).attr('data-dist-result') === 'write-off') {
            woTotal += parseFloat($(this).attr('data-size'))
            woCount++;
          }
          /* Counting process */
          if ($(this).attr('data-dist-result') === 'processed') {
            processTotal += parseFloat($(this).attr('data-size'))
            processCount++;
          }
        } else {
          $(this).hide();
        }
      });

      $('.dist-big-info-block-2').find('.dist-big-info-block-data ').text(Math.round(soldTotal !== 0 ? soldTotal / soldCount : 0));
      $('.dist-big-info-block-2').find('.dist-big-info-block-data ').append(`<span> ${$(this).attr('data-unit') === 'l' ? ' л.' : ' кг.'}</span>`)
      $('.dist-big-info-block-3').find('.dist-big-info-block-data ').text(Math.round(puTotal !== 0 ? puTotal / puCount : 0));
      $('.dist-big-info-block-3').find('.dist-big-info-block-data ').append(`<span> ${$(this).attr('data-unit') === 'l' ? ' л.' : ' кг.'}</span>`)
      $('.dist-big-info-block-4').find('.dist-big-info-block-data ').text(Math.round(woTotal !== 0 ? woTotal / woCount : 0));
      $('.dist-big-info-block-4').find('.dist-big-info-block-data ').append(`<span> ${$(this).attr('data-unit') === 'l' ? ' л.' : ' кг.'}</span>`)
      $('.dist-big-info-block-5').find('.dist-big-info-block-data ').text(Math.round(processTotal !== 0 ? processTotal / processCount : 0));
      $('.dist-big-info-block-5').find('.dist-big-info-block-data ').append(`<span> ${$(this).attr('data-unit') === 'l' ? ' л.' : ' кг.'}</span>`)
    });

    $('.dist-info-list-item-header').on('click', function () {
      $(this).parent().find('.dist-info-item-body').toggle();
    });

    /* Changing the time period */
    $('.main-page-header-period').on('change', function () {
      if ($("#start-date").val() !== '' && $("#end-date").val() !== '') {
        location.assign(`/distribution/all-products/?start=${new Date($("#start-date").val())}&end=${new Date($("#end-date").val())}`)
      }
    });

    $('.mp-date-quick').on('click', function () {
      const startDate = new Date(moment().subtract(parseFloat($(this).attr('data-months')), 'month'));
      const endDate = new Date();

      location.assign(`/distribution/all-products/?start=${startDate}&end=${endDate}`)
    });

    $('.mp-row-btn-1').trigger('click');
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
    /* Animating each clients line */
    $('.ci-footer-line-inner').each(function () {
      if (parseFloat($(this).attr('data-width')) < 5) $(this).css('background-color', '#D44D5C');
      if (parseFloat($(this).attr('data-width')) >= 5 && parseFloat($(this).attr('data-width')) < 15) $(this).css('background-color', '#f6b91d');
      if (parseFloat($(this).attr('data-width')) >= 15) $(this).css('background-color', '#0EAD69');

      anime({
        targets: $(this)[0],
        delay: parseFloat($(this).attr('data-index')) * 200 + 1000,
        duration: 1000,
        width: `${parseFloat($(this).attr('data-width'))}%`
      });
    });

    /* Picking a client */
    $('.client-item').on('click', async function () {
      if ($(this).hasClass('client-item-active')) return;

      /* Adding loading blocks for multiple elements */
      loadingBlock($('.client-detailed-info'))
      loadingBlock($('.client-revenue-block'))
      loadingBlock($('.client-list-block'))
      $('.client-item-active').removeClass('client-item-active');
      $(this).addClass('client-item-active');
      const clientData = await getClient($(this).attr('data-id'), new Date($('#start-date').val()), new Date($('#end-date').val()));

      removeloadingBlock($('.client-detailed-info'));
      removeloadingBlock($('.client-revenue-block'));
      removeloadingBlock($('.client-list-block'));

      /* Hiding block if there is no sales */
      if (clientData.sales.length === 0) {
        $('.client-revenue-block').hide();
        $('.client-list-block').hide();
      } else {
        $('.client-revenue-block').css('display', 'flex');
        $('.client-list-block').css('display', 'flex');
      }

      /* Setting basic info */
      $('#name').text(clientData.client.name);
      if (clientData.client.adress) $('#adress').text(clientData.client.adress);
      if (clientData.client.phoneNumber) $('#phone').text(`+7 ${clientData.client.phoneNumber}`);
      if (clientData.client.email) $('#email').text(clientData.client.email);

      /* Adding listed products */
      $('.cdi-product-line').empty()
      clientData.client.products.forEach(prod => {
        $('.cdi-product-line').append(`
          <div class="cdi-product">
            <p>${productsToRus[prod.productName.replace('-', '')]}</p>
            <p>${prod.pricePer} ₽</p>
          </div>
        `);
      });

      /* Adding added date and edit button */
      $('#added-date').text(`Добавлен: ${moment(clientData.client.creationDate).locale('ru').format('DD MMMM, YYYY')}`)

      $('#edit-client').attr('href', `/distribution/edit-client/${clientData.client._id}`)

      /* Adding revenue block */
      $('#revenue-details').find('.client-revenue-place p').text($(this).attr('data-place'));
      let totalRev = 0;
      let totalSize = 0;
      clientData.sales.forEach(sale => {
        totalSize += sale.size;
        totalRev += sale.price;
      });
      $('#revenue-details').find('.crd-header p').text(`${(totalRev.toFixed(2)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽`);
      $('#size-details').find('.crd-header p').text(`${(totalSize).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} кг./л.`);

      const salesFormated = [];
      clientData.sales.forEach(sale => {
        if (salesFormated.find(el => el.product === sale.product)) {
          let el = salesFormated.find(el => el.product === sale.product);

          el.size += sale.size;
          el.sizeShare = el.size / totalSize;
          el.revenue += sale.price;
          el.revenueShare = el.revenue / totalRev;
        } else {
          salesFormated.push({
            product: sale.product,
            size: sale.size,
            sizeShare: sale.size / totalSize,
            revenue: sale.price,
            revenueShare: sale.price / totalRev,
            unit: sale.unit
          });
        }
      });

      salesFormated.sort((a, b) => b.revenueShare - a.revenueShare);

      $('#revenue-details').find('.crd-dropdown-block').empty();

      salesFormated.forEach((sale, index) => {
        $('#revenue-details').find('.crd-dropdown-block').append(`
          <div class="crd-item">
            <div class="crd-item-title">${productsToRus[sale.product.replace('-', '')]}</div>
            <div class="crd-item-line">
              <p>${(sale.revenueShare * 100).toFixed(1)} %</p>
              <div class="crd-item-line-inner" data-rev="${sale.revenueShare}" data-index="${index + 1}"></div>
              <p>${sale.revenue > 1000 ? `${Math.round(sale.revenue / 1000)}к` : sale.revenue} ₽</p>
            </div>
          </div>
        `);
      });

      $('#revenue-details').find('.crd-item-line-inner').each(function () {
        anime({
          targets: $(this)[0],
          delay: 200 * parseFloat($(this).attr('data-index')),
          duration: 200,
          width: `${(parseFloat($(this).attr('data-rev')) * 100) / 2.5}%`
        })
      });

      salesFormated.sort((a, b) => b.sizeShare - a.sizeShare);

      $('#size-details').find('.crd-dropdown-block').empty();

      salesFormated.forEach((sale, index) => {
        $('#size-details').find('.crd-dropdown-block').append(`
          <div class="crd-item">
            <div class="crd-item-title">${productsToRus[sale.product.replace('-', '')]}</div>
            <div class="crd-item-line">
              <p>${(sale.sizeShare * 100).toFixed(1)} %</p>
              <div class="crd-item-line-inner" data-rev="${sale.sizeShare}" data-index="${index + 1}"></div>
              <p>${sale.size > 1000 ? `${Math.round(sale.size / 1000)}к` : sale.size} ${sale.unit === 'kg' ? 'кг.' : 'л.'}</p>
            </div>
          </div>
        `);
      });

      $('#size-details').find('.crd-item-line-inner').each(function () {
        anime({
          targets: $(this)[0],
          delay: 200 * parseFloat($(this).attr('data-index')),
          duration: 200,
          width: `${(parseFloat($(this).attr('data-rev')) * 100) / 2.5}%`
        })
      });

      /* Adding all purchases to a list */
      $('#all-purchases').empty();
      clientData.sales.sort((a, b) => new Date(b.date) - new Date(a.date));
      clientData.sales.forEach(sale => {
        $('#all-purchases').append(`
          <div class="dist-info-list-item" rc-title="Редактировать покупку" rc-link="/distribution/edit-sale/${sale._id}">
            <div class="dist-info-list-item-header">
              <div class="dist-info-list-item-img">
                <img src="/img/icons/sale-small-icon.png">
              </div>
              <div class="dist-info-list-item-product">${productsToRus[sale.product.replace('-', '')]}</div>
              <div class="dist-info-list-item-date">${moment(sale.date).format('DD.MM.YYYY')}</div>
              <div class="dist-info-list-item-product">${sale.size > 1000 ? `${Math.round(sale.size / 1000)}к` : sale.size} ${sale.unit === 'kg' ? 'кг.' : 'л.'}</div>
              <div class="dist-info-list-item-size dist-info-list-item-size-inc">+${sale.price}</div>
            </div>
          </div>
        `);
      });
    });

    $('.client-item').first().trigger('click');

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

  if (document.querySelector('#dist-write-off-container') || document.querySelector('#edit-dist-write-off-container')) {
    /* Validating size */
    $('#size').on('keyup change', function () {
      let percent = Math.round(parseFloat($(this).val()) / (parseFloat($('.ai-total-product-line-inner').attr('data-total')) / 100));

      $('.ai-total-product-line-inner').stop();
      $('.ai-total-product-line-inner').animate({ 'width': `${percent}%` }, 250);

      if (parseFloat($(this).val()) > parseFloat($('.ai-total-product-line-inner').attr('data-total'))) {
        $(this).parent().find('.ai-input-marker-s').remove();
        if ($(this).parent().find('.ai-input-marker-f').length === 0) {
          $(this).parent().append(`
      <div class="ai-input-marker ai-input-marker-f animate__animated animate__flipInY">
        <ion-icon name="close-sharp"></ion-icon>
      </div>`)
        }

        if ($(this).parent().find('.ai-warning-text').length === 0) {
          $(this).parent().append(`<div class="ai-warning-text">Количество не должно превышать общее количество продукта</div>`)
        }

        $('.ai-total-product-line-inner').addClass('ai-total-product-line-invalid');
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

        $('.ai-total-product-line-inner').removeClass('ai-total-product-line-invalid');
        $(this).addClass('ai-valid-input');
      }
    });

    /* Validation from */
    $('*').on('click change keyup mouseenter', function () {
      if ($('#date').hasClass('ai-valid-input') && $('#size').hasClass('ai-valid-input') && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-dist-write-off-container')) {
      $('.ai-input').trigger('keyup');
    }

    if (document.querySelector('#dist-write-off-container')) {
      $('.ai-input-submit-btn').click(async function () {
        const size = parseFloat($('#size').val());
        const date = new Date($('#date').val());
        const type = 'decrease';
        const distributionResult = 'write-off';
        const unit = $('.ai-form-container').attr('data-unit');
        const product = $('.ai-form-container').attr('data-product');
        let note = $('#note').val();


        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addProduct({ size, date, type, distributionResult, unit, product, note });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    } else if (document.querySelector('#edit-dist-write-off-container')) {
      $('.ai-input-submit-btn').click(async function () {
        const id = $(this).attr('data-product-id');
        const size = parseFloat($('#size').val());
        const date = new Date($('#date').val());
        const type = 'decrease';
        const distributionResult = 'write-off';
        const unit = $('.ai-form-container').attr('data-unit');
        const product = $('.ai-form-container').attr('data-product');
        let note = $('#note').val();


        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editProduct(id, { size, date, type, distributionResult, unit, product, note });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      });
    }

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

    if (productData.length === 0) emptyBlock($('.dist-main-columns-block'), 'Недостаточно данных', 'Информация за данный период отсутсвует')

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

    $('.mp-date-quick').on('click', function () {
      const startDate = new Date(moment().subtract(parseFloat($(this).attr('data-months')), 'month'));
      const endDate = new Date();

      location.assign(`/distribution/?start=${startDate}&end=${endDate}`)
    });

  }

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* FEED MODULE */
  /////////////////////////
  /////////////////////////
  /////////////////////////
  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* ADD FEED SAMPLE PAGE */
  /////////////////////////
  /////////////////////////
  /////////////////////////
  if (document.querySelector('#feed-sample-container') || document.querySelector('#edit-feed-sample-container')) {
    /* Switching between two types of feed */
    $('#fixed-ratios').on('click', function () {
      if ($(this).hasClass('ai-radio-active')) {
        $('.compound-input').css('display', 'flex');
      } else {
        $('.compound-input').hide();
      }
    });
    $('.ai-switch-btn').on('click', function () {
      if ($(this).attr('id') === 'compound') {
        $('.compound-radio').css('display', 'flex');
        $('#fixed-ratios').trigger('click');
        $('#fixed-ratios').trigger('click');
      } else {
        $('.compound-input').hide();
        $('.compound-radio').hide();
      }
    });

    /* Adding more ingredients */
    $('#add-ingredient-input').on('click', function () {
      const number = parseFloat($('.ai-combined-block ').last().attr('data-ingredient'))
      $(this).parent().before(`
        <div class="ai-combined-block ai-combined-block-${number + 1} compound-input" data-ingredient="${number + 1}" style="display:flex">
          <div class="ai-combined-block-title">Ингредиент #${number + 1}</div>
          <div class="ai-combined-block-remove">
            <ion-icon name="close"></ion-icon>
          </div>
          <div class="ai-input-block ai-input-block-text">
            <div class="ai-input-label">Наименование ингредиента</div>
            <input class="ai-input ai-input-text ai-input-validation ingredient" type="text" placeholder=""/>
          </div>
          <div class="ai-input-block ai-input-block-text">
            <div class="ai-input-label">Количество</div>
            <input class="ai-input ai-input-text ai-input-validation amount" type="number" placeholder=""/>
            <div class="ai-inside-text">%</div>
          </div>
        </div>
      `)
    });



    /* Removing ingredient */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-ingredient')) + 1 !== parseFloat($(this).attr('data-ingredient'))) {
          $(this).attr('data-ingredient', parseFloat($(this).prev().attr('data-ingredient')) + 1);
          $(this).find('.ai-combined-block-title').text(`ИНГРЕДИЕНТ #${parseFloat($(this).prev().attr('data-ingredient')) + 1}`)
        } else if ($(this).prev() && !$(this).prev().hasClass('ai-combined-block')) {
          $(this).attr('data-ingredient', 1);
          $(this).find('.ai-combined-block-title').text(`ИНГРЕДИЕНТ #1`)
        }
      });
    });

    /* Validating amounts so it will always be 100% total */
    let left = 100;
    $('.ai-form-container').on('keyup change', '.amount', function (e) {
      let elVal = $(this).val().length > 0 ? parseFloat($(this).val()) : 0;
      $(this).val(Math.abs(elVal));
      if (e.which === 8) {
        left = 100
        $('.amount').each(function () {
          let val = parseFloat($(this).val())
          if ($(this).val().length === 0) val = 0;
          left -= val;
        });
        left += elVal
        return;
      }
      if (elVal > left) $(this).val(left);
    });

    $('.ai-form-container').on('blur', '.amount', function () {
      left = 100
      $('.amount').each(function () {
        let val = parseFloat($(this).val())
        if ($(this).val().length === 0) val = 0;
        left -= val;
      });
    });

    /* Validation form */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).find('.ingredient').val().length > 0 && $(this).find('.amount').val().length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });

      if ($('.ai-switch-btn-active').attr('id') === 'regular' && $('#name').hasClass('ai-valid-input') && $('#unit').find('.ai-select-item-selected').length > 0 || $('.ai-switch-btn-active').attr('id') === 'compound' && $('#name').hasClass('ai-valid-input') && $('#unit').find('.ai-select-item-selected').length > 0 && !$('#fixed-ratios').hasClass('ai-radio-active') || $('.ai-switch-btn-active').attr('id') === 'compound' && $('#name').hasClass('ai-valid-input') && $('#unit').find('.ai-select-item-selected').length > 0 && $('#fixed-ratios').hasClass('ai-radio-active') && $('.ai-combined-block-valid').length >= 2 && $('body').find('.ai-warning-text').length === 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-feed-sample-container')) {
      $('.ai-switch-btn-click').trigger('click');
      $('.ai-input').trigger('keyup');

      $('.ai-select-item-selected').trigger('click').trigger('click');
    }

    /* Submiting data */
    $('.ai-input-submit-btn').on('click', async function () {
      if (document.querySelector('#feed-sample-container')) {
        const type = 'sample';
        const name = $('#name').val();
        const unit = $('#unit').find('.ai-select-item-selected').attr('data-val');
        const category = `${$('.ai-switch-btn-active').attr('id')}-feed`;
        const ingredients = [];
        $('.ai-combined-block-valid').each(function () {
          ingredients.push({ name: $(this).find('.ingredient').val(), percent: $(this).find('.amount').val() })
        })

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addFeedSampleOrRecord({ type, name, category, unit, ingredients });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      } else if (document.querySelector('#edit-feed-sample-container')) {
        const id = $(this).attr('data-id');
        const type = 'sample';
        const name = $('#name').val();
        const unit = $('#unit').find('.ai-select-item-selected').attr('data-val');
        const category = `${$('.ai-switch-btn-active').attr('id')}-feed`;
        const ingredients = [];
        $('.ai-combined-block-valid').each(function () {
          ingredients.push({ name: $(this).find('.ingredient').val(), percent: $(this).find('.amount').val() })
        })

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editFeedSampleOrRecord(id, { type, name, category, unit, ingredients });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      }

    });
  }

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* ADD FEED RECORD PAGE */
  /////////////////////////
  /////////////////////////
  /////////////////////////
  if (document.querySelector('#feed-record-container') || document.querySelector('#edit-feed-record-container')) {
    /* Changing switch button */
    $('.ai-switch-btn').on('click', function () {
      if ($(this).hasClass('ai-switch-btn-left')) {
        $('.ai-switch-btn-slider').css('background-color', '#0EAD69')
        $('.ai-radio-block').find('.ai-radio-text').text('Автопополнение');
      } else {
        $('.ai-switch-btn-slider').css('background-color', '#D44D5C')
        $('.ai-radio-block').find('.ai-radio-text').text('Автосписание');
      }
    });

    /* Showing the auto time period */
    $('#auto-radio').on('click', function () {
      if ($(this).hasClass('ai-radio-active')) {
        $('.auto-time-input').css('display', 'flex');
      } else {
        $('.auto-time-input').css('display', 'none');
      }
    });

    /* Show ingredients on compound feed selection */
    let feedSample;
    $('#feed').parent().find('.ai-select-item').on('click', async function () {
      feedSample = await getOneRecord($(this).attr('data-id'));
      $('.ai-additional-small-block').css('display', 'none');
      $('.compound-input').css('display', 'none');

      if (feedSample.category === 'compound-feed' && feedSample.ingredients.length > 0) {
        $('.ai-additional-small-block').css('display', 'flex');
        $('.ai-additional-small-block').empty();
        feedSample.ingredients.forEach((ing, i, arr) => {
          $('.ai-additional-small-block').append(`
          <div class="ai-as-block-item" data-name="${ing.name}" data-percent="${ing.percent}">
          <div class="ai-as-block-item-number">${i + 1}</div>
          <div class="ai-as-block-item-text">${ing.name}</div>
          <div class="ai-as-block-item-sub-text">${ing.percent}%</div>
          <div class="ai-as-block-item-text ai-as-block-item-separate total"></div>
          </div>
          `);
        })
      } else if (feedSample.category === 'compound-feed' && feedSample.ingredients.length === 0) {
        $('.compound-input').css('display', 'flex');
      }

      if (feedSample.unit === 'kg') $('#amount').parent().find('.ai-inside-text').text('кг.');
      if (feedSample.unit === 'bale') $('#amount').parent().find('.ai-inside-text').text('тюк.');

      $('#amount').trigger('keyup');
    });

    /* Counting percentages */
    $('#amount').on('keyup change', function () {
      if ($(this).val().length === 0) return $('.total').text('');
      let total = parseFloat($(this).val());
      $('.ai-as-block-item').each(function () {
        $(this).find('.total').text(`${Math.round(total * (parseFloat($(this).attr('data-percent')) / 100))} кг.`)
      })
    });

    /* Adding more ingredients */
    $('#add-ingredient-input').on('click', function () {
      const number = parseFloat($('.ai-combined-block ').last().attr('data-ingredient'))
      $(this).parent().before(`
        <div class="ai-combined-block ai-combined-block-${number + 1} compound-input" data-ingredient="${number + 1}" style="display:flex">
          <div class="ai-combined-block-title">Ингредиент #${number + 1}</div>
          <div class="ai-combined-block-remove">
            <ion-icon name="close"></ion-icon>
          </div>
          <div class="ai-input-block ai-input-block-text">
            <div class="ai-input-label">Наименование ингредиента</div>
            <input class="ai-input ai-input-text ai-input-validation ingredient" type="text" placeholder=""/>
          </div>
          <div class="ai-input-block ai-input-block-text">
            <div class="ai-input-label">Количество</div>
            <input class="ai-input ai-input-text ai-input-validation amount" type="number" placeholder=""/>
            <div class="ai-inside-text">%</div>
          </div>
        </div>
      `)
    });

    /* Removing ingredient */
    $('.ai-form-container').on('click', '.ai-combined-block-remove', function () {
      $(this).parent().remove();

      $('.ai-combined-block').each(function () {
        if ($(this).prev() && $(this).prev().hasClass('ai-combined-block') && parseFloat($(this).prev().attr('data-ingredient')) + 1 !== parseFloat($(this).attr('data-ingredient'))) {
          $(this).attr('data-ingredient', parseFloat($(this).prev().attr('data-ingredient')) + 1);
          $(this).find('.ai-combined-block-title').text(`ИНГРЕДИЕНТ #${parseFloat($(this).prev().attr('data-ingredient')) + 1}`)
        } else if ($(this).prev() && !$(this).prev().hasClass('ai-combined-block')) {
          $(this).attr('data-ingredient', 1);
          $(this).find('.ai-combined-block-title').text(`ИНГРЕДИЕНТ #1`)
        }
      });
    });

    /* Validating amounts so it will always be 100% total */
    let left = 100;
    $('.ai-form-container').on('keyup change', '.amount', function (e) {
      let elVal = $(this).val().length > 0 ? parseFloat($(this).val()) : 0;
      $(this).val(Math.abs(elVal));
      if (e.which === 8) {
        left = 100
        $('.amount').each(function () {
          let val = parseFloat($(this).val())
          if ($(this).val().length === 0) val = 0;
          left -= val;
        });
        left += elVal
        return;
      }
      if (elVal > left) $(this).val(left);
    });

    $('.ai-form-container').on('blur', '.amount', function () {
      left = 100
      $('.amount').each(function () {
        let val = parseFloat($(this).val())
        if ($(this).val().length === 0) val = 0;
        left -= val;
      });
    });

    /* Validation form */
    $('*').on('click change keyup mouseenter', function () {
      $('.ai-combined-block').each(function () {
        if ($(this).find('.ingredient').val().length > 0 && $(this).find('.amount').val().length > 0) {
          $(this).addClass('ai-combined-block-valid')
        } else {
          $(this).removeClass('ai-combined-block-valid')
        }
      });
      let pass = true;
      if ($('#feed').parent().find('.ai-select-item-selected').attr('data-type') === 'compound-feed' && parseFloat($('#feed').parent().find('.ai-select-item-selected').attr('data-ing')) === 0) {
        if ($('.ai-combined-block-valid').length < 2) pass = false;
      }
      if ($('#auto-radio').hasClass('ai-radio-active') && $('#auto-span').val().length === 0) pass = false;


      if (pass && $('#feed').parent().find('.ai-select-item-selected').length > 0 && $('#date').hasClass('ai-valid-input') && $('#amount').hasClass('ai-valid-input')) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-feed-record-container')) {
      $('.ai-switch-btn-click').trigger('click');
      $('.ai-input').trigger('keyup');

      $('.ai-select-item-selected').trigger('click').trigger('click');
      $('.ai-small-select-item-selected').trigger('click').trigger('click');
      $('.ai-radio').trigger('click').trigger('click');
    }


    /* Submiting data */
    $('.ai-input-submit-btn').on('click', async function () {
      if (document.querySelector('#feed-record-container')) {
        const type = 'record';
        const status = $('.ai-switch-btn-active').attr('id');
        const feed = $('#feed').parent().find('.ai-select-item-selected').attr('data-id');
        const amount = parseFloat($('#amount').val());
        const unit = $('#feed').parent().find('.ai-select-item-selected').attr('data-unit');
        const date = new Date($('#date').val());
        const autoAction = $('#auto-radio').hasClass('ai-radio-active');
        const autoTimeSpan = parseFloat($('#auto-span').val())
        const autoTimeSpanUnit = $('#span-unit').find('.ai-small-select-item-selected').attr('data-val');
        let nextAutoAction;
        if (autoAction) nextAutoAction = new Date(moment(date).add(autoTimeSpan, autoTimeSpanUnit));
        const ingredients = [];
        if (feedSample.category === 'compound-feed') {
          if (feedSample.ingredients.length === 0) {
            $('.ai-combined-block-valid').each(function () {
              ingredients.push({ name: $(this).find('.ingredient').val(), percent: $(this).find('.amount').val() })
            })
          } else {
            $('.ai-as-block-item').each(function () {
              ingredients.push({ name: $(this).attr('data-name'), percent: parseFloat($(this).attr('data-percent')) })
            })
          }
        }
        const animalGroup = $('#animal-group').parent().find('.ai-select-item-selected').attr('data-group');

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addFeedSampleOrRecord({ type, status, feed, amount, unit, date, autoAction, autoTimeSpan, autoTimeSpanUnit, nextAutoAction, ingredients, animalGroup });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      } else if (document.querySelector('#edit-feed-record-container')) {
        const id = $(this).attr('data-id');
        const type = 'record';
        const status = $('.ai-switch-btn-active').attr('id');
        const feed = $('#feed').parent().find('.ai-select-item-selected').attr('data-id');
        const amount = parseFloat($('#amount').val());
        const unit = $('#feed').parent().find('.ai-select-item-selected').attr('data-unit');
        const date = new Date($('#date').val());
        const autoAction = $('#auto-radio').hasClass('ai-radio-active');
        const autoTimeSpan = parseFloat($('#auto-span').val())
        const autoTimeSpanUnit = $('#span-unit').find('.ai-small-select-item-selected').attr('data-val');
        let nextAutoAction;
        if (autoAction) nextAutoAction = new Date(moment(date).add(autoTimeSpan, autoTimeSpanUnit));
        const ingredients = [];
        if (feedSample.category === 'compound-feed') {
          if (feedSample.ingredients.length === 0) {
            $('.ai-combined-block-valid').each(function () {
              ingredients.push({ name: $(this).find('.ingredient').val(), percent: $(this).find('.amount').val() })
            })
          } else {
            $('.ai-as-block-item').each(function () {
              ingredients.push({ name: $(this).attr('data-name'), percent: parseFloat($(this).attr('data-percent')) })
            })
          }
        }
        const animalGroup = $('#animal-group').parent().find('.ai-select-item-selected').attr('data-group');

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editFeedSampleOrRecord(id, { type, status, feed, amount, unit, date, autoAction, autoTimeSpan, autoTimeSpanUnit, nextAutoAction, ingredients, animalGroup });

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      }

    });



  }

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* FEED MAIN PAGE */
  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* FEED HISROTY AND PROJECTION BLOCK */
  if (document.querySelector('.fm-history-block ')) {
    $('.mp-row-btn').on('click', async function () {
      removeEmptyBlock($('.feed-main-graph-block'))
      const records = await getFeedRecords($(this).attr('data-id'));
      if (records.length === 0) return emptyBlock($('.feed-main-graph-block'), 'Недостаточно данных', 'Добавьте записи этого вида корма чтобы увидеть результаты')
      const projData = await getFarmProjections($('#mp-feed').attr('data-farm-id'), 5);
      const recordsFormatedBalance = [];
      records.forEach(rec => {
        let total = 0;
        records.forEach(recTot => {
          if ((new Date(rec.date) > new Date(recTot.date))) {
            if (recTot.status === 'increase') total += recTot.amount;
            if (recTot.status === 'decrease') total -= recTot.amount;
          }
        })
        if (rec.status === 'increase') total += rec.amount;
        if (rec.status === 'decrease') total -= rec.amount;
        recordsFormatedBalance.push({ record: rec, total });
      });
      recordsFormatedBalance.sort((a, b) => new Date(a.record.date) - new Date(b.record.date));

      $('.fm-history-block').find('.mp-hg-btn').off('click');
      $('.fm-history-block').find('.mp-hg-btn').on('click', function () {
        let workingArr
        if ($(this).attr('data-months') !== 'all') {
          let startDate = new Date(moment().subtract(parseFloat($(this).attr('data-months')), 'months'));
          workingArr = recordsFormatedBalance.filter(el => new Date(el.record.date) >= startDate);
        } else {
          workingArr = recordsFormatedBalance;
        }

        /* Setting max and min */
        let max, min;
        max = 0;
        min = 0;

        workingArr.forEach(el => {
          if (max < el.total) max = el.total;
          if (min > el.total) min = el.total;
        });
        max = Math.ceil(max / 10) * 10 * 1.5;

        $('.basic-graph-svg').remove()

        /* Adding main SVG */
        const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svg.classList.add('basic-graph-svg')
        $('.fm-history-block').append(svg);
        svg.style.width = $('.fm-history-block').width();
        svg.style.height = $('.fm-history-block').height();

        /* Counting the horizontal gap */
        let horGap = parseFloat($('.fm-history-block').height()) / 12;

        const workingAreaHeight = Math.round($('.fm-history-block').height() - horGap * 2);
        const workingAreaWidth = Math.round($('.fm-history-block').width() - horGap * 2);

        /* Adding horizontal grid lines and ticks */
        for (let i = 11; i >= 1; i--) {
          const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
          gridLine.classList.add('basic-graph-grid-line')
          svg.append(gridLine);
          gridLine.setAttribute('x1', 0)
          gridLine.setAttribute('y1', i * horGap)
          gridLine.setAttribute('x2', parseFloat($('.fm-history-block').width()))
          gridLine.setAttribute('y2', i * horGap)
        }

        /* Adding the vertical grid lines */
        for (let i = 1; i <= parseFloat($('.fm-history-block').width()) / horGap; i++) {
          const gridLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
          gridLine.classList.add('basic-graph-grid-line')
          svg.append(gridLine);
          gridLine.setAttribute('x1', i * horGap)
          gridLine.setAttribute('y1', 0)
          gridLine.setAttribute('x2', i * horGap)
          gridLine.setAttribute('y2', parseFloat($('.fm-history-block').height()))
        }

        /* Adding data */
        let start = new Date(workingArr[0].record.date);
        let end = new Date(workingArr[workingArr.length - 1].record.date);

        let daysSpan = Math.round((end.getTime() - start.getTime()) / 1000 / 60 / 60 / 24);



        workingArr.forEach((data, inx, arr) => {
          let currentDaysSpan = Math.round((new Date(data.record.date).getTime() - start.getTime()) / 1000 / 60 / 60 / 24);

          /* Adding data line */
          let path;
          if (inx === 0) {
            path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path.classList.add('basic-graph-point-line');
            path.classList.add('history-graph-data');
            path.style.stroke = `#8ED081`;
            svg.append(path);

            path.setAttribute('d', `M ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.total / (max / 100) / 100))}`)
            path.setAttribute('id', `graph-line-history`);
          } else {
            path = document.getElementById(`graph-line-history`);
            path.setAttribute('d', `${path.getAttribute('d')} L ${horGap + Math.round(workingAreaWidth * (currentDaysSpan / (daysSpan / 100) / 100))} ${workingAreaHeight + horGap - Math.round(workingAreaHeight * (data.total / (max / 100) / 100))}`)
          }

        });

        anime({
          targets: '.history-graph-data',
          strokeDashoffset: [2000, 0],
          easing: 'easeInOutSine',
          duration: 1500,
          delay: function (el, i) { return i * 250 },
        });





      });
      $('.fm-history-block').find('.mp-hg-btn').trigger('click');
    });
  };

  /* FEED / RESULT RELATION GRAPH */
  /* if(document.querySelector('#feed-result-graph ')) {
    $('.mp-row-btn').on('click', async function (){
      const animals = await getAnimalsByCategory('all');
    });
  }; */

  if (document.querySelector('#mp-feed')) {
    /* Warning block */
    /* Change blocks */
    $('.feed-warning-block').hide();
    $('.feed-warning-block').first().addClass('feed-warning-active').css('display', 'flex');

    if ($('.feed-warning-block').length > 1) {
      setInterval(() => {
        $('.feed-warning-active').addClass('animate__animated animate__slideOutDown');

        let el;
        if ($('.feed-warning-active').next().length > 0 && $('.feed-warning-active').next().hasClass('feed-warning-block')) {
          el = $('.feed-warning-active').next();
        } else {
          el = $('.feed-warning-block').first();
        }

        el.removeClass('animate__animated animate__slideOutDown animate__slideInDown');
        el.addClass('animate__animated animate__slideInDown').css('display', 'flex');

        setTimeout(() => {
          $('.feed-warning-active').hide();
          $('.feed-warning-active').removeClass('animate__animated animate__slideOutDown animate__slideInDown feed-warning-active');
          el.addClass('feed-warning-active')
        }, 1000)


      }, 5000);
    }
    /* Formating dates */
    $('.feed-history-date').each(function () {
      $(this).text(moment($(this).attr('data-date')).lang('ru').format('MMMM DD').toUpperCase())
    });
    /* Change size of history block items */
    $('.feed-history-item').each(function () {
      let el = $(this);
      if (parseFloat($(this).attr('data-num')) < parseFloat($(this).attr('data-max')) * 0.01) {
        $(this).css('width', 100);
        $(this).addClass('feed-history-small');
        $(this).attr('data-size', 'small');
        $(this).find('.feed-hide').css('opacity', 0);
        $(this).find('.feed-history-date').text(moment($(this).find('.feed-history-date').attr('data-date')).lang('ru').format('MMM DD').toUpperCase())
      } else {
        $(this).css('width', 300 + (parseFloat($(this).attr('data-num')) / (parseFloat($(this).attr('data-max')) / 100) * 2));
      }

      $('.feed-history-item').each(function () {
        if (new Date(el.attr('data-date')) < new Date($(this).attr('data-date'))) {
          el.detach();
          $(this).after(el);
        }
      });
    });

    $('.feed-history-item').on('click', function () {
      if ($(this).hasClass('feed-history-small') && $(this).attr('data-size') === 'small') {
        $(this).css('width', 225);
        $(this).find('.feed-hide').css('opacity', 1);
        $(this).attr('data-size', 'full')
        $(this).find('.feed-history-date').text(moment($(this).find('.feed-history-date').attr('data-date')).lang('ru').format('MMMM DD').toUpperCase())
      } else if ($(this).hasClass('feed-history-small') && $(this).attr('data-size') === 'full') {
        $(this).css('width', 100);
        $(this).find('.feed-hide').css('opacity', 0);
        $(this).attr('data-size', 'small')
        $(this).find('.feed-history-date').text(moment($(this).find('.feed-history-date').attr('data-date')).lang('ru').format('MMM DD').toUpperCase())
      }
    });

    /* Switching between feeds */
    $('.mp-row-btn').on('click', async function () {
      if ($(this).hasClass('mp-row-btn-active')) return;

      $('.mp-row-btn-active').removeClass('mp-row-btn-active');
      $(this).addClass('mp-row-btn-active');

      /* Showing the auto block once in a while */
      const id = $(this).attr('data-id');
      $('.auto-action-block').each(function () {
        if ($(this).attr('data-id') === id) {
          $(this).css('display', 'flex');
        } else {
          $(this).css('display', 'none');
        }
      });

      /* Showing the tile blocks */
      const records = await getFeedRecords(id);
      const recordsFormatedBalance = [];
      const recordsFormatedUse = [];
      let startSpan = new Date(moment().subtract(6, 'month'));
      let currentBalance = 0;
      let balanceMin = undefined;
      let balanceMax = undefined;
      let useMin = undefined;
      let useMax = undefined;

      records.forEach(rec => {
        if (new Date(rec.date) > startSpan) {
          let total = 0;
          records.forEach(recTot => {
            if ((new Date(rec.date) > new Date(recTot.date))) {
              if (recTot.status === 'increase') total += recTot.amount;
              if (recTot.status === 'decrease') total -= recTot.amount;
            }
          })
          if (rec.status === 'increase') total += rec.amount;
          if (rec.status === 'decrease') total -= rec.amount;
          recordsFormatedBalance.push({ record: rec, total });
          if (!balanceMax || total > balanceMax) balanceMax = total;
          if (!balanceMin || total < balanceMin) balanceMin = total;
        }
        if (rec.status === 'increase') currentBalance += rec.amount;
        if (rec.status === 'decrease') currentBalance -= rec.amount;
        $('#left-text').text(currentBalance);
        $('#left-unit').text($(this).attr('data-unit') === 'kg' ? 'кг.' : 'тюк.');

        if (rec.status === 'decrease' && new Date(moment().subtract(6, 'month')) < new Date(rec.date)) {
          if (recordsFormatedUse.find(el => moment(rec.date).day() === el.day)) {
            let element = recordsFormatedUse.find(el => moment(rec.date).day() === el.day);

            element.total += rec.amount;
            element.counter++;
            element.result = element.total / element.counter


            if (!useMax || element.result > useMax) useMax = element.result;
            if (!useMin || element.result < useMin) useMin = element.result;
          } else {
            recordsFormatedUse.push({
              day: moment(rec.date).day(),
              total: rec.amount,
              counter: 1,
              result: rec.amount
            });

            if (!useMax || rec.amount > useMax) useMax = rec.amount;
            if (!useMin || rec.amount < useMin) useMin = rec.amount;
          }
        }
      });
      recordsFormatedBalance.sort((a, b) => new Date(a.record.date) - new Date(b.record.date));
      recordsFormatedUse.sort((a, b) => a.day - b.day);


      /* BALANCE GRAPH */
      /* Adding main SVG */
      $('#tile-graph-left').find('.basic-mini-graph-svg').remove()
      const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
      svg.classList.add('basic-mini-graph-svg')
      $('#tile-graph-left').append(svg);
      svg.style.width = $('#tile-graph-left').width();
      svg.style.height = $('#tile-graph-left').height();
      const width = $('#tile-graph-left').width();
      const height = $('#tile-graph-left').height();

      /* Adding info */
      let circleTimer = 0;
      recordsFormatedBalance.forEach((rec, inx, arr) => {
        /* Adding data line */
        let path;
        if (inx === 0) {
          path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
          path.classList.add('basic-graph-point-line');
          svg.append(path);
          path.setAttribute('d', `M ${(width / arr.length) * inx} ${height - ((height / balanceMax) * rec.total)}`)
          path.style.stroke = `#8ED081`;

          path.setAttribute('id', `graph-line-average`);
        } else {
          path = document.getElementById(`graph-line-average`);
          path.setAttribute('d', `${path.getAttribute('d')} L ${(width / arr.length) * inx} ${height - ((height / balanceMax) * rec.total)}`)
        }
      });
      anime({
        targets: '.basic-graph-point-line',
        strokeDashoffset: [2000, 0],
        easing: 'easeInOutSine',
        duration: 1500,
        delay: function (el, i) { return i * 250 },
      });

      /* DAILY USE GRAPH */
      useMax = Math.round(useMax * 1.5);
      useMin = Math.round(useMin / 1.5);
      let weekTotal = 0;
      recordsFormatedUse.forEach(weekday => {
        weekTotal += weekday.result;
        anime({
          targets: $(`.fm-use-graph-item-${weekday.day}`).find('.fm-use-graph-item-inner')[0],
          height: `${weekday.result / (useMax / 100)}%`,
          easing: 'easeOutSine',
          duration: 1500,
          delay: weekday.day * 150,
        });
      });
      $('#use-text').text(Math.round(weekTotal));
      $('#use-unit').text($(this).attr('data-unit') === 'kg' ? 'кг.' : 'тюк.');

    });

    $('.mp-row-btn').first().trigger('click');

    /* Making the auto action */
    $('.auto-stop').on('click', function () {
      askAus($('.main-section '), `Вы уверены что хотите остановить автоматическое ${$(this).parent().attr('data-action')}?`, 'Остановить', 'Продолжить', true, $(this).parent().attr('data-record-id'));
    });

    $('.main-section').on('click', '#aus-btn-2', function () {
      $(this).parent().parent().parent().remove();
    });

    $('.main-section').on('click', '#aus-btn-1', async function () {
      const res = await editFeedSampleOrRecord($(this).parent().parent().parent().attr('data-data'), { autoActionStop: true, autoActionStopDate: new Date() });

      if (res) {
        $(this).parent().parent().parent().remove();
        location.reload(true);
      }

    });
  }

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* MILK QUALITY PAGE */
  /////////////////////////
  /////////////////////////
  /////////////////////////
  if (document.querySelector('#milk-quality-container') || document.querySelector('#edit-milk-quality-container')) {
    /* Validating form */
    $('.ai-table-line-input').on('keyup change', function () {
      if ($(this).val().length > 0) {
        $(this).addClass('ai-table-line-input-valid');
      } else {
        $(this).removeClass('ai-table-line-input-valid');
      }
    });

    $('*').on('click mousemove change keyup', function () {
      if ($('#date').hasClass('ai-valid-input') && $('.ai-table-line-input-valid').length > 0) {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'auto', 'filter': 'grayscale(0)' });
      } else {
        $('.ai-input-submit-btn').css({ 'pointer-events': 'none', 'filter': 'grayscale(1)' });
      }
    });

    if (document.querySelector('#edit-milk-quality-container')) {
      $('input').trigger('change');
    }

    /* Submiting data */
    $('.ai-input-submit-btn').on('click', async function () {
      if (document.querySelector('#milk-quality-container')) {
        const data = {
          date: new Date($('#date').val()),
          water: parseFloat($('#water').val()),
          dryResidue: parseFloat($('#dryResidue').val()),
          fat: parseFloat($('#fat').val()),
          casein: parseFloat($('#casein').val()),
          sugar: parseFloat($('#sugar').val()),
          phosphatides: parseFloat($('#phosphatides').val()),
          sterols: parseFloat($('#sterols').val()),
          albumen: parseFloat($('#albumen').val()),
          otherProteins: parseFloat($('#otherProteins').val()),
          nonProteinCompounds: parseFloat($('#nonProteinCompounds').val()),
          saltsOfInorganicAcids: parseFloat($('#saltsOfInorganicAcids').val()),
          ash: parseFloat($('#ash').val()),
          pigments: parseFloat($('#pigments').val()),
        }

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await addMilkQuality(data);

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      } else if (document.querySelector('#edit-milk-quality-container')) {
        const id = $(this).attr('data-id');
        const data = {
          date: new Date($('#date').val()),
          water: parseFloat($('#water').val()),
          dryResidue: parseFloat($('#dryResidue').val()),
          fat: parseFloat($('#fat').val()),
          casein: parseFloat($('#casein').val()),
          sugar: parseFloat($('#sugar').val()),
          phosphatides: parseFloat($('#phosphatides').val()),
          sterols: parseFloat($('#sterols').val()),
          albumen: parseFloat($('#albumen').val()),
          otherProteins: parseFloat($('#otherProteins').val()),
          nonProteinCompounds: parseFloat($('#nonProteinCompounds').val()),
          saltsOfInorganicAcids: parseFloat($('#saltsOfInorganicAcids').val()),
          ash: parseFloat($('#ash').val()),
          pigments: parseFloat($('#pigments').val()),
        }

        $(this).empty();
        $(this).append(`<div class="mini-loader"></div>`);
        anime({ targets: $(this)[0], width: '60px', borderRadius: '50%', duration: 100, easing: 'easeOutQuint' });

        const response = await editMilkQuality(id, data);

        if (response) {
          addConfirmationEmpty($('.animal-results-window'));
          setTimeout(() => { location.reload(true); }, 1500)
        }
      }

    });
  }

  /////////////////////////
  /////////////////////////
  /////////////////////////
  /* REPORT CREATION PAGE */
  /////////////////////////
  /////////////////////////
  /////////////////////////
  if (document.querySelector('#reports-page')) {

    $('.rml-item').on('click', async function () {
      if ($(this).attr('id') === 'milking-report') {
        const animals = await getAnimalsForGraph($('#reports-page').attr('data-farm-id'));
        let cowsData = [];
        animals.cows.forEach(cow => {
          if(cow.status !== 'alive') return;

          cowsData.push({
            name: cow.name,
            number: cow.number,
            results: cow.milkingResults,
            lactations: cow.lactations
          });
        });

        const curYearDay = moment().dayOfYear();
        let everyDayData = [];
        cowsData.forEach(data => {
          /* Create an estimate result for each day in lactational period*/
          /* From start of each lactation to the finish (or today if lactation isn't over) */
          let obj = {};
          obj.number = data.number;
          obj.name = data.name ? data.name : undefined;
          obj.lactations = [];
          obj.results = [];

          data.lactations.forEach(lact => {
            obj.lactations.push(lact);
            const start = new Date(lact.startDate);
            const finish = lact.finishDate ? new Date(lact.finishDate) : new Date();
            const daysInLactation = Math.round((finish.getTime() - start.getTime()) / 24 / 60 / 60 / 1000);
            for (let i = 0; i <= daysInLactation; i++) {
              let date = new Date(moment(lact.startDate).add(i, 'day'));
              let result;
              let daysClose = 10000;
              data.results.forEach(res => {
                if (!res.date || res.lactationNumber !== lact.number) return;

                const resDate = new Date(res.date);
                if (Math.abs((resDate.getTime() - date.getTime()) / 24 / 60 / 60 / 1000) < daysClose) {
                  daysClose = Math.abs((resDate.getTime() - date.getTime()) / 24 / 60 / 60 / 1000);
                  result = res;
                }

              });

              if (result) obj.results.push({ date, result: result.result, daysClose, lactationNumber: lact.number });
            }
          });
          everyDayData.push(obj);
        });


        everyDayData.forEach(data => {
          data.currentYearTotal = 0;
          data.fullLifeTotal = 0;

          data.results.forEach(res => {
            if (new Date(res.date) >= new Date(moment().startOf('year'))) data.currentYearTotal += res.result;

            data.fullLifeTotal += res.result;
          });

          data.lactations.forEach(lact => {
            lact.total = 0;

            data.results.forEach(res => {
              if (lact.number === res.lactationNumber) lact.total += res.result;
            });
          });
        });

        everyDayData.sort((a, b) => b.currentYearTotal - a.currentYearTotal);

        /* Preparing data for excel sheet format */
        let milkingResultsReport = [];
        let maxLacts = 0;
        everyDayData.forEach(data => {
          let currentArr = [];
          currentArr.push(data.number);
          data.name ? currentArr.push(data.name) : currentArr.push('-');
          data.currentYearTotal ? currentArr.push(data.currentYearTotal) : currentArr.push('-');
          data.fullLifeTotal ? currentArr.push(data.fullLifeTotal) : currentArr.push('-');

          data.lactations.forEach((lact, inx) => {
            if (inx === 0) {
              if (lact.number === 1) return;

              for (let i = 1; i < lact.number; i++) {
                currentArr.push('-');
              }
            }

            currentArr.push(lact.total);
            if (lact.number > maxLacts) maxLacts = lact.number;
          });

          milkingResultsReport.push(currentArr);
        });

        let headerLine = ['Номер', 'Кличка', 'Текущий год', 'Всего'];
        for (let i = 0; i < maxLacts; i++) {
          headerLine.push(`Лактация #${i + 1}`)
        }
        milkingResultsReport.unshift(headerLine);

        /* Creating a report */
        var wb = XLSX.utils.book_new();
        wb.Props = {
          Title: "Milking results report",
          Subject: "Report",
          Author: "Farmme",
          CreatedDate: new Date()
        };
        wb.SheetNames.push("Report Sheet");
        /* var ws_data = [['1', '2', '3'], ['suck', 'on it'], ['1', '2', '3', '4']]; */
        var ws = XLSX.utils.aoa_to_sheet(milkingResultsReport);
        ws['!cols'] = fitToColumn(milkingResultsReport);

        function fitToColumn(milkingResultsReport) {
          // get maximum character of each column
          return milkingResultsReport[0].map((a, i) => ({ wch: Math.max(...milkingResultsReport.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
        }
        wb.Sheets["Report Sheet"] = ws;

        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
          var view = new Uint8Array(buf);  //create uint8array as viewer
          for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
          return buf;
        }

        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        saveAs(blob, 'milking report.xlsx');
      }

      if ($(this).attr('id') === 'weight-report') {
        const animals = await getAnimalsForGraph($('#reports-page').attr('data-farm-id'));

        let formatedData = [];
        animals.animals.forEach(animal => {
          if(animal.status !== 'alive' || animal.weightResults.length === 0) return;

          animal.weightResults.sort((a, b) => new Date(b.date) - new Date(a.date));


          let growth = animal.weightResults[1] ? `${Math.round(animal.weightResults[0].result / animal.weightResults[1].result * 100 - 100)}%` : '-';

          formatedData.push([
            animal.number,
            animal.name ? animal.name : '-',
            animal.gender === 'male' ? 'Бык' : 'Корова',
            animal.weightResults[0].result,
            growth
          ]);
        });
        let headerLine = ['Номер', 'Кличка', 'Пол', 'Текущий вес', 'Рост'];
        formatedData.unshift(headerLine);

        /* Creating a report */
        var wb = XLSX.utils.book_new();
        wb.Props = {
          Title: "Weight results report",
          Subject: "Report",
          Author: "Farmme",
          CreatedDate: new Date()
        };
        wb.SheetNames.push("Report Sheet");
        /* var ws_data = [['1', '2', '3'], ['suck', 'on it'], ['1', '2', '3', '4']]; */
        var ws = XLSX.utils.aoa_to_sheet(formatedData);
        ws['!cols'] = fitToColumn(formatedData);

        function fitToColumn(formatedData) {
          // get maximum character of each column
          return formatedData[0].map((a, i) => ({ wch: Math.max(...formatedData.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
        }
        wb.Sheets["Report Sheet"] = ws;

        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
          var view = new Uint8Array(buf);  //create uint8array as viewer
          for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
          return buf;
        }

        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        saveAs(blob, 'weight report.xlsx');

      }

      if ($(this).attr('id') === 'slaughter-report') {
        const animals = await getAnimalsForGraph($('#reports-page').attr('data-farm-id'));

        let formatedData = [];
        animals.animals.forEach(animal => {
          if(animal.status !== 'alive' && !animal.butcherSuggestion) return;

          let sug;

          if(animal.butcherSuggestionReason === 'age') {
            sug = 'Животное достигло установленного возраста для списания'
          }
          if(animal.butcherSuggestionReason === 'weight') {
            sug = 'Животное достигло установленного веса для списания'
          }
          if(animal.butcherSuggestionReason === 'insemination') {
            let percent = Math.round(animal.inseminations.filter(insem => insem.success).length / animal.inseminations.length * 100)

            sug = `Животное плохо осеменяется (${percent}%)`;
          }


          formatedData.push([
            animal.number,
            animal.name ? animal.name : '-',
            animal.gender === 'male' ? 'Бык' : 'Корова',
            sug
          ]);
        });
        let headerLine = ['Номер', 'Кличка', 'Пол', 'Причина для списания'];
        formatedData.unshift(headerLine);

        /* Creating a report */
        var wb = XLSX.utils.book_new();
        wb.Props = {
          Title: "Write off recomendation report",
          Subject: "Report",
          Author: "Farmme",
          CreatedDate: new Date()
        };
        wb.SheetNames.push("Report Sheet");
        /* var ws_data = [['1', '2', '3'], ['suck', 'on it'], ['1', '2', '3', '4']]; */
        var ws = XLSX.utils.aoa_to_sheet(formatedData);
        ws['!cols'] = fitToColumn(formatedData);

        function fitToColumn(formatedData) {
          // get maximum character of each column
          return formatedData[0].map((a, i) => ({ wch: Math.max(...formatedData.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
        }
        wb.Sheets["Report Sheet"] = ws;

        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
          var view = new Uint8Array(buf);  //create uint8array as viewer
          for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
          return buf;
        }

        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        saveAs(blob, 'write off recomendation report.xlsx');

      }

      if ($(this).attr('id') === 'write-off-report') {
        const animals = await getAnimalsForGraph($('#reports-page').attr('data-farm-id'));

        let formatedData = [];
        animals.animals.forEach(animal => {
          if(animal.status === 'alive' || animal.status === 'dead-birth') return;

          let reason = '-', subReason = '-';

          if(animal.writeOffReason === 'sickness') reason = 'Падеж';
          if(animal.writeOffReason === 'sold') reason = 'Продажа';

          if(animal.writeOffSubReason === 'alive') subReason = 'Живьем';
          if(animal.writeOffSubReason === 'slaughtered') subReason = 'Забой';


          formatedData.push([
            animal.number,
            animal.name ? animal.name : '-',
            animal.gender === 'male' ? 'Бык' : 'Корова',
            reason,
            subReason,
            moment(animal.writeOffDate).format('DD.MM.YYYY'),
            animal.writeOffNote ? animal.writeOffNote : ''
          ]);
        });

        let headerLine = ['Номер', 'Кличка', 'Пол', '', '', 'Дата списания', 'Заметка'];
        formatedData.unshift(headerLine);

        /* Creating a report */
        var wb = XLSX.utils.book_new();
        wb.Props = {
          Title: "Write off report",
          Subject: "Report",
          Author: "Farmme",
          CreatedDate: new Date()
        };
        wb.SheetNames.push("Report Sheet");
        /* var ws_data = [['1', '2', '3'], ['suck', 'on it'], ['1', '2', '3', '4']]; */
        var ws = XLSX.utils.aoa_to_sheet(formatedData);
        ws['!cols'] = fitToColumn(formatedData);

        function fitToColumn(formatedData) {
          // get maximum character of each column
          return formatedData[0].map((a, i) => ({ wch: Math.max(...formatedData.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
        }
        wb.Sheets["Report Sheet"] = ws;

        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
          var view = new Uint8Array(buf);  //create uint8array as viewer
          for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
          return buf;
        }

        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        saveAs(blob, 'write off report.xlsx');

      }
      /* Calving report */
      if($(this).attr('id') === 'calving-report') {
        const animals = await getAnimalsForGraph($('#reports-page').attr('data-farm-id'));

        let formatedData = [];
        animals.cows.forEach(cow => {
          if(cow.status !== 'alive') return;

          cow.inseminations.sort((a, b) => new Date(a.date)- new Date(b.date));
          cow.lactations.sort((a, b) => new Date(a.startDate)- new Date(b.startDate));

          let status = undefined;

          if (cow.lactations.length === 0 && cow.inseminations.length > 0 && cow.inseminations.at(-1).success) status = 'inseminated-first';

          if (cow.lactations.length > 0 && cow.inseminations.length > 0 && cow.inseminations.at(-1).success && new Date(cow.inseminations.at(-1).date) > new Date(cow.lactations.at(-1).startDate)) status = 'inseminated-lactation'

          let insemDaysAfterCalv = '-';
          if (status === 'inseminated-lactation') {
            insemDaysAfterCalv = Math.round((new Date(cow.inseminations.at(-1).date).getTime() - new Date(cow.lactations.at(-1).startDate).getTime()) / 24 / 60 / 60 / 1000)
          }
          let calvingDate = '-';
          if (status === 'inseminated-lactation' || status === 'inseminated-first') {
            calvingDate = moment(cow.inseminations.at(-1).date).add(283, 'day').format('DD.MM.YYYY');
          }

          if(status === undefined) return;

          formatedData.push([
            cow.number,
            cow.name,
            status === 'inseminated-first' ? 'Первое осеменение' : 'Осеменение после лактации',
            insemDaysAfterCalv,
            calvingDate
          ]);
        });
        
        let headerLine = ['Номер', 'Кличка', 'Тип осеменения', 'День осем. после отела', 'Дата отела'];
        formatedData.unshift(headerLine);

        /* Creating a report */
        var wb = XLSX.utils.book_new();
        wb.Props = {
          Title: "Calving report",
          Subject: "Report",
          Author: "Farmme",
          CreatedDate: new Date()
        };
        wb.SheetNames.push("Report Sheet");
        /* var ws_data = [['1', '2', '3'], ['suck', 'on it'], ['1', '2', '3', '4']]; */
        var ws = XLSX.utils.aoa_to_sheet(formatedData);
        ws['!cols'] = fitToColumn(formatedData);

        function fitToColumn(formatedData) {
          // get maximum character of each column
          return formatedData[0].map((a, i) => ({ wch: Math.max(...formatedData.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
        }
        wb.Sheets["Report Sheet"] = ws;

        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
          var view = new Uint8Array(buf);  //create uint8array as viewer
          for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
          return buf;
        }

        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        saveAs(blob, 'calving report.xlsx');
      }

      /* Insemination report */
      if($(this).attr('id') === 'insemination-report') {
        const animals = await getAnimalsForGraph($('#reports-page').attr('data-farm-id'));

        let formatedData = [];
        animals.cows.forEach(cow => {
          if(cow.status !== 'alive') return;

          let status = undefined;
          let overdueDays = undefined;

          let insems = cow.inseminations.length > 0 ? true : false;
          let lacts = cow.lactations.length > 0 ? true : false;
          let fert = new Date() > new Date(moment(cow.birthDate).add('18', 'month')) ? true : false;

          if(!fert) return;

          cow.inseminations.sort((a, b) => new Date(a.date)- new Date(b.date));
          cow.lactations.sort((a, b) => new Date(a.startDate)- new Date(b.startDate));

          if(!lacts && !insems) {
            status = 'first-insemination'
          }
          if(!lacts && insems && !cow.inseminations.at(-1).success) {
            status = 'first-insemination'
          }

          if(lacts && new Date() > new Date(moment(cow.lactations.at(-1).startDate).add('60', 'days')) && !insems) {
            status = 'lact-insemination'
            overdueDays = Math.round((Date.now() - new Date(moment(cow.lactations.at(-1).startDate).add('60', 'days')).getTime()) / 1000 / 60 / 60 / 24)
          }
          if(lacts && new Date() > new Date(moment(cow.lactations.at(-1).startDate).add('60', 'days')) && insems && !cow.inseminations.at(-1).success) {
            status = 'lact-insemination'
            overdueDays = Math.round((Date.now() - new Date(moment(cow.lactations.at(-1).startDate).add('60', 'days')).getTime()) / 1000 / 60 / 60 / 24)
          }
          if(lacts && new Date() > new Date(moment(cow.lactations.at(-1).startDate).add('60', 'days')) && insems && cow.inseminations.at(-1).date < cow.lactations.at(-1).startDate) {
            status = 'lact-insemination'
            overdueDays = Math.round((Date.now() - new Date(moment(cow.lactations.at(-1).startDate).add('60', 'days')).getTime()) / 1000 / 60 / 60 / 24)
          }


          if(status === undefined) return;

          formatedData.push([
            cow.number,
            cow.name,
            status === 'first-insemination' ? 'Первое осеменение' : 'Осеменение после лактации',
            overdueDays === undefined ? '-' : overdueDays
          ]);
        });
        
        let headerLine = ['Номер', 'Кличка', '', 'Перестой'];
        formatedData.unshift(headerLine);

        /* Creating a report */
        var wb = XLSX.utils.book_new();
        wb.Props = {
          Title: "Insemination report",
          Subject: "Report",
          Author: "Farmme",
          CreatedDate: new Date()
        };
        wb.SheetNames.push("Report Sheet");
        /* var ws_data = [['1', '2', '3'], ['suck', 'on it'], ['1', '2', '3', '4']]; */
        var ws = XLSX.utils.aoa_to_sheet(formatedData);
        ws['!cols'] = fitToColumn(formatedData);

        function fitToColumn(formatedData) {
          // get maximum character of each column
          return formatedData[0].map((a, i) => ({ wch: Math.max(...formatedData.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
        }
        wb.Sheets["Report Sheet"] = ws;

        var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
        function s2ab(s) {
          var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
          var view = new Uint8Array(buf);  //create uint8array as viewer
          for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
          return buf;
        }

        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
        saveAs(blob, 'insemination report.xlsx');
      }
    });
  }





});