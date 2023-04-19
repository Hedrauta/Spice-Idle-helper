// ==UserScript==
// @name         Show Time in Tab
// @namespace    https://github.com/Hedrauta/Spice-Idle-helper
// @version      0.2
// @description  injects useful informations into prestige/ascend/collapse
// @author       /u/H3draut3r (Git/Hedrauta)
// @match        https://zakuro98.github.io/Spice-Idle/
// @updateURL    https://raw.githubusercontent.com/Hedrauta/Spice-Idle-helper/main/time-in-tab.js
// @downloadURL  https://raw.githubusercontent.com/Hedrauta/Spice-Idle-helper/main/time-in-tab.js
// @supportURL   https://github.com/Hedrauta/Spice-Idle-helper/issues
// ==/UserScript==

function injectButtons() {
  let buttonData = [
    {
      id: "prestige_last_time",
      text: "TIME&nbsp;SINCE&nbsp;PRESTIGE<br>0:00:00:00.000",
      divId: "prestige_tabs",
      class: "subtab unlocked",
    },
    {
      id: "ascend_last_time",
      text: "TIME&nbsp;SINCE&nbsp;ASCEND<br>0:00:00:00.000",
      divId: "ascension_tabs",
      class: "subtab unlocked",
    },
    {
      id: "collape_last_time",
      text: "TIME&nbsp;SINCE&nbsp;COLLAPSE<br>0:00:00:00.000",
      divId: "collapse_tabs",
      class: "subtab unlocked",
    },
  ];
  buttonData.map((data) => {
    let inject = document.getElementById(data.divId);

    let button = document.createElement("button");
    button.id = data.id;
    button.innerHTML = data.text;
    button.classList = data.class;

    inject.appendChild(button);
  });
}
injectButtons();

function injectText() {
  let injectedText = [
    {
      id: "prestige_per_s",
      text: "Peak 0 /min @ 0s",
      divClass: "prestige_info",
      class: "prestige_text rainbow_spice",
      style: "display: block;",
    },
    {
      id: "ascend_per_s",
      text: "Peak 0 /min @ 0s",
      divClass: "ascension_info",
      class: "ascend_text runes",
      style: "display: block;",
    },
  ];
  injectedText.map((data) => {
    let inject = document.getElementsByClassName(data.divClass)[0];
    let text = document.createElement("p");
    text.id = data.id;
    text.innerHTML = data.text;
    text.classList = data.class;
    text.style = data.style;

    inject.appendChild(text);
  });
}
injectText();
let peak_prestige_per_s = new Decimal(0);
let peak_ascend_per_s = 0;
let peak_time_prestige = 0;
let peak_time_ascend = 0;
function update_times() {
  if (
    game.tab == 1 &&
    (game.prestige_bought[11] || game.ascend >= 1 || game.collapse >= 1)
  ) {
    document.getElementById("prestige_last_time").innerHTML =
      "TIME&nbsp;SINCE&nbsp;PRESTIGE:<br>" +
      format_time(game.prestige_time_played);
    if (game.subtab[game.tab] == 0) {
      let prestige_up = null;

      let ascend_bonus = game.ascend / 20;
      if (game.ascend >= 10240) {
        ascend_bonus = 5 * (game.ascend - 7740) ** 0.5 + 262;
      }

      if (game.color_boosts <= 16) {
        prestige_up = new Decimal(2).pow(
          (game.color_boosts - 10) / 3 + ascend_bonus
        );
      } else {
        prestige_up = new Decimal(2).pow(
          (game.color_boosts - 8) / 4 + ascend_bonus
        );
      }
      if (
        Decimal.cmp(
          prestige_up.div(game.prestige_time_played),
          peak_prestige_per_s
        ) == 1
      ) {
        peak_prestige_per_s = prestige_up.div(game.prestige_time_played);
        peak_time_prestige = game.prestige_time_played;
      }
      if (game.prestige_time_played < peak_time_prestige) {
        peak_time_prestige = 0;
        peak_prestige_per_s = 0;
      }
      if (Decimal.cmp(peak_prestige_per_s, 0) == 1) {
        document.getElementById("prestige_per_s").style = "display: block;";
        document.getElementById("prestige_per_s").innerHTML =
          "Peak: " +
          format_idec(Decimal.mul(peak_prestige_per_s, 60), game.notation) +
          "/min @ " +
          format_time(peak_time_prestige);
      } else {
        document.getElementById("prestige_per_s").style = "display: none;";
      }
    }
  } else if (game.tab == 2) {
    document.getElementById("ascend_last_time").innerHTML =
      "TIME&nbsp;SINCE&nbsp;ASCEND:<br>" + format_time(game.ascend_time_played);
    if (game.subtab[3] == 0) {
      let asc_amount = Math.floor(
        (game.rainbow_spice.log(Decimal.pow(2, 512)) / 2) ** 8
      );
      if (game.research_complete[10] >= 1) {
        asc_amount = Math.floor(
          (game.rainbow_spice.log(Decimal.pow(2, 512)) / 2) ** 8 *
            (Math.log2((game.collapse + 25) / 25) ** 2 * 6.27 + 1)
        );
      }
      let asc_per_s = Math.floor(asc_amount / game.ascend_time_played);
      if (asc_per_s == Infinity) {
        asc_per_s = 0;
      }
      if (asc_per_s > peak_ascend_per_s) {
        peak_ascend_per_s = asc_per_s;
        peak_time_ascend = game.ascend_time_played;
      }
      if (game.ascend_time_played < peak_time_ascend) {
        peak_ascend_per_s = 0;
        peak_time_ascend = 0;
      }
      if (peak_ascend_per_s > 0) {
        document.getElementById("ascend_per_s").style = "display: block";
        document.getElementById("ascend_per_s").innerHTML =
          "Peak " +
          format_num(peak_ascend_per_s * 60, game.notation) +
          " /min @ " +
          format_time(peak_time_ascend);
      } else {
        document.getElementById("ascend_per_s").style = "display: none;";
      }
    }
  } else if (game.tab == 3 && game.collapse >= 5) {
    document.getElementById("collapse_last_time").innerHTML =
      "TIME&nbsp;SINCE&nbsp;COLLAPSE:<br>" +
      format_time(game.collapse_time_played);
  }
}

setInterval(update_times, 50);
