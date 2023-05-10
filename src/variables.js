export function getVariables() {
	var variables = [];

	variables.push(
		{
			variableId: 'connection',
			name: 'Connection'
		},
		{
			variableId: 'hostName',
			name: 'Host Name'
		},
		{
			variableId: 'hardwareVersion',
			name: 'Hardware Version'
		},
		{
			variableId: 'serialNumber',
			name: 'Serial Number'
		},
		{
			variableId: 'cloudStatus',
			name: 'Cloud Status'
		},
		{
			variableId: 'voltage',
			name: 'Voltage'
		},
		{
			variableId: 'amperage',
			name: 'Amperage'
		},
		{
			variableId: 'wattage',
			name: 'Wattage'
		}
	);

	if(this.config.model == 300) {
		for(let i = 0; i < 3; i++) {
			variables.push({
				variableId: `outlet${i + 1}Name`,
				name: `Outlet ${i + 1} Name`
			})
			variables.push({
				variableId: `outlet${i + 1}State`,
				name: `Outlet ${i + 1} State`
			})
		};
	} else if (this.config.model == 700) {
		for(let i = 0; i < 12; i++) {
			variables.push({
				variableId: `outlet${i + 1}Name`,
				name: `Outlet ${i + 1} Name`
			})
			variables.push({
				variableId: `outlet${i + 1}State`,
				name: `Outlet ${i + 1} State`
			})
		};
	}



	return variables;
}

export function updateVariables() {
	try {

		let variableObj = {
			hostName: this.DEVICE_DATA.deviceInfo.hostName,
			hardwareVersion: this.DEVICE_DATA.deviceInfo.hardwareVersion,
			serialNumber: this.DEVICE_DATA.deviceInfo.serialNumber,
			cloudStatus: this.DEVICE_DATA.deviceInfo.cloudStatus,
			voltage: this.DEVICE_DATA.powerInfo.voltage,
			amperage: this.DEVICE_DATA.powerInfo.current,
			wattage: this.DEVICE_DATA.powerInfo.power
		};

		if(this.config.model == 300) {
			for(let i = 0; i <= 2; i++) {
				variableObj[`outlet${i + 1}Name`] = this.DEVICE_DATA.outletInfo[`${i}`].name;
				variableObj[`outlet${i + 1}State`] = this.DEVICE_DATA.outletInfo[`${i}`].state;
			}
		} else if(this.config.model == 700) {
			for(let i = 0; i <= 11; i++) {
				variableObj[`outlet${i + 1}Name`] = this.DEVICE_DATA.outletInfo[i].name;
				variableObj[`outlet${i + 1}State`] = this.DEVICE_DATA.outletInfo[i].state;
			}
		}

		

		this.setVariableValues(variableObj);
		this.checkFeedbacks();
	} catch (error) {
		console.log(error);
	}
}
