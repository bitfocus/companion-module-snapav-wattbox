import { combineRgb } from '@companion-module/base';

export function getFeedbacks() {
	const feedbacks = {};

	const foregroundColor = combineRgb(255, 255, 255); // White
	const backgroundColorYellow = combineRgb(255, 255, 0); // Yellow
	const backgroundColorGreen = combineRgb(0, 255, 0); // Green
	const backgroundColorRed = combineRgb(255, 0, 0); //Red

	let outlets;

	if(this.config.model == 300) {
		outlets = 3
	} else if(this.config.model == 700) {
		outlets = 12
	}

	let outletChoices = []

	for(let i = 0; i < outlets; i++) {
		outletChoices.push({id: i, label: `Outlet ${i +1}`})
	}

	feedbacks.outletOn = {
		type: 'boolean',
		name: 'Outlet On',
		description: 'Indicate if an outlet is on',
		defaultStyle: {
			color: foregroundColor,
			bgcolor: backgroundColorGreen,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Outlet',
				id: 'outlet',
				default: '1',
				choices: outletChoices
			}
		],
		callback: (feedback) => {
			let opt = feedback.options;

			if(this.DEVICE_DATA.outletInfo[opt.outlet].state == 1) {
				return true;
			} else return false;
		},
	};

	feedbacks.outletOff = {
		type: 'boolean',
		name: 'Outlet Off',
		description: 'Indicate if an outlet is off',
		defaultStyle: {
			color: foregroundColor,
			bgcolor: backgroundColorRed,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Outlet',
				id: 'outlet',
				default: '1',
				choices: outletChoices
			}
		],
		callback: (feedback) => {
			let opt = feedback.options;

			if(this.DEVICE_DATA.outletInfo[opt.outlet].state == 0) {
				return true;
			} else return false;
		},
	};

	return feedbacks;
}
