const _damagedObject = require("../controllers").damagedobject;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/inspectionreport/damagedobject";

module.exports = (app) => {
	app.get(_rootAPIPath, (req, res) =>
		res.status(200).send({
			message: 'Welcome to the Todos API!'
		})
	);

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
		res.header(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept, x-method, x-token, x-application-id'
		);
		next();
	});

	var arrValidate = [];

	arrValidate = [];
	arrValidate = [
		check('act').not().isEmpty().withMessage('Parameter action can not be empty')
	];
	app.post(_rootAPIPath + '/save', arrValidate, _damagedObject.save);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.delete(_rootAPIPath + "/delete/:id", arrValidate, _damagedObject.deleteItem);

};
