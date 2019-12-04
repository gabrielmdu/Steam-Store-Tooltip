const languages = {
	"schinese": "简体中文 (Simplified Chinese)",
	"tchinese": "繁體中文 (Traditional Chinese)",
	"japanese": "日本語 (Japanese)",
	"koreana": "한국어 (Korean)",
	"thai": "ไทย (Thai)",
	"bulgarian": "Български (Bulgarian)",
	"czech": "Čeština (Czech)",
	"danish": "Dansk (Danish)",
	"german": "Deutsch (German)",
	"english": "English",
	"spanish": "Español - España (Spanish - Spain)",
	"latam": "Español - Latinoamérica (Spanish - Latin America)",
	"greek": "Ελληνικά (Greek)",
	"french": "Français (French)",
	"italian": "Italiano (Italian)",
	"hungarian": "Magyar (Hungarian)",
	"dutch": "Nederlands (Dutch)",
	"norwegian": "Norsk (Norwegian)",
	"polish": "Polski (Polish)",
	"portuguese": "Português (Portuguese)",
	"brazilian": "Português - Brasil (Portuguese - Brazil)",
	"romanian": "Română (Romanian)",
	"russian": "Русский (Russian)",
	"finnish": "Suomi (Finnish)",
	"swedish": "Svenska (Swedish)",
	"turkish": "Türkçe (Turkish)",
	"vietnamese": "Tiếng Việt (Vietnamese)",
	"ukrainian": "Українська (Ukrainian)"
};

const currencies = {
	"ae": "AED",
	"ar": "ARS",
	"au": "AUD",
	"br": "BRL",
	"ca": "CAD",
	"ch": "CHF",
	"cl": "CLP",
	"cn": "CNY",
	"co": "COP",
	"cr": "CRC",
	"fr": "EUR",
	"gb": "GBP",
	"hk": "HKD",
	"il": "ILS",
	"id": "IDR",
	"in": "INR",
	"jp": "JPY",
	"kr": "KRW",
	"kw": "KWD",
	"kz": "KZT",
	"mx": "MXN",
	"my": "MYR",
	"no": "NOK",
	"nz": "NZD",
	"pe": "PEN",
	"ph": "PHP",
	"pl": "PLN",
	"qa": "QAR",
	"ru": "RUB",
	"sa": "SAR",
	"sg": "SGD",
	"th": "THB",
	"tr": "TRY",
	"tw": "TWD",
	"ua": "UAH",
	"us": "USD",
	"uy": "UYU",
	"vn": "VND",
	"za": "ZAR"
};

// functions

async function loadOptions() {
	try {
		defaultSettings = await fetchAllSettings();

		let metroSlider = $("#sli-auto").data("slider");
		metroSlider.val(defaultSettings.autoplay / 1000);

		let metroSelectLanguage = $("#sel-language").data("select");
		metroSelectLanguage.val(defaultSettings.language === null ? "default" : defaultSettings.language);

		let metroSelectCurrency = $("#sel-currency").data("select");
		metroSelectCurrency.val(defaultSettings.currency === null ? "default" : defaultSettings.currency);

		let spaKey = document.querySelector("#spa-key");
		spaKey.innerHTML = defaultSettings.activationKey ?
			"<kbd>" + defaultSettings.activationKey + "</kbd>" : "(none)";
	} catch (error) {
		console.error(`Failed loading options: ${error}`);
	}
}

function fillAndBindSelect(element, options, settingName) {
	// creates the default option
	let defaultOpt = document.createElement("option");
	defaultOpt.value = "default";
	defaultOpt.text = "Default";

	element.appendChild(defaultOpt);

	for (const option in options) {
		let opt = document.createElement("option");
		opt.value = option;
		opt.text = options[option];

		element.appendChild(opt);
	}

	let metroSelect = $(element).data("select");
	metroSelect.options.onItemSelect = value => {
		let setValue = value === "default" ? null : value;
		chrome.storage.sync.set({ [settingName]: setValue });
		sendOptionMessage({ [settingName]: setValue });
	};
	metroSelect.reset();
}

function bindSliderEvents() {
	let metroSlider = $("#sli-auto").data("slider");
	let sliValue = document.querySelector("#sli-value");

	metroSlider.options.onStop = async value => {
		let autoplay = await fetchSetting("autoplay");

		if (value == (autoplay / 1000)) {
			return;
		}

		autoplay = value === 0 ? null : value * 1000;
		chrome.storage.sync.set({ autoplay: autoplay });
		sendOptionMessage({ autoplay: autoplay });
	};

	metroSlider.options.onChangeValue = value => {
		sliValue.textContent = value == 0 ? "Off" : value + " sec";
	};
}

function bindButtonsEvents() {
	let btnKey = document.querySelector("#btn-key");
	btnKey.addEventListener("click", function (event) {
		this.blur();

		Metro.infobox.create("<div class='text-center'>Press any key...</div>");
		document.body.addEventListener("keyup", upKeyEvent);
	});

	let btnClear = document.querySelector("#btn-clear");
	btnClear.addEventListener("click", event => {
		let spaKey = document.querySelector("#spa-key");
		spaKey.innerHTML = "(none)";

		chrome.storage.sync.set({ activationKey: null });
		sendOptionMessage({ activationKey: null });
	});
}

function upKeyEvent(event) {
	document.body.removeEventListener("keyup", upKeyEvent);

	let spaKey = document.querySelector("#spa-key");
	spaKey.innerHTML = "<kbd>" + event.code + "</kbd>";

	chrome.storage.sync.set({ activationKey: event.code });
	sendOptionMessage({ activationKey: event.code });

	let box = $(".info-box").data("infobox");
	Metro.infobox.close(box.elem);
}

function sendOptionMessage(option) {
	chrome.tabs.query({}, tabs => {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage(tab.id, option);
		});
	});
}

document.addEventListener('DOMContentLoaded', event => {
	let spaVersion = document.querySelector("#spa-version");
	spaVersion.textContent = EXTENSION_INFO.version;

	let aLink = document.querySelector("#a-link");
	aLink.href = EXTENSION_INFO.link;

	let selLanguage = document.querySelector("#sel-language");
	fillAndBindSelect(selLanguage, languages, "language");

	let selCurrency = document.querySelector("#sel-currency");
	fillAndBindSelect(selCurrency, currencies, "currency");

	bindSliderEvents();
	bindButtonsEvents();
	loadOptions();
});