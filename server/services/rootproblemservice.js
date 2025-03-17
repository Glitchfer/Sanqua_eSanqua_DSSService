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
const Repository = require("../repository/rootproblemrepository.js");
const _repoInstance = new Repository();
const InitialReportRepo = require("../repository/initialreportrepository.js");
const _initialReportRepo = new InitialReportRepo();

// Service

const OAuthService = require("./oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

// const _statusLeave = [ 'Draft', 'Waiting Approval', 'Processed', 'Rejected', 'Canceled' ];

const _xClassName = "RootProblemService";

class RootProblemService {
  async save(pParam) {
    var xJoResult;
    var xAct = pParam.act;
    delete pParam.act;
    var xFlagProcess = false;
    var xDecId = null;
    var xLogId = null;

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id == config.applicationId || el.application.id == 1
      );

      if (xLevel) {
        if (
          pParam.hasOwnProperty("logged_user_id")
        ) {
          if (pParam.logged_user_id != "") {
            xLogId = await _utilInstance.decrypt(
              pParam.logged_user_id,
              config.cryptoKey.hashKey
            );
            if (xLogId.status_code == "00") {
              pParam.logged_user_id = xLogId.decrypted
              xFlagProcess = true;
            } else {
              xJoResult = xLogId;
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Save data failed, Invalid logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Save data failed, Invalid logged user",
          };
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Save data failed, you have no right to save data",
        };
      }

      if (xFlagProcess) {
        xFlagProcess = false;

        if (xAct == "add") {
          if (
            pParam.hasOwnProperty("initialreport_id")
          ) {
            if (pParam.initialreport_id != "") {
              xDecId = await _utilInstance.decrypt(
                pParam.initialreport_id,
                config.cryptoKey.hashKey
              );
              if (xDecId.status_code == "00") {
                pParam.initialreport_id = xDecId.decrypted;
                pParam.created_by = xLogId.decrypted;
                pParam.created_by_name = pParam.logged_user_name;
                xFlagProcess = true;
              } else {
                xJoResult = xDecId;
              }
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "Invalid initial report ID",
              };
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Invalid initial report ID",
            };
          }

          if (xFlagProcess) {


            var xGetInitialReport = await _initialReportRepo.getById({id: pParam.initialreport_id});
            // console.log(`xGetInitialReport>>>>>>: ${JSON.stringify(xGetInitialReport)}`);
            if (xGetInitialReport.status_code == "00") {

              let xAddResult = await _repoInstance.save(pParam, xAct);
              // if success generate request number
              if (xAddResult.status_code == "00") {
                var dt = dateTime.create();
                var xDate = dt.format("ymd");
                var xType = "LPAM";
                let xReqNo = `${xType}/${
                  xAddResult.clear_id
                }/${xDate}/${xAddResult.clear_id.toString().padStart(5, "0")}`;
                let xParamUpdate = {
                  id: xAddResult.clear_id,
                  document_no: xReqNo,
                };
                let xResultUpdate = await _repoInstance.save(
                  xParamUpdate,
                  "update"
                );
                if (xResultUpdate.status_code == "00") {
                  // pParam.audit_id = xAddResult.clear_id;
                  xJoResult = xAddResult;
                } else {
                  xJoResult = xResultUpdate;
                  // delete data if failed generate requset_no
                  await _repoInstance.delete(xParamUpdate);
                }
              } else {
                xJoResult = xAddResult;
              }
              
            } else {
              xJoResult = xGetInitialReport;
            }
          }
        } else if (xAct == "update") {
          if (
            pParam.hasOwnProperty("id")
          ) {
            if (pParam.id != "") {
              xDecId = await _utilInstance.decrypt(
                pParam.id,
                config.cryptoKey.hashKey
              );
              if (xDecId.status_code == "00") {
                pParam.id = xDecId.decrypted;
                pParam.updated_by = xLogId.decrypted;
                pParam.updated_by_name = pParam.logged_user_name;
                xFlagProcess = true;
              } else {
                xJoResult = xDecId;
              }
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "Invalid Root Cause ID",
              };
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Invalid Root Cause ID",
            };
          }

          if (xFlagProcess) {
            // check is document already processd or not
            var xGetDataById = await _repoInstance.getById({id: pParam.id});
            console.log(`xGetDataById>>>>>>: ${JSON.stringify(xGetDataById)}`);
            if (xGetDataById.status_code == "00") {
              if (xGetDataById.data.status == 0) {
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
        pParam.is_admin = xLevel.is_admin;
      }

      if (pParam.hasOwnProperty("logged_user_id")) {
        if (pParam.logged_user_id != "") {
          if (pParam.logged_user_id.length < 5) {
            xFlagProcess = true;
          } else {
            xDecId = await _utilInstance.decrypt(
              pParam.logged_user_id,
              config.cryptoKey.hashKey
            );
            if (xDecId.status_code == "00") {
              pParam.logged_user_id = xDecId.decrypted;
              xFlagProcess = true;
            } else {
              xJoResult = xDecId;
            }
          }
        } else {
          xFlagProcess = true;
        }
      } else {
        xFlagProcess = true;
      }

      if (xFlagProcess) {
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
                document_no: xRows[index].document_no,
                initial_report: xRows[index].initial_report,
                conclusion: xRows[index].conclusion,
                corrective_recomendation: xRows[index].corrective_recomendation,
                status:
                  xRows[index].status != null
                    ? {
                        id: xRows[index].status,
                        name: config.statusDescription.inspectionReport[
                          xRows[index].status
                        ],
                      }
                    : null,
                // chronology: xRows[index].chronology,
                // file: xRows[index].file,

                created_at: moment(xRows[index].createdAt).format(
                  "DD MMM YYYY HH:mm:ss"
                ),
                created_by_name: xRows[index].created_by_name,
                created_by: xRows[index].created_by,
                updated_at: moment(xRows[index].updatedAt).format(
                  "DD MMM YYYY HH:mm:ss"
                ),
                updated_by_name: xRows[index].updated_by_name,
                updated_by: xRows[index].updated_by,
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
      if (
        pParam.hasOwnProperty("logged_user_id") &&
        pParam.hasOwnProperty("id")
      ) {
        if (pParam.logged_user_id != "" && pParam.id != "") {
          xEncId = pParam.id;
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
              xFlagProcess = true;
            } else {
              xJoResult = xLogId;
            }
          } else {
            xJoResult = xDecId;
          }
        }
      }

      if (xFlagProcess) {
        var xRootCauseObj = [];
        let xDetail = await _repoInstance.getById(pParam);
        // console.log(`>>> xDetail : ${JSON.stringify(xDetail)}`);

        if (xDetail) {
          if (xDetail.status_code == "00") {
            const xRootCauseDesc = xDetail.data.root_cause;
            console.log(`>>> xRootCauseDesc : ${JSON.stringify(xRootCauseDesc)}`);
            if (xRootCauseDesc != null) {
              for (let i = 0; i < xRootCauseDesc.length; i++) {
                xRootCauseObj.push({
                  id: await _utilInstance.encrypt(
                  xRootCauseDesc[i].id.toString(),
                    config.cryptoKey.hashKey
                  ),
                  // audit:xRootCauseDesc[i].audit,
                  description:xRootCauseDesc[i].description,
                  cause_category:xRootCauseDesc[i].cause_category
                  // created_by_name:xAccidentItem[i].created_by_name,
                  // created_at:
                  // xAccidentItem[i].createdAt != null
                  //     ? moment(xDetail.data.createdAt).format("DD-MM-YYYY HH:mm:ss")
                  //     : null,
                  // updated_by_name:xAccidentItem[i].updated_by_name,
                  // updated_at:
                  // xAccidentItem[i].updatedAt != null
                  //     ? moment(xDetail.data.updatedAt).format("DD-MM-YYYY HH:mm:ss")
                  //     : null
                });
              }
            }

            xJoData = {
              id: await _utilInstance.encrypt(
                xDetail.data.id.toString(),
                config.cryptoKey.hashKey
              ),
              document_no: xDetail.data.document_no,
              initial_report: xDetail.data.initial_report,
              conclusion: xDetail.data.conclusion,
              corrective_recomendation: xDetail.data.corrective_recomendation,
              root_cause: xRootCauseObj,
              status:
                xDetail.data.status != null
                  ? {
                      id: xDetail.data.status,
                      name: config.statusDescription.initialReport[
                        xDetail.data.status
                      ],
                    }
                  : null,
              created_by_name: xDetail.data.created_by_name,
              created_by: xDetail.data.created_by,
              created_at:
                xDetail.data.createdAt != null
                  ? moment(xDetail.data.createdAt).format("DD-MM-YYYY HH:mm:ss")
                  : null,
              updated_by_name: xDetail.data.updated_by_name,
              updated_at:
                xDetail.data.updatedAt != null
                  ? moment(xDetail.data.updatedAt).format("DD-MM-YYYY HH:mm:ss")
                  : null,
              updated_by: xDetail.data.updated_by,
              // submited_by_name: xDetail.data.submited_by_name,
              // submited_at:
              //   xDetail.data.submitedAt != null
              //     ? moment(xDetail.data.submitedAt).format(
              //         "DD-MM-YYYY HH:mm:ss"
              //       )
              //     : null,
              // cancel_by_name: xDetail.data.cancel_by_name,
              // cancel_at:
              //   xDetail.data.cancelAt != null
              //     ? moment(xDetail.data.cancelAt).format("DD-MM-YYYY HH:mm:ss")
              //     : null,
              // set_draft_by_name: xDetail.data.set_draft_by_name,
              // set_draft_at:
              //   xDetail.data.set_draftAt != null
              //     ? moment(xDetail.data.set_draftAt).format(
              //         "DD-MM-YYYY HH:mm:ss"
              //       )
              //     : null,
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
                pParam.logged_user_id = xLogId.decrypted
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
              status_msg: "Submit data failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Submit data failed, Invalid ID & logged user",
          };
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Submit data failed, you have no right to submit data",
        };
      }

      if (xFlagProcess) {
        let xDocDetail = await _repoInstance.getById(pParam);

        if (xDocDetail.status_code == "00") {
          // Check if document owned by logged_employee_id
          if (xDocDetail.data.created_by != pParam.logged_user_id) {
            xJoResult = {
              status_code: "-99",
              status_msg: "You not allowed to submit this data",
            };
          } else {
            if (xDocDetail.data.status != 0) {
              xJoResult = {
                status_code: "-99",
                status_msg: "This data already processed",
              };
            } else {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument,
                // submitedAt: await _utilInstance.getCurrDateTime(),
                // submited_by: pParam.logged_user_id,
                // submited_by_name: pParam.logged_user_name,
              };
              let xResultUpdate = await _repoInstance.save(
                xParamUpdate,
                "update"
              );
              xJoResult = xResultUpdate;
            }
          }
        } else {
          xJoResult = xDocDetail;
        }
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
                pParam.logged_user_id = xLogId.decrypted
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
              status_msg: "Cancel data failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Cancel data failed, Invalid ID & logged user",
          };
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Cancel data failed, you have no right to cancel data",
        };
      }

      if (xFlagProcess) {
        let xDetail = await _repoInstance.getById(pParam);
        // console.log(`>>> xDetail: ${JSON.stringify(xDetail.data.employee_id)}, ${JSON.stringify(pParam.logged_user_id)}, ${JSON.stringify(pParam.is_admin)}`);
        if (xDetail.status_code == "00") {
          let xParamUpdate = {
            id: pParam.id,
            cancel_note: pParam.note,
            // cancelAt: await _utilInstance.getCurrDateTime(),
            // cancel_by: pParam.logged_user_id,
            // cancel_by_name: pParam.logged_user_name,
            status: xStatusDocument,
          };
          // console.log(`>>> xParamUpdate : ${JSON.stringify(xParamUpdate)}`);
          // cannot cancel if status already finish
          if (xDetail.data.status != 2) {
            if (pParam.is_admin == 1) {
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            } else {
              if (xDetail.data.created_by == pParam.logged_user_id) {
                xJoResult = await _repoInstance.save(xParamUpdate, "update");
              } else {
                xJoResult = {
                  status_code: "-99",
                  status_msg: "You have no right to cancel this document",
                };
              }
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Document already canceled",
            };
          }
        } else {
          xJoResult = xDetail;
        }
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

  async setToDraft(pParam) {
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
                pParam.logged_user_id = xLogId.decrypted
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
              status_msg: "Set to draft failed, Invalid ID & logged user",
            };
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Set to draft failed, Invalid ID & logged user",
          };
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Set to draft failed, you have no right to delete data",
        };
      }

      if (xFlagProcess) {
        let xDetail = await _repoInstance.getById(pParam);
        if (xDetail.status_code == "00") {
          if (xDetail.data.created_by == pParam.logged_user_id) {
            if (xDetail.data.status == 2) {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument,
                // set_draftAt: await _utilInstance.getCurrDateTime(),
                // set_draft_by: pParam.logged_user_id,
                // set_draft_by_name: pParam.logged_user_name,
              };
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "You can not set to draft this document.",
              };
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "You not allowed set to draft this document",
            };
          }
        } else {
          xJoResult = xDetail;
        }
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
                pParam.logged_user_id = xLogId.decrypted
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
            if (xDetail.data.status != 1) {
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

module.exports = RootProblemService;
