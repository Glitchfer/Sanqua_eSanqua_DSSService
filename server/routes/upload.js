const _uploadController = require("../controllers").upload;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/upload";

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
    check("id").not().isEmpty().withMessage("Parameter id cannot be empty"),
  ];
  app.post(
    _rootAPIPath + "/k3/update_file_upload",
    arrValidate,
    _uploadController.k3FileUpload
  );
};
