import $ from 'jquery';


export const addConfirmationEmpty = (parentEl) => {
  parentEl.empty().prepend(`<div class="ai-success-block"><ion-icon name="checkmark-circle"></ion-icon></div>`);
  $('.ai-success-block ').addClass('animate__animated').addClass('animate__fadeIn').css('display', 'flex');
}