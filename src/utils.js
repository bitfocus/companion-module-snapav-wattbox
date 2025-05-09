/* eslint-disable no-case-declarations */
const { InstanceStatus } = require('@companion-module/base')

const Buffer = require('buffer').Buffer

module.exports = {
	getAuthKey: function (username, password) {
		let authString = username + ':' + password
		let authBase64 = Buffer.from(authString).toString('base64')
		return authBase64
	},

	getInformation: function () {
		let self = this

		if (self.config.protocol === 'http') {
			if (self.config.model === '800vps') {
				self.sendHTTPCommand('/main')
			} else {
				self.sendHTTPCommand('/wattbox_info.xml')
			}
		} else if (self.config.protocol === 'telnet') {
			self.addTelnetCommand('?OutletStatus')
			self.addTelnetCommand('?OutletName')
			self.addTelnetCommand('?AutoReboot')
		}
	},

	controlOutlet: function (outlet, command) {
		let self = this
	
		self.log('debug', 'Control Outlet: ' + outlet + ' Command: ' + command)
	
		const isModel800vps = self.config.model === '800vps'
	
		// If 'All' selected and model is 800vps, loop through each real outlet
		if (outlet === '0' && isModel800vps) {
			for (let choice of self.outletChoices) {
				if (choice.id !== '0') {
					self.controlOutlet(choice.id, command)
				}
			}
			return
		}
	
		if (self.config.protocol === 'telnet') {
			if (command === '1') {
				command = 'ON'
			} else if (command === '0') {
				command = 'OFF'
			}
			self.addTelnetCommand(`!OutletSet=${outlet},${command}`)
		} else {
			let path = ''
	
			if (isModel800vps) {
				if (command === '1') {
					path = `/outlet/on?o=${outlet}`
				} else if (command === '0') {
					path = `/outlet/off?o=${outlet}`
				} else if (command === '3') {
					path = `/outlet/reset?o=${outlet}`
				}
				// Unsupported commands ignored
			} else {
				path = `/control.cgi?outlet=${outlet}&command=${command}`
			}
	
			if (self.config.verbose) {
				self.log('debug', 'Control Outlet Path: ' + path)
			}
	
			if (path !== '') {
				self.sendHTTPCommand(path)
			}
		}
	},

	buildOutletChoices: function () {
		let self = this

		let outlets = 12

		if (self.config.model === 'other') {
			outlets = self.config.outlets
		} else {
			let model = self.MODELS.find((model) => model.id === self.config.model)

			if (model) {
				outlets = model.outlets
			}
		}

		self.outletChoices = []
		self.outletChoicesFeedbacks = []

		self.outletChoices.push({ id: '0', label: 'All' })

		console.log('outlets: ' + outlets)

		for (let i = 0; i < outlets; i++) {
			self.outletChoices.push({ id: i + 1 + '', label: `Outlet ${i + 1}` })
			self.outletChoicesFeedbacks.push({ id: i, label: `Outlet ${i + 1}` })
			self.DEVICE_DATA.outletInfo.push({ name: '', state: 0 })
		}
	},

	setupInterval() {
		let self = this

		self.stopInterval()

		if (self.config.polling) {
			self.POLLING_INTERVAL = setInterval(self.getInformation.bind(this), self.config.interval)
		}
	},

	stopInterval() {
		let self = this

		if (self.POLLING_INTERVAL !== null) {
			clearInterval(self.POLLING_INTERVAL)
			self.POLLING_INTERVAL = null
		}
	},
}
