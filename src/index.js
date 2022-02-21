const instance_skel = require('../../../instance_skel')

const http = require('http');

const { getAuthKey } = require('./utils');
const actions = require('./actions')
const configs = require('./configs')
//const constants = require('./constants')
//const feedbacks = require('./feedbacks')
//const polling = require('./polling')
//const upgrades = require('./upgrades')
//const variables = require('./variables')

class AvsnapWattboxInstance extends instance_skel {
	constructor(system, id, config) {
		super(system, id, config)

		Object.assign(this, {
			...actions,
			//...constants,
			...configs,
			//...feedbacks,
			//...polling,
			//...variables,
		})

		this.config = config

		this.authKey = this.getAuthKey(this.config.username, this.config.password);

		this.data = {
			status: {
				power: null,
				brightness: 0,
				temperature: 0,
			},
			interval: null,
		}

		//this.initConstants()
		this.initActions()
	}

	static GetUpgradeScripts() {
		return [upgrades.upgradeV1_2_0]
	}

	init() {
		this.updateConfig()
	}

	updateConfig(config) {
		if (config) {
			this.config = config
		}

		this.authKey = this.getAuthKey(this.config.username, this.config.password);

		//this.initFeedbacks()
		//this.updateVariableDefinitions()
		//this.initPolling()

		this.status(this.STATUS_OK)
	}

	destroy() {
		if (this.data.interval) {
			clearInterval(this.data.interval)
		}
	}
}

module.exports = AvsnapWattboxInstance;
