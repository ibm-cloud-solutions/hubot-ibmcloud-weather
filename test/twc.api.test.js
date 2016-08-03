/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';

const expect = require('chai').expect;
const weather = require('../src/lib/weather');
const mockTWCAPI = require('./mock.twc.api');
const path = require('path');
const mockHourlyForecast = require(path.resolve(__dirname, 'resources', 'test.hourly.forecast.json'));
const mockDailyForecast = require(path.resolve(__dirname, 'resources', 'test.daily.forecast.json'));
const mockCurrentObservations = require(path.resolve(__dirname, 'resources', 'test.current.observations.json'));
const mockHourlyObservations = require(path.resolve(__dirname, 'resources', 'test.hourly.observations.json'));

// Passing arrow functions to mocha is discouraged: https://mochajs.org/#arrow-functions
// return promises from mocha tests rather than calling done() - http://tobyho.com/2015/12/16/mocha-with-promises/
describe('Interacting with TWC API', function() {

	before(function(done) {
		mockTWCAPI.setupMockery();
		done();
	});

	it('should receive json object with 11 forecasts', function(done) {
		return weather.get10DayForecast(0.0, 0.0).then(function(res){
			expect(res.forecasts.length).to.eql(11);
			done();
		}, function(error) {
			done(error);
		});
	});

	it('should receive json object with 48 forecasts', function(done) {
		return weather.get48HourForecast(0.0, 0.0).then(function(res){
			expect(res.forecasts.length).to.eql(24);
			done();
		}, function(error) {
			done(error);
		});
	});

	it('should receive json object with 1 observation', function(done) {
		return weather.getCurrentObservation(0.0, 0.0).then(function(res){
			expect(Array.isArray(res.observation)).to.eql(false);
			done();
		}, function(error) {
			done(error);
		});
	});

	it('should receive json object with an array of observations', function(done) {
		return weather.get24HourObservation(0.0, 0.0).then(function(res){
			expect(Array.isArray(res.observations)).to.eql(true);
			done();
		}, function(error) {
			done(error);
		});
	});

	it('should format hourly forecast into array with 24 attachments', function(done) {
		return weather.hourlyForecastFormatter(mockHourlyForecast).then(function(res){
			expect(res.length).to.eql(24);
			done();
		}, function(error) {
			done(error);
		});
	});

	it('should format daily forecast into array with 11 attachments', function(done) {
		return weather.tenDayForecastFormatter(mockDailyForecast).then(function(res){
			expect(res.length).to.eql(11);
			done();
		}, function(error) {
			done(error);
		});
	});

	it('should format current observation into array with 1 attachments', function(done) {
		return weather.currentObservationFormatter(mockCurrentObservations).then(function(res){
			expect(res.length).to.eql(1);
			done();
		}, function(error) {
			done(error);
		});
	});

	it('should format hourly obersations into array with 3 attachments', function(done) {
		return weather.hourlyObservationFormatter(mockHourlyObservations).then(function(res){
			expect(res.length).to.eql(3);
			done();
		}, function(error) {
			done(error);
		});
	});
});
