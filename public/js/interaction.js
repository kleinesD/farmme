import $ from 'jquery';
import axios from 'axios';


export const addConfirmationEmpty = (parentEl) => {
  parentEl.empty().prepend(`<div class="ai-success-block"><ion-icon name="checkmark-circle"></ion-icon></div>`);
  $('.ai-success-block ').addClass('animate__animated').addClass('animate__fadeIn').css('display', 'flex');
}

export const askAus = (parent, title, btn1, btn2, danger, data) => {
  parent.prepend(`
    <div class="aus-container" data-data="${data}">
      <div class="aus-block">
        <div class="aus-block-title">${title}</div>
        <div class="aus-btns-block">
          <div class="aus-btn ${danger ? 'aus-btn-dang' : ''}" id="aus-btn-1">${btn1}</div>
          <div class="aus-btn aus-btn-highlighted" id="aus-btn-2">${btn2}</div>
        </div>
      </div>
    </div>
  `)
}

export const emptyBlock = (parent, title, text) => {
  if (parent.css('position') !== 'absolute') parent.css('position', 'relative');

  parent.prepend(`
    <div class="no-info-block">
      <div class="no-info-block-background"></div>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `)
}

export const removeEmptyBlock = (parent) => {
  parent.find('.no-info-block').remove();
}

export const loadingBlock = (parent) => {
  if (parent.css('position') !== 'absolute') parent.css('position', 'relative');

  parent.prepend(`
    <div class="loading-block">
      <div class="loading-icon"></div>
    </div>
  `)
}

export const removeloadingBlock = (parent) => {
  parent.find('.loading-block').remove();
  parent.find('.loading-block-window').remove();
}

export const quickTitle = () => {
  $('body').on('mouseenter', '*', function () {
    if ($(this).attr('qt') === undefined || $(this).attr('qt') === '') return;

    if($(this).css('position') === 'static') $(this).css('position', 'relative');
    
    $(this).append(`
      <div class="quick-title">${$(this).attr('qt')}</div>
    `);
  });

  $('body').on('mouseleave', '*', function () {
    $(this).find('.quick-title').remove();
  });
};

export const quickTitleLeft = () => {
  $('body').on('mouseenter', '*', function () {
    if ($(this).attr('qtl') === undefined || $(this).attr('qtl') === '') return;

    if($(this).css('position') === 'static') $(this).css('position', 'relative');
    
    $(this).append(`
      <div class="quick-title-left">${$(this).attr('qtl')}</div>
    `);
  });

  $('body').on('mouseleave', '*', function () {
    $(this).find('.quick-title-left').remove();
  });
};

export const quickTitleRight = () => {
  $('body').on('mouseenter', '*', function () {
    if ($(this).attr('qtr') === undefined || $(this).attr('qtr') === '') return;

    if($(this).css('position') === 'static') $(this).css('position', 'relative');
    
    $(this).append(`
      <div class="quick-title-right">${$(this).attr('qtr')}</div>
    `);
  });

  $('body').on('mouseleave', '*', function () {
    $(this).find('.quick-title-right').remove();
  });
};

export const getIcons = async () => {
  try{
    const res = await axios({
      method: 'GET',
      url: '/api/users/icons/get/'
    });

    if(res.data.status === 'success') return res.data.data.files;

  } catch(err) {
    console.log(err);
  }
}