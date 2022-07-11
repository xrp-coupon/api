const { exists } = require('../../utils/validate/index');
const errors = require('../../utils/error-handling/index');
const parseUtils = require('../../utils/parse-utils/index');

module.exports = {
  get_discount: async ({ params, user }) => {
    const { discount } = params;
    if(exists(discount)) {
      try {
        const discountQuery = parseUtils.query('Discount');
        discountQuery.equalTo('objectId', discount);
        const discountInstance = await discountQuery.first(parseUtils.sessTok(user));
        return discountInstance && discountInstance.toJSON();
      } catch (e) {
		throw e;
      }
    } else {
        const { code, message } = errors.constructErrorObject(400);
        throw new Parse.Error(code, message);
    }
  },
}