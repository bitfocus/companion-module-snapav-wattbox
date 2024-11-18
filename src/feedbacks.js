const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		const feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorGreen = combineRgb(0, 255, 0) // Green
		const backgroundColorRed = combineRgb(255, 0, 0) //Red

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
					default: 1,
					choices: this.outletChoicesFeedbacks,
				},
			],
			callback: (feedback) => {
				let opt = feedback.options

				let outlet = parseInt(opt.outlet)

				if (this.DEVICE_DATA.outletInfo[outlet].state == 1) {
					return true
				} else return false
			},
		}

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
					choices: this.outletChoicesFeedbacks,
				},
			],
			callback: (feedback) => {
				let opt = feedback.options

				let outlet = parseInt(opt.outlet)

				if (this.DEVICE_DATA.outletInfo[outlet].state == 0) {
					return true
				} else return false
			},
		}

		this.setFeedbackDefinitions(feedbacks)
	},
}
