// Description:
//	Functions to call The Weather Company API
//
// Configuration:
//	 HUBOT_TWC_API The Weather Company API URL
//	 HUBOT_TWC_USER The Weather Company User ID
//	 HUBOT_TWC_PASSWORD Password for The Weather Company User
//
// Author:
//	nbarker
//	megan-becvarik
//
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

'use strict';

const path = require('path');
const _ = require('lodash');
const env = require(path.resolve(__dirname, 'env'));
const weatherIcons = require(path.resolve(__dirname, 'weather.icon.urls.json'));
const request = require('request');

// --------------------------------------------------------------
// i18n (internationalization)
// It will read from a peer messages.json file.  Later, these
// messages can be referenced throughout the module.
// --------------------------------------------------------------
const i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	directory: __dirname + '/../locales',
	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
// At some point we need to toggle this setting based on some user input.
i18n.setLocale('en');

function createWeatherUrl(endpoint, queryParams){
	const url = env.url;
	if (url === undefined) {
		throw (new Error('Invalid configuration. HUBOT_TWC_API is not set.'));
	}
	let paramsStr = '';
	if (!(_.isNil(queryParams))) {
		if (_.isNil(queryParams.language)) {
			paramsStr = '?language=' + encodeURIComponent('en-US');
		}
		else {
			paramsStr = '?language=' + encodeURIComponent(queryParams.language);
			delete queryParams.language;
		}
		for (let param in queryParams) {
			if (queryParams.hasOwnProperty(param)) {
				paramsStr += '&' + param + '=' + encodeURIComponent(queryParams[param]);
			}
		}
	}
	else {
		// no query parameters provided setting defaults for language
		paramsStr = '?language=' + encodeURIComponent('en-US');
	}
	return url + endpoint + paramsStr;
};

function callWeatherAPI(apiUrl) {
	const username = env.username;
	const password = env.password;

	if (username === undefined) {
		throw (new Error('Invalid configuration. HUBOT_TWC_USER is not set.'));
	}
	if (password === undefined) {
		throw (new Error('Invalid configuration. HUBOT_TWC_PASSWORD is not set.'));
	}

	let auth = {
		username: username,
		password: password
	};
	let options = {
		url: apiUrl,
		auth: auth,
		json: true
	};

	return new Promise((resolve, reject) => {
		request.get(options, (error, response, body) => {
			if (error) {
				return reject(error);
			}
			else {
				return resolve(body);
			}
		});
	});
};

module.exports.getLocation = (city, state) => {
	let endpoint = '/api/weather/v3/location/search';
	let params = {};

	if (city) {
		params.query = city;
	}

	let weatherUrl = createWeatherUrl(endpoint, params);
	return callWeatherAPI(weatherUrl);
};

module.exports.get10DayForecast = (latitude, longitude) => {
	let fixedLat = latitude.toFixed(2);
	let fixLong = longitude.toFixed(2);
	let endpoint = `/api/weather/v1/geocode/${fixedLat}/${fixLong}/forecast/daily/10day.json`;
	let params = {
		units: 'e'
	};
	let weatherUrl = createWeatherUrl(endpoint, params);
	return callWeatherAPI(weatherUrl);
};

module.exports.get48HourForecast = (latitude, longitude) => {
	let fixedLat = latitude.toFixed(2);
	let fixLong = longitude.toFixed(2);
	let endpoint = `/api/weather/v1/geocode/${fixedLat}/${fixLong}/forecast/hourly/48hour.json`;
	let params = {
		units: 'e'
	};
	let weatherUrl = createWeatherUrl(endpoint, params);
	return callWeatherAPI(weatherUrl);
};

module.exports.getCurrentObservation = (latitude, longitude) => {
	let fixedLat = latitude.toFixed(2);
	let fixLong = longitude.toFixed(2);
	let endpoint = `/api/weather/v1/geocode/${fixedLat}/${fixLong}/observations.json`;
	let params = {
		units: 'e'
	};
	let weatherUrl = createWeatherUrl(endpoint, params);
	return callWeatherAPI(weatherUrl);
};

