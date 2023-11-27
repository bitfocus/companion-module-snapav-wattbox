/* eslint-disable no-case-declarations */
const { InstanceStatus } = require('@companion-module/base');

const axios = require('axios');
const xml2js = require('xml2js');
const Buffer = require('buffer').Buffer;

const parseXml = xml2js.parseString;

const { Telnet } = require('telnet-client');

module.exports = {
	getAuthKey: function (username, password) {
		let authString = username + ':' + password;
		let authBase64 = Buffer.from(authString).toString('base64');
		return authBase64;
	},

	async initTelnet() {
		let self = this;

		self.connection = new Telnet();

		const params = {
			host: self.config.ip,
			port: 23,
			loginPrompt: 'Username: ',
			passwordPrompt: 'Password: ',
			username: `${self.config.username}`,
			password: `${self.config.password}`,
			shellPrompt: 'Successfully Logged In!', // or negotiationMandatory: false
			//negotiationMandatory: false,
			timeout: 1500,
		};

		self.connection.on('data', function (data) {
			let response = data.toString();
			if (response.includes('API locked')) {
				self.log('error', 'API is locked due to too many invalid login attempts.');
				self.updateStatus(InstanceStatus.Error, 'API locked.');
				self.stopInterval();
			} else {
				self.processTelnetResponse(response);
			}
		});

		self.connection.on('ready', async function (prompt) {
			if (prompt.includes('Successfully Logged In!')) {
				console.log('log in successful');
				self.connectionReady = true;
				self.updateStatus(InstanceStatus.Ok);

				self.addTelnetCommand('?Firmware');
				self.addTelnetCommand('?Model');
				self.addTelnetCommand('?ServiceTag');
				self.addTelnetCommand('?Hostname');

				self.setupInterval();
			} else {
				console.log('log in failed');
				console.log(prompt);
				self.connectionReady = false;
				self.updateStatus(InstanceStatus.Error, 'Invalid prompt received');
				self.log('debug', 'Invalid prompt received, retrying in 10 seconds');
				self.destroy();
				setTimeout(self.init.bind(self), 10000, self.config);
			}
		});

		self.connection.on('error', function (error) {
			console.log('socket error:', error);
		});

		try {
			await self.connection.connect(params);
		} catch (error) {
			self.log('error', `Error connecting to Wattbox: ${error.toString()}`);
		}
	},

	getInformation: function () {
		let self = this;

		if (self.config.protocol === 'http') {
			axios
				.get(`http://${self.config.ip}/wattbox_info.xml`, {
					headers: {
						Host: self.config.ip,
						'Keep-Alive': '300',
						Connection: 'keep-alive',
						'User-Agent': 'APP',
						Authorization: `Basic ${self.authKey}`,
					},
				})
				.then((response) => {
					parseXml(response.data, (err, result) => {
						//console.log(JSON.stringify(result, null, 4));

						let names = result.request.outlet_name[0];
						let namesArray = names.split(',');

						let outletState = result.request.outlet_status[0];
						let outletStateArray = outletState.split(',');

						let info = {};

						info.deviceInfo = {
							hostName: result.request.host_name,
							hardwareVersion: result.request.hardware_version,
							serialNumber: result.request.serial_number,
							cloudStatus: result.request.cloud_status,
						};

						info.powerInfo = {
							voltage: result.request.voltage_value,
							current: result.request.current_value,
							power: result.request.power_value,
						};

						info.outletInfo = {};

						for (let i = 0; i < namesArray.length; i++) {
							info.outletInfo[i] = {
								name: namesArray[i],
								state: outletStateArray[i],
							};
						}

						self.updateStatus('ok');

						self.DEVICE_DATA = info;
						self.updateVariables();
					});
				})
				.catch((err) => {
					self.updateStatus('error');
					self.log('error', err);
				});
		} else if (self.config.protocol === 'telnet') {
			self.addTelnetCommand('?OutletStatus');
			self.addTelnetCommand('?OutletName');
			self.addTelnetCommand('?AutoReboot');
		}
	},

	sendHTTPCommand: function (path) {
		let self = this;

		self.axios
			.get(`http://${self.config.ip}${path}`, {
				headers: {
					Host: self.config.ip,
					'Keep-Alive': '300',
					Connection: 'keep-alive',
					'User-Agent': 'APP',
					Authorization: `Basic ${self.authKey}`,
				},
			})
			.catch((err) => {
				self.log('error', 'Error sending command: ' + err);
				self.updateStatus('error', 'Command send error');
			});
		self.log('debug', `http://${self.config.ip}${path}`);
	},

	addTelnetCommand: function (command) {
		let self = this;

		self.QUEUE.push(command);

		if (self.QUEUE.length === 1) {
			self.sendTelnetCommand(command);
		}
	},

	checkTelnetQueue: function () {
		let self = this;

		if (self.QUEUE.length > 0) {
			self.sendTelnetCommand(self.QUEUE[0]);
		}
	},

	async sendTelnetCommand(command) {
		let self = this;

		if (self.connectionReady) {
			self.log('debug', 'Sending: ' + command);
			await self.connection.send(`${command}`);
			//console.log(res);
		} else {
			self.log('warning', 'Connection not ready, unable to send command at this time.');
		}
	},

	processTelnetResponse: function (response) {
		let self = this;

		try {
			let params = response.replace('\n', '').split('=');

			switch (params[0]) {
				case '?Firmware':
					self.DEVICE_DATA.deviceInfo.hardwareVersion = params[1];
					break;
				case '?Model':
					self.DEVICE_DATA.deviceInfo.model = params[1];
					break;
				case '?ServiceTag':
					self.DEVICE_DATA.deviceInfo.serialNumber = params[1];
					break;
				case '?Hostname':
					self.DEVICE_DATA.deviceInfo.hostName = params[1];
					break;
				case '?OutletStatus':
					let outletArray = params[1].split(',');
					for (let i = 0; i < self.DEVICE_DATA.outletInfo.length; i++) {
						self.DEVICE_DATA.outletInfo[i].state = parseInt(outletArray[i]);
					}
					break;
				case '~OutletStatus':
					let outlet = params[1].split(',');
					let outletNum = parseInt(outlet[0]);
					let outletState = parseInt(outlet[1]);
					self.DEVICE_DATA.outletInfo[outletNum].state = outletState;
					break;
				case '?OutletName':
					let nameArray = params[1].split(',');
					for (let i = 0; i < self.DEVICE_DATA.outletInfo.length; i++) {
						self.DEVICE_DATA.outletInfo[i].name = nameArray[i].replace('{', '').replace('}', '');
					}
					break;
				case '?AutoReboot':
					self.DEVICE_DATA.deviceInfo.autoReboot = params[1];
					break;
				default:
					break;
			}
		} catch (error) {
			console.log(error);
		}

		self.lastTelnetResponse = response;

		self.checkVariables();
		self.checkFeedbacks();

		self.QUEUE.shift();
		self.checkTelnetQueue();
	},

	controlOutlet: function (outlet, command) {
		let self = this;

		if (self.config.protocol == 'telnet') {
			if (command == '1') {
				command = 'ON';
			} else if (command == '0') {
				command = 'OFF';
			}
			self.addTelnetCommand(`!OutletSet=${outlet},${command}`);
		} else {
			let path = `/control.cgi?outlet=${outlet}&command=${command}`;
			self.sendHTTPCommand(path);
		}
	},

	buildOutletChoices: function () {
		let self = this;

		let outlets = 12;

		if (self.config.model === 'other') {
			outlets = self.config.outlets;
		} else {
			let model = self.MODELS.find((model) => model.id === self.config.model);

			if (model) {
				outlets = model.outlets;
			}
		}

		self.outletChoices = [];
		self.outletChoicesFeedbacks = [];

		self.outletChoices.push({ id: '0', label: 'All' });

		console.log('outlets: ' + outlets);

		for (let i = 0; i < outlets; i++) {
			self.outletChoices.push({ id: i + 1 + '', label: `Outlet ${i + 1}` });
			self.outletChoicesFeedbacks.push({ id: i, label: `Outlet ${i + 1}` });
			self.DEVICE_DATA.outletInfo.push({ name: '', state: 0 });
		}
	},

	setupInterval() {
		let self = this;

		self.stopInterval();

		if (self.config.polling) {
			self.POLLING_INTERVAL = setInterval(self.getInformation.bind(this), self.config.interval);
		}
	},

	stopInterval() {
		let self = this;

		if (self.POLLING_INTERVAL !== null) {
			clearInterval(self.POLLING_INTERVAL);
			self.POLLING_INTERVAL = null;
		}
	},
};
