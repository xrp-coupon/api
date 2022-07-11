const xrpl = require('xrpl')

module.exports = {
	async init() {
		global.xrpClient = new xrpl.Client(process.env.API_XRP)
		await global.xrpClient.connect()
		return global.xrpClient;
	},
}