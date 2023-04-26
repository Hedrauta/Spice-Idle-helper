// Not available in GreaseMonkey (Idk why, but it just won't work. Prefer using TamperMonkey)
// ==UserScript==
// @name         Peak/min @ Timestamp
// @namespace    https://github.com/Hedrauta/Spice-Idle-helper
// @version      0.3
// @description  injects informations about "best" timing on Prestige/Ascend/Collaps
// @author       /u/H3draut3r (Git/Hedrauta)
// @match        https://zakuro98.github.io/Spice-Idle/
// @updateURL    https://raw.githubusercontent.com/Hedrauta/Spice-Idle-helper/main/PPM_at_timestamp.user.js
// @downloadURL  https://raw.githubusercontent.com/Hedrauta/Spice-Idle-helper/main/PPM_at_timestamp.user.js
// @supportURL   https://github.com/Hedrauta/Spice-Idle-helper/issues
// @noframes
// @run-at 			 document-end
// ==/UserScript==

function injectPPMText() {
  let injectedText = [
    {
      id: "prestige_per_s",
      text: "Peak: 0 /min @ 0s",
      divClass: "prestige_info",
      class: "prestige_text rainbow_spice",
      style: "display: none;",
    },
    {
      id: "ascend_per_s",
      text: "Peak: 0 /min @ 0s",
      divClass: "ascension_info",
      class: "ascend_text runes",
      style: "display: none;",
    },
    {
      id: "collapse_per_s",
      text: "Peak: 0 /min @ 0s",
      divClass: "collapse_info",
      class: "collapse_text atomic_spice",
      style: "display: none;",
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
injectPPMText();

// define variable "before function", so we can "save" data across checks
let peak_prestige_per_s = new Decimal(0);
let peak_ascend_per_s = 0;
let peak_collapse_per_s = 0;
let peak_time_prestige = 0;
let peak_time_ascend = 0;
let peak_time_collapse = 0;

// update all variable at once
function update_PPM() {
  // first prestige, keep the value up2date, even "off"-tab
  if (game.color_boosts >= 10 || game.prestige > 0) {
    // Part of game-code to math pending Rainbow Spice (by Zakuro98)
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
    // end of game-code

    if (game.prestige_time_played < peak_time_prestige) {
      // reset if prestiged
      peak_time_prestige = 0;
      peak_prestige_per_s = 0;
    }
    if (
      Decimal.cmp(
        prestige_up.div(new Decimal(game.prestige_time_played)),
        peak_prestige_per_s
      ) == 1
    ) {
      peak_prestige_per_s = prestige_up.div(game.prestige_time_played);
      peak_time_prestige = game.prestige_time_played;
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
  } else {
    document.getElementById("prestige_per_s").style = "display: none;";
  }

  // next: Ascend
  if (game.prestige_bought[25] || game.ascend > 0) {
    // game-code to math pending Ansus Runes (by Zakuro98)
    let asc_amount = Math.floor(
      (game.rainbow_spice.log(Decimal.pow(2, 512)) / 2) ** 8
    );
    if (game.research_complete[10] >= 1) {
      asc_amount = Math.floor(
        (game.rainbow_spice.log(Decimal.pow(2, 512)) / 2) ** 8 *
          (Math.log2((game.collapse + 25) / 25) ** 2 * 6.27 + 1)
      );
    }
    // end of game-code

    if (game.ascend_time_played < peak_time_ascend) {
      // reset if ascended
      peak_ascend_per_s = 0;
      peak_time_ascend = 0;
    }
    let asc_per_s = Math.floor(asc_amount / game.ascend_time_played);
    if (asc_per_s == Infinity) {
      asc_per_s = 0;
    }
    if (asc_per_s > peak_ascend_per_s) {
      peak_ascend_per_s = asc_per_s;
      peak_time_ascend = game.ascend_time_played;
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
  } else {
    document.getElementById("ascend_per_s").style = "display: none;";
  }

  // next Collapse
  if (game.ascend_complete[5]) {
    // game-code to math pending Atomic Spice (by Zakuro98)
    let collapse_amount = game.collapse_spice.pow(5 * 10 ** -10).floor();
    if (collapse_amount.cmp(Decimal.pow(10, 1800)) >= 0) {
      collapse_amount = collapse_amount
        .div(Decimal.pow(10, 200))
        .pow(10 / ((collapse_amount.log(10) * 0.3 - 56) ** 0.5 - 2))
        .mul(Decimal.pow(10, 200));
    } else if (collapse_amount.cmp(Decimal.pow(10, 200)) >= 0) {
      collapse_amount = collapse_amount
        .div(Decimal.pow(10, 200))
        .pow(0.5)
        .mul(Decimal.pow(10, 200));
    }

    if (game.research_complete[5] >= 1 && game.collapse_challenge === 0) {
      let rune_amount = Decimal.pow(
        1.2,
        (game.total_rune_power / 10 ** 28) ** 0.2
      ).mul(game.total_rune_power ** 0.5 / (5 * 10 ** 12) + 1);
      if (rune_amount.cmp(Decimal.pow(10, 50)) >= 0) {
        rune_amount = Decimal.pow(
          10,
          rune_amount.div(Decimal.pow(10, 50)).log(10) ** 0.5 + 50
        );
      }
      if (rune_amount.cmp(Decimal.pow(10, 100)) >= 0) {
        rune_amount = Decimal.pow(10, 100);
      }

      collapse_amount = collapse_amount.mul(rune_amount);
    }
    let total_completions = 0;
    for (let i = 0; i < 6; i++) {
      total_completions += game.collapse_complete[i];
    }
    if (game.research_complete[22] >= 1 && game.collapse_challenge === 0) {
      collapse_amount = collapse_amount.mul(
        Decimal.pow(888, total_completions)
      );
    }
    // game-code-end

    if (game.collapse_time_played < peak_time_collapse) {
      peak_collapse_per_s = 0;
      peak_time_collapse = 0;
    }
    let col_per_s = collapse_amount / game.collapse_time_played;
    if (col_per_s == Infinity) {
      col_per_s = 0;
    }
    if (peak_collapse_per_s < col_per_s) {
      peak_collapse_per_s = col_per_s;
      peak_time_collapse = game.collapse_time_played;
    }

    if (peak_collapse_per_s > 0) {
      document.getElementById("collapse_per_s").style = "display: block;";
      document.getElementById("collapse_per_s").innerHTML =
        "Peak: " +
        format_num(peak_collapse_per_s * 60, game.notation) +
        " /min @ " +
        format_time(peak_time_collapse);
    } else {
      document.getElementById("collapse_per_s").style = "display: none;";
    }
  } else {
    document.getElementById("collapse_per_s").style = "display: none;";
  }
}

setInterval(update_PPM, 50);
