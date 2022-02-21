function getAuthKey(username, password) {
	let authString = username + ':' + password;
	let authBase64 = Buffer.from(authString).toString('base64');
	return authBase64;
}

module.exports = {
	getAuthKey,
};
