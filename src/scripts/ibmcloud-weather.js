// Description:
//	Listens for commands to initiate actions against The Weather Company
//
// Configuration:
//	 HUBOT_TWC_API Weather Insights API
//	 HUBOT_TWC_USER Weather Insights User
//	 HUBOT_TWC_PASSWORD Weather Insights Password
//
// Commands:
//   hubot weather help - Show available commands in the weather category.
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

var path = require('path');
var TAG = path.basename(__filename);

const Conversation = require('hubot-conversation');
const _ = require('lodash');
const activity = require('hubot-ibmcloud-activity-emitter');
const utils = require('hubot-ibmcloud-utils').utils;
const weather = require('../lib/weather');

// --------------------------------------------------------------
// i18n (internationalization)
// It will read from a peer messages.json file.  Later, these
// messages can be referenced throughout the module.
// --------------------------------------------------------------
var i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	directory: __dirname + '/../locales',
	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
// At some point we need to toggle this setting based on some user input.
i18n.setLocale('en');


const WEATHER_HELP_RE = /weather\s+help/i;
const WEATHER_HELP_ID = 'twc.weather.help';
const LIST_SERVICES_RE = /weather\s+(services)|((show|list)\s+((my)*\s+)*services)/i;
const LIST_SERVICES_ID = 'twc.services.list';
const SHOW_WEATHER_RE = /(weather\sfor)\s(\S+)(.*)/i;
const SHOW_WEATHER_ID = 'twc.weather.show';

const SERVICES_TO_DISPLAY = {
	DAILY_FORECAST: {
		label: i18n.__('ten.day.forecast'),
		func: weather.get10DayForecast,
		formatter: weather.tenDayForecastFormatter
	},
	HOURLY_FORECAST: {
		label: i18n.__('forty.eight.hour.forecast'),
		func: weather.get48HourForecast,
		formatter: weather.hourlyForecastFormatter
	},
	CURRENT_CONDITIONS: {
		label: i18n.__('current.weather'),
		func: weather.getCurrentObservation,
		formatter: weather.currentObservationFormatter
	},
	HOURLY_CONDITIONS: {
		label: i18n.__('twenty.four.hour.observations'),
		func: weather.get24HourObservation,
		formatter: weather.hourlyObservationFormatter
	}
};

module.exports = (robot) => {
	const switchBoard = new Conversation(robot);

	robot.on(WEATHER_HELP_ID, (res) => {
		robot.logger.debug(`${TAG}: ${WEATHER_HELP_ID} Natural Language match.`);
		help(res);
	});
	robot.respond(WEATHER_HELP_RE, {id: WEATHER_HELP_ID}, function(res) {
		robot.logger.debug(`${TAG}: ${WEATHER_HELP_ID} Reg Ex match.`);
		help(res);
	});
	function help(res){
		robot.logger.debug(`${TAG}: twc.weather.help res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Listing weather help...`);
		let servicesHelp = i18n.__('services.help');
		let weatherForHelp = i18n.__('weather.for.help');
		let help = `${robot.name} weather services - ${servicesHelp}\n`;
		help += `${robot.name} weather for [CITY] [STATE] - ${weatherForHelp}\n`;

		robot.emit('ibmcloud.formatter', { response: res, message: help});
	};

	robot.on(LIST_SERVICES_ID, (res) => {
		robot.logger.debug(`${TAG}: ${LIST_SERVICES_ID} Natural Language match.`);
		listServices(res);
	});
	robot.respond(LIST_SERVICES_RE, {id: LIST_SERVICES_ID}, (res) => {
		robot.logger.debug(`${TAG}: ${LIST_SERVICES_ID} Reg Ex match.`);
		listServices(res);
	});
	function listServices(res){
		robot.logger.debug(`${TAG}: twc.weather.list res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Listing the weather services...`);

		let message = i18n.__('pick.a.service');
		robot.emit('ibmcloud.formatter', { response: res, message: message});
		// display events in list
		let prompt = '';
		let keys = Object.keys(SERVICES_TO_DISPLAY);
		keys.map((key, index, keys) => {
			prompt += `\n${index + 1}) ${SERVICES_TO_DISPLAY[key].label}`;
		});

		let regex = new RegExp('([1-' + SERVICES_TO_DISPLAY.length + ']+)');
		utils.getExpectedResponse(res, robot, switchBoard, prompt, regex).then((selectionRes) => {
			let selection = parseInt(selectionRes.match[1], 10) - 1;
			// store selection in the hubot brain
			let selectedService = SERVICES_TO_DISPLAY[Object.keys(SERVICES_TO_DISPLAY)[selection]];
			robot.brain.set('twcService', selectedService);
			let message = i18n.__('service.selected', selectedService.label);
			robot.emit('ibmcloud.formatter', { response: res, message: message});
			robot.logger.info(`${TAG}: Selected weather service ${selectedService.label}`);
			activity.emitBotActivity(robot, res, { activity_id: 'activity.weather.services'});
		});
	};

	robot.on(SHOW_WEATHER_ID, (res, parameters) => {
		robot.logger.debug(`${TAG}: ${SHOW_WEATHER_ID} Natural Language match.`);
		if (parameters && parameters.location) {
			showWeather(res, parameters.location, null);
		}
		else {
			robot.logger.error(`${TAG}: Error extracting the location from text=[${res.message.text}].`);
			let message = i18n.__('cognitive.parse.problem.location');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
		}
	});
	robot.respond(SHOW_WEATHER_RE, {id: SHOW_WEATHER_ID}, (res) => {
		robot.logger.debug(`${TAG}: ${SHOW_WEATHER_ID} Reg Ex match.`);
		const city = res.match[2];
		let state;
		if (res.match.length > 3) {
			state = res.match[3];
		}
		showWeather(res, city, state);
	});
	function showWeather(res, city, state) {
		robot.logger.debug(`${TAG}: twc.weather.show res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Retrieving weather...`);
		let service = robot.brain.get('twcService');

		if (!service){
			service = SERVICES_TO_DISPLAY.CURRENT_CONDITIONS;
			robot.brain.set('twcService', service);
		}

		let location = city;
		if (_.isString(state)) {
			location = city + ' ' + state;
		}
		robot.logger.info(`${TAG}: Getting weather for ${location}`);
		let message = i18n.__('weather.for.city', location);
		robot.emit('ibmcloud.formatter', { response: res, message: message});
		geocode(robot, res, city, state, service);

	};
};

