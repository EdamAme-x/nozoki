/**
  Created by @amex2189
  @Obstruction
*/
import { tw } from "https://cdn.skypack.dev/twind";
import Swal from "https://esm.sh/sweetalert2@11.9.0";
import escapeHtml from "https://cdn.jsdelivr.net/npm/escape-html@1.0.3/+esm";

console.log("Welcome to Nozoki OC / Frontend by @amex2189");

let target = "";
// そんなコードジロジロ見ないで //
const api = "https://tumuri.deno.dev/";
const memberImage = "https://obs.line-apps.com/r/g2/member/";
let started = false;
let logs = [
  {
    name: "ame_x@amex2189",
    content:
      "@訪問者 \n 皆さんこんにちは！ \n このメッセージはサンプルです。 \n\n お知らせ: 絵文字とスタンプ・アイコンに対応しました。良ければこのツールを広めてください！ \n Twitter (@amex2189) もフォローして頂けるとありがたいです。",
    time: getCurrentTime(),
    raw: {
      sendBy: false,
    },
  },
];

let lastMessage = "";

/**
 * String to Mention tag
 * @return {string} parsed
 */
function convertAtMentions(str) {
  let cols = str.split("\n");
  const regex = /@(.+) /g;

  for (let i = 0; i < cols.length; i++) {
    cols[i] = cols[i].replace(regex, (match, p1) => {
      return match.replaceAll(
        "@" + p1,
        `<a style="color: skyblue">@${p1} </a>`,
      );
    });
  }

  return cols.join("\n");
}

/**
 * Returns the current time in the format HH:MM.
 *
 * @return {string} The current time in the format HH:MM.
 */
