const _inspection = require("../controllers").inspection;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/inspectionreport";

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
		check("id")
		.optional()
		.notEmpty()
		.withMessage("Parameter id can not be empty"),
	  check("initialreport_id")
		.optional()
		.notEmpty()
		.withMessage("Parameter initialreport_id can not be empty"),
	  check("id").custom((value, { req }) => {
		if (!value && !req.body.initialreport_id) {
		  throw new Error(
			"At least one field (id or initialreport_id) is required."
		  );
		}
		return true;
	  }),
	  check("initialreport_id").custom((value, { req }) => {
		if (!value && !req.body.id) {
		  throw new Error(
			"At least one field (id or initialreport_id) is required."
		  );
		}
		return true;
	  }),
	];
	app.post(_rootAPIPath + '/save', arrValidate, _inspection.save);

	arrValidate = [];
	arrValidate = [
		check('limit', 'Parameter limit can not be empty and must be integer').not().isEmpty().isInt(),
		check('offset', 'Parameter offset can not be empty and must be integer').not().isEmpty().isInt()
	];
	app.get(_rootAPIPath + '/list', arrValidate, _inspection.list);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.get(_rootAPIPath + '/detail/:id', arrValidate, _inspection.getById);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/submit', arrValidate, _inspection.submit);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/cancel', arrValidate, _inspection.cancel);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.post(_rootAPIPath + '/set_to_draft', arrValidate, _inspection.setToDraft);
	
	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.delete(_rootAPIPath + "/delete/:id", arrValidate, _inspection.deleteReport);
	
	arrValidate = [];
	arrValidate = [ check('document_id').not().isEmpty().withMessage('Parameter document_id can not be empty') ];
	app.post(_rootAPIPath + "/approve", arrValidate, _inspection.approve);

	arrValidate = [];
	arrValidate = [ check('document_id').not().isEmpty().withMessage('Parameter document_id can not be empty') ];
	app.post(_rootAPIPath + "/reject", arrValidate, _inspection.reject);

};
