function fetchContent(tip, html) {
    let appId = /\/app\/(\d*)\?*/g.exec(tip.reference.href)[1];

    fetch("https://store.steampowered.com/api/appdetails?appids=" + appId)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let gameData = data[appId].data;

            // categories / genres / metacritic / platforms / price_overview / release_date / type

            let content =
                html.replace("@name", gameData.name)
                    .replace("@description", gameData.short_description)
                    .replace("@header_img", gameData.header_image);

            tip.setContent(content);
        })
        .catch(reason => tip.setContent("Error loading store data"));
}

function initTooltips(html) {
    let bodyEl = document.getElementsByTagName("body")[0];

    tippy(bodyEl, {
        target: "[href*='store.steampowered.com/app']",
        content: "Loading store details...",
        theme: "steam-stt",
        interactive: true,
        maxWidth: 500,
        animateFill: false,
        onShow: tip => fetchContent(tip, html)
    });
}

function main() {
    let name = "Steam Store Tooltip";
    let version = "1.0.0";
    let author = "gabrielmdu";
    let greyColor = "color: grey;";
    let blackBackground = "background: black;";

    console.log("%c[%c%s %c%s %cby %c%s%c]",
        greyColor + blackBackground,
        "color: #1470a1;" + blackBackground,
        name,
        "color: white;" + blackBackground,
        version,
        greyColor + blackBackground,
        "color: orange;" + blackBackground,
        author,
        greyColor + blackBackground);

    fetch(chrome.extension.getURL("/html/steamstoretooltip.html"))
        .then(response => response.text())
        .then(initTooltips)
        .catch(reason => console.error("[ERROR] " + reason));
}

main();