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
const _modelDb = require("../models").tr_initialreports;
const _modelPersonInvolve = require("../models").tr_personinvolves;
const _modelInjuredCategory = require("../models").ms_injuredcategories;
const _modelBodyPart = require("../models").ms_bodyparts;
const _modelInspection = require("../models").tr_inspections;
const _modelRootProblem = require("../models").tr_rootproblems;

const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const _xClassName = "InitialReportRepository";

class InitialReportRepository {
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
          model: _modelPersonInvolve,
          as: "person_involve",
          include: [
            {
              model: _modelInjuredCategory,
              as: "injured_category",
              attributes: ["id", "name"],
            },
            {
              model: _modelBodyPart,
              as: "body_part",
              attributes: ["id", "name"],
            },
          ],
          // attributes: ["id", "name"],
        },
        {
          model: _modelInspection,
          as: "inspection",
          include: [],
          attributes: ["id", "document_no", "status"],
        },
        {
          model: _modelRootProblem,
          as: "root_problem",
          include: [],
          attributes: ["id", "document_no", "status"],
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
          model: _modelInspection,
          as: "inspection",
          include: [],
          attributes: ["id", "document_no", "status"],
        },
        {
          model: _modelRootProblem,
          as: "root_problem",
          include: [],
          attributes: ["id", "document_no", "status"],
        },
      ];

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            company_id: pParam.company_id,
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

      if (
        pParam.hasOwnProperty("start_date") &&
        pParam.hasOwnProperty("end_date")
      ) {
        if (pParam.start_date != "" && pParam.end_date != "") {
          xWhereAnd.push({
            incident_date: {
              [Op.between]: [
                pParam.start_date + " 00:00:00",
                pParam.end_date + " 23:59:59",
              ],
            },
          });
        }
      }
      if (pParam.hasOwnProperty("filter")) {
        if (
          pParam.filter != null &&
          pParam.filter != undefined &&
          pParam.filter != ""
        ) {
          var xFilter = JSON.parse(pParam.filter);
          if (xFilter.length > 0) {
            for (var index in xFilter) {
              // var objProperty = Object.getOwnPropertyNames(xFilter[index])[0];
              xWhereAnd.push(xFilter[index]);
              // if (objProperty.includes("_ids")) {
              //   xWhereAnd.push({
              //     [objProperty]: {
              //       [Op.contains]: Sequelize.literal(
              //         `ARRAY[${xFilter[index][objProperty]}]`
              //       ),
              //     },
              //   });
              // } else {
              //   xWhereAnd.push(xFilter[index]);
              // }
            }
          }
        }
      }

      if (pParam.hasOwnProperty("keyword")) {
        if (pParam.keyword != "") {
          xWhereOr.push(
            {
              chronology: {
                [Op.iLike]: "%" + pParam.keyword + "%",
              },
            },
            {
              document_no: {
                [Op.iLike]: "%" + pParam.keyword + "%",
              },
            },
            {
              incident_location: {
                [Op.iLike]: "%" + pParam.keyword + "%",
              },
            }
          );
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
    var xInclude = null;

    try {
      var xSaved = null;
      xTransaction = await sequelize.transaction();
      xJoinedTable = {};
      xInclude = {
        include: [
          {
            model: _modelPersonInvolve,
            as: "person_involve",
          },
        ],
      };

      if (pAct == "add" || pAct == "add_batch") {
        xSaved = await _modelDb.create(pParam, xInclude, {
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
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Invalid Action",
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
        model: _modelPersonInvolve,
        as: "person_involve",
        include: [
          {
            model: _modelInjuredCategory,
            as: "injured_category",
            attributes: ["id", "name"],
          },
          {
            model: _modelBodyPart,
            as: "body_part",
            attributes: ["id", "name"],
          },
        ],
        // attributes: ["id", "name"],
      },
    ];
    var xWhereOr = [];
    var xWhereAnd = [];
    var xWhere = [];
    var xAttributes = [];
    var xJoResult = {};

    try {
      // xInclude = [];

      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xWhereAnd.push({
            id: pParam.id,
          });
        }
      }

      if (pParam.hasOwnProperty("company_id")) {
        if (pParam.company_id != "") {
          xWhereAnd.push({
            company_id: pParam.company_id,
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
        status_msg: `Failed, ${e.message}`,
        err_msg: e,
      };

      return xJoResult;
    }
  }
}

module.exports = InitialReportRepository;
