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
							{ id: '0', label: 'All' },
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
		if (this.config.model == '300') {
			actions.power.options[1].choices = [
				{ id: '0', label: 'All' },
				{ id: '1', label: '1' },
				{ id: '2', label: '2' },
				{ id: '3', label: '3' },
			];
			actions.powercycle.options[0].choices = [
				{ id: '0', label: 'All' },
				{ id: '1', label: '1' },
				{ id: '2', label: '2' },
				{ id: '3', label: '3' },
			];
		} else if (this.config.model == '700') {
			actions.power.options[1].choices = [
				{ id: '0', label: 'All' },
				{ id: '1', label: '1' },
				{ id: '2', label: '2' },
				{ id: '3', label: '3' },
				{ id: '4', label: '4' },
				{ id: '5', label: '5' },
				{ id: '6', label: '6' },
				{ id: '7', label: '7' },
				{ id: '8', label: '8' },
				{ id: '9', label: '9' },
				{ id: '10', label: '10' },
				{ id: '11', label: '11' },
				{ id: '12', label: '12' },
			];
			actions.powercycle.options[0].choices = [
				{ id: '0', label: 'All' },
				{ id: '1', label: '1' },
				{ id: '2', label: '2' },
				{ id: '3', label: '3' },
				{ id: '4', label: '4' },
				{ id: '5', label: '5' },
				{ id: '6', label: '6' },
				{ id: '7', label: '7' },
				{ id: '8', label: '8' },
				{ id: '9', label: '9' },
				{ id: '10', label: '10' },
				{ id: '11', label: '11' },
				{ id: '12', label: '12' },
			];
		}

		this.setActions(actions);
	},

	action(action) {
		var self = this;

		if (self.config.ip) {
			let path;

			switch (action.action) {
				case 'power': {
					path = `/control.cgi?outlet=${action.options.outlet}&command=${action.options.powerState}`;
					break;
				}
				case 'powercycle': {
					path = `/control.cgi?outlet=${action.options.outlet}&command=3`;
					break;
				}
				case 'autoRebootOn': {
					path = `/control.cgi?outlet=0&command=4`;
					break;
				}
				case 'autoRebootOff': {
					path = `/control.cgi?outlet=0&command=4`;
				}
			}

			if (path.length > 0) {
				let url = 'http://' + self.config.ip + path;

				this.log('debug', `making request:, ${url}`);

				let get_args = {
					headers: {
						Host: self.config.ip,
						'Keep-Alive': '300',
						Connection: 'keep-alive',
						'User-Agent': 'APP',
						Authorization: `Basic ${self.authKey}`,
					},
				};

				self.rest
					.get(url, get_args, function (data, response) {
						self.status(self.STATUS_OK);
						console.log(data);
					})
					.on('error', function (error) {
						self.status(self.STATUS_ERROR, 'ERROR: Chk Credentials');
						self.log(
							'error',
							`Error executing action ${action.action} with message ${error.message}. Is your username and password correct?`
						);
					});
			}
		}
	},
};
