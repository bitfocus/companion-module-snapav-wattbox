const instance_skel = require('../../../instance_skel');

const http = require('http');

const { getAuthKey } = require('./utils');
const actions = require('./actions');
const configs = require('./configs');

class AvsnapWattboxInstance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config);

		Object.assign(this, {
			...actions,
			...configs,
		});

		this.config = config;

		this.authKey = getAuthKey(this.config.username, this.config.password);

		this.data = {
			status: {
				power: null,
				brightness: 0,
				temperature: 0,
			},
			interval: null,
		};

		this.initActions();
	}

	init() {
		this.updateConfig();
	}

	updateConfig(config) {
		if (config) {
			this.config = config;
		}

		this.authKey = this.getAuthKey(this.config.username, this.config.password);

		this.status(this.STATUS_OK);
	}

	destroy() {
		if (this.data.interval) {
			clearInterval(this.data.interval);
		}
	}
}

module.exports = AvsnapWattboxInstance;
