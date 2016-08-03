/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

/*
 * possible conversations to test:
 * user says 'list services' (do we need to have something in user enters invalid number?)
 * user asks for weather at location not in gazetteer, hubot notifies user
 * user asks for weather at known location, hubot retrieves list of matching locations
 * user asks for number that is not in list (when listing possible locations), hubot notifies it cannot do anything
 * user asks for number that is in list (when listing possible locations), hubot gets long/lat and calls api
*/

'use strict';

/*eslint no-undef: 0 */

const expect = require('chai').expect;
const Helper = require('hubot-test-helper');
const helper = new Helper('../src/scripts');
const mockTWC = require('./mock.twc.api');

var i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	directory: __dirname + '/../src/locales',
	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
// At some point we need to toggle this setting based on some user input.
i18n.setLocale('en');

// Passing arrow functions to mocha is discouraged: https://mochajs.org/#arrow-functions
// return promises from mocha tests rather than calling done() - http://tobyho.com/2015/12/16/mocha-with-promises/
describe('Interacting with TWC via Natural Language', function() {

	let room;

	before(function() {
		mockTWC.setupMockery();
	});

	beforeEach(function() {
		room = helper.createRoom();
	});

	afterEach(function() {
		room.destroy();
	});

	context('user calls `list services`', function() {
		// the response messages should be first to prompt user to pick option, second to list options
		it('should respond with services', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				if (event.message) {
					expect(event.message).to.be.a('string');
					expect(event.message).to.contain(i18n.__('pick.a.service'));
					done();
				}
			});

			var res = { message: {text: 'List the weather options', user: {id: 'anId'}}, response: room };
			room.robot.emit('twc.services.list', res, {});
		});
	});

	context('user calls `weather for Charlotte NC`', function() {
		it('should respond with the weather', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				if (event.message) {
					expect(event.message).to.be.a('string');
					expect(event.message).to.contain('Got it! You want the weather for Charlotte');
					done();
				}
			});

			var res = { message: {text: 'Please get the weather for Charlotte NC', user: {id: 'anId'}}, response: room };
			room.robot.emit('twc.weather.show', res, {location: 'Charlotte'});
		});
	});

	context('user calls `weather help`', function() {
		it('should respond with help information', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				if (event.message) {
					expect(event.message).to.be.a('string');
					expect(event.message).to.contain('weather services');
					expect(event.message).to.contain('weather for [CITY] [STATE]');
					done();
				}
			});

			var res = { message: {text: 'help weather', user: {id: 'anId'}}, response: room };
			room.robot.emit('twc.weather.help', res, {});
		});
	});
});
