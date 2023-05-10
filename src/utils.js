export function getAuthKey(username, password) {
	let authString = username + ':' + password;
	let authBase64 = Buffer.from(authString).toString('base64');
	return authBase64;
}

export function getInformation() {
	this.axios.get(`http://${this.config.ip}/wattbox_info.xml`, {
		headers: {
			Host: this.config.ip,
			'Keep-Alive': '300',
			Connection: 'keep-alive',
			'User-Agent': 'APP',
			Authorization: `Basic ${this.authKey}`
		},
		/*transformResponse: [function (data) {
			console.log('here')
			data = this.jsonc.parse()
		
			return data;
		  }],*/
	})
	.then((response) => {
		this.parseXml(response.data, (err, result) => {
			//console.log(JSON.stringify(result, null, 4));

			let names = result.request.outlet_name[0];
			let namesArray = names.split(',');

			let outletState = result.request.outlet_status[0];
			let outletStateArray = outletState.split(',')

			let info = {};

			info.deviceInfo = {
				hostName: result.request.host_name,
				hardwareVersion: result.request.hardware_version,
				serialNumber: result.request.serial_number,
				cloudStatus: result.request.cloud_status
			};

			info.powerInfo = {
				voltage: result.request.voltage_value,
				current: result.request.current_value,
				power: result.request.power_value
			};

			info.outletInfo = {};

			for(let i = 0; i < namesArray.length; i++) {
				info.outletInfo[i] = {
					name: namesArray[i],
					state: outletStateArray[i]
				}
			}

			this.updateStatus('ok');
			
			this.DEVICE_DATA = info;
			this.updateVariables();
		})
	})
	.catch((err) => {
		this.updateStatus('error');
		this.log('error', err);
	})
}

export function sendCommand(path) {
	this.axios.get(`http://${this.config.ip}${path}`, {
		headers: {
			Host: this.config.ip,
			'Keep-Alive': '300',
			Connection: 'keep-alive',
			'User-Agent': 'APP',
			Authorization: `Basic ${this.authKey}`
		}
	} )
	.catch((err) => {
		this.log('error', 'Error sending command: ' + err);
		this.updateStatus('error', 'Command send error');
	});
	this.log('debug', `http://${this.config.ip}${path}`)
}