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
const _modelDb = require("../models").tr_audititemscores;
const _modelAudit = require("../models").tr_audits;
const _modelAuditType = require("../models").ms_audittypes;
const _modelArea = require("../models").ms_areas;
const _modelScope = require("../models").ms_scopes;
const _modelClause = require("../models").ms_clauses;

const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const _xClassName = "AuditRepository";

class AuditRepository {
  constructor() {}
  async save(pParam, pAct) {
    var xJoResult = {};
    let xTransaction;
    var xSaved = null;
    var xJoinedTable = [];

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();
      xJoinedTable = {};

      if (pAct == "update") {
        // console.log(`>>> pParam: ${JSON.stringify(pParam)}`);
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

  async list(pParam, pAct) {
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
          model: _modelAudit,
          as: "audit",
          attributes: ["name", "audit_no", "status"],
        },
        {
          model: _modelAuditType,
          as: "audit_type",
          attributes: ["id", "name"],
        },
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
      ];

      if (pParam.hasOwnProperty("audit_id")) {
        if (pParam.audit_id != "") {
          xWhereAnd.push({
            audit_id: pParam.audit_id,
          });
        }
      }

      if (pParam.hasOwnProperty("area_id")) {
        if (pParam.area_id != "") {
          xWhereAnd.push({
            clause_area_id: pParam.area_id,
          });
        }
      }

      if (pParam.hasOwnProperty("scope_id")) {
        if (pParam.scope_id != "") {
          xWhereAnd.push({
            clause_scope_id: pParam.scope_id,
          });
        }
      }

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            clause_company_id: pParam.company_id,
          });
        }
      }

      if (pParam.hasOwnProperty("category_id")) {
        if (pParam.category_id != "") {
          xWhereAnd.push({
            clause_category_id: pParam.category_id,
          });
        }
      }

      if (pParam.hasOwnProperty("score_id")) {
        if (pParam.score_id != "") {
          xWhereAnd.push({
            score_id: pParam.score_id,
          });
        }
      }

      if (pParam.hasOwnProperty("audit_type_id")) {
        if (pParam.audit_type_id != "") {
          xWhereAnd.push({
            clause_audit_type_id: pParam.audit_type_id,
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
            corrective_plan_desc: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            clause_no: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            clause_desc: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            verification_note: {
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

      if (pAct == "check") {
        xJoResult = xData;
      } else {
        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xData,
          total_record: xCountDataWithoutLimit,
        };
      }
    } catch (e) {
      _utilInstance.writeLog(
        `${_xClassName}.list`,
        `Exception error: ${e.message}`,
        "error"
      );

      if (pAct == "check") {
        xJoResult = null;
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: `Failed get data. Error : ${e.message}`,
        };
      }
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
      ];

      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xWhereAnd.push({
            id: pParam.id,
          });
        }
      }

      if (pParam.hasOwnProperty("audit_id")) {
        if (pParam.audit_id != "") {
          xWhereAnd.push({
            audit_id: pParam.audit_id,
          });
        }
      }

      if (pParam.hasOwnProperty("area_id")) {
        if (pParam.area_id != "") {
          xWhereAnd.push({
            clause_area_id: pParam.area_id,
          });
        }
      }

      if (pParam.hasOwnProperty("scope_id")) {
        if (pParam.scope_id != "") {
          xWhereAnd.push({
            clause_scope_id: pParam.scope_id,
          });
        }
      }

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            clause_company_id: pParam.company_id,
          });
        }
      }

      if (pParam.hasOwnProperty("category_id")) {
        if (pParam.category_id != "") {
          xWhereAnd.push({
            clause_category_id: pParam.category_id,
          });
        }
      }

      if (pParam.hasOwnProperty("score_id")) {
        if (pParam.score_id != "") {
          xWhereAnd.push({
            score_id: pParam.score_id,
          });
        }
      }

      if (pParam.hasOwnProperty("audit_type_id")) {
        if (pParam.audit_type_id != "") {
          xWhereAnd.push({
            clause_audit_type_id: pParam.audit_type_id,
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
      // console.log(`>>> xData: ${JSON.stringify(xData)}`);

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
}

module.exports = AuditRepository;
