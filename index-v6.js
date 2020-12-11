const searchBox = document.querySelector('#search');
const results = document.querySelector('#results');
const count = document.querySelector('#count');

const { fromEvent } = rxjs;
const { pluck, debounceTime, filter, tap, map,mergeMap, defaultIfEmpty } = rxjs.operators;
const { ajax } = rxjs.ajax;
const URL = 'https://cors-anywhere.herokuapp.com/https://en.wikipedia.org/w/api.php?action=opensearch&search=';
const notEmpty = input => !!input && input.trim().length > 0;

function clearResults(container) {
  while(container.childElementCount > 0) {
    container.removeChild(container.firstChild);
  }
}

function appendResults(results, container) {
  const [,_results,,links] = results;
  _results.forEach((result, idx) => {
    let li = document.createElement('li');
    let anchor = document.createElement('a');
    anchor.href = links[idx];
    anchor.target = "_blank";
    let text = document.createTextNode(result);
    anchor.appendChild(text)
    li.appendChild(anchor);
    container.appendChild(li);
  });
}
const keyups = fromEvent(searchBox, 'keyup');

keyups.pipe(
  pluck('target','value'),
  debounceTime(500),
  filter(notEmpty),
  tap(term => console.log(`Searching with term ${term}`)),
  map(query => URL + query),
  mergeMap(query =>
    ajax(query)
    .pipe(
    tap(res => console.log(res)),
    pluck('response'),
    defaultIfEmpty([])))
).subscribe(arr => {
      count.innerHTML = `${arr[1].length} results`;
      clearResults(results);
      appendResults(arr, results);
});
