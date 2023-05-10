import { InstanceBase, runEntrypoint, Regex } from '@companion-module/base';

import axios from 'axios';
import * as xml2js from 'xml2js';

import * as actions from './actions.js';
import * as presets from './presets.js';
import * as variables from './variables.js';
import * as configs from './configs.js';
import * as utils from './utils.js';
import * as feedbacks from './feedbacks.js'

class SnapAVWattboxInstance extends InstanceBase {
	constructor(internal) {
		super(internal);

		Object.assign(this, {
			...configs,
			...actions,
			...presets,
			...variables,
			...utils,
			...feedbacks
		});

		//this.updateVariables = updateVariables

		this.DEVICE_DATA = {
			deviceInfo: {
				hostName: '',
				hardwareVersion: '',
				serialNumber: '',
				cloudStatus: 0
			},
			powerInfo: {
				voltage: 0,
				current: 0,
				power: 0
			},
			outletInfo: {}
		};

		this.axios = axios;
		this.parseXml = xml2js.parseString;

		this.init(this.getConfigFields());
	}

	async init(config) {
		this.config = config;

		this.POLLING_INTERVAL = null; //used to poll the device every second
		this.CONNECTED = false; //used for friendly notifying of the user that we have not received data yet

		this.DEVICE_DATA = {};

		this.DEVICE_DATA = {
			deviceInfo: {
				hostName: '',
				hardwareVersion: '',
				serialNumber: '',
				cloudStatus: 0
			},
			powerInfo: {
				voltage: 0,
				current: 0,
				power: 0
			},
			outletInfo: []
		};

		if(this.config.model == 300) {
			for(var i = 1; i <= 3; i++ ) {
				this.DEVICE_DATA.outletInfo[i] = {
					name: '',
					state: 0
				}
			}
		} else if (this.config.model == 700) {
			for(var i = 1; i <= 12; i++ ) {
				this.DEVICE_DATA.outletInfo[i] = {
					name: '',
					state: 0
				}
			}
		}

		this.authKey = this.getAuthKey(this.config.username, this.config.password);

		if (this.config.polling) {
			this.setupInterval();
		}

		this.initActions();
		this.initVariables();
		this.initFeedbacks();
		this.initPresets();

		this.updateVariables();

		this.updateStatus('ok');
	}

	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.POLLING_INTERVAL) {
			clearInterval(this.POLLING_INTERVAL);
			this.POLLING_INTERVAL = null;
		}
	}

	async configUpdated(config) {
		this.config = config;

		if (this.POLLING_INTERVAL) {
			clearInterval(this.POLLING_INTERVAL);
			this.POLLING_INTERVAL = null;
		}

		this.authKey = this.getAuthKey(this.config.username, this.config.password);

		if (this.config.polling) {
			this.setupInterval();
		}

		this.initActions();
		this.initVariables();
		this.initPresets();
		this.initFeedbacks();

		this.updateVariables();
	}

	initVariables() {
		const variables = this.getVariables();
		this.setVariableDefinitions(variables);
	}

	initPresets() {
		const presets = this.getPresets();
		this.setPresetDefinitions(presets);
	}

	initActions() {
		const actions = this.getActions();
		this.setActionDefinitions(actions);
	}

	initFeedbacks() {
		const feedbacks = this.getFeedbacks();
		this.setFeedbackDefinitions(feedbacks);
	}

	setupInterval() {
		this.stopInterval();

		if (this.config.polling) {
			//this.getInformation();
			this.POLLING_INTERVAL = setInterval(this.getInformation.bind(this), 2000);
		}
	}

	getInformation() {
		this.getInformation();
	}

	stopInterval() {
		if (this.POLLING_INTERVAL !== null) {
			clearInterval(this.POLLING_INTERVAL);
			this.POLLING_INTERVAL = null;
		}
	}
}
runEntrypoint(SnapAVWattboxInstance, []);