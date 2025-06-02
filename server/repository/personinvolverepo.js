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
const _modelDb = require("../models").tr_personinvolves;
const _modelIntialReport = require("../models").tr_initialreports;

const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const _xClassName = "PersonInvolveRepo";

class PersonInvolveRepo {
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
      if (pParam.hasOwnProperty("injured_body_part_id")) {
        if (
          pParam.injured_body_part_id != null &&
          pParam.injured_body_part_id.length > 0
        ) {
          // for (let i = 0; i < pParam.injured_body_part_id.length; i++) {
          // }
          pParam.injured_body_part_id = Sequelize.literal(
            `ARRAY[${pParam.injured_body_part_id.join(",")}]`
          );
        } else {
          pParam.injured_body_part_id = null;
        }
      }
      console.log(`>>> Save xData: ${JSON.stringify(pParam)}`);
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
          attributes: ["name", "document_no", "status"],
        },
      ];

      if (pParam.hasOwnProperty("initialreport_id")) {
        if (pParam.initialreport_id != "") {
          xWhereAnd.push({
            initialreport_id: pParam.initialreport_id,
          });
        }
      }

      // if (pParam.hasOwnProperty("keyword")) {
      //   if (pParam.keyword != "") {
      //     xWhereOr.push({
      //       corrective_plan_desc: {
      //         [Op.iLike]: "%" + pParam.keyword + "%",
      //       },
      //     });
      //   }
      // }

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
          model: _modelIntialReport,
          as: "initial_report",
          attributes: ["document_no", "status"],
        },
      ];

      if (pParam.hasOwnProperty("id")) {
        if (pParam.id != "") {
          xWhereAnd.push({
            id: pParam.id,
          });
        }
      }

      if (pParam.hasOwnProperty("initialreport_id")) {
        if (pParam.initialreport_id != "") {
          xWhereAnd.push({
            initialreport_id: pParam.initialreport_id,
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

module.exports = PersonInvolveRepo;
