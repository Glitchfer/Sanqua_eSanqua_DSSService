const jwt = require("jsonwebtoken");
const md5 = require("md5");
const crypto = require("crypto");
const moment = require("moment");
const dateFormat = require("dateformat");
const bcrypt = require("bcrypt");
const fs = require("fs");
const dateTime = require("node-datetime");

// Config
const env = process.env.NODE_ENV || "localhost";
const config = require(__dirname + "/../config/config.json")[env];

//Util
const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const GlobalUtility = require("../utils/globalutility.js");
const _globalUtilInstance = new GlobalUtility();

// Repository
const Repository = require("../repository/discoveryitemrepository.js");
const _repoInstance = new Repository();

// Service

const AuditService = require("./auditservice.js");
const _auditServiceInstance = new AuditService();
const OAuthService = require("./oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

// const _statusLeave = [ 'Draft', 'Waiting Approval', 'Processed', 'Rejected', 'Canceled' ];

const _xClassName = "DiscoveryItemService";

class DiscoveryItemService {
  async save(pParam) {
    var xJoResult;
    var xAct = pParam.act;
    delete pParam.act;
    var xFlagProcess = false;
    var xDecId = null;

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id == config.applicationId || el.application.id == 1
      );

      if (xLevel) {
        xFlagProcess = false;

        if (pParam.hasOwnProperty("logged_user_id")) {
          if (pParam.logged_user_id != "") {
            var xLogId = await _utilInstance.decrypt(
              pParam.logged_user_id,
              config.cryptoKey.hashKey
            );
            if (xLogId.status_code == "00") {
              if (pParam.hasOwnProperty("id")) {
                xDecId = await _utilInstance.decrypt(
                  pParam.id,
                  config.cryptoKey.hashKey
                );
                if (xDecId.status_code == "00") {
                  // pParam.updated_by = xLogId.decrypted;
                  // pParam.updated_by_name = pParam.logged_user_name;
                  // pParam.updatedAt = await _utilInstance.getCurrDateTime();
                  pParam.id = xDecId.decrypted;
                  xFlagProcess = true;
                } else {
                  xJoResult = xDecId;
                }
              }
              if (pParam.hasOwnProperty("audit_id")) {
                xDecId = await _utilInstance.decrypt(
                  pParam.audit_id,
                  config.cryptoKey.hashKey
                );
                if (xDecId.status_code == "00") {
                  pParam.audit_id = xDecId.decrypted;
                  xFlagProcess = true;
                } else {
                  xJoResult = xDecId;
                }
              } else {
                xJoResult = {
                  status_code: "-99",
                  status_msg: "Update failed, Supplied ID is invalid",
                };
              }
            } else {
              xJoResult = xLogId;
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Update failed, Invalid logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Update failed, Invalid logged user",
          };
        }

        if (xFlagProcess) {
          if (xAct == "add") {
            var xAddResult = await _repoInstance.save(pParam, xAct);

            xJoResult = xAddResult;
          } else if (xAct == "update") {
            // var xGetDataById = await _repoInstance.getByParam({
            //   id: pParam.id,
            // });
            // // console.log(`xGetDataById>>>>>>: ${JSON.stringify(xGetDataById)}`);
            // if (xGetDataById.status_code == "00") {
            //   // if (xGetDataById.data.status == 0) {
            var xAddResult = await _repoInstance.save(pParam, xAct);

            xJoResult = xAddResult;
            //   // } else {
            //   //   xJoResult = {
            //   //     status_code: "-99",
            //   //     status_msg: "Document already processed, edit failed !!",
            //   //   };
            //   // }
            // } else {
            //   xJoResult = xGetDataById;
            // }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Update data failed, Invalid action",
            };
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Update data failed, you have no right to update data",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.save`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.save>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async list(pParam) {
    var xJoResult = {};
    var xJoArrData = [];
    var xDecId = null;
    var xFlagProcess = false;

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id == config.applicationId || el.application.id == 1
      );

      if (xLevel) {
        if (pParam.hasOwnProperty("audit_id")) {
          if (pParam.audit_id != "" && pParam.audit_id != null) {
            if (pParam.audit_id.length == 65) {
              xDecId = await _utilInstance.decrypt(
                pParam.audit_id,
                config.cryptoKey.hashKey
              );
              if (xDecId.status_code == "00") {
                pParam.audit_id = xDecId.decrypted;
              }
            }
          }
        }
        //   pParam.is_admin = xLevel.is_admin;

        // if (xFlagProcess) {
        var xResultList = await _repoInstance.list(pParam);
        if (xResultList) {
          if (xResultList.status_code == "00") {
            var xRows = xResultList.data.rows;
            for (var index in xRows) {
              let xFileObjectiveArr = [];
              let xFileCorrectiveArr = [];

              for (var j in xRows[index].objective_evidence) {
                xFileObjectiveArr.push({
                  subject: xRows[index].objective_evidence[j].subject,
                  file:
                    xRows[index].objective_evidence[j].file != null
                      ? `${config.imagePathESanQua}/dss/audit/${xRows[index].objective_evidence[j].file}`
                      : null,
                });
              }

              for (var j in xRows[index].corrective_evidence) {
                xFileCorrectiveArr.push({
                  subject: xRows[index].corrective_evidence[j].subject,
                  file:
                    xRows[index].corrective_evidence[j].file != null
                      ? `${config.imagePathESanQua}/dss/audit/${xRows[index].corrective_evidence[j].file}`
                      : null,
                });
              }

              xJoArrData.push({
                id: await _utilInstance.encrypt(
                  xRows[index].id.toString(),
                  config.cryptoKey.hashKey
                ),
                // audit_id: xRows[index].audit_id,
                description: xRows[index].description,
                corrective_plan_desc: xRows[index].corrective_plan_desc,
                corrective_plan_due_date: xRows[index].corrective_plan_due_date,
                corrective_due_date: xRows[index].corrective_due_date,
                area: xRows[index].area,
                scope: xRows[index].scope,
                objective_evidence: xFileObjectiveArr,
                corrective_evidence: xFileCorrectiveArr,
              });
            }

            xJoResult = {
              status_code: "00",
              status_msg: "OK",
              total_record: xResultList.total_record,
              data: xJoArrData,
            };
          } else {
            xJoResult = xResultList;
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Data not found",
          };
        }
        // }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Data not found",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.list`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.list>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async delete(pParam) {
    var xJoResult;
    var xDecId = null;
    var xFlagProcess = false;
    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id == config.applicationId || el.application.id == 1
      );

      if (xLevel) {
        if (
          pParam.hasOwnProperty("logged_user_id") &&
          pParam.hasOwnProperty("id")
        ) {
          if (pParam.logged_user_id != "" && pParam.id != "") {
            xDecId = await _utilInstance.decrypt(
              pParam.id,
              config.cryptoKey.hashKey
            );
            if (xDecId.status_code == "00") {
              pParam.id = xDecId.decrypted;
              var xLogId = await _utilInstance.decrypt(
                pParam.logged_user_id,
                config.cryptoKey.hashKey
              );
              if (xLogId.status_code == "00") {
                xFlagProcess = true;
              } else {
                xJoResult = xLogId;
              }
            } else {
              xJoResult = xDecId;
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Delete item failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Delete item failed, Invalid ID & logged user",
          };
        }

        if (xFlagProcess) {
          var xDeleteResult = await _repoInstance.delete(pParam);
          xJoResult = xDeleteResult;
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: `xFlagProcess <${_xClassName}.delete>: Delete Failed`,
          };
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Delete data failed, you have no right to delete data",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.delete`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.delete>: ${e.message}`,
      };
    }

    return xJoResult;
  }
}

module.exports = DiscoveryItemService;
