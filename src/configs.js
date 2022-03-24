module.exports = {
	config_fields() {
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module allows you to control the AVSnap WattBox with Companion.',
			},
			{
				type: 'textinput',
				id: 'ip',
				label: 'IP',
				width: 12,
				regex: this.REGEX_IP,
				default: '192.168.1.1',
				required: true,
			},
			{
				type: 'dropdown',
				label: 'Model',
				id: 'model',
				choices: [
					{ id: '300', label: 'WB-300-IP-3' },
					{ id: '700', label: 'WB-700-IPV-12' },
				],
				default: '300',
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
				regex: this.REGEX_PASSWORD,
				default: 'wattbox',
				required: true,
			},
		];
	},
};
