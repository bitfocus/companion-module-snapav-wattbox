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

	// Outlet configuration lives behind property.cgi. Its form fields are named with a literal
	// leading "$" -- the web UI renders <input name="$outlet1_name"> -- which url encodes to
	// %24outlet1_name on the wire. Sending the name without the "$" is accepted with a 200 and
	// then silently ignored, so this prefix is load bearing.
	propertyFieldPrefix: function () {
		return '$'
	},

	setOutletName: function (outlet, name) {
		let self = this

		if (self.config.protocol !== 'http') {
			self.log('warn', 'Renaming an outlet requires the HTTP protocol.')
			return
		}

		// The device stores the name verbatim, so a comma would corrupt the comma separated
		// outlet_name list it reports back in status.
		const clean = String(name ?? '').replace(/,/g, ' ')

		if (clean !== String(name ?? '')) {
			self.log('warn', 'Commas are not allowed in outlet names and were replaced with spaces.')
		}

		const field = encodeURIComponent(`${self.propertyFieldPrefix()}outlet${outlet}_name`)
		const body = `${field}=${encodeURIComponent(clean)}`

		self.sendSessionPost('/property.cgi', body, `Rename outlet ${outlet} to "${clean}"`)
	},

	setOutletMode: function (outlet, mode) {
		let self = this

		if (self.config.protocol !== 'http') {
			self.log('warn', 'Setting outlet mode requires the HTTP protocol.')
			return
		}

		const field = encodeURIComponent(`${self.propertyFieldPrefix()}outlet${outlet}_method`)
		const body = `${field}=${encodeURIComponent(mode)}`

		const label = mode === '2' ? 'Reset Only' : 'Normal'

		self.sendSessionPost('/property.cgi', body, `Set outlet ${outlet} mode to ${label}`)
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

	// A WattBox's embedded web server is single threaded. Poll it faster than it can answer and it
	// starts returning empty or partial documents, so an occasional bad response is expected rather
	// than exceptional. Tolerate a few, then back off; never stop polling, because a connection that
	// gives up can only be revived by disabling and re-enabling it by hand.
	pollFailed: function (reason) {
		let self = this

		self.POLL_FAILURES = (self.POLL_FAILURES ?? 0) + 1

		if (self.config.verbose) {
			self.log('debug', `Poll failed (${self.POLL_FAILURES}): ${reason}`)
		}

		if (self.POLL_FAILURES < self.POLL_FAILURE_TOLERANCE) {
			return
		}

		if (self.CONNECTED !== false) {
			self.CONNECTED = false
			self.log('warn', `No usable status from the WattBox: ${reason}. Slowing down and retrying.`)
			self.updateStatus(InstanceStatus.ConnectionFailure, reason)
		}

		self.applyPollBackoff()
	},

	pollSucceeded: function () {
		let self = this

		const wasFailing = self.POLL_FAILURES >= self.POLL_FAILURE_TOLERANCE

		self.POLL_FAILURES = 0

		if (self.CONNECTED !== true) {
			self.CONNECTED = true
			self.updateStatus(InstanceStatus.Ok)
		}

		// Restore the configured rate once the device is answering again.
		if (wasFailing && self.POLL_BACKOFF !== null) {
			self.POLL_BACKOFF = null
			self.log('info', 'WattBox is responding again, returning to the configured polling interval.')
			self.setupInterval()
		}
	},

	// Double the interval on repeated failure up to a ceiling, so a device that is wedged or offline
	// is retried gently instead of being hammered while it recovers.
	applyPollBackoff: function () {
		let self = this

		if (!self.config.polling) {
			return
		}

		const base = Number(self.config.interval) || 5000
		const next = self.POLL_BACKOFF === null || self.POLL_BACKOFF === undefined ? base * 2 : self.POLL_BACKOFF * 2
		const capped = Math.min(next, self.POLL_BACKOFF_MAX)

		if (capped === self.POLL_BACKOFF) {
			return
		}

		self.POLL_BACKOFF = capped

		if (self.config.verbose) {
			self.log('debug', `Backing off polling to ${capped}ms`)
		}

		self.stopInterval()
		self.POLLING_INTERVAL = setInterval(self.getInformation.bind(self), capped)
	},
}
