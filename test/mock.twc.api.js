/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';
const nock = require('nock');
const path = require('path');
const env = require(path.resolve(__dirname, '..', 'src', 'lib', 'env'));

const endpoint = env.url;
const testDailyForecast = require(path.resolve(__dirname, 'resources', 'test.daily.forecast.json'));
const testHourlyForecast = require(path.resolve(__dirname, 'resources', 'test.hourly.forecast.json'));
const testCurrentObservations = require(path.resolve(__dirname, 'resources', 'test.current.observations.json'));
const testHourlyObservations = require(path.resolve(__dirname, 'resources', 'test.hourly.observations.json'));
const testLocationServices = require(path.resolve(__dirname, 'resources', 'test.location.services.json'));

module.exports = {
	setupMockery: function() {
		let twcScope = nock(endpoint)
			.persist();
		twcScope.get('/api/weather/v1/geocode/0.00/0.00/forecast/daily/10day.json')
			.query(true)
			.reply(200, testDailyForecast);
		twcScope.get('/api/weather/v1/geocode/0.00/0.00/forecast/hourly/48hour.json')
				.query(true)
				.reply(200, testHourlyForecast);
		twcScope.get('/api/weather/v1/geocode/0.00/0.00/observations.json')
				.query(true)
				.reply(200, testCurrentObservations);
		twcScope.get('/api/weather/v1/geocode/0.00/0.00/observations/timeseries.json')
				.query(true)
				.reply(200, testHourlyObservations);
		twcScope.get('/api/weather/v1/geocode/35.23/-80.84/observations.json')
				.query(true)
				.reply(200, testCurrentObservations);
		twcScope.get('/api/weather/v3/location/search')
			.query(true)
			.reply(200, testLocationServices);
	}
};
