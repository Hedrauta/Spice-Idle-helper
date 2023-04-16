// ==UserScript==
// @name         Show Time in Tab
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shows current time of pre/asc/col in the Tab
// @author       /u/H3draut3r (Git/Hedrauta)
// @match        https://zakuro98.github.io/Spice-Idle/
// ==/UserScript==

function injectButtons() {
  const buttonData = [
    { id: 'prestige_last_time', text: 'TIME&nbsp;SINCE&nbsp;PRESTIGE<br>0:00:00:00.000', divId: 'prestige_tabs', class: 'subtab unlocked' },
    { id: 'ascend_last_time', text: 'TIME&nbsp;SINCE&nbsp;ASCEND<br>0:00:00:00.000', divId: 'ascension_tabs', class: 'subtab unlocked' },
    { id: 'collape_last_time', text: 'TIME&nbsp;SINCE&nbsp;COLLAPSE<br>0:00:00:00.000', divId: 'collapse_tabs', class: 'subtab unlocked' }
  ];
  buttonData.map(data => {
    let inject = document.getElementById(data.divId);

    const button = document.createElement('button');
    button.id = data.id;
    button.innerText = data.text;
    button.classList = data.class;

    inject.appendChild(button);
  });
}
injectButtons();


function update_times() {
  document.getElementById("prestige_last_time").innerHTML = "TIME&nbsp;SINCE&nbsp;PRESTIGE:<br>"+format_time(game.prestige_time_played)
  document.getElementById("ascend_last_time").innerHTML = "TIME&nbsp;SINCE&nbsp;ASCEND:<br>"+format_time(game.ascend_time_played)
  document.getElementById("collapse_last_time").innerHTML = "TIME&nbsp;SINCE&nbsp;COLLAPSE:<br>"+format_time(game.collapse_time_played)
}

setInterval(update_times, 50);