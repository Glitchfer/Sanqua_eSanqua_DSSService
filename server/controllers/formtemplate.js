// Services
const Service = require("../services/formtemplateservice.js");
const _serviceInstance = new Service();

// OAuth Service
const OAuthService = require("../services/oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

// Validation
const { check, validationResult } = require("express-validator");

module.exports = {
  getById,
  list,
  save,
  deletePermanent,
  archive,
  unarchive,
  dropdown,
  listItem,
  saveItem,
  deleteItem,
};

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

async function list(req, res) {
  var joResult;
  var errors = null;

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
        req.params.user_id = oAuthResult.token_data.result_verify.id;
        req.params.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.list(req.params);
        // joResult.token_data = oAuthResult.token_data;
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

async function dropdown(req, res) {
  var joResult;
  var errors = null;

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
        req.params.user_id = oAuthResult.token_data.result_verify.id;
        req.params.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.dropdown(req.params);
        // joResult.token_data = oAuthResult.token_data;
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

async function save(req, res) {
  var joResult;
  var errors = null;

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
        req.body.user_id = oAuthResult.token_data.result_verify.id;
        req.body.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.save(req.body);
        // joResult.token_data = oAuthResult.token_data;
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

async function archive(req, res) {
  var joResult;
  var errors = null;

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
        req.params.user_id = oAuthResult.token_data.result_verify.id;
        req.params.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.archive(req.params);
        // joResult.token_data = oAuthResult.token_data;
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

async function unarchive(req, res) {
  var joResult;
  var errors = null;

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
        req.params.user_id = oAuthResult.token_data.result_verify.id;
        req.params.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.unarchive(req.params);
        // joResult.token_data = oAuthResult.token_data;
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

async function deletePermanent(req, res) {
  var joResult;
  var errors = null;

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
        req.params.user_id = oAuthResult.token_data.result_verify.id;
        req.params.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.delete(req.params);
        // joResult.token_data = oAuthResult.token_data;
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

async function listItem(req, res) {
  var joResult;
  var errors = null;

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
        req.params.user_id = oAuthResult.token_data.result_verify.id;
        req.params.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.listItem(req.params);
        // joResult.token_data = oAuthResult.token_data;
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

async function saveItem(req, res) {
  var joResult;
  var errors = null;

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
        req.body.user_id = oAuthResult.token_data.result_verify.id;
        req.body.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.saveItem(req.body);
        // joResult.token_data = oAuthResult.token_data;
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

async function deleteItem(req, res) {
  var joResult;
  var errors = null;

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
        req.params.user_id = oAuthResult.token_data.result_verify.id;
        req.params.user_name = oAuthResult.token_data.result_verify.name;
        joResult = await _serviceInstance.deleteItem(req.params);
        // joResult.token_data = oAuthResult.token_data;
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
