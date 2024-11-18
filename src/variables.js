module.exports = {
	initVariables: function () {
		var variables = []

		variables.push(
			{
				variableId: 'connection',
				name: 'Connection',
			},
			{
				variableId: 'hostName',
				name: 'Host Name',
			},
			{
				variableId: 'hardwareVersion',
				name: 'Hardware Version',
			},
			{
				variableId: 'serialNumber',
				name: 'Serial Number',
			},
			{
				variableId: 'cloudStatus',
				name: 'Cloud Status',
			},
			{
				variableId: 'voltage',
				name: 'Voltage',
			},
			{
				variableId: 'amperage',
				name: 'Amperage',
			},
			{
				variableId: 'wattage',
				name: 'Wattage',
			}
		)

		let model = this.MODELS.find((model) => model.id === this.config.model)

		let outlets = 2

		if (model) {
			outlets = model.outlets
		}

		for (let i = 0; i < outlets; i++) {
			variables.push({
				variableId: `outlet${i + 1}Name`,
				name: `Outlet ${i + 1} Name`,
			})
			variables.push({
				variableId: `outlet${i + 1}State`,
				name: `Outlet ${i + 1} State`,
			})
		}

		if (this.config.protocol === 'telnet') {
			variables.push({
				variableId: 'lastTelnetResponse',
				name: 'Last Telnet Response',
			})
		}

		this.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		try {
			let variableObj = {
				hostName: this.DEVICE_DATA.deviceInfo.hostName,
				hardwareVersion: this.DEVICE_DATA.deviceInfo.hardwareVersion,
				serialNumber: this.DEVICE_DATA.deviceInfo.serialNumber,
				cloudStatus: this.DEVICE_DATA.deviceInfo.cloudStatus,
				voltage: this.DEVICE_DATA.powerInfo.voltage,
				amperage: this.DEVICE_DATA.powerInfo.current,
				wattage: this.DEVICE_DATA.powerInfo.power,
			}

			let model = this.MODELS.find((model) => model.id === this.config.model)

			let outlets = 2

			if (model) {
				outlets = model.outlets
			}

			for (let i = 0; i < outlets; i++) {
				variableObj[`outlet${i + 1}Name`] = this.DEVICE_DATA.outletInfo[i].name
				variableObj[`outlet${i + 1}State`] = this.DEVICE_DATA.outletInfo[i].state == '1' ? 'On' : 'Off'
			}

			if (this.config.protocol === 'telnet') {
				variableObj.lastTelnetResponse = this.lastTelnetResponse
			}

			this.setVariableValues(variableObj)
		} catch (error) {
			console.log(error)
		}
	},
}
