const _formTemplateController = require("../controllers").formtemplate;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/formtemplate";

module.exports = (app) => {
  app.get(_rootAPIPath, (req, res) =>
    res.status(200).send({
      message: "Welcome to the Todos API!",
    })
  );

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-method, x-token, x-application-id"
    );
    next();
  });

  var arrValidate = [];

  arrValidate = [];
  arrValidate = [
    check("act").not().isEmpty().withMessage("Parameter name can not be empty"),
    check("name")
      .not()
      .isEmpty()
      .withMessage("Parameter name can not be empty"),
    check(
      "company_id",
      "Parameter company_id can not be empty and must be integer"
    )
      .not()
      .isEmpty()
      .isInt(),
    check("company_name")
      .not()
      .isEmpty()
      .withMessage("Parameter company_name can not be empty"),
    check(
      "audit_type_id",
      "Parameter audit_type_id can not be empty and must be integer"
    )
      .not()
      .isEmpty()
      .isInt(),
  ];
  app.post(_rootAPIPath + "/save", arrValidate, _formTemplateController.save);

  arrValidate = [];
  arrValidate = [
    check("limit", "Parameter limit can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
    check("offset", "Parameter offset can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
  ];
  app.get(_rootAPIPath + "/list", arrValidate, _formTemplateController.list);
  arrValidate = [];
  app.get(
    _rootAPIPath + "/dropdown",
    arrValidate,
    _formTemplateController.dropdown
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.get(
    _rootAPIPath + "/detail/:id",
    arrValidate,
    _formTemplateController.getById
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.delete(
    _rootAPIPath + "/delete/:id",
    arrValidate,
    _formTemplateController.deletePermanent
  );

  arrValidate = [];
  arrValidate = [
    check("limit", "Parameter limit can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
    check("offset", "Parameter offset can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
  ];
  app.get(
    _rootAPIPath + "/item/list",
    arrValidate,
    _formTemplateController.listItem
  );

  arrValidate = [];
  arrValidate = [
    check("act").not().isEmpty().withMessage("Parameter name can not be empty"),
    check("form_template_id", "Parameter template_id can not be empty")
      .not()
      .isEmpty(),
    check(
      "clause_id",
      "Parameter clause_id can not be empty and must be integer"
    )
      .not()
      .isEmpty()
      .isInt(),
  ];
  app.post(
    _rootAPIPath + "/item/save",
    arrValidate,
    _formTemplateController.saveItem
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.delete(
    _rootAPIPath + "/item/delete/:id",
    arrValidate,
    _formTemplateController.deleteItem
  );
};
