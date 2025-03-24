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
    check(
      "clause_id",
      "Parameter clause_id can not be empty and must be integer"
    )
      .not()
      .isEmpty()
      .isInt(),

    // check("id")
    //   .optional()
    //   .notEmpty()
    //   .withMessage("Parameter id can not be empty"),
    // check("formtemplate_id")
    //   .optional()
    //   .notEmpty()
    //   .withMessage("Parameter formtemplate_id can not be empty"),
    check("act").custom((value, { req }) => {
      console.log("check id>>>", value);

      if (value == "add" && !req.body.formtemplate_id) {
        throw new Error("formtemplate_id is required.");
      }

      if (value == "update" && !req.body.id) {
        throw new Error("ID is required.");
      }
      return true;
    }),
    // check("formtemplate_id").custom((value, { req }) => {
    //   console.log("check formtemplate_id>>>", value);
    //   if (!value && !req.body.id) {
    //     throw new Error(
    //       "At least one field (id or formtemplate_id) is required."
    //     );
    //   }
    //   return true;
    // }),
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

  arrValidate = [];
  arrValidate = [
    check("act").not().isEmpty().withMessage("Parameter name can not be empty"),
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/item/generate",
    arrValidate,
    _formTemplateController.generateItem
  );
};
