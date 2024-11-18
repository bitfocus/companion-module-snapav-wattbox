const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'ip',
				label: 'IP',
				width: 12,
				regex: Regex.IP,
				default: '192.168.1.1',
				required: true,
			},
			{
				type: 'dropdown',
				label: 'Model',
				id: 'model',
				choices: this.MODELS,
				default: '300',
			},
			{
				type: 'static-text',
				id: 'protocol-static',
				label: 'Protocol',
				width: 12,
				default: 'Telnet',
				isVisible: (config) => config.model === '250',
			},
			{
				type: 'dropdown',
				id: 'protocol',
				label: 'Protocol',
				width: 12,
				default: 'http',
				choices: [
					{ id: 'http', label: 'HTTP' },
					{ id: 'telnet', label: 'Telnet' },
				],
				isVisible: (config) => config.model === 'other',
			},
			{
				type: 'number',
				id: 'outlets',
				label: 'Number of outlets',
				default: 2,
				width: 12,
				isVisible: (config) => config.model === 'other',
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				width: 12,
				default: 'wattbox',
				required: true,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 12,
				default: 'wattbox',
				required: true,
			},
			{
				type: 'checkbox',
				id: 'polling',
				label: 'Enable Polling?',
				width: 6,
				default: false,
			},
			{
				type: 'number',
				id: 'interval',
				label: `Polling interval in milliseconds`,
				width: 12,
				min: 200,
				default: 500,
				required: true,
				isVisible: (config) => config.polling,
			},
		]
	},
}
