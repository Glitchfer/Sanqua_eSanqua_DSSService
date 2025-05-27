const _personInvolve = require("../controllers").personinvolve;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/initialreport/personinvolve";

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
		// check('initialreport_id').not().isEmpty().withMessage('Parameter ID can not be empty'),
		check("act").custom((value, { req }) => {
			if (value == "add" && !req.body.initialreport_id) {
				throw new Error("initialreport_id is required.");
			}

			if (value == "update" && !req.body.id) {
				throw new Error("ID is required.");
			}
			return true;
		})
	];
	app.post(_rootAPIPath + '/save', arrValidate, _personInvolve.save);

	arrValidate = [];
	arrValidate = [
		check('act').not().isEmpty().withMessage('Parameter action can not be empty'),
		check('initialreport_id').not().isEmpty().withMessage('Parameter ID can not be empty')
	];
	app.post(_rootAPIPath + '/save_batch', arrValidate, _personInvolve.save);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.delete(_rootAPIPath + "/delete/:id", arrValidate, _personInvolve.deletePerson);

};
