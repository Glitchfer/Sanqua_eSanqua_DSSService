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
const Repository = require("../repository/audititemscorerepository.js");
const _repoInstance = new Repository();

// Service

const AuditService = require("./auditservice.js");
const _auditServiceInstance = new AuditService();
const OAuthService = require("./oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

// const _statusLeave = [ 'Draft', 'Waiting Approval', 'Processed', 'Rejected', 'Canceled' ];

const _xClassName = "AuditItemScoreService";

class AuditItemScoreService {
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
                pParam.updatedAt = await _utilInstance.getCurrDateTime();
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
              status_msg: "Update failed, Invalid logged user & ID",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Update failed, ID & Invalid logged user",
          };
        }
        if (xFlagProcess) {
          if (xAct == "update") {
            var xGetDataById = await _repoInstance.getByParam({id: pParam.id});
            // console.log(`xGetDataById>>>>>>: ${JSON.stringify(xGetDataById)}`);
            if (xGetDataById.status_code == "00") {
              // if (xGetDataById.data.status == 0) {
                var xAddResult = await _repoInstance.save(pParam, xAct);

                xJoResult = xAddResult;
              // } else {
              //   xJoResult = {
              //     status_code: "-99",
              //     status_msg: "Document already processed, edit failed !!",
              //   };
              // }
            } else {
              xJoResult = xGetDataById;
            }
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
      //   pParam.is_admin = xLevel.is_admin;

        // if (xFlagProcess) {
        var xResultList = await _repoInstance.list(pParam);
        if (xResultList) {
          if (xResultList.status_code == "00") {
            var xRows = xResultList.data.rows;
            for (var index in xRows) {
              xJoArrData.push({
                id: await _utilInstance.encrypt(
                  xRows[index].id.toString(),
                  config.cryptoKey.hashKey
                ),
                audit: xRows[index].audit,
                clause_id: xRows[index].clause_id,
                clause_desc: xRows[index].clause_desc,
                clause_no: xRows[index].clause_no,
                audit_type: xRows[index].audit_type,
                area: xRows[index].area,
                scope: xRows[index].scope,
                company_id: xRows[index].clause_company_id,
                category_id: xRows[index].clause_category_id,
                category_name: xRows[index].clause_category_name,
                score_id: xRows[index].score_id,
                score_name: xRows[index].score_name,
                score_value: xRows[index].score_value,
                // objective_evidence: xRows[index].objective_evidence,
                // corrective_plan_due_date: xRows[index].corrective_plan_due_date,
                // corrective_plan_desc: xRows[index].corrective_plan_desc,
                // corrective_due_date: xRows[index].corrective_due_date,
                // corrective_evidence: xRows[index].corrective_evidence,
                // verification_note: xRows[index].verification_note,
                status: xRows[index].status,

                // created_at: moment(xRows[index].createdAt).format(
                //   "DD MMM YYYY HH:mm:ss"
                // ),
                // created_by_name: xRows[index].created_by_name,
                // created_by: xRows[index].created_by,
                // updated_at: moment(xRows[index].updatedAt).format(
                //   "DD MMM YYYY HH:mm:ss"
                // ),
                // updated_by_name: xRows[index].updated_by_name,
                // updated_by: xRows[index].updated_by,
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

  async getById(pParam) {
    var xJoResult = {};
    var xFlagProcess = false;
    var xDecId = null;
    var xEncId = null;
    var xJoData = {};

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id == config.applicationId || el.application.id == 1
      );

          console.log(`>>> pParam : ${JSON.stringify(pParam)}`);
      if (xLevel) {
        if (
          pParam.hasOwnProperty("id")
        ) {
          if (pParam.id != "") {
            xEncId = pParam.id;
            xDecId = await _utilInstance.decrypt(
              pParam.id,
              config.cryptoKey.hashKey
            );
            if (xDecId.status_code == "00") {
              pParam.id = xDecId.decrypted;
              xFlagProcess = true;
            } else {
              xJoResult = xDecId;
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Get detail failed, invalid ID",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Get detail failed, invalid ID",
          };
        }

        if (xFlagProcess) {
          // var xAuditItemDetail = [];
          let xDetail = await _repoInstance.getByParam(pParam);
          console.log(`>>> xDetail : ${JSON.stringify(xDetail)}`);

          if (xDetail) {
            if (xDetail.status_code == "00") {
              xJoData = {
                id: await _utilInstance.encrypt(
                  xDetail.data.id.toString(),
                  config.cryptoKey.hashKey
                ),
                audit: xDetail.data.audit,
                company_id: xDetail.data.clause_company_id,
                clause_id: xDetail.data.clause_id,
                clause_desc: xDetail.data.clause_desc,
                clause_no: xDetail.data.clause_no,
                audit_type: xDetail.data.audit_type,
                area: xDetail.data.area,
                scope: xDetail.data.scope,
                company_id: xDetail.data.clause_company_id,
                category_id: xDetail.data.clause_category_id,
                category_name: xDetail.data.clause_category_name,
                score_id: xDetail.data.score_id,
                score_name: xDetail.data.score_name,
                score_value: xDetail.data.score_value,
                objective_evidence: xDetail.data.objective_evidence,
                corrective_plan_due_date: xDetail.data.corrective_plan_due_date,
                corrective_plan_desc: xDetail.data.corrective_plan_desc,
                corrective_due_date: xDetail.data.corrective_due_date,
                corrective_evidence: xDetail.data.corrective_evidence,
                verification_note: xDetail.data.verification_note,
                status: xDetail.data.status,
                created_by_name: xDetail.data.created_by_name,
                created_at:
                  xDetail.data.createdAt != null
                    ? moment(xDetail.data.createdAt).format("DD-MM-YYYY HH:mm:ss")
                    : null,
                updated_by_name: xDetail.data.updated_by_name,
                updated_at:
                  xDetail.data.updatedAt != null
                    ? moment(xDetail.data.updatedAt).format("DD-MM-YYYY HH:mm:ss")
                    : null
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
        }
        
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Data not found",
        };
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

  async submit(pParam) {
    var xJoResult;
    var xFlagProcess = false;
    var xDecId = null;
    var xEncId = null;
    var xStatusDocument = 1;

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
                pParam.updated_by = xLogId.decrypted;
                pParam.updated_by_name = pParam.logged_user_name;
                pParam.updatedAt = await _utilInstance.getCurrDateTime();
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
              status_msg: "Submit failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Submit failed, Invalid ID & logged user",
          };
        }

        if (xFlagProcess) {
          let xDocDetail = await _repoInstance.getByParam(pParam);

          if (xDocDetail.status_code == "00") {
            if (xDocDetail.data.status != 0) {
              xJoResult = {
                status_code: "-99",
                status_msg: "This data already processed",
              };
            } else {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument,
                submit_by:  xLogId.decrypted,
                submit_by_name: pParam.logged_user_name,
                submitAt: await _utilInstance.getCurrDateTime()
              };
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            }
          } else {
            xJoResult = xDocDetail;
          }
        }
        
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Submit data failed, you have no right to update data",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.submit`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.submit>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async cancel(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";
    var xStatusDocument = 3;

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;

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
                pParam.updatedAt = await _utilInstance.getCurrDateTime();
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
              status_msg: "Cancel failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Cancel failed, Invalid ID & logged user",
          };
        }

        if (xFlagProcess) {
          let xDetail = await _repoInstance.getByParam(pParam);
          // console.log(`>>> xDetail: ${JSON.stringify(xDetail.data.employee_id)}, ${JSON.stringify(pParam.logged_user_id)}, ${JSON.stringify(pParam.is_admin)}`);
          if (xDetail.status_code == "00") {
            if (xDetail.data.status != 3) {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument,
                cancel_note:  pParam.cancel_note,
                cancel_by:  xLogId.decrypted,
                cancel_by_name: pParam.logged_user_name,
                cancelAt: await _utilInstance.getCurrDateTime()
              };
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "Data already canceled",
              };
            }
          } else {
            xJoResult = xDetail;
          }
        }
        
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Cancel data failed, you have no right to update data",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.cancel`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.cancel>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async setDraft(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";
    var xStatusDocument = 0;

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
                pParam.updated_by = xLogId.decrypted;
                pParam.updated_by_name = pParam.logged_user_name;
                pParam.updatedAt = await _utilInstance.getCurrDateTime();
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
              status_msg: "Set Draft failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Set Draft failed, Invalid ID & logged user",
          };
        }


        if (xFlagProcess) {
          let xDetail = await _repoInstance.getByParam(pParam);
          if (xDetail.status_code == "00") {
            // if (xDetail.data.created_by == pParam.logged_user_id) {
            if (xDetail.data.status == 3 || xDetail.data.status == 4) {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument
              };
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "You can not set to draft this data.",
              };
            }
            // } else {
            //   xJoResult = {
            //     status_code: "-99",
            //     status_msg: "You not allowed set to draft this data",
            //   };
            // }
          } else {
            xJoResult = xDetail;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Set draft data failed, you have no right to update data",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.setToDraft`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.setToDraft>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async verify(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";
    var xStatusDocument = 2;

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
                pParam.updated_by = xLogId.decrypted;
                pParam.updated_by_name = pParam.logged_user_name;
                pParam.updatedAt = await _utilInstance.getCurrDateTime();
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
              status_msg: "Verify failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Verify failed, Invalid ID & logged user",
          };
        }


        if (xFlagProcess) {
          let xDetail = await _repoInstance.getByParam(pParam);
          if (xDetail.status_code == "00") {
            // if (xDetail.data.created_by == pParam.logged_user_id) {
            if (xDetail.data.status == 1) {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument,
                verification_note: pParam.verification_note,
                verify_by:  xLogId.decrypted,
                verify_by_name: pParam.logged_user_name,
                verifyAt: await _utilInstance.getCurrDateTime()
              };
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "You can not verify this data.",
              };
            }
            // } else {
            //   xJoResult = {
            //     status_code: "-99",
            //     status_msg: "You not allowed set to draft this data",
            //   };
            // }
          } else {
            xJoResult = xDetail;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Verify data failed, you have no right to update data",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.Verify`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.Verify>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async setUnused(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";
    var xStatusDocument = 4;

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
                pParam.updated_by = xLogId.decrypted;
                pParam.updated_by_name = pParam.logged_user_name;
                pParam.updatedAt = await _utilInstance.getCurrDateTime();
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
              status_msg: "Set item to unuse failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Set item to unuse failed, Invalid ID & logged user",
          };
        }


        if (xFlagProcess) {
          let xDetail = await _repoInstance.getByParam(pParam);
          if (xDetail.status_code == "00") {
            // if (xDetail.data.created_by == pParam.logged_user_id) {
            if (xDetail.data.status != 4) {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument
              };
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "You can not change or this data already unused.",
              };
            }
            // } else {
            //   xJoResult = {
            //     status_code: "-99",
            //     status_msg: "You not allowed set to draft this data",
            //   };
            // }
          } else {
            xJoResult = xDetail;
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
        `${_xClassName}.Unused`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.Unused>: ${e.message}`,
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
                // pParam.updated_by = xLogId.decrypted;
                // pParam.updated_by_name = pParam.logged_user_name;
                // pParam.updatedAt = await _utilInstance.getCurrDateTime();
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
            if (xDetail.data.status == 0 || xDetail.data.status == 3 || xDetail.data.status == 4) {
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

module.exports = AuditItemScoreService;
