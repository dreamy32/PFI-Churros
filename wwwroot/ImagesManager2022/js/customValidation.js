// Author: Nicolas Chourot
$(() => {

  $(".Email").each(function () {
    $(this).attr(
      "pattern",
      /* https://regex-generator.olafneumann.org/ vraiment cool*/
      /* String.raw pour ne pas interpréter les "\" */
      String.raw`^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$`
    );
  });
  $(".URL").each(function () {
    $(this).attr(
      "pattern",
      String.raw`(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$`
    );
  });
  $(".phone").each(function () {
    $(this).attr("pattern", String.raw`^\(\d\d\d\)\s\d\d\d-\d\d\d\d$`);
    $(this).mask("(999) 999-9999");
    $(this).attr("onchange", "this.setCustomValidity('')");
    $(this).attr("onkeypress", "this.setCustomValidity('')");
  });

  $(".zipcode").each(function () {
    $(this).attr(
      "pattern",
      String.raw`^[a-zA-Z][0-9]+[a-zA-Z]\s[0-9]+[a-zA-Z][0-9]+$`
    );
    $(this).mask("a9a 9a9");
    $(this).attr("onchange", "this.setCustomValidity('')");
    $(this).attr("onkeypress", "this.setCustomValidity('')");
  });

  $("input[type='checkbox']").each(function () {
    $(this).attr("onchange", "this.setCustomValidity('')");
  });

  $("input[type='number']").each(function () {
    $(this).attr("onchange", "this.setCustomValidity('')");
  });

  $("input[type='radio']").each(function () {
    $(this).attr(
      "onchange",
      "this.setCustomValidity(''); document.getElementsByName('" +
      $(this).attr("name") +
      "').forEach((radio) => {radio.setCustomValidity('')});"
    );
    console.log($(this).attr("onchange"));
  });

  $(".MatchedPassword").each(function () {
    let password = $(this);
    let pattern = String.raw`^\S{6,}$`;
    let matchedPassword = $(`#${password.attr('matchedPasswordId')}`);
    password.attr('pattern', pattern);
    password.attr("onchange", `if(this.checkValidity()) {form.${matchedPassword.attr('id')}.pattern = this.value; form.${matchedPassword.attr('id')}.required=true;}`);
    password.attr("onfocus", `if(this.checkValidity()) {form.${matchedPassword.attr('id')}.pattern = this.value; form.${matchedPassword.attr('id')}.required=this.value!='';}`);
  })

  $(".MatchedInput").each(function () {
    let input = $(this);
    let matchedInput = $(`#${input.attr('matchedInputId')}`);
    input.attr("onchange", `if(this.checkValidity()) {form.${matchedInput.attr('id')}.pattern = this.value; form.${matchedInput.attr('id')}.required=true;}`);
    input.attr("onfocus", `if(this.checkValidity()) {form.${matchedInput.attr('id')}.pattern = this.value; form.${matchedInput.attr('id')}.required=this.value!='';}`);
  })
});