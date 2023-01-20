import $ from 'jquery';


export const addConfirmationEmpty = (parentEl) => {
  parentEl.empty().prepend(`<div class="aa-success-block"><ion-icon name="checkmark-circle"></ion-icon></div>`);
  $('.aa-success-block ').addClass('animate__animated').addClass('animate__fadeIn').css('display', 'flex');
}