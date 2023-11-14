/**
  Created by @amex2189
  @Obstruction
*/
console.log("Welcome to Nozoki OC / Frontend by @amex2189");

let password = "";
let target = "";
let api = "https://tumuri.deno.dev";

function getTicket(url) {
  if (url.includes("?")) {
    url = url.split("?")[0];
  }
  let ticket = url.split("/").pop();
  return ticket;
}

window.onload = function () {
  $("#app").in(div({}, "hi!!"));
};
