const { exists } = require('../../utils/validate/index');
const errors = require('../../utils/error-handling/index');
const parseUtils = require('../../utils/parse-utils/index');
const generator = require('generate-password');
const ShopifyNodeApi = require('shopify-api-node');


module.exports = {
	post_discount: async ({ params }) => {
		const {
			shop,
			discount,
		} = params;

		if (exists(shop, discount)) {
			try {
				const shopQuery = parseUtils.query('Shop');
				shopQuery.equalTo('shop', shop);
				let shopInstance = await shopQuery.first({ useMasterKey: true });
				if (shopInstance) {
					const shopifyNodeInstance = shopifyInstance({
						shopName: shop,
						accessToken: shopInstance.get('accessToken'),
					});

					const getPriceRuleId = async ({ targetType, value }) => {
						const { id: priceRuleId } = await shopifyNodeInstance.priceRule.create({
							target_selection: "all",
							allocation_method: targetType === 'shipping_line' ? 'each' : 'across',
							customer_selection: 'all',
							starts_at: new Date().toISOString(),
							ends_at: new Date((d => d.setFullYear(d.getFullYear() + 1))(new Date)).toISOString(),
							once_per_customer: true,
							target_type: targetType === 'shipping_line'  ? 'shipping_line' : 'line_item',
							title: new Date().toGMTString() + ' - ' + 'XRP',
							value: targetType === 'shipping_line' ? '-100' : `-${value}`,
							value_type: targetType === 'shipping_line' ? 'percentage' : targetType,
						});
						return priceRuleId;
					}
					const { targetType, value } = discount;

					const { priceRuleId = await getPriceRuleId({ targetType, value }) } = discount;
					
					if (targetType === 'percentage') {
						const parsedDiscountValue = parseFloat(value, 10);
						if (parsedDiscountValue > 100 || parsedDiscountValue <= 0) {
							throw 400;
						}
					} else if (targetType === 'fixed_amount') {
						const parsedDiscountValue = parseFloat(value, 10);
						if (parsedDiscountValue <= 0) {
							throw 400;
						}
					}
					
					if (priceRuleId) {
						const discountInstance = parseUtils.instance('Discount');
						discountInstance.set('priceRuleId', priceRuleId);
						discountInstance.set('targetType', targetType);
						discountInstance.set('discountValue', value);

						const code = generator.generate({
							symbols: false,
							uppercase: false,
							numbers: false,
							lowercase: true,
							excludeSimilarCharacters: true,
							length: 6,
							strict: true,
						});
						
						const discountCodeInstance = await shopifyNodeInstance.discountCode.create(priceRuleId, {
							code,
						});
						return discountCodeInstance
					} else {
						const { code, message } = errors.constructErrorObject(400);
						throw new Parse.Error(code, message);
					}				

				} else {
					const { code, message } = errors.constructErrorObject(400);
					throw new Parse.Error(code, message);
				}

			} catch (e) {
				const { code, message } = errors.constructErrorObject(e.code || e.statusCode || 500, e);
				throw new Parse.Error(code, message);
			}
		} else {
			const { code, message } = errors.constructErrorObject(400);
			throw new Parse.Error(code, message);
		}
	},

}