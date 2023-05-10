import { Regex } from "@companion-module/base";

export function getConfigFields() {
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
			regex: Regex.Password,
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
			label: `Polling interval in milliseconds (default: 5, min: 2)`,
			width: 12,
			min: 2,
			default: 5,
			required: true,
		},
	];
}
