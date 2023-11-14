/**
  Created by @amex2189
  @Obstruction
*/
import { tw } from "https://cdn.skypack.dev/twind";
import Swal from "https://esm.sh/sweetalert2@11.9.0";

console.log("Welcome to Nozoki OC / Frontend by @amex2189");

let target = "";
let api = "https://tumuri.deno.dev/";
let started = false;
let logs = [
  {
    name: "ame_x@amex2189",
    content: "皆さんこんにちは！ このメッセージはサンプルです。",
    time: getCurrentTime(),
  },
];
let lastMessage = "";

function getCurrentTime() {
  const now = new Date();

  return `${now.getHours()}:${now.getMinutes()}`;
}

function getTicket(url) {
  if (url.includes("?")) {
    url = url.split("?")[0];
  }
  const ticket = ("/" + url).split("/").pop();
  return ticket;
}

async function getLastMessage(url) {
  const ticket = getTicket(url);
  const res = await fetch(api + ticket);
  const data = await res.json();

  return data;
}

function start() {
  if (started) {
    return Swal.fire({
      icon: "error",
      title: "既に監視を開始しています。",
    });
  } else if (target.replace(" ", "") === "") {
    return Swal.fire({
      icon: "error",
      title: "入力が有りません。",
    });
  }

  started = !0;
  console.clear();
  logs = [];

  const thread = setInterval(async () => {
    const res = await getLastMessage(target);

    if (lastMessage !== (res.sendBy + res.text)) {
      logs.push({
        name: res.sendby ? res.name ?? "MEMBER" : "BOT",
        content: res.text,
        time: getCurrentTime(),
      });

      lastMessage = res.sendBy + res.text;

      console.log(logs[logs.length - 1]);
      $("#log").out.appendChild(logComponent(logs[logs.length - 1]));
    }
  }, 750);
}

function logComponent(log) {
  console.log(log);
  return div({}, `${log.name}:${log.content}:${log.time}`);
}

window.onload = function () {
  $("#app").in(div(
    {
      class: tw("flex flex-col items-center w-full h-screen p-4"),
    },
    div(
      {
        class: tw("mb-3"),
      },
      h1(
        {
          class: tw("text-3xl inline-flex items-center h-[50px]"),
        },
        img(
          {
            src: "/static/square.png",
            alt: "Logo",
            height: "30px",
            class: tw("mr-4 h-[30px]"),
          },
        ),
        "OC Observer",
      ),
    ),
    div(
      {
        class: tw("mb-4"),
      },
      input(
        {
          $input: (e) => {
            target = e.target.value;
          },
          placeholder: "~/ti/g2/~",
          class: tw(
            "rounded text-md text-black border-none nuem-x bg-[#00000000] text-white focus:outline-none p-1",
          ),
        },
      ),
      button({
        $click: start,
        class: tw(
          "py-[6px] px-3 ml-2 rounded bg-gray-700 text-white border-none hover:bg-gray-600 focus",
        ),
      }, "Start"),
    ),
    div({
      class: tw(
        "h-full overflow-y-scroll log-x w-[320px] bg-[#282828] rounded",
      ),
      id: "log",
    }),
    div(
      {},
      p(
        {
          class: tw("mt-2"),
        },
        "&copy;",
        span({
          class: tw("text-red-500 ml-1"),
        }, "ame_x"),
        span({
          class: tw("mx-1"),
        }, "&"),
        span({
          class: tw("text-green-500 ml-1"),
        }, "piloking"),
      ),
    ),
  ));
};
