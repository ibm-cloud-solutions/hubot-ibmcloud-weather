/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';

const settings = {
	url: process.env.VCAP_SERVICES_WEATHERINSIGHTS_0_CREDENTIALS_HOST ? 'https://' + process.env.VCAP_SERVICES_WEATHERINSIGHTS_0_CREDENTIALS_HOST : process.env.HUBOT_TWC_API,
	username: process.env.VCAP_SERVICES_WEATHERINSIGHTS_0_CREDENTIALS_USERNAME || process.env.HUBOT_TWC_USER,
	password: process.env.VCAP_SERVICES_WEATHERINSIGHTS_0_CREDENTIALS_PASSWORD || process.env.HUBOT_TWC_PASSWORD
};

// gracefully output message and exit if any required config is undefined
if (!settings.url) {
	console.error('HUBOT_TWC_API not set');
}

if (!settings.username) {
	console.error('HUBOT_TWC_USER not set');
}
if (!settings.password) {
	console.error('HUBOT_TWC_PASSWORD not set');
}


module.exports = settings;
