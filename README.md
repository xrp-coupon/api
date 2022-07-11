# Add XRP to Node Globals for one time init and access
Code (https://github.com/xrp-coupon/widget/tree/main/src/store/xrp)

```

   
const xrpl = require('xrpl')

module.exports = {
	async init() {
		global.xrpClient = new xrpl.Client(process.env.API_XRP)
		await global.xrpClient.connect()
		return global.xrpClient;
	},
}
```

# Use global to read data from XRP (TODO)
```
https://github.com/xrp-coupon/api/blob/main/cloud/transactions/get/index.js

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
```
# How to deploy
1. Run build and in the build index.html add the <!--__SHELL_HTML_CONTENT__--> afer body
2. copy the build folder from your client react app (CRA) and paste in the public directory.
3. Move the index.html from the public directoy to the root directory of the app
