import { combineRgb } from '@companion-module/base';

export function getPresets() {
	let presets = {};

	const ColorWhite = combineRgb(255, 255, 255);
	const ColorBlack = combineRgb(0, 0, 0);
	const ColorRed = combineRgb(200, 0, 0);
	const ColorGreen = combineRgb(0, 200, 0);

	let outlets;

	if (this.config.model == 300) {
		outlets = 3
	} else if(this.config.model == 700) {
		outlets = 12
	}

	for (let i = 0; i < outlets; i++) {
		presets[`outlet${i + 1}On`] = {
			type: 'button',
			category: 'Power',
			name: 'Outlet On',
			style: {
				style: 'text',
				text: `Outlet ${i + 1} On`,
				size: '14',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								powerState: '1',
								outlet: `${i + 1}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'outletOn',
					options: {
						outlet: `${i}`,
					},
					style: {
						color: ColorBlack,
						bgcolor: ColorGreen,
					},
				}
			],
		};
		presets[`outlet${i + 1}Off`] = {
			type: 'button',
			category: 'Power',
			name: 'Outlet Off',
			style: {
				style: 'text',
				text: `Outlet ${i + 1} Off`,
				size: '14',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'power',
							options: {
								powerState: '0',
								outlet: `${i + 1}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'outletOff',
					options: {
						outlet: `${i}`
					},
					style: {
						color: ColorBlack,
						bgcolor: ColorRed
					}
				}
			],
		};
	}
	return presets;
}
