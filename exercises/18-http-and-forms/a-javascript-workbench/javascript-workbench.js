let form = document.querySelector("form");
let results = document.querySelector("p");

form.addEventListener("submit", event => {
  let fun = new Function("", form.elements.code.value);
  try {
    results.textContent = fun();
  } catch (e) {
    results.textContent = e.toString();
  }
  event.preventDefault();
});
