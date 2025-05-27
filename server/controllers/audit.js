// Services
const Service = require("../services/auditservice.js");
const _serviceInstance = new Service();
const ItemService = require("../services/audititemscoreservice.js");
const _itemServiceInstance = new ItemService();
const MemberService = require("../services/auditmemberservice.js");
const _memberServiceInstance = new MemberService();
const DiscoveryItemService = require("../services/discoveryitemservice.js");
const _discoveryitemInstance = new DiscoveryItemService();

// OAuth Service
const OAuthService = require("../services/oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

// Validation
const { check, validationResult } = require("express-validator");

module.exports = {
  save,
  list,
  getById,
  submit,
  cancel,
  setToDraft,
  approve,
  reject,
  done,
  generateFormAudit,
  fetchMatrix,

  itemList,
  itemDetail,
  itemSave,
  itemSubmit,
  itemCancel,
  itemSetDraft,
  itemSetUnused,
  itemVerify,
  itemDelete,
  itemUpdateFileUpload,

  memberSave,
  memberDelete,

  discoveryitemList,
  discoveryitemSave,
  discoveryitemDelete,
  discoveryitemFileUpload,
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
        req.body.logged_user_level =
          xOAuthResult.token_data.result_verify.user_level;
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

async function list(req, res) {
  var joResult;
  var errors = null;

  var xOAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (xOAuthResult.status_code == "00") {
    if (xOAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        joResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.query.logged_employee_id =
          xOAuthResult.token_data.result_verify.employee_info.id;
        req.query.logged_user_level =
          xOAuthResult.token_data.result_verify.user_level;
        req.query.logged_user_id = xOAuthResult.token_data.result_verify.id;
        req.query.logged_user_name = xOAuthResult.token_data.result_verify.name;
        req.query.logged_department_id =
          xOAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.department.id;
        joResult = await _serviceInstance.list(req.query);
        // joResult.token_data = xOAuthResult.token_data;
        joResult = JSON.stringify(joResult);
      }
    } else {
      joResult = JSON.stringify(xOAuthResult);
    }
  } else {
    joResult = JSON.stringify(xOAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(joResult);
}

async function getById(req, res) {
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
        req.params.method = req.headers["x-method"];
        req.params.token = req.headers["x-token"];
        req.params.logged_employee_id =
          xOAuthResult.token_data.result_verify.employee_info == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.id;
        req.params.logged_user_level =
          xOAuthResult.token_data.result_verify.user_level;
        req.params.logged_user_id = xOAuthResult.token_data.result_verify.id;
        req.params.logged_user_name =
          xOAuthResult.token_data.result_verify.name;
        xJoResult = await _serviceInstance.getById(req.params);
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

async function submit(req, res) {
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
          xOAuthResult.token_data.result_verify.user_level;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        req.body.logged_device = req.headers["x-device"];

        xJoResult = await _serviceInstance.submit(req.body);
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

async function cancel(req, res) {
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
          xOAuthResult.token_data.result_verify.user_level;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _serviceInstance.cancel(req.body);
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

async function approve(req, res) {
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
          xOAuthResult.token_data.result_verify.user_level;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _serviceInstance.approve(req.body);
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

async function setToDraft(req, res) {
  var joResult;
  var oAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (oAuthResult.status_code == "00") {
    if (oAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        joResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.body.logged_employee_id =
          oAuthResult.token_data.result_verify.employee_info == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.id;
        req.body.logged_employee_name =
          oAuthResult.token_data.result_verify.employee_info == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.name;
        req.body.logged_department_id =
          oAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.department.id;
        req.body.logged_department_name =
          oAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.department
                .name;
        req.body.logged_level_id =
          oAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.level.id;
        req.body.logged_level_name =
          oAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.level.name;
        req.body.logged_user_id =
          oAuthResult.token_data.result_verify == null
            ? null
            : oAuthResult.token_data.result_verify.id;
        req.body.logged_user_name =
          oAuthResult.token_data.result_verify == null
            ? null
            : oAuthResult.token_data.result_verify.name;
        req.body.logged_user_level =
          oAuthResult.token_data.result_verify.user_level;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        joResult = await _serviceInstance.setToDraft(req.body);
        joResult = JSON.stringify(joResult);
      }
    } else {
      joResult = JSON.stringify(oAuthResult);
    }
  } else {
    joResult = JSON.stringify(oAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(joResult);
}

async function reject(req, res) {
  var joResult;
  var oAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (oAuthResult.status_code == "00") {
    if (oAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        joResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.body.logged_employee_id =
          oAuthResult.token_data.result_verify.employee_info == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.id;
        req.body.logged_user_id = oAuthResult.token_data.result_verify.id;
        req.body.logged_user_name = oAuthResult.token_data.result_verify.name;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        joResult = await _serviceInstance.reject(req.body);
        joResult = JSON.stringify(joResult);
      }
    } else {
      joResult = JSON.stringify(oAuthResult);
    }
  } else {
    joResult = JSON.stringify(oAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(joResult);
}

async function done(req, res) {
  var joResult;
  var oAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (oAuthResult.status_code == "00") {
    if (oAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        joResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.body.logged_employee_id =
          oAuthResult.token_data.result_verify.employee_info == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.id;
        req.body.logged_employee_name =
          oAuthResult.token_data.result_verify.employee_info == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.name;
        req.body.logged_department_id =
          oAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.department.id;
        req.body.logged_department_name =
          oAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.department
                .name;
        req.body.logged_level_id =
          oAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.level.id;
        req.body.logged_level_name =
          oAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.level.name;
        req.body.logged_user_id =
          oAuthResult.token_data.result_verify == null
            ? null
            : oAuthResult.token_data.result_verify.id;
        req.body.logged_user_name =
          oAuthResult.token_data.result_verify == null
            ? null
            : oAuthResult.token_data.result_verify.name;
        req.body.logged_user_level =
          oAuthResult.token_data.result_verify.user_level;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        joResult = await _serviceInstance.done(req.body);
        joResult = JSON.stringify(joResult);
      }
    } else {
      joResult = JSON.stringify(oAuthResult);
    }
  } else {
    joResult = JSON.stringify(oAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(joResult);
}

async function generateFormAudit(req, res) {
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
          xOAuthResult.token_data.result_verify.user_level;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _serviceInstance.generateFormAudit(req.body);
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

async function fetchMatrix(req, res) {
  var joResult;
  var oAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (oAuthResult.status_code == "00") {
    if (oAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        joResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.body.logged_employee_id =
          oAuthResult.token_data.result_verify.employee_info == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.id;
        req.body.logged_employee_name =
          oAuthResult.token_data.result_verify.employee_info == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.name;
        req.body.logged_department_id =
          oAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.department.id;
        req.body.logged_department_name =
          oAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.department
                .name;
        req.body.logged_level_id =
          oAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.level.id;
        req.body.logged_level_name =
          oAuthResult.token_data.result_verify.employee_info.level == null
            ? null
            : oAuthResult.token_data.result_verify.employee_info.level.name;
        req.body.logged_user_id =
          oAuthResult.token_data.result_verify == null
            ? null
            : oAuthResult.token_data.result_verify.id;
        req.body.logged_user_name =
          oAuthResult.token_data.result_verify == null
            ? null
            : oAuthResult.token_data.result_verify.name;
        req.body.logged_user_level =
          oAuthResult.token_data.result_verify.user_level;
        req.body.token = req.headers["x-token"];
        req.body.method = req.headers["x-method"];
        req.body.logged_device = req.headers["x-device"];
        joResult = await _serviceInstance.fetchMatrix(req.body);
        joResult = JSON.stringify(joResult);
      }
    } else {
      joResult = JSON.stringify(oAuthResult);
    }
  } else {
    joResult = JSON.stringify(oAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(joResult);
}

async function itemList(req, res) {
  var joResult;
  var errors = null;

  var xOAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (xOAuthResult.status_code == "00") {
    if (xOAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        joResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.query.logged_employee_id =
          xOAuthResult.token_data.result_verify.employee_info.id;
        req.query.logged_user_level =
          xOAuthResult.token_data.result_verify.user_level;
        req.query.logged_user_id = xOAuthResult.token_data.result_verify.id;
        req.query.logged_user_name = xOAuthResult.token_data.result_verify.name;
        req.query.logged_department_id =
          xOAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.department.id;
        joResult = await _itemServiceInstance.list(req.query);
        // joResult.token_data = xOAuthResult.token_data;
        joResult = JSON.stringify(joResult);
      }
    } else {
      joResult = JSON.stringify(xOAuthResult);
    }
  } else {
    joResult = JSON.stringify(xOAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(joResult);
}

async function itemDetail(req, res) {
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
        req.params.method = req.headers["x-method"];
        req.params.token = req.headers["x-token"];
        req.params.logged_employee_id =
          xOAuthResult.token_data.result_verify.employee_info == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.id;
        req.params.logged_user_level =
          xOAuthResult.token_data.result_verify.user_level;
        req.params.logged_user_id = xOAuthResult.token_data.result_verify.id;
        req.params.logged_user_name =
          xOAuthResult.token_data.result_verify.name;
        xJoResult = await _itemServiceInstance.getById(req.params);
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

async function itemSave(req, res) {
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

        req.body.logged_user_level =
          xOAuthResult.token_data.result_verify == null
            ? null
            : xOAuthResult.token_data.result_verify.user_level;

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        xJoResult = await _itemServiceInstance.save(req.body);
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

async function itemSubmit(req, res) {
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

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _itemServiceInstance.submit(req.body);
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

async function itemVerify(req, res) {
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

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _itemServiceInstance.verify(req.body);
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

async function itemCancel(req, res) {
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

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _itemServiceInstance.cancel(req.body);
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

async function itemSetDraft(req, res) {
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

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _itemServiceInstance.setDraft(req.body);
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

async function itemSetUnused(req, res) {
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

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        xJoResult = await _itemServiceInstance.setUnused(req.body);
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

async function itemDelete(req, res) {
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
        xJoResult = await _itemServiceInstance.delete(req.body);
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

async function itemUpdateFileUpload(req, res) {
  var xJoResult;
  var xOAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (xOAuthResult.status_code == "00") {
    if (xOAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();
      console.log("validation>>>>", errors);

      if (errors.length != 0 || req.body.act == "add") {
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

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        req.body.act = "update";
        xJoResult = await _itemServiceInstance.save(req.body);
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

async function memberSave(req, res) {
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
        xJoResult = await _memberServiceInstance.save(req.body);
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

async function memberDelete(req, res) {
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
        xJoResult = await _memberServiceInstance.delete(req.body);
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

async function discoveryitemList(req, res) {
  var joResult;
  var errors = null;

  var xOAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (xOAuthResult.status_code == "00") {
    if (xOAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();

      if (errors.length != 0) {
        joResult = JSON.stringify({
          status_code: "-99",
          status_msg: "Parameter value has problem",
          error_msg: errors,
        });
      } else {
        req.query.logged_employee_id =
          xOAuthResult.token_data.result_verify.employee_info.id;
        req.query.logged_user_level =
          xOAuthResult.token_data.result_verify.user_level;
        req.query.logged_user_id = xOAuthResult.token_data.result_verify.id;
        req.query.logged_user_name = xOAuthResult.token_data.result_verify.name;
        req.query.logged_department_id =
          xOAuthResult.token_data.result_verify.employee_info.department == null
            ? null
            : xOAuthResult.token_data.result_verify.employee_info.department.id;
        joResult = await _discoveryitemInstance.list(req.query);
        // joResult.token_data = xOAuthResult.token_data;
        joResult = JSON.stringify(joResult);
      }
    } else {
      joResult = JSON.stringify(xOAuthResult);
    }
  } else {
    joResult = JSON.stringify(xOAuthResult);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(joResult);
}

async function discoveryitemSave(req, res) {
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

        req.body.logged_user_level =
          xOAuthResult.token_data.result_verify == null
            ? null
            : xOAuthResult.token_data.result_verify.user_level;

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        xJoResult = await _discoveryitemInstance.save(req.body);
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

async function discoveryitemDelete(req, res) {
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
        xJoResult = await _discoveryitemInstance.delete(req.body);
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

async function discoveryitemFileUpload(req, res) {
  var xJoResult;
  var xOAuthResult = await _oAuthServiceInstance.verifyToken(
    req.headers["x-token"],
    req.headers["x-method"]
  );

  if (xOAuthResult.status_code == "00") {
    if (xOAuthResult.token_data.status_code == "00") {
      // Validate first
      var errors = validationResult(req).array();
      console.log("validation>>>>", errors);

      if (errors.length != 0 || req.body.act == "add") {
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

        req.body.method = req.headers["x-method"];
        req.body.token = req.headers["x-token"];
        req.body.logged_device = req.headers["x-device"];
        req.body.act = "update";
        xJoResult = await _discoveryitemInstance.save(req.body);
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
