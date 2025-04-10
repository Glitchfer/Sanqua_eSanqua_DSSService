var env = process.env.NODE_ENV || "localhost";
var configEnv = require(__dirname + "/../config/config.json")[env];
var Sequelize = require("sequelize");
var sequelize = new Sequelize(
  configEnv.database,
  configEnv.username,
  configEnv.password,
  configEnv
);
const { hash } = require("bcryptjs");
const Op = Sequelize.Op;

// Model
const _modelDb = require("../models").tr_audits;
const _modelAuditItemScore = require("../models").tr_audititemscores;
const _modelAuditMember = require("../models").tr_auditmembers;
const _modelAuditType = require("../models").ms_audittypes;
const _modelArea = require("../models").ms_areas;
const _modelScope = require("../models").ms_scopes;
// const _modelEmployee = require('../models').ms_employees;
// const _modelPayrollTemplate = require('../models').ms_payrolltemplates;
// const _modelEmployeeLevel = require('../models').ms_employeelevels;

const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const _xClassName = "AuditRepository";

class AuditRepository {
  constructor() {}

  async getById(pParam) {
    var xInclude = [];
    var xWhereOr = [];
    var xWhereAnd = [];
    var xWhere = [];
    var xOrder = [];
    var xAttributes = [];
    var xJoResult = {};

    try {
      xInclude = [
        {
          model: _modelAuditItemScore,
          as: "audit_item",
          include: [
            {
              model: _modelArea,
              as: "area",
              attributes: ["id", "name"],
            },
            {
              model: _modelScope,
              as: "scope",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: _modelAuditMember,
          as: "audit_member",
          // attributes: ["id", "name"],
        },
        {
          model: _modelAuditType,
          as: "audit_type",
          attributes: ["id", "name"],
        },
      ];
      xOrder = [
        [{ model: _modelAuditItemScore, as: "audit_item" }, "id", "ASC"],
      ];

      xWhereAnd.push({
        id: pParam.id,
      });

      if (xWhereAnd.length > 0) {
        xWhere.push({
          [Op.and]: xWhereAnd,
        });
      }

      var xData = await _modelDb.findOne({
        where: xWhere,
        include: xInclude,
        order: xOrder,
        // subQuery: false
      });

      if (xData) {
        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xData,
        };
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
        status_msg: `Failed get data. Error : ${e.message}`,
      };
    }

    return xJoResult;
  }

  async list(pParam) {
    // var xOrder = [ sequelize.col('employee.name', 'asc') ];
    // var xOrder = [ [ sequelize.col('created_at', 'desc') ] ];
    var xOrder = ["createdAt"];
    var xWhere = [];
    var xWhereOr = [];
    var xWhereAnd = [];
    var xInclude = [];
    var xJoResult = {};

    try {
      xInclude = [
        {
          model: _modelAuditType,
          as: "audit_type",
          attributes: ["id", "name"],
        },
      ];

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            company_id: pParam.company_id,
          });
        }
      }

      if (pParam.hasOwnProperty("audit_type_id")) {
        if (pParam.audit_type_id != "") {
          xWhereAnd.push({
            audit_type_id: pParam.audit_type_id,
          });
        }
      }

      if (
        pParam.hasOwnProperty("start_date") &&
        pParam.hasOwnProperty("end_date")
      ) {
        if (pParam.start_date != "" && pParam.end_date != "") {
          xWhereAnd.push({
            audit_date: {
              [Op.between]: [
                pParam.start_date + " 00:00:00",
                pParam.end_date + " 23:59:59",
              ],
            },
          });
        }
      }

      if (pParam.hasOwnProperty("status")) {
        if (pParam.status != "") {
          xWhereAnd.push({
            status: pParam.status,
          });
        }
      }

      if (pParam.hasOwnProperty("keyword")) {
        if (pParam.keyword != "") {
          xWhereOr.push({
            name: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            audit_no: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
          });
        }
      }

      if (xWhereAnd.length > 0) {
        xWhere.push({
          [Op.and]: xWhereAnd,
        });
      }

      if (pParam.hasOwnProperty("order_by")) {
        xOrder = [
          [pParam.order_by, pParam.order_type == "desc" ? "DESC" : "ASC"],
        ];
      }

      if (xWhereOr.length > 0) {
        xWhere.push({
          [Op.or]: xWhereOr,
        });
      }

      var xParamQuery = {
        where: xWhere,
        order: [xOrder],
        include: xInclude,
        subQuery: false,
      };

      var xCountDataWithoutLimit = await _modelDb.count(xParamQuery);

      if (pParam.hasOwnProperty("offset") && pParam.hasOwnProperty("limit")) {
        if (
          pParam.offset != "" &&
          pParam.limit != "" &&
          pParam.limit != "all"
        ) {
          xParamQuery.offset = pParam.offset;
          xParamQuery.limit = pParam.limit;
        }
      }

      var xData = await _modelDb.findAndCountAll(xParamQuery);

      xJoResult = {
        status_code: "00",
        status_msg: "OK",
        data: xData,
        total_record: xCountDataWithoutLimit,
      };
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.list`,
        `Exception error: ${e.message}`,
        "error"
      );

      xJoResult = {
        status_code: "-99",
        status_msg: `Failed get data. Error : ${e.message}`,
      };
    }

    return xJoResult;
  }

  async save(pParam, pAct) {
    var xJoResult = {};
    let xTransaction;
    var xSaved = null;
    var xJoinedTable = [];

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();
      xJoinedTable = {};

      if (pAct == "add") {
        xSaved = await _modelDb.create(pParam, xJoinedTable, {
          transaction: xTransaction,
        });
        if (xSaved.id != null) {
          await xTransaction.commit();
          xJoResult = {
            status_code: "00",
            status_msg: "Data has been successfully saved",
            created_id: await _utilInstance.encrypt(
              xSaved.id.toString(),
              config.cryptoKey.hashKey
            ),
            clear_id: xSaved.id,
          };
        }
      } else if (pAct == "update") {
        var xId = pParam.id;
        delete pParam.id;
        var xWhere = {
          where: {
            id: xId,
          },
          transaction: xTransaction,
        };
        xSaved = await _modelDb.update(pParam, xWhere);

        await xTransaction.commit();

        xJoResult = {
          status_code: "00",
          status_msg: "Data has been successfully updated",
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.save`,
        `Exception error: ${e.message}`,
        "error"
      );

      if (xTransaction) await xTransaction.rollback();
      xJoResult = {
        status_code: "-99",
        status_msg: `Failed save or update data. Error : ` + e.message,
      };
    }

    return xJoResult;
  }

  async getByParam(pParam) {
    var xInclude = [];
    var xWhereOr = [];
    var xWhereAnd = [];
    var xWhere = [];
    var xAttributes = [];
    var xJoResult = {};

    try {
      xInclude = [
        {
          model: _modelAuditType,
          as: "audit_type",
          attributes: ["id", "name"],
        },
      ];

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            company_id: pParam.company_id,
          });
        }
      }

      if (pParam.hasOwnProperty("audit_type_id")) {
        if (pParam.audit_type_id != "") {
          xWhereAnd.push({
            audit_type_id: pParam.audit_type_id,
          });
        }
      }

      if (pParam.hasOwnProperty("audit_date")) {
        if (pParam.audit_date != "") {
          xWhereAnd.push({
            audit_date: pParam.audit_date,
          });
        }
      }

      if (pParam.hasOwnProperty("status")) {
        if (pParam.status != "") {
          xWhereAnd.push({
            status: pParam.status,
          });
        }
      }

      if (xWhereAnd.length > 0) {
        xWhere.push({
          [Op.and]: xWhereAnd,
        });
      }

      var xData = await _modelDb.findOne({
        where: xWhere,
        include: xInclude,
        // subQuery: false
      });
      console.log(`>>> xData: ${JSON.stringify(xData)}`);

      if (xData) {
        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xData,
        };
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
        status_msg: `Failed get data. Error : ${e.message}`,
      };
    }

    return xJoResult;
  }

  async delete(pParam) {
    let xTransaction;
    var xJoResult = {};

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();

      xSaved = await _modelDb.destroy({
        where: {
          id: pParam.id,
        },
        transaction: xTransaction,
      });

      await xTransaction.commit();

      xJoResult = {
        status_code: "00",
        status_msg: "Data has been successfully deleted",
      };

      return xJoResult;
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.delete`,
        `Exception error: ${e.message}`,
        "error"
      );
      if (xTransaction) await xTransaction.rollback();
      xJoResult = {
        status_code: "-99",
        status_msg: "Failed save or update data",
        err_msg: e,
      };

      return xJoResult;
    }
  }

  async generateFormAudit(pParam) {
    var xJoResult = {};
    try {
      var xSql = "";
      xSql = `SELECT * FROM func_generate_form_audit('{
                "audit_id":"${pParam.audit_id}",
                "audit_type_id": ${pParam.audit_type_id},
                "company_id": ${pParam.company_id},
                "created_by": ${pParam.logged_user_id},
                "created_by_name": "${pParam.logged_user_name}"
            }'::json);`;
      console.log("SQL_FUNCTION>>>>>", xSql);

      var xDtQuery = await sequelize.query(xSql, {
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(`>>> xDtQuery: ${JSON.stringify(xDtQuery)}`);
      if (xDtQuery.length > 0) {
        if (xDtQuery[0].func_generate_form_audit.status_code == "00") {
          xJoResult = {
            status_code: xDtQuery[0].func_generate_form_audit.status_code,
            status_msg: xDtQuery[0].func_generate_form_audit.status_msg,
            data: xDtQuery[0].func_generate_form_audit.data,
          };
        } else {
          xJoResult = xDtQuery[0].func_generate_form_audit;
        }
      }
    } catch (e) {
      // console.log('xDtQuery>>>>>', e);
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
}

module.exports = AuditRepository;
