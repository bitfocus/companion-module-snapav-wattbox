export function getActions() {
	let actions = {
			power: {
				name: 'Power',
				options: [
					{
						type: 'dropdown',
						label: 'Power on/off',
						id: 'powerState',
						choices: [
							{ id: '0', label: 'Off' },
							{ id: '1', label: 'On' },
						],
						default: '0',
					},
					{
						type: 'dropdown',
						label: 'Outlet',
						id: 'outlet',
						default: '1',
					},
				],
				callback: (action) => {
					let path;
					path = `/control.cgi?outlet=${action.options.outlet}&command=${action.options.powerState}`;
					this.sendCommand(path);
				}
			},
			powercycle: {
				name: 'Power Cycle',
				options: [
					{
						type: 'dropdown',
						label: 'Outlet',
						id: 'outlet',
						default: '1',
					},
				],
				callback: (action) => {
					let path;
					path = `/control.cgi?outlet=${action.options.outlet}&command=3`;
					this.sendCommand(path);
				}
			},
			autoRebootOn: {
				name: 'Auto Reboot On',
				options: [],
				callback: (action) => {
					let path;
					path = `/control.cgi?outlet=0&command=4`;
					this.sendCommand(path);
				}
			},
			autoRebootOff: {
				name: 'Auto Reboot Off',
				options: [],
				callback: (action) => {
					let path;
					path = `/control.cgi?outlet=0&command=4`;
					this.sendCommand(path);
				}
			}
		};
		if(this.config.model == '300') {
			actions.power.options[1].choices = [
				{ id: '0', label: 'All' },
				{ id: '1', label: '1' },
				{ id: '2', label: '2' },
				{ id: '3', label: '3' }
			]
			actions.powercycle.options[0].choices = [
				{ id: '0', label: 'All' },
				{ id: '1', label: '1' },
				{ id: '2', label: '2' },
				{ id: '3', label: '3' },
			]
			
		} else if(this.config.model == '700') {
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
				{ id: '12', label: '12' }
			]
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
				{ id: '12', label: '12' }
			]
		};

		return actions;

	}
