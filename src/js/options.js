import { EXTENSION_INFO, fetchSetting, fetchAllSettings } from './default_settings.js';

import 'nouislider/dist/nouislider.css';
import '../sass/options.scss';

import noUiSlider from 'nouislider';
import { backgroundQueries } from '../background.js';

const languages = {
	'schinese': '简体中文 (Simplified Chinese)',
	'tchinese': '繁體中文 (Traditional Chinese)',
	'japanese': '日本語 (Japanese)',
	'koreana': '한국어 (Korean)',
	'thai': 'ไทย (Thai)',
	'bulgarian': 'Български (Bulgarian)',
	'czech': 'Čeština (Czech)',
	'danish': 'Dansk (Danish)',
	'german': 'Deutsch (German)',
	'english': 'English',
	'spanish': 'Español - España (Spanish - Spain)',
	'latam': 'Español - Latinoamérica (Spanish - Latin America)',
	'greek': 'Ελληνικά (Greek)',
	'french': 'Français (French)',
	'italian': 'Italiano (Italian)',
	'hungarian': 'Magyar (Hungarian)',
	'dutch': 'Nederlands (Dutch)',
	'norwegian': 'Norsk (Norwegian)',
	'polish': 'Polski (Polish)',
	'portuguese': 'Português (Portuguese)',
	'brazilian': 'Português - Brasil (Portuguese - Brazil)',
	'romanian': 'Română (Romanian)',
	'russian': 'Русский (Russian)',
	'finnish': 'Suomi (Finnish)',
	'swedish': 'Svenska (Swedish)',
	'turkish': 'Türkçe (Turkish)',
	'vietnamese': 'Tiếng Việt (Vietnamese)',
	'ukrainian': 'Українська (Ukrainian)'
};

const currencies = {
	'ae': 'AED',
	'ar': 'ARS',
	'au': 'AUD',
	'br': 'BRL',
	'ca': 'CAD',
	'ch': 'CHF',
	'cl': 'CLP',
	'cn': 'CNY',
	'co': 'COP',
	'cr': 'CRC',
	'fr': 'EUR',
	'gb': 'GBP',
	'hk': 'HKD',
	'il': 'ILS',
	'id': 'IDR',
	'in': 'INR',
	'jp': 'JPY',
	'kr': 'KRW',
	'kw': 'KWD',
	'kz': 'KZT',
	'mx': 'MXN',
	'my': 'MYR',
	'no': 'NOK',
	'nz': 'NZD',
	'pe': 'PEN',
	'ph': 'PHP',
	'pl': 'PLN',
	'qa': 'QAR',
	'ru': 'RUB',
	'sa': 'SAR',
	'sg': 'SGD',
	'th': 'THB',
	'tr': 'TRY',
	'tw': 'TWD',
	'ua': 'UAH',
	'us': 'USD',
	'uy': 'UYU',
	'vn': 'VND',
	'za': 'ZAR'
};

var settings = {};

// functions

async function loadOptions() {
	try {
		settings = await fetchAllSettings();

		const slider = document.querySelector('#slider');
		slider.noUiSlider.set(settings.autoplay / 1000);

		const selLanguage = document.querySelector('#sel-language');
		selLanguage.value = settings.language === null
			? 'default'
			: settings.language;

		const selCurrency = document.querySelector('#sel-currency');
		selCurrency.value = settings.currency === null
			? 'default'
			: settings.currency;

		const key = document.querySelector('#key');
		key.innerHTML = settings.activationKey ?
			'<kbd>' + settings.activationKey + '</kbd>' : '(none)';
	} catch (error) {
		console.error(`Failed loading options: ${error}`);
	}
}

function fillAndBindSelect(element, options, settingName) {
	// creates the default option
	const defaultOpt = document.createElement('option');
	defaultOpt.value = 'default';
	defaultOpt.text = 'Default';

	element.appendChild(defaultOpt);

	for (const option in options) {
		const opt = document.createElement('option');
		opt.value = option;
		opt.text = options[option];

		element.appendChild(opt);
	}

	element.addEventListener('change', evt => {
		const setValue = evt.target.value === 'default' ? null : evt.target.value;
		chrome.storage.sync.set({ [settingName]: setValue });
		sendOptionMessage({ [settingName]: setValue });
	});
}

function bindSliderEvents() {
	const slider = document.querySelector('#slider');
	noUiSlider.create(slider, {
		start: 5,
		step: 1,
		range: {
			min: 0,
			max: 10
		}
	});

	const sliderValue = document.querySelector('#slider-value');

	slider.noUiSlider.on('update', value =>
		sliderValue.textContent = value == 0 ? 'Off' : Math.floor(value) + ' sec'
	);

	slider.noUiSlider.on('change', async value => {
		let autoplay = await fetchSetting(settings, 'autoplay');

		if (value == (autoplay / 1000)) {
			return;
		}

		autoplay = value === 0 ? null : value * 1000;
		chrome.storage.sync.set({ autoplay: autoplay });
		sendOptionMessage({ autoplay: autoplay });
	});
}

function bindButtonsEvents() {
	const btnChange = document.querySelector('#btn-change');
	btnChange.addEventListener('click', function (event) {
		const modal = document.querySelector('.modal');
		modal.classList.remove('hidden');

		document.body.addEventListener('keyup', upKeyEvent);
	});

	const btnClear = document.querySelector('#btn-clear');
	btnClear.addEventListener('click', event => {
		const key = document.querySelector('#key');
		key.innerHTML = '(none)';

		chrome.storage.sync.set({ activationKey: null });
		sendOptionMessage({ activationKey: null });
	});
}

function upKeyEvent(event) {
	document.body.removeEventListener('keyup', upKeyEvent);

	if (event.code !== 'Escape') {
		const key = document.querySelector('#key');
		key.innerHTML = '<kbd>' + event.code + '</kbd>';

		chrome.storage.sync.set({ activationKey: event.code });
		sendOptionMessage({ activationKey: event.code });
	}

	const modal = document.querySelector('.modal');
	modal.classList.add('hidden');
}

function sendOptionMessage(option) {
	chrome.tabs.query({ active: false, url: '*://*/*' }, tabs => {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage(tab.id, {
				contentScriptQuery: backgroundQueries.UPDATE_SETTINGS,
				settings: option
			});
		});
	});
}

document.addEventListener('DOMContentLoaded', event => {
	const spaVersion = document.querySelector('#sst-version');
	spaVersion.textContent = EXTENSION_INFO.version;

	const aLink = document.querySelector('#sst-link');
	aLink.href = EXTENSION_INFO.link;

	const selLanguage = document.querySelector('#sel-language');
	fillAndBindSelect(selLanguage, languages, 'language');

	const selCurrency = document.querySelector('#sel-currency');
	fillAndBindSelect(selCurrency, currencies, 'currency');

	bindSliderEvents();
	bindButtonsEvents();
	loadOptions();
});