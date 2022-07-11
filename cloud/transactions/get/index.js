const errors = require("../../utils/error-handling/index");
const parseUtils = require("../../utils/parse-utils/index");
const { exists } = require('../../utils/validate');
const shopifyInstance = require('../../utils/shopify-instance')
const xrpl = require('xrpl');

module.exports = {
	get_transactions: async ({ params, user }) => {
		const {
			account, shop
		} = params;
		if (exists(account, shop)) {
			try {
				const shopQuery = parseUtils.query('Shop');
				shopQuery.equalTo('shop', shop);
				let shopInstance = await shopQuery.first({ useMasterKey: true });
				if (shopInstance) { // only authenticated shops can search
					// Todo
					// Use global.xrpClient to fetch transaction of type Payment
					// for the merchant account passed.
					
					
				} else {
					const { code, message } = errors.constructErrorObject(400);
					throw new Parse.Error(code, message);
				}
			} catch (e) {
				throw e;
			}
		} else {
			const { code, message } = errors.constructErrorObject(400);
			throw new Parse.Error(code, message);
		}
	},
	initRoutes(req, res) {
		Parse.Cloud.define("get_products", async (req) => {
			try {
				const data = await this.get_products(req);
				return { data };
			} catch (e) {
				throw e;
			}
		});
	},
};
