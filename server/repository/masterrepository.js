var env = process.env.NODE_ENV || "localhost";
var config = require(__dirname + "/../config/config.json")[env];
var Sequelize = require("sequelize");
var sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);
const { hash } = require("bcryptjs");
const Op = Sequelize.Op;

const _modelDb = require("../models");
const _modelFormTemplateItem = require("../models").tr_formtemplateitems;

// const PayrollTemplateReposiotory = require('../repository/payrolltemplaterepository.js');
// const _payrollTemplateRepoInstance = new PayrollTemplateReposiotory();

const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

const _xClassName = "MasterRepository";

class MasterRepository {
  constructor(pModelName, pApp) {
    if (pApp == "universal") {
      pApp = "";
    } else {
      pApp += "_";
    }

    var xModelName =
      pApp +
      "ms_" +
      (pModelName.slice(-1) == "y"
        ? pModelName.slice(0, -1) + "ies"
        : pModelName.slice(-1) == "s"
        ? pModelName.slice(0, -1) + "ses"
        : pModelName + "s");
    console.log(">>> Model Name : " + xModelName);
    // xModelName = 'unit.js';
    // // this._modelDb = require('../models').xModelName;
    // this._modelDb = require(`../models/${xModelName}`);
    this._runningModel = _modelDb[xModelName];
  }

  async convertToModelName(pModelName) {
    var xModelName =
      "ms_" +
      (pModelName.slice(-1) == "y"
        ? pModelName.slice(0, -1) + "ies"
        : pModelName.slice(-1) == "s"
        ? pModelName.slice(0, -1) + "ses"
        : pModelName + "s");

    return xModelName;
  }

