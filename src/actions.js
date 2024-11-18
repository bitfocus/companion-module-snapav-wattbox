module.exports = {
	initActions: function () {
		let self = this

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
						choices: self.outletChoices,
					},
				],
				callback: (action) => {
					self.controlOutlet(action.options.outlet, action.options.powerState)
				},
			},
			powercycle: {
				name: 'Power Cycle',
				options: [
					{
						type: 'dropdown',
						label: 'Outlet',
						id: 'outlet',
						default: '1',
						choices: self.outletChoices,
					},
				],
				callback: (action) => {
					self.controlOutlet(action.options.outlet, 3)
				},
			},
			autoRebootOn: {
				name: 'Auto Reboot On',
				options: [],
				callback: () => {
					self.controlOutlet(0, 4)
				},
			},
			autoRebootOff: {
				name: 'Auto Reboot Off',
				options: [],
				callback: () => {
					self.controlOutlet(0, 4)
				},
			},
		}

		self.setActionDefinitions(actions)
	},
}
