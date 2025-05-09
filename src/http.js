const { InstanceStatus } = require('@companion-module/base')

const xml2js = require('xml2js')
const crypto = require('crypto')
const parseXml = xml2js.parseString

const net = require('net')

const cheerio = require('cheerio')

function parseWattboxHtml(html) {
	const deviceInfo = {}
	const outlets = []

	try {
		const $ = cheerio.load(html)

		// Extract system info
		const serviceTag = $('li:contains("SERVICE TAG") span').first().text().trim()
		const model = $('li:contains("MODEL") span').first().text().trim()
		const firmware = $('li:contains("FIRMWARE VERSION") span').first().text().trim()
		const hostname = $('li:contains("SYSTEM NAME") span').first().text().trim()

		deviceInfo.serialNumber = serviceTag
		deviceInfo.model = model
		deviceInfo.hardwareVersion = firmware
		deviceInfo.hostName = hostname

		//outlet info
		$('.grid-block').each((i, el) => {
			const number = $(el).find('.grid-index-label span').first().text().trim()
			const name = $(el).find('.grid-head').first().text().trim()
			const stateImg = $(el).find('.grid-index-label img').attr('src') || ''
			const watts = $(el).find('div[style*="width:50%"]:first-child p').text().trim()
			const amps = $(el).find('div[style*="width:50%"]:last-child p').text().trim()

			const state = stateImg.includes('_on') ? 1 : 0

			if (number) {
				outlets.push({
					id: parseInt(number),
					name,
					state,
					watts,
					amps,
				})
			}
		})
	} catch (error) {
	} finally {
		console.log('Parsed Wattbox HTML:', outlets)
		return {
			deviceInfo,
			outletInfo: outlets,
		}
	}
}

function parseHeaders(rawHeaders) {
	console.log('Parsing Headers')
	console.log(rawHeaders)

	const headers = {}
	const lines = rawHeaders.split('\r\n')
	for (let line of lines) {
		const index = line.indexOf(':')
		if (index > -1) {
			const key = line.slice(0, index).trim()
			const value = line.slice(index + 1).trim()
			headers[key.toLowerCase()] = value
		}
	}
	return headers
}

function generateDigestAuthHeader({
	username,
	password,
	method,
	uri,
	realm,
	nonce,
	opaque,
	qop = 'auth',
	nc = '00000001',
	cnonce,
}) {
	const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex')
	const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex')
	const response = crypto.createHash('md5').update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`).digest('hex')

	return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}", opaque="${opaque}"`
}

