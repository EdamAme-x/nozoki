/**
  Created by @amex2189
  @Obstruction
*/
import { tw } from "https://cdn.skypack.dev/twind";

console.log("Welcome to Nozoki OC / Frontend by @amex2189");

let target = "";
let api = "https://tumuri.deno.dev/";

function getTicket(url) {
  if (url.includes("?")) {
    url = url.split("?")[0];
  }
  let ticket = url.split("/").pop();
  return ticket;
}

async function getLastMessage(url) {
  const ticket = getTicket(url);
  const res = await fetch(api + ticket);
  const data = res.json();

  return data;
}

const consts = {
  creater: "ame_x (@amex2189) & Piloking",
};

window.onload = function () {
  $("#app").in(div(
    {
      class: tw("flex flex-col items-center w-full h-screen p-4 bg-gray-900"),
    },
    div(
      {
        class: tw("mb-5"),
      },
      h1({
        class: tw("text-3xl"),
      }, "OC Observer"),
    ),
    div(
      {
        class: tw("mb-4"),
      },
      input({
        $input: (e) => {
          console.log("URL: " + e.target.value);
          target = e.target.value;
        },
        placeholder: "~/ti/g2/~",
        class: tw("rounded text-xl text-black border-none nuem-x"),
      }),
    ),
    div({
      class: tw("h-full overflow-y-scroll log-x"),
    }, "{ ここにチャットログ }"),
    div(
      {},
      p({
        class: "",
      }, "&copy; " + consts.creater),
    ),
  ));
};
