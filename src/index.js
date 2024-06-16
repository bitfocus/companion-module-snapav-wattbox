const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base');

const config = require('./config.js');

const actions = require('./actions.js');
const feedbacks = require('./feedbacks.js');
const variables = require('./variables.js');
const presets = require('./presets.js');

const constants = require('./constants.js');
const utils = require('./utils.js');

class SnapAVWattboxInstance extends InstanceBase {
	constructor(internal) {
		super(internal);

		Object.assign(this, {
			...config,
			...actions,
			...presets,
			...variables,
			...constants,
			...utils,
			...feedbacks,
		});

		this.POLLING_INTERVAL = null; //used to poll the device every second
		this.CONNECTED = false; //used for friendly notifying of the user that we have not received data yet

		this.DEVICE_DATA = {};

		this.DEVICE_DATA = {
			deviceInfo: {
				hostName: '',
				hardwareVersion: '',
				serialNumber: '',
				cloudStatus: 0,
			},
			powerInfo: {
				voltage: 0,
				current: 0,
				power: 0,
			},
			outletInfo: [],
		};

		this.QUEUE = [];
	}

	async init(config) {
		this.configUpdated(config);
	}

	async configUpdated(config) {
		this.config = config;

		let model = this.MODELS.find((model) => model.id === this.config.model);

		if (model) {
			if (model.protocol) {
				console.log('setting protocol to ' + model.protocol);
				this.config.protocol = model.protocol;
			}
		}

		this.buildOutletChoices();

		if (this.POLLING_INTERVAL) {
			clearInterval(this.POLLING_INTERVAL);
			this.POLLING_INTERVAL = null;
		}

		this.initActions();
		this.initFeedbacks();
		this.initVariables();
		this.initPresets();

		this.checkVariables();
		this.checkFeedbacks();

		if (this.config.protocol === 'http') {
			this.authKey = this.getAuthKey(this.config.username, this.config.password);
			this.updateStatus(InstanceStatus.Ok);

			if (this.config.polling) {
				this.setupInterval();
			}
		} else if (this.config.protocol === 'telnet') {
			this.initTelnet();
		}
	}

	async destroy() {
		if (this.config.protocol === 'telnet') {
			this.sendTelnetCommand('!Exit');
		} else {
			if (this.socket !== undefined) {
				this.socket.destroy();
				delete this.socket;
			}

			if (this.POLLING_INTERVAL) {
				clearInterval(this.POLLING_INTERVAL);
				this.POLLING_INTERVAL = null;
			}
		}
	}
}

runEntrypoint(SnapAVWattboxInstance, []);