module.exports.get24HourObservation = (latitude, longitude) => {
	let fixedLat = latitude.toFixed(2);
	let fixLong = longitude.toFixed(2);
	let endpoint = `/api/weather/v1/geocode/${fixedLat}/${fixLong}/observations/timeseries.json`;
	let params = {
		units: 'e',
		hours: '23'
	};
	let weatherUrl = createWeatherUrl(endpoint, params);
	return callWeatherAPI(weatherUrl);
};


// default formatters
module.exports.hourlyForecastFormatter = (data) => {
	return new Promise((resolve, reject) => {
		if ((data.forecasts) && (data.forecasts.length > 0)) {
			const attachments = data.forecasts.map((forecast) => {
				let d = new Date(forecast.fcst_valid_local);
				let hour = '';
				if (d.getHours() === 0) {
					hour = '12am';
				}
				else if (d.getHours() === 12) {
					hour = '12pm';
				}
				else if (d.getHours() > 12) {
					hour = (d.getHours() - 12).toString() + 'pm';
				}
				else {
					hour = (d.getHours()).toString() + 'am';
				}
				const attachment = {
					title: forecast.dow + ' ' + hour,
					text: forecast.temp + '\xB0F' + '\n' + forecast.phrase_32char,
					thumb_url: weatherIcons.icon_code[forecast.icon_code]
				};
				return attachment;
			});
			return resolve(attachments);
		}
		else {
			return reject(new Error(i18n.__('error.weather')));
		}
	});
};

module.exports.tenDayForecastFormatter = (data) => {
	return new Promise((resolve, reject) => {
		if ((data.forecasts) && (data.forecasts.length > 0)) {
			const attachments = data.forecasts.map((forecast) => {
				let d = new Date(forecast.fcst_valid_local);
				let icon = null;
				// if the forecast is called late in the current day, there is no day key (just night) for the current forecast
				if (forecast.hasOwnProperty('day')) {
					icon = weatherIcons.icon_code[forecast.day.icon_code];
				}
				else {
					icon = weatherIcons.icon_code[forecast.night.icon_code];
				}
				const attachment = {
					title: forecast.dow + ' ' + (d.getMonth() + 1).toString() + '/' + d.getDate(),
					text: forecast.narrative,
					thumb_url: icon
				};
				return attachment;
			});
			return resolve(attachments);
		}
		else {
			return reject(new Error(i18n.__('error.weather')));
		}
	});
};

module.exports.currentObservationFormatter = (data) => {
	return new Promise((resolve, reject) => {
		if (data.observation) {
			let value = data.observation;
			let attachments = [];
			const attachment = {
				title: i18n.__('current.weather'),
				text: value.temp + '\xB0F' + '\n' + value.wx_phrase,
				thumb_url: weatherIcons.icon_code[value.wx_icon]
			};
			attachments.push(attachment);
			return resolve(attachments);
		}
		else {
			return reject(new Error(i18n.__('error.weather')));
		}
	});
};

module.exports.hourlyObservationFormatter = (data) => {
	return new Promise((resolve, reject) => {
		if ((data.observations) && (data.observations.length > 0)) {
			const attachments = data.observations.map((observation) => {
				let d = new Date((observation.valid_time_gmt * 1000));
				let hour = '';
				let minutes = d.getMinutes().toString();
				if (minutes.length < 2) {
					minutes = '0' + minutes;
				}
				if (d.getHours() === 0) {
					hour = '12:' + minutes + 'am';
				}
				else if (d.getHours() === 12) {
					hour = '12:' + minutes + 'pm';
				}
				else if (d.getHours() > 12) {
					hour = (d.getHours() - 12).toString() + ':' + minutes + 'pm';
				}
				else {
					hour = (d.getHours()).toString() + ':' + minutes + 'am';
				}
				const attachment = {
					title: (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hour,
					text: observation.temp + '\xB0F' + '\n' + observation.wx_phrase,
					thumb_url: weatherIcons.icon_code[observation.wx_icon]
				};
				return attachment;
			});
			return resolve(attachments);
		}
		else {
			return reject(new Error(i18n.__('error.weather')));
		}
	});
};