module.exports = {
	sendHTTPCommand: function (path) {
		let self = this
		const method = 'GET'

		const tryRequest = (authHeader) => {
			const client = net.createConnection({ host: self.config.ip, port: 80 }, () => {
				client.write(`${method} ${path} HTTP/1.1\r\n`)
				client.write(`Host: ${self.config.ip}\r\n`)
				if (authHeader) client.write(`Authorization: ${authHeader}\r\n`)
				client.write('Connection: close\r\n')
				client.write('\r\n')
			})

			let rawData = ''

			client.on('data', (chunk) => {
				rawData += chunk.toString()
			})

			client.on('end', () => {
				const headersEndIndex = rawData.indexOf('\r\n\r\n')
				if (headersEndIndex !== -1) {
					const headersRaw = rawData.slice(0, headersEndIndex)
					const headers = parseHeaders(headersRaw)

					// Check for 404 Not Found
					if (headersRaw.includes('404 Not Found')) {
						self.log('debug', `404 Not Found: ${path}`)
						self.stopInterval()
						return
					}

					if (headers['www-authenticate']?.startsWith('Digest') && !self.USING_DIGEST_AUTH) {
						const realmMatch = headers['www-authenticate'].match(/realm="(.+?)"/)
						const nonceMatch = headers['www-authenticate'].match(/nonce="(.+?)"/)
						const opaqueMatch = headers['www-authenticate'].match(/opaque="(.+?)"/)

						if (realmMatch && nonceMatch) {
							const realm = realmMatch[1]
							const nonce = nonceMatch[1]
							const opaque = opaqueMatch ? opaqueMatch[1] : ''
							const cnonce = crypto.randomBytes(8).toString('hex')

							self.digest = { realm, nonce, opaque }
							self.USING_DIGEST_AUTH = true

							const digestHeader = generateDigestAuthHeader({
								username: self.config.username,
								password: self.config.password,
								method,
								uri: path,
								realm,
								nonce,
								opaque,
								cnonce,
							})

							self.sendHTTPCommandWithDigest(path, digestHeader)
							return
						}
					}

					const body = rawData.slice(headersEndIndex + 4)
					const firstIndex = body.indexOf('<')
					const cleanBody = body.slice(firstIndex)

					if (self.config.model === '800vps') {
						const outletData = parseWattboxHtml(cleanBody)
						self.DEVICE_DATA = outletData
						self.checkFeedbacks()
						self.checkVariables()
					} else {
						self.processHttpData(cleanBody)
					}
				}
			})

			client.on('error', (error) => {
				console.error('Socket Error:', error)
			})

			self.log('debug', `http://${self.config.ip}${path}`)
		}

		// Choose auth method based on global
		if (self.USING_DIGEST_AUTH && self.digest?.realm && self.digest?.nonce) {
			const cnonce = crypto.randomBytes(8).toString('hex')
			const digestHeader = generateDigestAuthHeader({
				username: self.config.username,
				password: self.config.password,
				method,
				uri: path,
				realm: self.digest.realm,
				nonce: self.digest.nonce,
				opaque: self.digest.opaque,
				cnonce,
			})
			tryRequest(digestHeader)
		} else {
			const authHeader = `Basic ${self.authKey}`
			tryRequest(authHeader)
		}
	},

	sendHTTPCommandWithDigest: function (path, digestHeader) {
		let self = this

		console.log('Sending Digest Auth')
		console.log(digestHeader)

		const client = net.createConnection({ host: self.config.ip, port: 80 }, () => {
			client.write(`GET ${path} HTTP/1.1\r\n`)
			client.write(`Host: ${self.config.ip}\r\n`)
			client.write(`Authorization: ${digestHeader}\r\n`)
			client.write('Connection: close\r\n')
			client.write('\r\n')
		})

		let rawData = ''

		client.on('data', (chunk) => {
			rawData += chunk.toString()
		})

		client.on('end', () => {
			const headersEndIndex = rawData.indexOf('\r\n\r\n')
			const body = rawData.slice(headersEndIndex + 4)
			const firstIndex = body.indexOf('<')
			const cleanBody = body.slice(firstIndex)
			console.log('processing digest response')
			self.processHttpData(cleanBody)
		})

		client.on('error', (error) => {
			console.error('Retry Socket Error:', error)
		})
	},

	processHttpData: function (data) {
		let self = this

		if (self.config.verbose) {
			//self.log('debug', 'Raw Data: ' + data)
		}

		try {
			parseXml(data, (err, result) => {
				console.log(JSON.stringify(result, null, 4))

				if (result && result?.request) {
					const data = result.request
					let names = data.outlet_name[0]
					let namesArray = names.split(',')

					let outletState = data.outlet_status[0]
					let outletStateArray = outletState.split(',')

					let info = {}

					info.deviceInfo = {
						hostName: data.host_name,
						hardwareVersion: data.hardware_version,
						serialNumber: data.serial_number,
						cloudStatus: data.cloud_status,
					}

					info.powerInfo = {
						voltage: data.voltage_value,
						current: data.current_value,
						power: data.power_value,
					}

					info.outletInfo = {}

					for (let i = 0; i < namesArray.length; i++) {
						info.outletInfo[i] = {
							name: namesArray[i],
							state: outletStateArray[i],
						}
					}

					self.DEVICE_DATA = info
					self.checkFeedbacks()
					self.checkVariables()
				}

				self.updateStatus(InstanceStatus.Ok)
			})
		} catch (error) {
			self.log('error', `Error parsing XML: ${error}`)
			self.updateStatus(InstanceStatus.Error, `Error parsing XML: ${error}`)
		}
	},
}
