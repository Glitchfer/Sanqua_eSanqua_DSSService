const jwt = require("jsonwebtoken");
const md5 = require("md5");
const crypto = require("crypto");
const moment = require("moment");
const dateFormat = require("dateformat");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { Kafka, logLevel } = require("kafkajs");

// Config
const env = process.env.NODE_ENV || "localhost";
const config = require(__dirname + "/../config/config.json")[env];

//Util
const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

// Repository
const Repository = require("../repository/formtemplaterepository.js");
const _repoInstance = new Repository();

// const ApprovalMatrixHierarchyService = require('./approvalmatrixhierarchyservice.js');
// const _approvalMatrixHierarchyService = new ApprovalMatrixHierarchyService();

const LocalUtility = require("../utils/globalutility.js");
const _globalUtilInstance = new LocalUtility();

const OAuthService = require("./oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

const _xClassName = "FormTemplateService";

class FormTemplateService {
  constructor() {}

  async getById(pParam) {
    var xJoResult = {};
    var xFlagProccess = false;
    var xDecId = null;
    var xEncId = null;
    var xJoData = {};

    try {
      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xEncId = pParam.id;
          xDecId = await _utilInstance.decrypt(
            pParam.id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.id = xDecId.decrypted;
            xFlagProccess = true;
          } else {
            xJoResult = xDecId;
          }
        }
      }

      if (xFlagProccess) {
        // console.log(`pParam >>>>>>>> : ${JSON.stringify(pParam)}`);
        let xDetail = await _repoInstance.getById(pParam);
        console.log(
          `xDetail >>>>>>>> : ${JSON.stringify(
            xDetail.data.form_template_item
          )}`
        );

        if (xDetail.status_code == "00") {
          var xTemplateItem = [];
          for (var index in xDetail.data.form_template_item) {
            xTemplateItem.push({
              id: await _utilInstance.encrypt(
                JSON.stringify(xDetail.data.form_template_item[index].id),
                config.cryptoKey.hashKey
              ),
              // ref_id: await _utilInstance.encrypt(xDetail.data.form_template_item[index].ref_id, config.cryptoKey.hashKey),
              clause: xDetail.data.form_template_item[index].clause,
              area: xDetail.data.form_template_item[index].area,
              scope: xDetail.data.form_template_item[index].scope,
            });
          }

          xJoData = {
            id: await _utilInstance.encrypt(
              xDetail.data.id.toString(),
              config.cryptoKey.hashKey
            ),
            name: xDetail.data.name,
            company_id: xDetail.data.company_id,
            company_name: xDetail.data.company_name,
            department_id: xDetail.data.department_id,
            department_name: xDetail.data.department_name,
            audit_type: xDetail.data.audit_type,
            form_template_item: xTemplateItem,

            created_by_name: xDetail.data.created_by_name,
            created_at:
              xDetail.data.createdAt != null
                ? moment(xDetail.data.createdAt).format("DD-MM-YYYY HH:mm:ss")
                : null,
            updated_by_name: xDetail.data.updated_by_name,
            updated_at:
              xDetail.data.updated_at != null
                ? moment(xDetail.data.updated_at).format("DD-MM-YYYY HH:mm:ss")
                : null,
          };
          xJoResult = {
            status_code: "00",
            status_msg: "OK",
            data: xJoData,
          };
        } else {
          xJoResult = xDetail;
        }
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.getById`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.getById>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async list(pParam) {
    var xJoResult = {};
    var xJoArrData = [];
    try {
      var xResultList = await _repoInstance.list(pParam);

      if (xResultList.status_code == "00") {
        if (xResultList.data.count > 0) {
          var xRows = xResultList.data.rows;
          for (var index in xRows) {
            var xJoList = JSON.parse(JSON.stringify(xRows[index]));
            xJoList.id = await _utilInstance.encrypt(
              xRows[index].id.toString(),
              config.cryptoKey.hashKey
            );
            xJoArrData.push(xJoList);
          }
          xJoResult = {
            status_code: "00",
            status_msg: "OK",
            data: xJoArrData,
            total_record: xResultList.data.total_record,
          };
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Data not found",
          };
        }
      } else {
        xJoResult = xResultList;
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

  async dropdown(pParam) {
    var xJoResult = {};
    var xJoArrData = [];
    try {
      var xResultList = await _repoInstance.list(pParam);
      // console.log(`MASTER LIST>>>>>>>>>2, ${JSON.stringify(xResultList)}`);
      if (xResultList.status_code == "00") {
        if (xResultList.data.count > 0) {
          var xRows = xResultList.data.rows;
          for (var index in xRows) {
            xJoArrData.push({
              id: xRows[index].id,
              name: xRows[index].name,
            });
          }
          xJoResult = {
            status_code: "00",
            status_msg: "OK",
            data: xJoArrData,
            total_record: xResultList.data.total_record,
          };
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Data not found",
          };
        }
      } else {
        xJoResult = xResultList;
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.dropdown`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.dropdown>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async save(pParam) {
    var xJoResult;
    var xAct = pParam.act;
    var xFlagProcess = true;
    var xExistingData = null;
    try {
      delete pParam.act;

      if (xAct == "add") {
        // Check if data exists
        if (pParam.hasOwnProperty("is_check_name")) {
          if (pParam.is_check_name) {
            xExistingData = await _repoInstance.isDataExists(
              pParam.name,
              pParam.filter
            );
          }
        }

        if (xExistingData == null) {
          // User Id
          var xDecId = await _utilInstance.decrypt(
            pParam.user_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.created_by = xDecId.decrypted;
            pParam.created_by_name = pParam.user_name;
          } else {
            xFlagProcess = false;
            xJoResult = xDecId;
          }

          if (xFlagProcess) {
            var xAddResult = await _repoInstance.save(pParam, xAct);
            xJoResult = xAddResult;
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Data already exists.",
          };
        }
      } else if (xAct == "update") {
        console.log(JSON.stringify(pParam));

        var xDecId = await _utilInstance.decrypt(
          pParam.id,
          config.cryptoKey.hashKey
        );
        if (xDecId.status_code == "00") {
          pParam.id = xDecId.decrypted;
          xDecId = await _utilInstance.decrypt(
            pParam.user_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.updated_by = xDecId.decrypted;
            pParam.updated_by_name = pParam.user_name;
          } else {
            xFlagProcess = false;
            xJoResult = xDecId;
          }
        } else {
          xFlagProcess = false;
          xJoResult = xDecId;
        }

        if (xFlagProcess) {
          var xAddResult = await _repoInstance.save(pParam, xAct);
          xJoResult = xAddResult;
        }
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

  async archive(pParam) {
    var xJoResult;
    var xFlagProcess = true;
    try {
      var xDecId = await _utilInstance.decrypt(
        pParam.id,
        config.cryptoKey.hashKey
      );
      if (xDecId.status_code == "00") {
        pParam.id = xDecId.decrypted;
        xDecId = await _utilInstance.decrypt(
          pParam.user_id,
          config.cryptoKey.hashKey
        );
        if (xDecId.status_code == "00") {
          pParam.is_delete = 1;
          pParam.deleted_by = xDecId.decrypted;
          pParam.deleted_by_name = pParam.user_name;
        } else {
          xFlagProcess = false;
          xJoResult = xDecId;
        }
      } else {
        xFlagProcess = false;
        xJoResult = xDecId;
      }

      if (xFlagProcess) {
        var xDeleteResult = await _repoInstance.archive(pParam);
        xJoResult = xDeleteResult;
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: `xFlagProcess <${_xClassName}.archive>: ${xFlagProcess}`,
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.archive`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.archive>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async unarchive(pParam) {
    var xJoResult;
    var xFlagProcess = true;
    try {
      var xDecId = await _utilInstance.decrypt(
        pParam.id,
        config.cryptoKey.hashKey
      );
      if (xDecId.status_code == "00") {
        pParam.id = xDecId.decrypted;
        xDecId = await _utilInstance.decrypt(
          pParam.user_id,
          config.cryptoKey.hashKey
        );
        if (xDecId.status_code == "00") {
          pParam.is_delete = 0;
          // pParam.deleted_by = xDecId.decrypted;
          // pParam.deleted_by_name = pParam.user_name;
        } else {
          xFlagProcess = false;
          xJoResult = xDecId;
        }
      } else {
        xFlagProcess = false;
        xJoResult = xDecId;
      }

      if (xFlagProcess) {
        var xDeleteResult = await _repoInstance.archive(pParam);
        xJoResult = xDeleteResult;
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: `xFlagProcess <${_xClassName}.unarchive>: ${xFlagProcess}`,
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.unarchive`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.unarchive>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async delete(pParam) {
    var xJoResult;
    var xFlagProcess = true;
    try {
      var xDecId = await _utilInstance.decrypt(
        pParam.id,
        config.cryptoKey.hashKey
      );
      if (xDecId.status_code == "00") {
        pParam.id = xDecId.decrypted;
      } else {
        xFlagProcess = false;
        xJoResult = xDecId;
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

  async listItem(pParam) {
    var xJoResult = {};
    var xJoArrData = [];
    try {
      var xResultList = await _repoInstance.listItem(pParam);

      if (xResultList.status_code == "00") {
        if (xResultList.data.count > 0) {
          var xRows = xResultList.data.rows;
          xRows = await _utilInstance.changeIdToEncryptedId(
            xRows,
            config.cryptoKey.hashKey
          );
          for (var index in xRows) {
            var xObj = {
              id: xRows[index].id,
              clause: xRows[index].clause,
              area: xRows[index].area,
              scope: xRows[index].scope,
              form_template: xRows[index].form_template,
              created_by_name: xRows[index].created_by_name,
              created_at:
                xRows[index].createdAt != null
                  ? moment(xRows[index].createdAt).format("DD-MM-YYYY HH:mm:ss")
                  : null,
              updated_by_name: xRows[index].updated_by_name,
              updated_at:
                xRows[index].updated_at != null
                  ? moment(xRows[index].updated_at).format(
                      "DD-MM-YYYY HH:mm:ss"
                    )
                  : null,
            };
            // var xJoList = JSON.parse(JSON.stringify(xObj));
            // xJoList.id = await _utilInstance.encrypt(
            //   xObj.id.toString(),
            //   config.cryptoKey.hashKey
            // );
            xJoArrData.push(xObj);
          }
          xJoResult = {
            status_code: "00",
            status_msg: "OK",
            data: xJoArrData,
            total_record: xResultList.data.total_record,
          };
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Data not found",
          };
        }
      } else {
        xJoResult = xResultList;
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.listItem`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.listItem>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async saveItem(pParam) {
    var xJoResult;
    var xAct = pParam.act;
    var xFlagProcess = true;
    try {
      delete pParam.act;

      if (xAct == "add") {
        // User Id
        var xDecId = await _utilInstance.decrypt(
          pParam.user_id,
          config.cryptoKey.hashKey
        );
        if (xDecId.status_code == "00") {
          var xDecTemplateId = await _utilInstance.decrypt(
            pParam.form_template_id,
            config.cryptoKey.hashKey
          );
          console.log(`xDecTemplateId>>>> ${JSON.stringify(xDecTemplateId)}`);

          if (xDecTemplateId.status_code == "00") {
            let xCheckTemplateId = await _repoInstance.getById({
              id: xDecTemplateId.decrypted,
            });
            console.log(
              `xCheckTemplateId>>>> ${JSON.stringify(xCheckTemplateId)}`
            );
            if (xCheckTemplateId.status_code == "00") {
              pParam.created_by = xDecId.decrypted;
              pParam.created_by_name = pParam.user_name;
              pParam.formtemplate_id = xDecTemplateId.decrypted;
            } else {
              xFlagProcess = false;
              xJoResult = {
                status_code: "-99",
                status_msg: `xCheckTemplateId: ${xCheckTemplateId.status_msg}`,
              };
            }
          } else {
            xFlagProcess = false;
            xJoResult = xDecTemplateId;
          }
        } else {
          xFlagProcess = false;
          xJoResult = xDecId;
        }

        if (xFlagProcess) {
          var xAddResult = await _repoInstance.saveItem(pParam, xAct);
          xJoResult = xAddResult;
        }
      } else if (xAct == "update") {
        console.log(JSON.stringify(pParam));

        var xDecId = await _utilInstance.decrypt(
          pParam.id,
          config.cryptoKey.hashKey
        );
        if (xDecId.status_code == "00") {
          pParam.id = xDecId.decrypted;
          xDecId = await _utilInstance.decrypt(
            pParam.user_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.updated_by = xDecId.decrypted;
            pParam.updated_by_name = pParam.user_name;
          } else {
            xFlagProcess = false;
            xJoResult = xDecId;
          }
        } else {
          xFlagProcess = false;
          xJoResult = xDecId;
        }

        if (xFlagProcess) {
          var xAddResult = await _repoInstance.saveItem(pParam, xAct);
          xJoResult = xAddResult;
        }
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.saveItem`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.saveItem>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async deleteItem(pParam) {
    var xJoResult;
    var xFlagProcess = true;
    try {
      var xDecId = await _utilInstance.decrypt(
        pParam.id,
        config.cryptoKey.hashKey
      );
      if (xDecId.status_code == "00") {
        pParam.id = xDecId.decrypted;
      } else {
        xFlagProcess = false;
        xJoResult = xDecId;
      }

      if (xFlagProcess) {
        var xDeleteResult = await _repoInstance.deleteItem(pParam);
        xJoResult = xDeleteResult;
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: `xFlagProcess <${_xClassName}.deleteItem>: Delete Failed`,
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.deleteItem`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.deleteItem>: ${e.message}`,
      };
    }

    return xJoResult;
  }
}

module.exports = FormTemplateService;
