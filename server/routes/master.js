const masterController = require("../controllers").master;

const { check, validationResult } = require("express-validator");
var rootAPIPath = "/api/esanqua/dss/v1/master";

module.exports = (app) => {
  app.get(rootAPIPath, (req, res) =>
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
    // check('limit', 'Parameter limit can not be empty and must be integer').not().isEmpty().isInt(),
    check("offset", "Parameter offset can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
  ];
  app.get(
    rootAPIPath + "/:app/:model/list",
    arrValidate,
    masterController.master_List
  );

  arrValidate = [];
  app.get(
    rootAPIPath + "/:app/:model/detail/:id",
    arrValidate,
    masterController.master_Detail
  );

  arrValidate = [];
  app.get(
    rootAPIPath + "/:app/:model/dropdown",
    arrValidate,
    masterController.master_Dropdown
  );

  arrValidate = [];
  arrValidate = [
    check("name")
      .optional()
      .notEmpty()
      .withMessage("Parameter name can not be empty"),
    check("description")
      .optional()
      .notEmpty()
      .withMessage("Parameter description can not be empty"),
    check("name").custom((value, { req }) => {
      if (!value && !req.body.description) {
        throw new Error(
          "At least one field (name or description) is required."
        );
      }
      return true;
    }),
    check("description").custom((value, { req }) => {
      if (!value && !req.body.name) {
        throw new Error(
          "At least one field (name or description) is required."
        );
      }
      return true;
    }),
  ];
  app.post(
    rootAPIPath + "/:app/:model/save",
    arrValidate,
    masterController.master_Save
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.delete(
    rootAPIPath + "/:app/:model/delete/:id",
    masterController.master_Delete
  );
  app.put(
    rootAPIPath + "/:app/:model/archive/:id",
    masterController.master_Archive
  );
  app.put(
    rootAPIPath + "/:app/:model/unarchive/:id",
    masterController.master_Unarchive
  );
};
