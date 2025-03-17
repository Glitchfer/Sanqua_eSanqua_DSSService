const _initialReport = require("../controllers").initialreport;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/initialreport";

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
		check('act').not().isEmpty().withMessage('Parameter action can not be empty'),
		check('company_id', 'Parameter company_id can not be empty and must be integer').not().isEmpty().isInt(),
		check('company_name').not().isEmpty().withMessage('Parameter company_name can not be empty'),
		check('incident_date_time').not().isEmpty().withMessage('Parameter incident_date can not be empty'),
		check('incident_location').not().isEmpty().withMessage('Parameter incident_location can not be empty'),
		check('chronology').not().isEmpty().withMessage('Parameter chronology can not be empty')
	];
	app.post(_rootAPIPath + '/save', arrValidate, _initialReport.save);

	arrValidate = [];
	arrValidate = [
		check('limit', 'Parameter limit can not be empty and must be integer').not().isEmpty().isInt(),
		check('offset', 'Parameter offset can not be empty and must be integer').not().isEmpty().isInt()
	];
	app.get(_rootAPIPath + '/list', arrValidate, _initialReport.list);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.get(_rootAPIPath + '/detail/:id', arrValidate, _initialReport.getById);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/submit', arrValidate, _initialReport.submit);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/cancel', arrValidate, _initialReport.cancel);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/set_to_draft', arrValidate, _initialReport.setToDraft);
	
	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.delete(_rootAPIPath + "/delete/:id", arrValidate, _initialReport.deleteReport);
};
