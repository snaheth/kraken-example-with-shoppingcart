var Dispatcher = require('./dispatcher');
var Constants = require('./constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _model = {products: [], cart: {}};
var $ = require('jquery');

function createProduct(productObject, callback) {
	$.ajax({
		url: '/products',
		type: 'POST',
		dataType: 'json',
		data: productObject,
		cache: false,
		success: function (data) {
			console.log('data', data);
			_model.products = data.products;
			callback();
		},
		error: function (xhr, status, err) {
			console.error(err.toString());
		}
	});
}
function deleteProduct(productObject, callback) {
	$.ajax({
		url: '/products',
		type: 'POST',
		dataType: 'json',
		data: productObject,
		cache: false,
		success: function (data) {
			console.log('data', data);
			_model.products = data.products;
			callback();
		},
		error: function (xhr, status, err) {
			console.error(err.toString());
		}
	});
}

function addToCart(productObject, callback) {
	$.ajax({
		url: '/cart',
		type: 'POST',
		dataType: 'json',
		data: productObject,
		cache: false,
		success: function (data) {
			_model.cart = data.cart;
			callback();
		},
		error: function (xhr, status, err) {
			console.error(err.toString());
		}
	});
}

function initiatePayment(payInfoObject, callback) {
	$.ajax({
		url: '/pay',
		type: 'POST',
		dataType: 'json',
		data: payInfoObject,
		cache: false,
		success: function (data) {
			_model.cart = data.cart;
			callback();

		},
		error: function (xhr, status, err) {
			console.error(err.toString());
		}
	});
}
var Store = assign({}, EventEmitter.prototype, {
	getModel: function () {
		return _model;
	},
	setModel: function (model) {
		_model = model;
	},
	emitter: function (evt, payload) {
		payload = payload || {};
		this.emit(evt, payload);
	},
	/**
	 * @param {function} callback
	 */
	addListener: function (evt, callback) {
		this.on(evt, callback);
	},

	/**
	 * @param {function} callback
	 */
	subtractListener: function (evt, callback) {
		this.removeListener(evt, callback);
	}
});

// Register callback to handle all updates
Dispatcher.register(function (action) {
	var text;

	switch (action.actionType) {
		case Constants.PRODUCT_CREATE:
			createProduct(action.product, function () {
				Store.emitter('productChange');
			});
			break;
		case Constants.PRODUCT_DELETE:
			deleteProduct(action.product, function () {
				Store.emitter('productChange');
			});
			break;
		case Constants.CART_ADD:
			addToCart(action.product, function () {
				Store.emitter('cartChange');
			});
			break;
		case Constants.PAYMENT_INITIATE:
		  	Store.emitter('paymentInit');
			initiatePayment(action.payInfo, function () {
				Store.emitter('paymentComplete');
				Store.emitter('cartChange');
			});
			break;
		default:
		// no op
	}
});

module.exports = Store;