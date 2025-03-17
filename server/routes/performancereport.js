const _performancereport = require("../controllers").performancereport;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/performancereport";

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
	app.post(_rootAPIPath + '/save', arrValidate, _performancereport.save);

	arrValidate = [];
	arrValidate = [
		check('limit', 'Parameter limit can not be empty and must be integer').not().isEmpty().isInt(),
		check('offset', 'Parameter offset can not be empty and must be integer').not().isEmpty().isInt()
	];
	app.get(_rootAPIPath + '/list', arrValidate, _performancereport.list);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.get(_rootAPIPath + '/detail/:id', arrValidate, _performancereport.getById);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/submit', arrValidate, _performancereport.submit);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/cancel', arrValidate, _performancereport.cancel);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/set_to_draft', arrValidate, _performancereport.setToDraft);
	
	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.delete(_rootAPIPath + "/delete/:id", arrValidate, _performancereport.deleteReport);
};
