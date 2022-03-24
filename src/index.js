const instance_skel = require('../../../instance_skel');

var Client = require('node-rest-client').Client;

const { getAuthKey } = require('./utils');
const actions = require('./actions');
const configs = require('./configs');

class SnapavWattboxInstance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config);

		Object.assign(this, {
			...actions,
			...configs,
		});

		this.rest = new Client();

		this.config = config;

		this.authKey = getAuthKey(this.config.username, this.config.password);

		this.data = {
			status: {
				power: {
					1: null,
					2: null,
					3: null,
					4: null,
					5: null,
					6: null,
					7: null,
					8: null,
					9: null,
					10: null,
					11: null,
					12: null,
				},
				auto_reboot: null,
			},
			interval: null,
		};

		this.initActions();

		this.status(this.STATUS_OK);
	}

	init() {
		this.updateConfig();
	}

	updateConfig(config) {
		if (config) {
			this.config = config;
		}

		this.authKey = getAuthKey(this.config.username, this.config.password);

		this.status(this.STATUS_OK);
	}

	destroy() {
		if (this.data.interval) {
		}
	}
}

module.exports = SnapavWattboxInstance;
