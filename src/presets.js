const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this

		let presets = {}

		const ColorWhite = combineRgb(255, 255, 255)
		const ColorBlack = combineRgb(0, 0, 0)
		const ColorRed = combineRgb(200, 0, 0)
		const ColorGreen = combineRgb(0, 200, 0)

		let outlets = 12

		if (self.config.model === 'other') {
			outlets = self.config.outlets
		} else {
			let model = self.MODELS.find((model) => model.id === self.config.model)

			if (model) {
				outlets = model.outlets
			}
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
					},
				],
			}
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
							outlet: `${i}`,
						},
						style: {
							color: ColorBlack,
							bgcolor: ColorRed,
						},
					},
				],
			}
		}

		this.setPresetDefinitions(presets)
	},
}
