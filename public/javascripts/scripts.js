(function ($) {

  window.setTimeout(function () {
    $(".toast").slideUp(500, function () {
      $(this).remove();
    });
  }, 10000);
  
})(jQuery); // end of jQuery name space