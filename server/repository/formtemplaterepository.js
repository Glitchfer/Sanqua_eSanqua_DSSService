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
const _modelDb = require("../models").ms_formtemplates;
const _modelFormTemplateItem = require("../models").tr_formtemplateitems;
const _modelClause = require("../models").ms_clauses;
const _modelArea = require("../models").ms_areas;
const _modelAuditType = require("../models").ms_audittypes;
const _modelClauseCategory = require("../models").ms_clausecategories;
const _modelScope = require("../models").ms_scopes;

const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const _xClassName = "FormTemplate";
const dateTime = require("node-datetime");

class FormTemplate {
  constructor() {}

  async getById(pParam) {
    var xInclude = [];
    var xWhereOr = [];
    var xWhereAnd = [];
    var xWhere = [];
    var xAttributes = [];
    var xJoResult = {};

    try {
      xInclude = [
        {
          model: _modelFormTemplateItem,
          as: "form_template_item",
          attributes: ["id"],
          include: [
            {
              model: _modelClause,
              as: "clause",
              attributes: ["id", "description", "clause_no", "reference"],
              include: [
                {
                  model: _modelClauseCategory,
                  as: "clause_category",
                  attributes: ["id", "name"],
                },
              ],
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
          ],
        },
        {
          model: _modelAuditType,
          as: "audit_type",
          attributes: ["id", "name"],
        },
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
        status_msg: `Get data ${_xClassName}.getById Error : ${e.message}`,
      };
    }

    return xJoResult;
  }

  async list(pParam) {
    // var xOrder = [ sequelize.col('employee.name', 'asc') ];
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

      if (pParam.hasOwnProperty("department_id")) {
        if (pParam.department_id != "") {
          xWhereAnd.push({
            department_id: pParam.department_id,
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

      if (pParam.hasOwnProperty("keyword")) {
        if (pParam.keyword != "") {
          xWhereOr.push({
            name: {
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
        order: xOrder,
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
      if (xData) {
        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xData,
          total_record: xCountDataWithoutLimit,
        };
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
        status_msg: `Get data ${_xClassName}.list Error : ${e.message}`,
      };
    }

    return xJoResult;
  }

  async save(pParam, pAct) {
    let xTransaction;
    var xJoResult = {};
    var xInclude = {};

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();

      if (pAct == "add") {
        pParam.status = 1;
        pParam.is_delete = 0;

        xInclude = {
          include: [
            {
              model: _modelFormTemplateItem,
              as: "form_template_item",
            },
          ],
        };

        xSaved = await _modelDb.create(pParam, xInclude, {
          xTransaction,
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
          };
        } else {
          if (xTransaction) await xTransaction.rollback();

          xJoResult = {
            status_code: "-99",
            status_msg: "Failed save to database",
          };
        }
      } else if (pAct == "update") {
        pParam.updatedAt = await _utilInstance.getCurrDateTime();
        var xId = pParam.id;
        delete pParam.id;
        var xWhere = {
          where: {
            id: xId,
          },
        };
        xSaved = await _modelDb.update(pParam, xWhere, {
          xTransaction,
        });

        await xTransaction.commit();

        xJoResult = {
          status_code: "00",
          status_msg: "Data has been successfully updated",
        };
      }
    } catch (e) {
      if (xTransaction) await xTransaction.rollback();
      xJoResult = {
        status_code: "-99",
        status_msg: `Save or update [${_xClassName}.save] Error : ${e.message}`,
      };
    }

    return xJoResult;
  }

  async isDataExists(pName, pFilter) {
    var xWhere = [];
    xWhere.push({ name: pName });
    xWhere.push({ is_delete: 0 });

    if (pFilter) {
      if (pFilter.length > 0) {
        for (var i in pFilter) {
          xWhere.push(pFilter[i]);
        }
      }
    }

    var data = await _modelDb.findOne({
      where: xWhere,
    });

    return data;
  }

  async archive(pParam) {
    let xTransaction;
    var xJoResult = {};

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();

      xSaved = await _modelDb.update(
        pParam,
        {
          where: {
            id: pParam.id,
          },
        },
        { xTransaction }
      );

      await xTransaction.commit();

      xJoResult = {
        status_code: "00",
        status_msg:
          "Data has been successfully " +
          (pParam.is_delete == 1 ? "archived" : "unarchived"),
      };
    } catch (e) {
      if (xTransaction) await xTransaction.rollback();
      xJoResult = {
        status_code: "-99",
        status_msg: `Archive data [${_xClassName}.Archive] Error : ${e.message}`,
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

      xSaved = await _modelDb.destroy(
        {
          where: {
            id: pParam.id,
          },
        },
        { xTransaction }
      );

      await xTransaction.commit();

      xJoResult = {
        status_code: "00",
        status_msg: "Data has been successfully deleted",
      };
    } catch (e) {
      if (xTransaction) await xTransaction.rollback();
      xJoResult = {
        status_code: "-99",
        status_msg: `Delete [${_xClassName}.delete] Error : ${e.message}`,
      };
    }
    return xJoResult;
  }

  async listItem(pParam) {
    // var xOrder = [ sequelize.col('employee.name', 'asc') ];
    var xOrder = ["createdAt"];
    var xWhere = [];
    var xWhereOr = [];
    var xWhereAnd = [];
    var xInclude = [];
    var xJoResult = {};

    try {
      xInclude = [
        {
          model: _modelDb,
          as: "form_template",
          attributes: [
            "id",
            "name",
            "company_id",
            "company_name",
            "department_id",
            "department_name",
          ],
          include: [
            {
              model: _modelAuditType,
              as: "audit_type",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: _modelClause,
          as: "clause",
          attributes: ["id", "description", "clause_no", "reference"],
          include: [
            {
              model: _modelClauseCategory,
              as: "clause_category",
              attributes: ["id", "name"],
            },
          ],
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

      if (pParam.hasOwnProperty("area_id")) {
        if (pParam.area_id != "") {
          xWhereAnd.push({
            area_id: pParam.area_id,
          });
        }
      }

      if (pParam.hasOwnProperty("scope_id")) {
        if (pParam.scope_id != "") {
          xWhereAnd.push({
            scope_id: pParam.scope_id,
          });
        }
      }

      if (pParam.hasOwnProperty("form_template_id")) {
        if (pParam.form_template_id != "") {
          xWhereAnd.push({
            form_template_id: pParam.form_template_id,
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
        order: xOrder,
        include: xInclude,
        subQuery: false,
      };

      var xCountDataWithoutLimit = await _modelFormTemplateItem.count(
        xParamQuery
      );

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

      var xData = await _modelFormTemplateItem.findAndCountAll(xParamQuery);
      if (xData) {
        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xData,
          total_record: xCountDataWithoutLimit,
        };
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
        status_msg: `Get data ${_xClassName}.list Error : ${e.message}`,
      };
    }

    return xJoResult;
  }
  async saveItem(pParam, pAct) {
    let xTransaction;
    var xJoResult = {};
    var xInclude = {};

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();

      if (pAct == "add") {
        pParam.status = 1;
        pParam.is_delete = 0;

        xSaved = await _modelFormTemplateItem.create(pParam, {
          xTransaction,
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
          };
        } else {
          if (xTransaction) await xTransaction.rollback();

          xJoResult = {
            status_code: "-99",
            status_msg: "Failed save to database",
          };
        }
      } else if (pAct == "update") {
        pParam.updatedAt = await _utilInstance.getCurrDateTime();
        var xId = pParam.id;
        delete pParam.id;
        var xWhere = {
          where: {
            id: xId,
          },
        };
        xSaved = await _modelFormTemplateItem.update(pParam, xWhere, {
          xTransaction,
        });

        await xTransaction.commit();

        xJoResult = {
          status_code: "00",
          status_msg: "Data has been successfully updated",
        };
      }
    } catch (e) {
      if (xTransaction) await xTransaction.rollback();
      xJoResult = {
        status_code: "-99",
        status_msg: `Save or update [${_xClassName}.saveItem] Error : ${e.message}`,
      };
    }

    return xJoResult;
  }

  async deleteItem(pParam) {
    let xTransaction;
    var xJoResult = {};

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();

      xSaved = await _modelFormTemplateItem.destroy(
        {
          where: {
            id: pParam.id,
          },
        },
        { xTransaction }
      );

      await xTransaction.commit();

      xJoResult = {
        status_code: "00",
        status_msg: "Data has been successfully deleted",
      };
    } catch (e) {
      if (xTransaction) await xTransaction.rollback();
      xJoResult = {
        status_code: "-99",
        status_msg: `Delete [${_xClassName}.deleteItem] Error : ${e.message}`,
      };
    }
    return xJoResult;
  }

  async generateItem(pParam) {
    console.log(`>>> pParam: ${JSON.stringify(pParam)}`);
    var xJoResult = {};
    try {
      var xSql = "";
      xSql = `SELECT * FROM func_generate_template_item('{
                "id":"${pParam.id}",
                "created_by": ${pParam.created_by},
                "created_by_name": "${pParam.created_by_name}"
            }'::json);`;
      // console.log("SQL_FUNCTION>>>>>", xSql);

      var xDtQuery = await sequelize.query(xSql, {
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(`>>> xDtQuery: ${JSON.stringify(xDtQuery)}`);
      if (xDtQuery.length > 0) {
        console.log(`>>> xDtQuery: ${JSON.stringify(xDtQuery)}`);
        if (xDtQuery[0].func_generate_template_item.status_code == "00") {
          xJoResult = {
            status_code: xDtQuery[0].func_generate_template_item.status_code,
            status_msg: xDtQuery[0].func_generate_template_item.status_msg,
            data: xDtQuery[0].func_generate_template_item.data,
          };
        } else {
          xJoResult = xDtQuery[0].func_generate_template_item;
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

module.exports = FormTemplate;
