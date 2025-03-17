// Services
const Service = require("../services/damagedobjectservice.js");
const _serviceInstance = new Service();

// OAuth Service
const OAuthService = require("../services/oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

// Validation
const { check, validationResult } = require("express-validator");

module.exports = {
  save,
  deleteItem
};

async function save(req, res) {
  var xJoResult;
  var xOAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"],
    req.headers["x-device"]
  );

  if (xOAuthResult.status_code == "00") {
    if (xOAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        xJoResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.body.logged_company_id =
          xOAuthResult.token_data.result_verify.employee_info.company == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.company.id;
        req.body.logged_company_name =
          xOAuthResult.token_data.result_verify.employee_info.company == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.company.name;
        req.body.logged_employee_id =
          xOAuthResult.token_data.result_verify.employee_info == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.id;
        req.body.logged_employee_name =
          xOAuthResult.token_data.result_verify.employee_info == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.name;
        req.body.logged_department_id =
          xOAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.department.id;
        req.body.logged_department_name =
          xOAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.department
                .name;
        req.body.logged_level_id =
          xOAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.level.id;
        req.body.logged_level_name =
          xOAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.level.name;
        req.body.logged_user_id =
          xOAuthResult.token_data.result_verify == null
            ? null
            : xOAuthResult.token_data.result_verify.id;
        req.body.logged_user_name =
          xOAuthResult.token_data.result_verify == null
            ? null
            : xOAuthResult.token_data.result_verify.name;
        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        xJoResult = await _serviceInstance.save(req.body);
        xJoResult = JSON.stringify(xJoResult);
      }
    } else {
      xJoResult = JSON.stringify(xOAuthResult);
    }
  } else {
    xJoResult = JSON.stringify(xOAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(xJoResult);
}

async function deleteItem(req, res) {
  var xJoResult;
  var xOAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"],
    req.headers["x-device"]
  );

  if (xOAuthResult.status_code == "00") {
    if (xOAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        xJoResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.body.logged_company_id =
          xOAuthResult.token_data.result_verify.employee_info.company.id;
        req.body.logged_company_name =
          xOAuthResult.token_data.result_verify.employee_info.company.name;
        req.body.logged_employee_id =
          xOAuthResult.token_data.result_verify.employee_info == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.id;
        req.body.logged_employee_name =
          xOAuthResult.token_data.result_verify.employee_info == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.name;
        req.body.logged_department_id =
          xOAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.department.id;
        req.body.logged_department_name =
          xOAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.department
                .name;
        req.body.logged_level_id =
          xOAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.level.id;
        req.body.logged_level_name =
          xOAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.level.name;
        req.body.logged_user_id =
          xOAuthResult.token_data.result_verify == null
            ? null
            : xOAuthResult.token_data.result_verify.id;
        req.body.logged_user_name =
          xOAuthResult.token_data.result_verify == null
            ? null
            : xOAuthResult.token_data.result_verify.name;
        req.body.logged_user_level = 
          xOAuthResult.token_data.result_verify == null
            ? null
            : xOAuthResult.token_data.result_verify.user_level; 
        req.body.id = req.params.id;

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _serviceInstance.delete(req.body);
        xJoResult = JSON.stringify(xJoResult);
      }
    } else {
      xJoResult = JSON.stringify(xOAuthResult);
    }
  } else {
    xJoResult = JSON.stringify(xOAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(xJoResult);
}