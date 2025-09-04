'use strict';

module.exports.createSuccess = (message, data = undefined) => ({ success: true, message, data });
module.exports.createError = (message, error = undefined) => ({ success: false, message, error });