const geocode = (robot, res, city, state, service) => {
	if (city) {
		let serviceStr = (service) ? JSON.stringify(service) : '';
		robot.logger.debug(`${TAG}: geocode() city:${city}, state:${state}, service:${serviceStr}`);

		robot.logger.info(`${TAG}: Async location request city:${city}, state:${state}`);
		return weather.getLocation(city, state).then((matches) => {
			let resultStr = JSON.stringify(matches);
			robot.logger.info(`${TAG}: location results:${resultStr}`);
			let lat;
			let lon;
			let locationFound = !(_.isNil(matches)) && !(_.isNil(matches.location)) && !(_.isNil(matches.location.address));
			if (locationFound && (matches.location.address.length > 1)) {
				// start a conversation
				let message = i18n.__('pick.an.option');
				robot.emit('ibmcloud.formatter', { response: res, message: message});
				// display places in list
				let prompt = '';
				let index = 0;

				for (let value of matches.location.address){
					prompt += `\n${++index}) ${value}`;
				}
				let l = matches.location.address.length;

				let sb = new Conversation(robot);
				let regex = new RegExp('([1-' + l + ']+)');
				utils.getExpectedResponse(res, robot, sb, prompt, regex).then((selectionRes) => {
					let selection = parseInt(selectionRes.match[1], 10) - 1;
					lon = matches.location.longitude[selection];
					lat = matches.location.latitude[selection];

					let message = i18n.__('getting.weather', matches.location.address[selection]);
					robot.emit('ibmcloud.formatter', { response: res, message: message});
					robot.logger.info(`${TAG}: Asynch call using weather library to get weather for ${lat}, ${lon}.`);
					return service.func(lat, lon);
				}).then((w) => {
					robot.logger.info(`${TAG}: Weather data obtained for ${lat}, ${lon}.`);
					robot.logger.debug(w);
					return service.formatter(w).then((attachments) => {
						robot.emit('ibmcloud.formatter', {
							response: res,
							attachments
						});
						activity.emitBotActivity(robot, res, { activity_id: 'activity.weather.query'});
					}).catch((e) => {
						let weatherData = '{}';
						if (w) {
							weatherData = JSON.stringify(w);
						}
						robot.logger.error(`${TAG}: An error occurred attempting to format the weather response for ${lat},${lon} - ${weatherData}:`);
						robot.logger.error(e);
						let message = i18n.__('error.weather');
						robot.emit('ibmcloud.formatter', { response: res, message: message});
					});
				}, (e) => {
					robot.logger.error(`${TAG}: An error occurred attempting to get the weather for ${lat},${lon}:`);
					robot.logger.error(e);
					let message = i18n.__('error.weather');
					robot.emit('ibmcloud.formatter', { response: res, message: message});
				});
			}
			else {
				if (locationFound && matches.location.address.length === 1) {
					lon = matches.location.longitude[0];
					lat = matches.location.latitude[0];
					robot.logger.info(`${TAG}: Asynch call using weather library to get weather for ${lat}, ${lon}.`);
					return service.func(lat, lon).then((w) => {
						robot.logger.info(`${TAG}: Weather data obtained for ${lat}, ${lon}.`);
						robot.logger.debug(w);
						return service.formatter(w).then((attachments) => {
							robot.emit('ibmcloud.formatter', {
								response: res,
								attachments
							});
							activity.emitBotActivity(robot, res, { activity_id: 'activity.weather.query'});
						}).catch((e) => {
							let weatherData = '{}';
							if (w) {
								weatherData = JSON.stringify(w);
							}
							robot.logger.error(`${TAG}: An error occurred attempting to format the weather response for ${lat},${lon} - ${weatherData}:`);
							robot.logger.error(e);
							let message = i18n.__('error.weather');
							robot.emit('ibmcloud.formatter', { response: res, message: message});
						});
					}, (e) => {
						robot.logger.error(`${TAG}: An error occurred attempting to get the weather for ${lat},${lon}:`);
						robot.logger.error(e);
						let message = i18n.__('error.weather');
						robot.emit('ibmcloud.formatter', { response: res, message: message});
					});
				}
				else {
					robot.logger.warning(`${TAG}: No location match ws found to get the weather.`);
					let message = i18n.__('no.match');
					robot.emit('ibmcloud.formatter', { response: res, message: message});
				}
			}
		}).catch((err) => {
			robot.logger.error(`${TAG}: An error occurred with the location services.`);
			robot.logger.error(err);
			let message = i18n.__('location.query.error');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
		});
	}
	else {
		let message = i18n.__('provide.location');
		robot.emit('ibmcloud.formatter', { response: res, message: message});
		robot.logger.warning(`${TAG}: Need to provide a location to get the weather.`);
	}
};
