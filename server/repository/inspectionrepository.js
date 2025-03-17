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
const _modelDb = require("../models").tr_inspections;
const _modelIntialReport = require("../models").tr_initialreports;
const _modelDamagedObject = require("../models").tr_damagedobjects;
const _modelObjectCategory = require("../models").ms_objectcategories;
const _modelAccidentItemDesc = require("../models").tr_accidentitemdescs;
const _modelDescCategory = require("../models").ms_desccategories;
const _modelAccidentClassification = require("../models").ms_accidentclassifications;
const _modelDangerCondition = require("../models").ms_dangerconditions;
const _modelDangerAction = require("../models").ms_dangeractions;
const _modelAccidentSource = require("../models").ms_accidentsources;
const _modelAccidentType = require("../models").ms_accidenttypes;

const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const _xClassName = "InspectionRepository";

class InspectionRepository {
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
          model: _modelIntialReport,
          as: "initial_report",
          attributes: ["document_no", "company_id", "company_name", "status"],
        },
        {
          model: _modelAccidentItemDesc,
          as: "accident_item_desc",
          include: [
            {
              model: _modelDescCategory,
              as: "desc_category",
              attributes: ["id", "name"],
            }
          ]
        },
        {
          model: _modelDamagedObject,
          as: "damaged_object",
          include: [
            {
              model: _modelObjectCategory,
              as: "object_category",
              attributes: ["id", "name"],
            }
          ]
        },
        {
          model: _modelAccidentClassification,
          as: "accident_classification",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelDangerCondition,
          as: "danger_condition",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelDangerAction,
          as: "danger_action",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelAccidentSource,
          as: "accident_source",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelAccidentType,
          as: "accident_type",
          attributes: ["id", "name", "code", "description"]
        }
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
          model: _modelIntialReport,
          as: "initial_report",
          attributes: ["document_no", "company_id", "company_name", "status"],
        },
        {
          model: _modelAccidentClassification,
          as: "accident_classification",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelDangerCondition,
          as: "danger_condition",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelDangerAction,
          as: "danger_action",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelAccidentSource,
          as: "accident_source",
          attributes: ["id", "name", "code", "description"]
        },
        {
          model: _modelAccidentType,
          as: "accident_type",
          attributes: ["id", "name", "code", "description"]
        }
      ];

      if (pParam.hasOwnProperty("initialreport_id")) {
        if (pParam.initialreport_id != "") {
          xWhereAnd.push({
            initialreport_id: pParam.initialreport_id,
          });
        }
      }

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            '$initial_report.company_id$': pParam.company_id,
          });
        }
      }

      if (pParam.hasOwnProperty("accident_classification_id")) {
        if (pParam.accident_classification_id != "") {
          xWhereAnd.push({
            accident_classification_id: pParam.accident_classification_id,
          });
        }
      }

      if (pParam.hasOwnProperty("danger_condition_id")) {
        if (pParam.danger_condition_id != "") {
          xWhereAnd.push({
            danger_condition_id: pParam.danger_condition_id,
          });
        }
      }

      if (pParam.hasOwnProperty("danger_action_id")) {
        if (pParam.danger_action_id != "") {
          xWhereAnd.push({
            danger_action_id: pParam.danger_action_id,
          });
        }
      }

      if (pParam.hasOwnProperty("accident_source_id")) {
        if (pParam.accident_source_id != "") {
          xWhereAnd.push({
            accident_source_id: pParam.accident_source_id,
          });
        }
      }

      if (pParam.hasOwnProperty("accident_type_id")) {
        if (pParam.accident_type_id != "") {
          xWhereAnd.push({
            accident_type_id: pParam.accident_type_id,
          });
        }
      }

			if (pParam.hasOwnProperty('corrective_start_date') && pParam.hasOwnProperty('corrective_end_date')) {
				if (pParam.corrective_start_date != '' && pParam.corrective_end_date != '') {
					xWhereAnd.push({
						corrective_action_due_date: {
							[Op.between]: [ pParam.corrective_start_date + ' 00:00:00', pParam.corrective_end_date + ' 23:59:59' ]
						}
					});
				}
			}

			if (pParam.hasOwnProperty('investigation_start_date') && pParam.hasOwnProperty('investigation_end_date')) {
				if (pParam.investigation_start_date != '' && pParam.investigation_end_date != '') {
					xWhereAnd.push({
						investigation_date: {
							[Op.between]: [ pParam.investigation_start_date + ' 00:00:00', pParam.investigation_end_date + ' 23:59:59' ]
						}
					});
				}
			}

			if (pParam.hasOwnProperty('start_date') && pParam.hasOwnProperty('end_date')) {
				if (pParam.start_date != '' && pParam.end_date != '') {
					xWhereAnd.push({
						createdAt: {
							[Op.between]: [ pParam.start_date + ' 00:00:00', pParam.end_date + ' 23:59:59' ]
						}
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
            dangerous_process_desc: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            document_no: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            corrective_action_desc: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            existing_function_protection: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            },
            conclusion: {
              [Op.iLike]: "%" + pParam.keyword + "%",
            }
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
    var xInclude = [
      {
        model: _modelIntialReport,
        as: "initial_report",
        attributes: ["document_no", "company_id", "company_name", "status"],
      },
      {
        model: _modelAccidentItemDesc,
        as: "accident_item_desc",
        include: [
          {
            model: _modelDescCategory,
            as: "description_category",
            attributes: ["id", "name"],
          }
        ]
      },
      {
        model: _modelDamagedObject,
        as: "damaged_object",
        include: [
          {
            model: _modelObjectCategory,
            as: "object_category",
            attributes: ["id", "name"],
          }
        ]
      },
      {
        model: _modelAccidentClassification,
        as: "accident_classification",
        attributes: ["id", "name", "code", "description"]
      },
      {
        model: _modelDangerCondition,
        as: "danger_condition",
        attributes: ["id", "name", "code", "description"]
      },
      {
        model: _modelDangerAction,
        as: "danger_action",
        attributes: ["id", "name", "code", "description"]
      },
      {
        model: _modelAccidentSource,
        as: "accident_source",
        attributes: ["id", "name", "code", "description"]
      },
      {
        model: _modelAccidentType,
        as: "accident_type",
        attributes: ["id", "name", "code", "description"]
      }
    ];
    var xWhereOr = [];
    var xWhereAnd = [];
    var xWhere = [];
    var xAttributes = [];
    var xJoResult = {};

    try {
      xInclude = [];

      if (pParam.hasOwnProperty("initialreport_id")) {
        if (pParam.initialreport_id != "") {
          xWhereAnd.push({
            initialreport_id: pParam.initialreport_id,
          });
        }
      }

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            '$initial_report.company_id$': pParam.company_id,
          });
        }
      }
      

      if (pParam.hasOwnProperty("accident_classification_id")) {
        if (pParam.accident_classification_id != "") {
          xWhereAnd.push({
            accident_classification_id: pParam.accident_classification_id,
          });
        }
      }

      if (pParam.hasOwnProperty("danger_condition_id")) {
        if (pParam.danger_condition_id != "") {
          xWhereAnd.push({
            danger_condition_id: pParam.danger_condition_id,
          });
        }
      }

      if (pParam.hasOwnProperty("danger_action_id")) {
        if (pParam.danger_action_id != "") {
          xWhereAnd.push({
            danger_action_id: pParam.danger_action_id,
          });
        }
      }

      if (pParam.hasOwnProperty("accident_source_id")) {
        if (pParam.accident_source_id != "") {
          xWhereAnd.push({
            accident_source_id: pParam.accident_source_id,
          });
        }
      }

      if (pParam.hasOwnProperty("accident_type_id")) {
        if (pParam.accident_type_id != "") {
          xWhereAnd.push({
            accident_type_id: pParam.accident_type_id,
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
}

module.exports = InspectionRepository;
