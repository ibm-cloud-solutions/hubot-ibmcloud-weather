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
const sprinkles = require('mocha-sprinkles');

// Passing arrow functions to mocha is discouraged: https://mochajs.org/#arrow-functions
// return promises from mocha tests rather than calling done() - http://tobyho.com/2015/12/16/mocha-with-promises/
describe('Interacting with TWC via Reg Ex', function() {

	let room;

	before(function() {
		mockTWC.setupMockery();
	});

	beforeEach(function() {
		room = helper.createRoom();
		// Force all emits into a reply.
		room.robot.on('ibmcloud.formatter', function(event) {
			if (event.message) {
				console.log('event.message: ' + event.message);
				event.response.reply(event.message);
			}
		});
	});

	afterEach(function() {
		room.destroy();
	});

	context('user calls `list services`', function() {
		beforeEach(function() {
			return room.user.say('mimiron', '@hubot list services');
		});
		// the response messages should be first to prompt user to pick option, second to list options
		it('should respond with 2 messages', function(done) {
			expect(room.messages.length).to.eql(3);
			expect(room.messages[1]).to.eql(['hubot', '@mimiron OK, please let me know which service you would like to use?']);
			expect(room.messages[2]).to.eql([ 'hubot', '@mimiron \n1) 10 day weather forecast\n2) 48 hour weather forecast\n3) Current weather\n4) 24 hour weather observations' ]);
			done();
		});
	});

	context('user calls `weather for Charlotte NC`', function() {
		it('should respond with 2 messages and an attachment', function(done) {
			setTimeout(() => {
				// break on first formatter response
				expect(room.messages.length).to.eql(4);
				expect(room.messages[1][1]).to.eql('@mimiron Got it! You want the weather for Charlotte  NC');
				done();
			}, 500);
			room.user.say('mimiron', '@hubot weather for Charlotte NC');
		});
	});

	context('user calls `weather for Charlotte`', function() {
		it('should respond with 5 messages including a conversation', function(done) {
			let timeout = 15000;
			this.timeout(timeout);

			room.user.say('mimiron', '@hubot weather for Charlotte');
			return sprinkles.eventually({ timeout: timeout }, function(){
				if (room.messages.length < 3){
					throw new Exception('too soon');
				}
			}).then(() => false).catch(() => true).then((success) => {
				console.log(JSON.stringify(room.messages) + ' -- ' + room.messages.length);
				expect(room.messages[3][1]).to.eql('@mimiron \n1) Charlotte, North Carolina, United States\n2) Charlottesville, Virginia, United States\n3) Charlotte Amalie, Saint Thomas, U.S. Virgin Islands\n4) Charlottetown, Prince Edward Island, Canada\n5) Charlotte, Michigan, United States\n6) Charlotte, Rochester, 14612, New York, United States\n7) Charlotte S Yeh, 650 F St NW, Washington, District of Columbia 20001, United States\n8) Charlotte Hall, Maryland, United States\n9) Charlotte, Tennessee, United States\n10) Charlotte Wilcox & Co., 1560 Broadway, New York City, New York 10036, United States');
				expect(room.messages.length).to.eql(4);
				room.user.say('mimiron', '1');
				done();
			});
		});
	});
});