function getCurrentTime() {
  const now = new Date();

  return `${now.getHours().toString().padStart(2, "0")}:${
    now
      .getMinutes()
      .toString()
      .padStart(2, "0")
  }`;
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
 * Determine the type of message object in the argument
 * @return {string} Message Type
 */
function whatType(raw) {
  const type = raw.type;

  switch (type) {
    case "text":
      return "< テキスト >";
    case "image/video/location/unknown":
      return "< 画像 / 動画 >";
    case "note":
      return "< ノート >";
    case "file":
      return "< ファイル >";
    case "unsend/delete":
      return "< メッセージ削除 >";
    case "sticker":
      return "< スタンプ >";
    case "flex":
      return "< Flex >";
    default:
      return "< 不明 >";
  }
}

function convertEmoji(text, raw) {
  if (text.includes("(emoji)") && typeof raw["sticon"] !== undefined) {
    const regex = /(\(emoji\))/g;
    let count = 0;
    const sticons = raw["sticon"]["resources"]; // [{}...]
    const sticonCount = sticons.length;

    text = text.replace(regex, (match) => {
      count++;
      if (count > sticonCount) {
        return match;
      }

      // parse https://stickershop.line-scdn.net/sticonshop/v1/sticon/{productId}/android/{sticonId}.png
      const imgUrl =
        `https://stickershop.line-scdn.net/sticonshop/v1/sticon/{productId}/android/{sticonId}.png`
          .replace("{productId}", sticons[count - 1]["productId"]).replace(
            "{sticonId}",
            sticons[count - 1]["sticonId"],
          );
      return `<img src="${imgUrl}" alt="sticon" class="${
        tw("h-[18px] inline mx-[1px]")
      } sticon" height="20"/>`;
    });
  }

  return text;
}

function convertStamp(text, raw) {
  console.log(raw.type);
  if (raw.type === "sticker") {
    // スタンプにパース
    const imgUrl =
      `https://stickershop.line-scdn.net/stickershop/v1/sticker/{stkId}/android/sticker.png?v=1`
        .replace("{stkId}", raw["stkId"]);

    return `<img src="${imgUrl}" alt="stamp" />`;
  }

  return text;
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
        name: res.sendBy ? (res.senderName ? res.senderName : "MEMBER") : "BOT",
        content: res.text ?? whatType(res),
        time: getCurrentTime(),
        raw: res,
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
      class: tw("w-full w-[270px] my-1 flex justify-between"),
    },
    div(
      {
        class: "w-[50px]",
      },
      img({
        src: log.raw.sendBy ? (memberImage + log.raw.sendBy) : "https://www.ame-x.net/favicon.ico",
        width: "50",
        height: "50",
        class: tw("rounded-full w-[50px] h-[50px]")
      }),
    ),
    div(
      {
        class: "w-[270px]"
      },
      span(
        {
          class: tw("ml-3 text-sm text-gray-400 w-2/3 h-[10px]"),
          style: {
            overflow: "hidden",
            whiteSpace: "none"
          }
        },
        log.name.length > 10 ? log.name.substring(0, 10) : log.name,
      ),
      div(
        {
          class: tw("mt-1 ml-2 flex items-end justify-center h-auto"),
        },
        div(
          {
            class: tw(
              "w-full overflow-hidden text-ellipsis text-sm text-white bg-gray-700 rounded p-1 chat-x hover:bg-gray-800 hover:cursor-pointer hover:text-gray-300 transition duration-300",
            ),
            raw: log.content
              ? convertAtMentions(
                convertStamp(
                  convertEmoji(escapeHtml(log.content), log.raw),
                  log.raw,
                ),
              )
                .replace(
                  /\n/gmi,
                  "<br />",
                )
              : whatType(log.raw),
          },
        ),
        div(
          {
            class: tw(
              "w-1/10 text-right text-gray-400 text-sm flex flex-col items-center justify-end pl-2",
            ),
          },
          log.time,
        ),
      ),
      div(
        {
          class: tw(
            "text-xs transform scale-[0.9] ml-3 mt-[1px] w-4/5 flex justify-right space-x-2 pr-2",
          ),
        },
        span({
          $click: () => {
            window.open(
              "line://nv/profilePopup/mid=" + log.raw.sendBy,
              "_blank",
            );
          },
        }, "Report"),
        span({
          class: tw("ml-1"),
        }, "|"),
        span({
          $click: () => {
            Swal.fire({
              text: JSON.stringify(log.raw, null, 2),
            });
          },
        }, "RawData"),
        span({
          class: tw("ml-1"),
        }, "|"),
        span({
          $click: () => {
            const shareText = `${log.name} ${log.time}
----
Icon: ${memberImage}${log.raw.sendBy ?? ""}
----
${log.content ?? whatType(log.raw)}
----
Report: ${"line://nv/profilePopup/mid=" + log.raw.sendBy}
----
By https://nozoki.deno.dev`;

            window.open(
              "line://share?text=" + encodeURIComponent(shareText),
              "_blank",
            );
          },
        }, "Share"),
      ),
    ),
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
          "OC Observer",
        ),
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
            "rounded text-md text-black border-none nuem-x bg-[#000000aa] text-white focus:outline-none p-1 border-2 border-gray-300",
          ),
        }),
        button(
          {
            $click: start,
            class: tw(
              "py-[6px] px-3 ml-2 rounded bg-gray-700 text-white border-none hover:bg-gray-600 focus",
            ),
          },
          "Start",
        ),
      ),
      div({
        class: tw(
          "h-full overflow-y-scroll log-x w-[320px] bg-[#282828] rounded p-2",
        ),
        id: "log",
      }),
      div(
        {
          class: tw("mt-1 flex flex-row items-center h-[50px] w-[320px]"),
        },
        button({
          class: tw(
            "w-1/2 rounded bg-gray-700 text-white border-none hover:bg-gray-600 focus",
          ),
          $click: () => {
            $("#log").out.scrollTop = $("#log").out.scrollHeight;
          },
        }, "Down"),
        button({
          class: tw(
            "w-1/2 rounded bg-gray-700 text-white border-none hover:bg-gray-600 focus",
          ),
          $click: () => {
            const textarea = document.createElement("textarea");
            textarea.value = logs.map((log) =>
              `${log.name}: ${log.time} ${log.content ?? log.type}`
            ).join("\n");
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);

            Swal.fire({
              icon: "success",
              title: "完了",
              text: "ログをコピーしました",
              confirmButtonText: "OK",
            });
          },
        }, "Export"),
      ),
      div(
        {},
        p(
          {
            class: tw("mt-2"),
          },
          "©",
          a(
            {
              class: tw("text-red-500 mx-1"),
              href: "https://twitter.com/amex2189",
            },
            "ame_x",
          ),
          span(
            {
              class: tw("mx-1"),
            },
            "&",
          ),
          span(
            {
              class: tw("text-green-500 ml-1"),
            },
            "piloking",
          ),
        ),
      ),
    ),
  );
  $("#log").out.appendChild(logComponent(logs[logs.length - 1]));
};
