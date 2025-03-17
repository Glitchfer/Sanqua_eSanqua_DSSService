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
const Repository = require("../repository/damagedobjectrepo.js");
const _repoInstance = new Repository();
const InspectionRepo = require("../repository/inspectionrepository.js");
const _inspectionRepo = new InspectionRepo();

// Service

const OAuthService = require("./oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

// const _statusLeave = [ 'Draft', 'Waiting Approval', 'Processed', 'Rejected', 'Canceled' ];

const _xClassName = "DamagedObjectService";

class DamagedObjectService {
  async save(pParam) {
    var xJoResult;
    var xAct = pParam.act;
    delete pParam.act;
    var xFlagProcess = false;
    var xDecId = null;

    try {
      xFlagProcess = false;

      if (xAct == "add") {
        if (pParam.hasOwnProperty("logged_user_id") && pParam.hasOwnProperty("inspection_id")) {
          if (pParam.logged_user_id != "" && pParam.inspection_id != "") {
            xDecId = await _utilInstance.decrypt(
              pParam.inspection_id,
              config.cryptoKey.hashKey
            );
            if (xDecId.status_code == "00") {
              pParam.inspection_id = xDecId.decrypted;
              var xLogId = await _utilInstance.decrypt(
                pParam.logged_user_id,
                config.cryptoKey.hashKey
              );
              if (xLogId.status_code == "00") {
                pParam.logged_user_id = xLogId.decrypted;
                pParam.created_by = xLogId.decrypted;
                pParam.created_by_name = pParam.logged_user_name;
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
              status_msg: "Invalid logged user or inspection report",
            };
          }
          
          if (xFlagProcess) {
            let xDetail = await _inspectionRepo.getById({id: pParam.inspection_id});
            if (xDetail.status_code == "00") {
              if (xDetail.data.status == 0) {
                let xAddResult = await _repoInstance.save(pParam, xAct);
                xJoResult = xAddResult;
              } else {
                xJoResult = {
                  status_code: "-99",
                  status_msg: "Add data failed, this document already processed.",
                };
              }
            } else {
              xJoResult = xDetail;
            }
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Invalid logged user or inspection report id",
          };
        }
      } else if (xAct == "update") {
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
                pParam.updated_by = xLogId.decrypted;
                pParam.updated_by_name = pParam.logged_user_name;
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
              status_msg: "Invalid logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Invalid logged user",
          };
        }

        if (xFlagProcess) {
          // check is document already processd or not
          var xGetDataById = await _repoInstance.getById(pParam);
          // console.log(`xGetDataById>>>>>>: ${JSON.stringify(xGetDataById)}`);
          if (xGetDataById.status_code == "00") {
            if (xGetDataById.data.inspection.status == 0) {
              var xAddResult = await _repoInstance.save(pParam, xAct);

              xJoResult = xAddResult;
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "Document already processed, edit failed !!",
              };
            }
          } else {
            xJoResult = xGetDataById;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Invalid action",
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
          let xDetail = await _repoInstance.getByParam(pParam);
          if (xDetail.status_code == "00") {
            if (xDetail.data.inspection.status == 0) {
              var xDeleteResult = await _repoInstance.delete(pParam);
              xJoResult = xDeleteResult;
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "Delete failed, this data already processed.",
              };
            }
          } else {
            xJoResult = xDetail;
          }
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

module.exports = DamagedObjectService;