  async getById(pParam) {
    var xJoResult = {};
    try {
      var xData = await this._runningModel.findOne({
        where: {
          id: pParam.id,
          is_delete: 0,
        },
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
    // var xOrder = [ 'name', 'ASC' ];
    var xOrder = [];
    var xInclude = [];
    var xWhere = [];
    var xWhereAnd = [],
      xWhereOr = [];
    var xJoResult = {};
    try {
      if (pParam.order_by != "" && pParam.hasOwnProperty("order_by")) {
        xOrder = [
          pParam.order_by,
          pParam.order_type == "desc" ? "DESC" : "ASC",
        ];
      } else {
        xOrder = ["id", "ASC"];
      }

      if (pParam.hasOwnProperty("join_table")) {
        if (pParam.join_table.length > 0) {
          let xJoinTable = JSON.parse(pParam.join_table);
          for (var i in xJoinTable) {
            if (
              xJoinTable[i].hasOwnProperty("name") &&
              xJoinTable[i].hasOwnProperty("alias")
            ) {
              let xModelName = await this.convertToModelName(
                xJoinTable[i].name
              );
              xInclude.push({
                model: _modelDb[xModelName],
                as: xJoinTable[i].alias,
              });
            }
          }
        }
      }

      if (pParam.hasOwnProperty("filter")) {
        if (
          pParam.filter != null &&
          pParam.filter != undefined &&
          pParam.filter != ""
        ) {
          var xFilter = JSON.parse(pParam.filter);
          // console.log(`xFilter ${JSON.stringify(xFilter)}`);
          if (xFilter.length > 0) {
            // xWhereAnd.push( pParam.filter );
            for (var index in xFilter) {
              var objProperty = Object.getOwnPropertyNames(xFilter[index])[0];
              if (objProperty.includes("_ids")) {
                xWhereAnd.push({
                  [objProperty]: {
                    [Op.contains]: Sequelize.literal(
                      `ARRAY[${xFilter[index][objProperty]}]`
                    ),
                  },
                });
              } else {
                xWhereAnd.push(xFilter[index]);
              }
            }
          }
        }
      }

      if (pParam.hasOwnProperty("is_archived")) {
        if (pParam.is_archived != "") {
          xWhereAnd.push({
            is_delete: pParam.is_archived,
          });
        } else {
          xWhereAnd.push({
            is_delete: 0,
          });
        }
      } else {
        xWhereAnd.push({
          is_delete: 0,
        });
      }

      if (pParam.hasOwnProperty("arr_id")) {
        if (
          pParam.arr_id != "" &&
          pParam.arr_id != "null" &&
          pParam.arr_id != null
        ) {
          // console.log(`>>> pParam.arr_id: ${pParam.arr_id}`, pParam.arr_id != '' && pParam.arr_id != 'null' && pParam.arr_id != null);
          // let xModelName = await this.convertToModelName(pParam.model);
          xWhereAnd.push({
            id: {
              [Op.in]: pParam.arr_id != "null" ? pParam.arr_id.split(",") : [],
            },
          });
        }
      }

      // console.log(`>>> pParam.keyword: ${pParam.keyword}`);
      if (pParam.hasOwnProperty("keyword")) {
        if (pParam.keyword != "" && pParam.keyword != null) {
          var xWhereKeyword = [];
          if (pParam.model == "clause") {
            xWhereOr.push(
              {
                description: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              },
              {
                reference: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              },
              {
                clause_no: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              },
              {
                "$clause_category.name$": {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              }
            );
          } else if (
            pParam.model == "area" ||
            pParam.model == "scope" ||
            pParam.model == "audittype" ||
            pParam.model == "bodypart" ||
            pParam.model == "injuredcategory" ||
            pParam.model == "objectcategory" ||
            pParam.model == "clausecategory" ||
            pParam.model == "grade"
          ) {
            xWhereOr.push(
              {
                name: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              },
              {
                code: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              }
            );
          } else {
            xWhereOr.push(
              {
                name: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              },
              {
                code: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              },
              {
                description: {
                  [Op.iLike]: "%" + pParam.keyword + "%",
                },
              }
            );
          }
          for (let i = 0; i < xWhereKeyword.length; i++) {
            xWhereOr.push(xWhereKeyword[i]);
          }
        }
      }

      if (xWhereAnd.length > 0) {
        xWhere.push({
          [Op.and]: xWhereAnd,
        });
      }

      if (xWhereOr.length > 0) {
        xWhere.push({
          [Op.or]: xWhereOr,
        });
      }

      var xParamQuery = {
        where: xWhere,
        include: xInclude,
        order: [xOrder],
      };

      var xCountDataWithoutLimit = await this._runningModel.count(xParamQuery);

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

      let xData = await this._runningModel.findAndCountAll(xParamQuery);

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

      var objProperty = Object.getOwnPropertyNames(pParam);
      for (let i = 0; i < objProperty.length; i++) {
        if (objProperty[i].includes("_ids")) {
          // console.log(`objName>>>>>>>> ${JSON.stringify(objProperty[i])}`);
          // console.log(
          //   `objValue>>>>>>>> ${JSON.stringify(pParam[objProperty[i]])}`
          // );
          if (
            pParam[objProperty[i]] != null &&
            pParam[objProperty[i]].length > 0
          ) {
            pParam[objProperty[i]] = Sequelize.literal(
              `ARRAY[${pParam[objProperty[i]].join(",")}]`
            );
          } else {
            pParam[objProperty[i]] = null;
          }
        }
      }
      // console.log(`pParam>>>>>>>> ${JSON.stringify(pParam)}`);
      if (pAct == "add") {
        pParam.status = 1;
        pParam.is_delete = 0;

        if (pParam.model == "formtemplate") {
          xInclude = {
            include: [
              {
                model: _modelFormTemplateItem,
                as: "form_template_item",
              },
            ],
          };
        }

        xSaved = await this._runningModel.create(pParam, xInclude, {
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
        xSaved = await this._runningModel.update(pParam, xWhere, {
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

    var data = await this._runningModel.findOne({
      where: xWhere,
    });

    return data;
  }

  async isDataExistsByDesc(pDesc, pFilter) {
    var xWhere = [];
    xWhere.push({ description: pDesc });
    xWhere.push({ is_delete: 0 });

    if (pFilter) {
      if (pFilter.length > 0) {
        for (var i in pFilter) {
          xWhere.push(pFilter[i]);
        }
      }
    }

    var data = await this._runningModel.findOne({
      where: xWhere,
    });

    return data;
  }

  async isDataExistsByNameCode(pName, pCode, pFilter) {
    var xWhere = [];
    var xWhereOr = [];
    var xWhereAnd = [];

    if (pFilter) {
      if (pFilter.length > 0) {
        for (var i in pFilter) {
          xWhereAnd.push(pFilter[i]);
        }
      }
    }

    xWhereAnd.push({ is_delete: 0 });

    xWhereOr.push({
      name: {
        [Op.iLike]: "%" + pName + "%",
      },
    });

    if (pCode != undefined && pCode != null && pCode != "") {
      xWhereOr.push({
        code: {
          [Op.iLike]: "%" + pCode + "%",
        },
      });
    }

    if (xWhereAnd.length > 0) {
      xWhere.push({
        [Op.and]: xWhereAnd,
      });
    }

    if (xWhereOr.length > 0) {
      xWhere.push({
        [Op.or]: xWhereOr,
      });
    }

    var data = await this._runningModel.findOne({
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

      xSaved = await this._runningModel.update(
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

      xSaved = await this._runningModel.destroy(
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
}

module.exports = MasterRepository;
