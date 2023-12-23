import $ from 'jquery';


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
}