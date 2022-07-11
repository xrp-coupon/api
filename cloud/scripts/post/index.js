const errors = require("../../utils/error-handling/index");
const parseUtils = require("../../utils/parse-utils/index");
const { exists } = require('../../utils/validate');
const shopifyInstance = require('../../utils/shopify-instance')

module.exports = {
	post_scripts: async ({ params, user }) => {
		const {
			shop
		} = params;
		if (exists(shop)) {
			try {
				const shopQuery = parseUtils.query('Shop');
				shopQuery.equalTo('shop', shop);
				let shopInstance = await shopQuery.first({ useMasterKey: true });
				if (shopInstance) {
					const shopifyNodeInstance = shopifyInstance({
						shopName: shop,
						accessToken: shopInstance.get('accessToken'),
					});
					const existingShopifyScriptTags = await shopifyNodeInstance.scriptTag.list();
					await Promise.all(existingShopifyScriptTags.map(async tag => await shopifyNodeInstance.scriptTag.delete(tag.id)))
					const scriptInstance = await shopifyNodeInstance.scriptTag.create({
						event: "onload",
						src: `${process.env.API_SHOPLOOKS_WIDGET_URL}` // dont add ?shop query param here as Shopify will add by default
					});
					return scriptInstance;
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
		Parse.Cloud.define("post_scripts", async (req) => {
			try {
				const data = await this.post_scripts(req);
				return { data };
			} catch (e) {
				throw e;
			}
		});
	},
};
