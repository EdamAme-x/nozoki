/**
  Created by @amex2189
  @Obstruction
*/
import { tw } from "https://cdn.skypack.dev/twind";
import Swal from "https://esm.sh/sweetalert2@11.9.0";

console.log("Welcome to Nozoki OC / Frontend by @amex2189");

let target = "";
// そんなコードジロジロ見ないで //
const api = "https://tumuri.deno.dev/";
let started = false;
let logs = [
  {
    name: "ame_x@amex2189",
    content: "皆さんこんにちは！ このメッセージはサンプルです。",
    time: getCurrentTime(),
    raw: {}
  },
];

let lastMessage = "";

/**
 * Returns the current time in the format HH:MM.
 *
 * @return {string} The current time in the format HH:MM.
 */
function getCurrentTime() {
  const now = new Date();

  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Extracts the ticket from a given URL.
 *
 * @param {string} url - The URL from which to extract the ticket.
 * @return {string} The extracted ticket.
 */
function getTicket(url) {
  if (url.includes("?")) {
    url = url.split("?")[0];
  }
  const ticket = ("/" + url).split("/").pop();
  return ticket;
}

/**
 * Retrieves the last message from the specified URL.
 *
 * @param {string} url - The URL to retrieve the last message from.
 * @return {Promise<any>} A Promise that resolves to the last message data.
 */
async function getLastMessage(url) {
  const ticket = getTicket(url);
  const res = await fetch(api + ticket);
  const data = await res.json();

  return data;
}

/**
 * Starts the monitoring process.
 *
 * @return {undefined} No return value.
 */
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
  $("#log").in(div({}));

  const thread = setInterval(async () => {
    const res = await getLastMessage(target);

    if (lastMessage !== res.sendBy + res.text) {
      logs.push({
        name:
          res.sendby ? (res.raw.userInfo[0].name ? res.raw.userInfo[0].name : "MEMBER") : "BOT", 
        content: res.text,
        time: getCurrentTime(),
        raw: res
      });

      lastMessage = res.sendBy + res.text;

      $("#log").out.appendChild(logComponent(logs[logs.length - 1]));
    }
  }, 550);

  setTimeout(() => {
    clearInterval(thread);
    Swal.fire({
      icon: "success",
      title: "無料版はここまでです。",
      text: "購入は @amex2189 まで",
      confirmButtonText: "OK",
    }).then(() => {
      location.reload();
    });
  }, 900000);
}

/**
 * Logs the given component and returns a div element with the logged information.
 *
 * @param {string} log - The message to be logged.
 * @return {HTMLElement} - A div element containing the logged information.
 */
function logComponent(log) {
  console.log(log);
  return div(
    {
      class: tw("w-full my-1"),
    },
    span(
      {
        class: tw("ml-3 text-gray-400 w-2/3 overflow-hidden"),
      },
      log.name
    ),
    div(
      {
        class: tw("mt-1 ml-2 flex items-end justify-center h-auto"),
      },
      div(
        {
          class: tw(
            "w-4/5 overflow-hidden text-ellipsis text-sm text-white bg-gray-700 rounded p-1 chat-x hover:bg-gray-800 hover:cursor-pointer hover:text-gray-300 transition duration-300"
          ),
          $click: () => {
            Swal.fire({
              text: JSON.stringify(log.raw, null, 2),
            })
          }
        },
        log.content ?? "< 画像 / 動画 / スタンプ・絵文字 / Flex / その他 >" // NOTE: 後で細かい区分
      ),
      div(
        {
          class: tw(
            "w-1/5 text-right text-gray-400 text-sm flex flex-col items-center justify-end"
          ),
        },
        log.time
      )
    )
  );
}

/**
 * Initializes the window when it loads.
 *
 * @return {void}
 */
window.onload = function () {
  $("#app").in(
    div(
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
          img({
            src: "/static/square.png",
            alt: "Logo",
            height: "30px",
            class: tw("mr-4 h-[30px]"),
          }),
          "OC Observer"
        )
      ),
      div(
        {
          class: tw("mb-4"),
        },
        input({
          $input: (e) => {
            target = e.target.value;
          },
          placeholder: "~/ti/g2/~",
          class: tw(
            "rounded text-md text-black border-none nuem-x bg-[#00000000] text-white focus:outline-none p-1 border-2 border-gray-300"
          ),
        }),
        button(
          {
            $click: start,
            class: tw(
              "py-[6px] px-3 ml-2 rounded bg-gray-700 text-white border-none hover:bg-gray-600 focus"
            ),
          },
          "Start"
        )
      ),
      div({
        class: tw(
          "h-full overflow-y-scroll log-x w-[275px] bg-[#282828] rounded p-2"
        ),
        id: "log",
      }),
      div(
        {
          class: tw("mt-1 flex flex-row items-center h-[50px] w-[275px]"),
        },
        button({
          class: tw("w-1/2 rounded bg-gray-700 text-white border-none hover:bg-gray-600 focus"),
          $click: () => {
            $("#log").out.scrollTop = $("#log").out.scrollHeight;
          }
        }, "Down"),
        button({
          class: tw("w-1/2 rounded bg-gray-700 text-white border-none hover:bg-gray-600 focus"),
          $click: () => {
            const textarea = document.createElement("textarea");
            textarea.value = logs.map(log => `${log.name}: ${log.time} ${log.content}`).join("\n");
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);

            Swal.fire({
              icon: "success",
              title: "完了",
              text: "ログをコピーしました",
              confirmButtonText: "OK",
            })
          }
        }, "Export")
      ),
      div(
        {},
        p(
          {
            class: tw("mt-2"),
          },
          "&copy;",
          a(
            {
              class: tw("text-red-500 mx-1"),
              href: "https://twitter.com/amex2189",
            },
            "ame_x"
          ),
          span(
            {
              class: tw("mx-1"),
            },
            "&"
          ),
          span(
            {
              class: tw("text-green-500 ml-1"),
            },
            "piloking"
          )
        )
      )
    )
  );
  $("#log").out.appendChild(logComponent(logs[logs.length - 1]));
};
