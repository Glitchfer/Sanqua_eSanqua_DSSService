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
const Repository = require("../repository/auditrepository.js");
const _repoInstance = new Repository();

const AuditRepository = require("../repository/audititemscorerepository.js");
const _auditRepo = new AuditRepository();

// Service

const OAuthService = require("../services/oauthservice.js");
const _oAuthServiceInstance = new OAuthService();

const MasterService = require("../services/masterservice.js");
const _masterServiceInstance = new MasterService();
// const _statusLeave = [ 'Draft', 'Waiting Approval', 'Processed', 'Rejected', 'Canceled' ];

const _xClassName = "AuditService";

class AuditService {
  async save(pParam) {
    var xJoResult;
    var xAct = pParam.act;
    delete pParam.act;
    var xFlagProcess = false;
    var xDecId = null;

    try {
      xFlagProcess = false;

      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;
      }
      if (pParam.is_admin == 1) {
        if (xAct == "add") {
          if (pParam.hasOwnProperty("logged_user_id")) {
            if (pParam.logged_user_id != "") {
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
              xJoResult = {
                status_code: "-99",
                status_msg: "Invalid logged user",
              };
            }

            if (xFlagProcess) {
              pParam.date =
                pParam.date != null && pParam.date != ""
                  ? moment(pParam.date).format("YYYY-MM-DD")
                  : null;

              let xAddResult = await _repoInstance.save(pParam, xAct);
              // if success generate request number
              if (xAddResult.status_code == "00") {
                var dt = dateTime.create();
                var xDate = dt.format("ymd");
                var xType = "DSS";
                if (pParam.audit_type_id == 1) {
                  xType = "IFS";
                }
                if (pParam.audit_type_id == 2) {
                  xType = "5R";
                }
                let xReqNo = `${xType}/${
                  xAddResult.clear_id
                }/${xDate}/${xAddResult.clear_id.toString().padStart(5, "0")}`;
                let xParamUpdate = {
                  id: xAddResult.clear_id,
                  audit_no: xReqNo,
                };
                let xResultUpdate = await _repoInstance.save(
                  xParamUpdate,
                  "update"
                );
                if (xResultUpdate.status_code == "00") {
                  pParam.audit_id = xAddResult.clear_id;
                  xJoResult = xAddResult;

                  // generate item form based on audit type
                  xJoResult.generateFormResult =
                    await _repoInstance.generateFormAudit(pParam);
                } else {
                  xJoResult = xResultUpdate;
                  // delete data if failed generate requset_no
                  await _repoInstance.delete(xParamUpdate);
                }
              } else {
                xJoResult = xAddResult;
              }
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Invalid logged user",
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
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "You not allowed to create or update audit document",
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
                audit_no: xRows[index].audit_no,
                name: xRows[index].name,
                company_id: xRows[index].company_id,
                company_name: xRows[index].company_name,
                status:
                  xRows[index].status != null
                    ? {
                        id: xRows[index].status,
                        name: config.statusDescription.auditDocument[
                          xRows[index].status
                        ],
                      }
                    : null,
                audit_date: xRows[index].audit_date,
                audit_type: xRows[index].audit_type,

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
              pParam.updated_by = xLogId.decrypted;
              pParam.updated_by_name = pParam.logged_user_name;
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
        var xAuditItemDetail = [];
        var xAuditMember = [];
        var xAuditScoreResult = [];
        var xAuditScoreTotal = 0;
        var xAuditScoreGrade = null;
        let xDetail = await _repoInstance.getById(pParam);
        // console.log(`>>> xDetail : ${JSON.stringify(xDetail)}`);

        if (xDetail) {
          if (xDetail.status_code == "00") {
            // Get Approval matrix
            var xParamApprovalMatrix = {
              application_id: config.applicationId,
              table_name: config.approvalMatrixConfig.tableName.auditDocument,
              document_id: xEncId,
            };
            var xResultApprovalMatrix =
              await _oAuthServiceInstance.getApprovalMatrix(
                pParam.method,
                pParam.token,
                xParamApprovalMatrix
              );
            // console.log(`>>> xGradeList : ${JSON.stringify(xGradeList)}`);
            // document detail item
            const xDetailItemData = xDetail.data.audit_item;
            if (xDetailItemData != null) {
              for (let i = 0; i < xDetailItemData.length; i++) {
                let xFileObjectiveArr = [];
                let xFileCorrectiveArr = [];

                for (var j in xDetailItemData[i].objective_evidence) {
                  xFileObjectiveArr.push({
                    subject: xDetailItemData[i].objective_evidence[j].subject,
                    file:
                      xDetailItemData[i].objective_evidence[j].file != null
                        ? `${config.imagePathESanQua}/dss/audit/${xDetailItemData[i].objective_evidence[j].file}`
                        : null,
                  });
                }

                for (var j in xDetailItemData[i].corrective_evidence) {
                  xFileCorrectiveArr.push({
                    subject: xDetailItemData[i].corrective_evidence[j].subject,
                    file:
                      xDetailItemData[i].corrective_evidence[j].file != null
                        ? `${config.imagePathESanQua}/dss/audit/${xDetailItemData[i].corrective_evidence[j].file}`
                        : null,
                  });
                }

                xAuditItemDetail.push({
                  id: await _utilInstance.encrypt(
                    xDetailItemData[i].id.toString(),
                    config.cryptoKey.hashKey
                  ),
                  // audit:xDetailItemData[i].audit,
                  company_id: xDetailItemData[i].clause_company_id,
                  clause_id: xDetailItemData[i].clause_id,
                  clause_desc: xDetailItemData[i].clause_desc,
                  clause_no: xDetailItemData[i].clause_no,
                  audit_type: xDetailItemData[i].audit_type,
                  area: xDetailItemData[i].area,
                  scope: xDetailItemData[i].scope,
                  company_id: xDetailItemData[i].clause_company_id,
                  category_id: xDetailItemData[i].clause_category_id,
                  category_name: xDetailItemData[i].clause_category_name,
                  score_id: xDetailItemData[i].score_id,
                  score_name: xDetailItemData[i].score_name,
                  score_value: xDetailItemData[i].score_value,
                  objective_evidence: xFileObjectiveArr,
                  corrective_plan_due_date:
                    xDetailItemData[i].corrective_plan_due_date,
                  corrective_plan_desc: xDetailItemData[i].corrective_plan_desc,
                  corrective_due_date: xDetailItemData[i].corrective_due_date,
                  corrective_evidence: xFileCorrectiveArr,
                  verification_note: xDetailItemData[i].verification_note,
                  status: xDetailItemData[i].status,
                  // is_score_double: xDetailItemData[i].is_score_double,
                  score_multiplier: xDetailItemData[i].score_multiplier,
                  created_by: xDetailItemData[i].created_by,
                  created_by_name: xDetailItemData[i].created_by_name,
                  created_at:
                    xDetailItemData[i].createdAt != null
                      ? moment(xDetail.data.createdAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      : null,
                  updated_by: xDetailItemData[i].updated_by,
                  updated_by_name: xDetailItemData[i].updated_by_name,
                  updated_at:
                    xDetailItemData[i].updatedAt != null
                      ? moment(xDetail.data.updatedAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      : null,
                  submit_by: xDetailItemData[i].submit_by,
                  submit_by_name: xDetailItemData[i].submit_by_name,
                  submit_at:
                    xDetailItemData[i].submitAt != null
                      ? moment(xDetail.data.submitAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      : null,
                  verify_by: xDetailItemData[i].verify_by,
                  verify_by_name: xDetailItemData[i].verify_by_name,
                  verify_at:
                    xDetailItemData[i].verifyAt != null
                      ? moment(xDetail.data.verifyAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      : null,

                  cancel_note: xDetailItemData[i].cancel_note,
                  cancel_by: xDetailItemData[i].cancel_by,
                  cancel_by_name: xDetailItemData[i].cancel_by_name,
                  cancel_at:
                    xDetailItemData[i].verifyAt != null
                      ? moment(xDetail.data.verifyAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      : null,
                });
              }
            }

            const xDetailMember = xDetail.data.audit_member;
            if (xDetailMember != null) {
              for (let i = 0; i < xDetailMember.length; i++) {
                xAuditMember.push({
                  id: await _utilInstance.encrypt(
                    xDetailMember[i].id.toString(),
                    config.cryptoKey.hashKey
                  ),
                  // audit:xDetailMember[i].audit,
                  employee_id: xDetailMember[i].employee_id,
                  employee_name: xDetailMember[i].employee_name,
                  employee_code: xDetailMember[i].employee_code,
                  scope_ids: xDetailMember[i].scope_ids,
                  area_ids: xDetailMember[i].area_ids,
                  member_type: xDetailMember[i].member_type,
                  created_by_name: xDetailMember[i].created_by_name,
                  created_at:
                    xDetailMember[i].createdAt != null
                      ? moment(xDetail.data.createdAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      : null,
                  updated_by_name: xDetailMember[i].updated_by_name,
                  updated_at:
                    xDetailMember[i].updatedAt != null
                      ? moment(xDetail.data.updatedAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )
                      : null,
                });
              }
            }
            
            // show auditScoreResult for 5r
            if (
              xDetail.data.audit_type != null &&
              xDetail.data.audit_type.id == 2
            ) {
              // get scoring klausul
              const xGetAuditScoreResult = await this.calculateResultV5(
                xDetailItemData,
                xDetailMember
              );
              if (xGetAuditScoreResult != null && xGetAuditScoreResult != undefined) {
                for (let i = 0; i < xGetAuditScoreResult.length; i++) {
                  const xTotal = xGetAuditScoreResult[i].total
                  xAuditScoreTotal = xAuditScoreTotal + xTotal
                }

                xAuditScoreTotal = xAuditScoreTotal / xGetAuditScoreResult.length
                xAuditScoreTotal =  parseFloat(xAuditScoreTotal.toFixed(2))
              }

              // get check grade base on score result
              const xGetGrade = await _masterServiceInstance.list({
                app: 'universal',
                model: 'grade'
              })
              if (xGetGrade != null) {
                if (xGetGrade.status_code == '00') {
                  const xGradeList = xGetGrade.data
                  let grade = null
                  // console.log(`>>> xGradeList : ${JSON.stringify(xGradeList)}`);
                  for (let i = 0; i < xGradeList.length; i++) {
                    var item = xGradeList[i];
                    const start = Number(item.start_value);
                    const end = Number(item.end_value);
                    // console.log(`xGradeList[${i}], start: ${start}, end: ${end}`, xAuditScoreTotal >= start, xAuditScoreTotal <= end);
                    if (xAuditScoreTotal >= start && xAuditScoreTotal < end + 1) {
                      grade = item;
                      break;
                    }
                  }
                  console.log(`>>> grade : ${JSON.stringify(grade)}`);
                  // grade = xGradeList.find(g => xAuditScoreTotal >= g.start_value && xAuditScoreTotal <= g.end_value);
                  xAuditScoreGrade = grade != null ? {
                    name: grade.name,
                    start_value: grade.start_value,
                    end_value: grade.end_value,
                  } : null
                }
              }

              xAuditScoreResult = xGetAuditScoreResult;
            }

            // console.log(`>>> xAuditItemDetail : ${JSON.stringify(xAuditItemDetail)}`);
            xJoData = {
              id: await _utilInstance.encrypt(
                xDetail.data.id.toString(),
                config.cryptoKey.hashKey
              ),
              audit_no: xDetail.data.audit_no,
              audit_date: xDetail.data.audit_date,
              audit_type: xDetail.data.audit_type,
              name: xDetail.data.name,
              status:
                xDetail.data.status != null
                  ? {
                      id: xDetail.data.status,
                      name: config.statusDescription.auditDocument[
                        xDetail.data.status
                      ],
                    }
                  : null,

              company: {
                id: xDetail.data.company_id,
                name: xDetail.data.company_name,
              },
              approver_ids: xDetail.data.approver_ids,

              approval_matrix:
                xResultApprovalMatrix.status_code == "00" &&
                xResultApprovalMatrix.token_data.status_code == "00"
                  ? xResultApprovalMatrix.token_data.data
                  : null,
              audit_item_score: xAuditItemDetail,
              audit_member: xAuditMember,
              audit_score_result: xAuditScoreResult,
              audit_score_total: xAuditScoreTotal,
              audit_score_grade: xAuditScoreGrade,
              cancel_note: xDetail.data.cancel_note,
              created_by_name: xDetail.data.created_by_name,
              created_at:
                xDetail.data.createdAt != null
                  ? moment(xDetail.data.createdAt).format("DD-MM-YYYY HH:mm:ss")
                  : null,
              updated_by_name: xDetail.data.updated_by_name,
              updated_at:
                xDetail.data.updatedAt != null
                  ? moment(xDetail.data.updatedAt).format("DD-MM-YYYY HH:mm:ss")
                  : null,
              submited_by_name: xDetail.data.submited_by_name,
              submited_at:
                xDetail.data.submitedAt != null
                  ? moment(xDetail.data.submitedAt).format(
                      "DD-MM-YYYY HH:mm:ss"
                    )
                  : null,
              cancel_by_name: xDetail.data.cancel_by_name,
              cancel_at:
                xDetail.data.cancelAt != null
                  ? moment(xDetail.data.cancelAt).format("DD-MM-YYYY HH:mm:ss")
                  : null,
              set_draft_by_name: xDetail.data.set_draft_by_name,
              set_draft_at:
                xDetail.data.set_draftAt != null
                  ? moment(xDetail.data.set_draftAt).format(
                      "DD-MM-YYYY HH:mm:ss"
                    )
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
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;
      }

      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xEncId = pParam.id;
          xDecId = await _utilInstance.decrypt(
            pParam.id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.id = xDecId.decrypted;
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
          } else {
            xJoResult = xDecId;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Submit failed, param id not found",
        };
      }

      if (xFlagProcess) {
        let xDocDetail = await _repoInstance.getById(pParam);

        if (xDocDetail.status_code == "00") {
          // Check if document owned by logged_employee_id
          if (
            xDocDetail.data.created_by == pParam.logged_user_id ||
            pParam.is_admin == 1
          ) {
            if (xDocDetail.data.status != 0) {
              xJoResult = {
                status_code: "-99",
                status_msg: "This data already processed",
              };
            } else {
              let xParamUpdate = {
                id: pParam.id,
                status: xStatusDocument,
                submitedAt: await _utilInstance.getCurrDateTime(),
                submited_by: pParam.logged_user_id,
                submited_by_name: pParam.logged_user_name,
              };
              let xResultUpdate = await _repoInstance.save(
                xParamUpdate,
                "update"
              );
              if (xResultUpdate.status_code == "00") {
                // Add Approval Matrix
                var xParamAddApprovalMatrix = {
                  act: "fetch_matrix",
                  document_id: xEncId,
                  document_no: xDocDetail.data.audit_no,
                  application_id: config.applicationId,
                  table_name:
                    config.approvalMatrixConfig.tableName.auditDocument,
                  company_id: xDocDetail.data.company_id,
                  // department_id: xDocDetail.data.department_id,
                };

                var xApprovalMatrixResult =
                  await _oAuthServiceInstance.addApprovalMatrix(
                    pParam.method,
                    pParam.token,
                    xParamAddApprovalMatrix
                  );
                if (xApprovalMatrixResult.status_code == "00") {
                  let xArrApprover = [];
                  for (
                    let i = 0;
                    i < xApprovalMatrixResult.approvers.length;
                    i++
                  ) {
                    for (
                      let j = 0;
                      j <
                      xApprovalMatrixResult.approvers[i].approver_user.length;
                      j++
                    ) {
                      xArrApprover.push(
                        Number(
                          xApprovalMatrixResult.approvers[i].approver_user[j]
                            .employee_id
                        )
                      );
                    }
                  }

                  let xParamUpdateApproverId = {
                    id: xDocDetail.data.id,
                    approver_ids: xArrApprover,
                  };

                  let xResultUpdateApproverId = await _repoInstance.save(
                    xParamUpdateApproverId,
                    "update"
                  );
                  if (xResultUpdateApproverId.status_code == "00") {
                    //   let xParamDetailUpdate = {
                    //     id: pParam.id,
                    //     // request_no: xReqNo,
                    //     status_request: xStatusDocument,
                    //     submitedAt: await _utilInstance.getCurrDateTime(),
                    //   };
                    //   let xResultDetailUpdate = await _documentDetailRepo.save(
                    //     xParamDetailUpdate,
                    //     "update_from_header"
                    //   );
                  }
                  xJoResult = xResultUpdate;
                  xJoResult.approval_matrix_result = xApprovalMatrixResult;
                } else {
                  xParamUpdate.id = xDocDetail.data.id;
                  xParamUpdate.status = 0;
                  xParamUpdate.submitedAt = null;
                  xParamUpdate.submited_by = null;
                  xParamUpdate.submited_by_name = null;

                  await _repoInstance.save(xParamUpdate, "update");
                  xJoResult = xApprovalMatrixResult;
                }
              } else {
                xJoResult = xResultUpdate;
              }
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "You not allowed to submit this data",
            };
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

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;
      }

      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xEncId = pParam.id;
          xDecId = await _utilInstance.decrypt(
            pParam.id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.id = xDecId.decrypted;
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
          } else {
            xJoResult = xDecId;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Cancel failed, param id not found",
        };
      }

      if (xFlagProcess) {
        let xDetail = await _repoInstance.getById(pParam);
        // console.log(`>>> xDetail: ${JSON.stringify(xDetail.data.employee_id)}, ${JSON.stringify(pParam.logged_user_id)}, ${JSON.stringify(pParam.is_admin)}`);
        if (xDetail.status_code == "00") {
          let xParamUpdate = {
            id: pParam.id,
            cancel_note: pParam.note,
            cancelAt: await _utilInstance.getCurrDateTime(),
            cancel_by: pParam.logged_user_id,
            cancel_by_name: pParam.logged_user_name,
            status: 4,
          };
          // console.log(`>>> pParam cancel : ${JSON.stringify(pParam.is_admin)}`);
          // cannot cancel if status already finish
          if (xDetail.data.status != 3) {
            // check if item status there are already processed
            const xGetItemList = await _auditRepo.list(
              {
                audit_id: pParam.id,
              },
              "check"
            );
            const xCheckItemAudit =
              xGetItemList.rows.find(
                ({ status }) => status == 1 || status == 2 //status progress and verified
              ) != undefined;
            // console.log(
            //   `>>> xCheckItemAudit : ${JSON.stringify(xCheckItemAudit)}`
            // );
            if (!xCheckItemAudit) {
              if (
                xDetail.data.created_by == pParam.logged_user_id ||
                pParam.is_admin == 1
              ) {
                xJoResult = await _repoInstance.save(xParamUpdate, "update");
              } else {
                xJoResult = {
                  status_code: "-99",
                  status_msg: "You have no right to cancel this document",
                };
              }
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg:
                  "Document cannot be canceled, there are already processed item",
              };
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Document cannot be canceled",
            };
          }
        } else {
          xJoResult = xDetail;
        }
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.cancelBeforeSubmit`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.cancelBeforeSubmit>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async setToDraft(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;
      }

      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xEncId = pParam.id;
          xDecId = await _utilInstance.decrypt(
            pParam.id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.id = xDecId.decrypted;
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
          } else {
            xJoResult = xDecId;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Set to draft failed, param id not found",
        };
      }

      if (xFlagProcess) {
        let xDetail = await _repoInstance.getById(pParam);
        if (xDetail.status_code == "00") {
          if (
            xDetail.data.created_by == pParam.logged_user_id ||
            pParam.is_admin == 1
          ) {
            if (xDetail.data.status == 4 || xDetail.data.status == 5) {
              let xParamUpdate = {
                id: pParam.id,
                status: 0,
                set_draftAt: await _utilInstance.getCurrDateTime(),
                set_draft_by: pParam.logged_user_id,
                set_draft_by_name: pParam.logged_user_name,
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

  async approve(pParam) {
    var xJoResult;
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";
    var xStatusRequest = 2;

    try {
      if (pParam.hasOwnProperty("document_id")) {
        if (pParam.document_id != "") {
          xEncId = pParam.document_id;
          xDecId = await _utilInstance.decrypt(
            pParam.document_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.id = xDecId.decrypted;
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
          } else {
            xJoResult = xDecId;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Approve failed, param id not found",
        };
      }

      if (xFlagProcess) {
        xFlagProcess = false;

        let xDetail = await _repoInstance.getById(pParam);
        if (xDetail.status_code == "00") {
          // if (xFlagProcess) {
          if (xDetail.data.status == 1) {
            var xParamApprovalMatrixDocument = {
              document_id: xEncId,
              status: 1,
              application_id: config.applicationId,
              table_name: config.approvalMatrixConfig.tableName.auditDocument,
              note: pParam.note,
            };

            // console.log(`_____________>>> xParamApprovalMatrixDocument: ${JSON.stringify(xParamApprovalMatrixDocument)}`);
            var xResultApprovalMatrixDocument =
              await _oAuthServiceInstance.confirmApprovalMatrix(
                pParam.method,
                pParam.token,
                xParamApprovalMatrixDocument
              );
            // console.log(`_____________>>> xResultApprovalMatrixDocument: ${JSON.stringify(xResultApprovalMatrixDocument)}`);

            if (xResultApprovalMatrixDocument != null) {
              if (xResultApprovalMatrixDocument.status_code == "00") {
                if (
                  xResultApprovalMatrixDocument.status_document_approved == true
                ) {
                  // ----------------------------
                  let xParamUpdate = {
                    id: xDetail.data.id,
                    // confirmed_note: pParam.note,
                    // confirmedAt: await _utilInstance.getCurrDateTime(),
                    // confirmed_by: pParam.logged_user_id,
                    // confirmed_by_name: pParam.logged_user_name,
                    status: xStatusRequest,
                  };
                  xJoResult = await _repoInstance.save(xParamUpdate, "update");

                  // -------------------------------------------------
                } else {
                  // Sort first
                  xResultApprovalMatrixDocument.approvers =
                    xResultApprovalMatrixDocument.approvers.sort((a, b) => {
                      if (a.sequence < b.sequence) {
                        return -1;
                      }
                    });

                  xJoResult = {
                    status_code: "00",
                    status_msg:
                      "Document successfully approved. Document available for next approver",
                    result_approval_matrix: xResultApprovalMatrixDocument,
                  };
                }
              } else {
                xJoResult = xResultApprovalMatrixDocument;
              }
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg:
                  "There is problem on approval matrix processing. Please try again",
              };
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "You cannot approve this document",
            };
          }
          // }
        } else {
          xJoResult = xDetail;
        }
      } else {
        xJoResult = xDecId;
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.approve`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.approve>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async reject(pParam) {
    var xJoResult;
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";
    var xStatusRequest = 5;

    try {
      if (pParam.hasOwnProperty("document_id")) {
        if (pParam.document_id != "") {
          xEncId = pParam.document_id;
          xDecId = await _utilInstance.decrypt(
            pParam.document_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.id = xDecId.decrypted;
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
          } else {
            xJoResult = xDecId;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Reject failed, param id not found",
        };
      }

      if (xFlagProcess) {
        xFlagProcess = false;

        let xDetail = await _repoInstance.getById(pParam);
        // console.log(`>>> xDetail: ${JSON.stringify(xDetail)}`);
        if (xDetail.status_code == "00") {
          // if (xFlagProcess) {
          if (xDetail.data.status == 1) {
            var xParamApprovalMatrixDocument = {
              document_id: xEncId,
              status: -1,
              application_id: config.applicationId,
              table_name: config.approvalMatrixConfig.tableName.auditDocument,
              note: pParam.note,
            };

            var xResultApprovalMatrixDocument =
              await _oAuthServiceInstance.confirmApprovalMatrix(
                pParam.method,
                pParam.token,
                xParamApprovalMatrixDocument
              );

            if (xResultApprovalMatrixDocument != null) {
              if (xResultApprovalMatrixDocument.status_code == "00") {
                let xParamUpdate = {
                  id: pParam.id,
                  // confirmed_note: pParam.note,
                  // confirmed_at: await _utilInstance.getCurrDateTime(),
                  // confirmed_by: pParam.logged_user_id,
                  // confirmed_by_name: pParam.logged_user_name,
                  status: xStatusRequest,
                };
                xJoResult = await _repoInstance.save(xParamUpdate, "update");
              } else {
                xJoResult = xResultApprovalMatrixDocument;
              }
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg:
                  "There is problem on approval matrix processing. Please try again",
              };
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "You cannot reject this document",
            };
          }
          // }
        } else {
          xJoResult = xDetail;
        }
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.reject`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.approvalLeader>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async done(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;
      }
      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xEncId = pParam.id;
          xDecId = await _utilInstance.decrypt(
            pParam.id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.id = xDecId.decrypted;
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
          } else {
            xJoResult = xDecId;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Set to draft failed, param id not found",
        };
      }

      if (xFlagProcess) {
        let xDetail = await _repoInstance.getById(pParam);
        if (xDetail.status_code == "00") {
          if (
            xDetail.data.created_by == pParam.logged_user_id ||
            pParam.is_admin == 1
          ) {
            if (xDetail.data.status == 2) {
              let xParamUpdate = {
                id: pParam.id,
                status: 3,
                finish_at: await _utilInstance.getCurrDateTime(),
              };
              xJoResult = await _repoInstance.save(xParamUpdate, "update");
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "You can not finish this document.",
              };
            }
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: "You not allowed finish this document",
            };
          }
        } else {
          xJoResult = xDetail;
        }
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.done`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.done>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async generateFormAudit(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;
      }
      if (pParam.hasOwnProperty("audit_id")) {
        if (pParam.audit_id != "") {
          xEncId = pParam.audit_id;
          xDecId = await _utilInstance.decrypt(
            pParam.audit_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.audit_id = xDecId.decrypted;
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
          } else {
            xJoResult = xDecId;
          }
        }
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Generate form failed, param id not found",
        };
      }

      if (xFlagProcess) {
        let xGenerateFormResult = await _repoInstance.generateFormAudit(pParam);

        xJoResult = xGenerateFormResult;
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.generateFormAudit`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.generateFormAudit>: ${e.message}`,
      };
    }

    return xJoResult;
  }

  async fetchMatrix(pParam) {
    var xJoResult = {};
    var xDecId = null;
    var xFlagProcess = false;
    var xEncId = "";
    var xClearId = "";

    try {
      let xLevel = pParam.logged_user_level.find(
        (el) =>
          el.application.id === config.applicationId || el.application.id === 1
      );

      // console.log(`>>> xLevel.is_admin`,xLevel.is_admin);
      if (xLevel) {
        pParam.is_admin = xLevel.is_admin;
      }
      if (pParam.id != "" && pParam.user_id != "") {
        xDecId = await _utilInstance.decrypt(
          pParam.id,
          config.cryptoKey.hashKey
        );
        if (xDecId.status_code == "00") {
          xFlagProcess = true;
          xEncId = pParam.id;
          pParam.id = xDecId.decrypted;
          xClearId = xDecId.decrypted;
          xDecId = await _utilInstance.decrypt(
            pParam.user_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.user_id = xDecId.decrypted;
            xFlagProcess = true;
          } else {
            xJoResult = xDecId;
          }
        } else {
          xJoResult = xDecId;
        }
      }

      if (xFlagProcess) {
        // Get PR Detail
        var xDocDetail = await _repoInstance.getById({ id: xClearId });
        // console.log(`>>> xDocDetail: ${JSON.stringify(xDocDetail)}`);
        if (xDocDetail != null) {
          if (xDocDetail.status_code == "00") {
            if (
              xDetail.data.created_by == pParam.logged_user_id ||
              pParam.is_admin == 1
            ) {
              if (xDocDetail.data.status != 1) {
                xJoResult = {
                  status_code: "-99",
                  status_msg:
                    "Fetch matrix cannot be processed, please check again",
                };
              } else {
                // Next Phase : Approval Matrix & Notification to admin
                // Fetch Approval Matrix
                var xParamAddApprovalMatrix = {
                  act: "fetch_matrix",
                  document_id: xEncId,
                  document_no: xDocDetail.data.audit_no,
                  application_id: config.applicationId,
                  table_name:
                    config.approvalMatrixConfig.tableName.auditDocument,
                  company_id: xDocDetail.data.company_id,
                };

                var xApprovalMatrixResult =
                  await _oAuthServiceInstance.addApprovalMatrix(
                    pParam.method,
                    pParam.token,
                    xParamAddApprovalMatrix
                  );
                if (xApprovalMatrixResult.status_code == "00") {
                  let xArrApprover = [];
                  for (
                    let i = 0;
                    i < xApprovalMatrixResult.approvers.length;
                    i++
                  ) {
                    for (
                      let j = 0;
                      j <
                      xApprovalMatrixResult.approvers[i].approver_user.length;
                      j++
                    ) {
                      xArrApprover.push(
                        Number(
                          xApprovalMatrixResult.approvers[i].approver_user[j]
                            .employee_id
                        )
                      );
                    }
                  }

                  const xUpdateParam = {
                    id: xClearId,
                    approved_at: null,
                    approver_ids: xArrApprover,
                  };

                  var xUpdateResult = await _repoInstance.save(
                    xUpdateParam,
                    "update"
                  );
                  // console.log(`>>> xUpdateResult: ${JSON.stringify(xUpdateResult)}`);
                  xJoResult = xUpdateResult;
                  xJoResult.approval_matrix_result = xApprovalMatrixResult;
                } else {
                  xJoResult = xApprovalMatrixResult;
                }
              }
            } else {
              xJoResult = {
                status_code: "-99",
                status_msg: "You can not fetch matrix document",
              };
            }
          } else {
            xJoResult = xDocDetail;
          }
        } else {
          xJoResult = {
            status_code: "-99",
            status_msg: "Data not found. Please supply valid identifier",
          };
        }
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.fetchMatrix`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Exception error <${_xClassName}.fetchMatrix>: ${e.message}`,
      };
    }
    return xJoResult;
  }
  async calculateResultV4(data, member) {
    const grouped = member.map((m) => {
      const memberAreas = m.area_ids;
      const memberData = data.filter(item =>
        memberAreas.includes(item.area.id) && item.status !== 3 // <-- ini kuncinya
      );
      // const memberData = data.filter((d) => m.area_ids.includes(d.area.id));

      const categoryMap = {};

      // Group by category -> clause_id
      memberData.forEach((item) => {
        const categoryKey = item.clause_category_id;
        const clauseKey = item.clause_id;

        if (!categoryMap[categoryKey]) {
          categoryMap[categoryKey] = {
            category: item.clause_category_name,
            category_id: item.clause_category_id,
            clauses: {},
          };
        }

        if (!categoryMap[categoryKey].clauses[clauseKey]) {
          categoryMap[categoryKey].clauses[clauseKey] = [];
        }

        categoryMap[categoryKey].clauses[clauseKey].push(item.score_value);
      });

      const categories = Object.values(categoryMap).map(
        ({ category, category_id, clauses }) => {
          const clauseAverages = Object.values(clauses).map((scores) => {
            return scores.reduce((sum, val) => sum + val, 0) / scores.length;
          });

          const total_per_category = clauseAverages.reduce(
            (sum, val) => sum + val,
            0
          );
          const average_per_category =
            clauseAverages.length > 0
              ? total_per_category / clauseAverages.length
              : 0;

          return {
            category,
            category_id,
            total_per_category: parseFloat(total_per_category.toFixed(2)),
            average_per_category: parseFloat(average_per_category.toFixed(2)),
          };
        }
      );
      // console.log(`>>> memberData: ${JSON.stringify(categoryMap)}`);

      const grand_total = categories.reduce(
        (sum, c) => sum + c.total_per_category,
        0
      );
      return {
        employee_name: m.employee_name,
        employee_id: m.employee_id,
        employee_code: m.employee_code,
        categories: categories.sort(
          (a, b) => b.total_per_category - a.total_per_category
        ),
        total: parseFloat(grand_total.toFixed(2)),
      };
    });

    // for (let i = 0; i < grouped.length; i++) {
    //   if (grouped[i].employee_name == "Rolan Trigara") {
    //     console.log(`>>> grouped: ${JSON.stringify(grouped[i])}`);
    //   }
    // }
    return grouped;
  }
  async calculateResultV5(data, member) {
    const grouped = member.map((m) => {
      const memberAreas = m.area_ids;
      const memberData = data.filter(item =>
        memberAreas.includes(item.area.id) && item.status !== 3 // <-- ini kuncinya
      );
      // const memberData = data.filter((d) => m.area_ids.includes(d.area.id));

      const categoryMap = {};

      // Group by category -> clause_id
      memberData.forEach((item) => {
        const categoryKey = item.clause_category_id;
        const clauseKey = item.clause_id;

        if (!categoryMap[categoryKey]) {
          categoryMap[categoryKey] = {
            category: item.clause_category_name,
            category_id: item.clause_category_id,
            clauses: {},
          };
        }

        if (!categoryMap[categoryKey].clauses[clauseKey]) {
          categoryMap[categoryKey].clauses[clauseKey] = [];
        }

        let score = 0;
        if (typeof item.score_value !== 'undefined' && item.score_value !== null) {
          score = item.score_value;
        } else if (item.score && typeof item.score.value !== 'undefined') {
          score = item.score.value;
        }

        const multiplier = item.score_multiplier != null ? item.score_multiplier : 1
        categoryMap[categoryKey].clauses[clauseKey].push(score * multiplier);
      });

      const categories = Object.values(categoryMap).map(
        ({ category, category_id, clauses }) => {
          const clauseAverages = Object.values(clauses).map((scores) => {
            const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
            return avg;
          });

          const total_per_category = clauseAverages.reduce(
            (sum, val) => sum + val,
            0
          );
          const average_per_category =
            clauseAverages.length > 0
              ? total_per_category / clauseAverages.length
              : 0;

          return {
            category,
            category_id,
            total_per_category: parseFloat(total_per_category.toFixed(2)),
            average_per_category: parseFloat(average_per_category.toFixed(2)),
          };
        }
      );
      // console.log(`>>> memberData: ${JSON.stringify(categoryMap)}`);
      const grand_total = categories.reduce(
        (sum, c) => sum + c.total_per_category,
        0
      );
      return {
        employee_name: m.employee_name,
        employee_id: m.employee_id,
        employee_code: m.employee_code,
        categories: categories.sort(
          (a, b) => b.total_per_category - a.total_per_category
        ),
        total: parseFloat(grand_total.toFixed(2)),
      };
    });

    return grouped;
  }
}

module.exports = AuditService;
