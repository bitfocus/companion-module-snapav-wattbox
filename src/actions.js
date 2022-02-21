module.exports = {
	initActions() {
		const actions = {
			power: {
				label: 'Power',
				options: [
					{
						type: 'dropdown',
						label: 'Power on/off',
						id: 'powerState',
						choices: [
							{ id: '0', label: 'Off' },
							{ id: '1', label: 'On' },
						],
						default: 'off',
					},
					{
						type: 'dropdown',
						label: 'Outlet',
						id: 'outlet',
						choices: [
							{ id: '1', label: '1' },
							{ id: '2', label: '2' },
							{ id: '3', label: '3' },
						],
						default: '1',
					},
				],
			},
			powercycle: {
				label: 'Power Cycle',
				options: [
					{
						type: 'dropdown',
						label: 'Outlet',
						id: 'outlet',
						choices: [
							{ id: '0', label: 'All' },
							{ id: '1', label: '1' },
							{ id: '2', label: '2' },
							{ id: '3', label: '3' },
						],
						default: '1',
					},
				],
			},
			autoRebootOn: {
				label: 'Auto Reboot On',
			},
			autoRebootOff: {
				label: 'Auto Reboot Off',
			},
		};

		this.setActions(actions);
	},

	action(action) {
		if (this.config.ip) {
			let getOptions = {
				headers: {
					KeepAlive: 300,
					Connection: 'keep-alive',
					UserAgent: 'app',
				},
			};

			switch (action.action) {
				case 'power': {
					getOptions.path = `/control.cgi'?outlet=${action.options.outlet}&command=${action.options.powerState}`;
					break;
				}
				case 'powercycle': {
					getOptions.path = `/control.cgi'?outlet=${action.options.outlet}&command=3`;
					break;
				}
				case 'autoRebootOn': {
					getOptions.path = `/control.cgi'?outlet=0&command=4`;
					break;
				}
				case 'autoRebootOff': {
					getOptions.path = `/control.cgi'?outlet=0&command=4`;
				}
			}

			if (getOptions.path > 0) {
				getOptions.headers.Authorization = `Basic ${this.authKey}`;
				getOptions.hostname = this.config.ip;

				http.get(getOptions, (res, err) => {
					if (err !== null) {
						this.status(this.STATUS_ERROR, `Keylight Change Request Failed. Type: ${action.action}`);
						this.log('error', `Keylight Change Request Failed. Type: ${action.action}`);
					} else {
						this.status(this.STATUS_OK);
						this.updateVariables(data.lights[0]);
					}
				});
			}
		}
	},
};
