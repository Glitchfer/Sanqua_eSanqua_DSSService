const jwt = require("jsonwebtoken");
const md5 = require("md5");
const crypto = require("crypto");
const moment = require("moment");
const sequelize = require("sequelize");
const dateFormat = require("dateformat");
const Op = sequelize.Op;
const bcrypt = require("bcrypt");
const fs = require("fs");

const env = process.env.NODE_ENV || "localhost";
const config = require(__dirname + "/../config/config.json")[env];

// Repository
const MasterRepository = require("../repository/masterrepository.js");

//Util
const Utility = require("peters-globallib-v2");
const _utilInstance = new Utility();

class MasterService {
  constructor() {}

  async getById(pParam) {
    var xJoResult = {};
    var xJoArrData = [];
    var xFlagProcess = false;

    var xDecId = await _utilInstance.decrypt(
      pParam.id,
      config.cryptoKey.hashKey
    );
    if (xDecId.status_code == "00") {
      pParam.id = xDecId.decrypted;
      xFlagProcess = true;
    } else {
      xJoResult = xDecId;
    }

    if (xFlagProcess) {
      var _repoInstance = new MasterRepository(pParam.model, pParam.app);
      var xDetail = await _repoInstance.getById(pParam);
      if (xDetail.status_code == "00") {
        var xTempDetail = JSON.parse(JSON.stringify(xDetail.data));
        xTempDetail.id = await _utilInstance.encrypt(
          xDetail.id.toString(),
          config.cryptoKey.hashKey
        );

        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xTempDetail,
        };
      } else {
        xJoResult = xDetail;
      }
    }

    return xJoResult;
  }

  async list(pParam) {
    var xJoResult = {};
    var xJoArrData = [];

    var _repoInstance = new MasterRepository(pParam.model, pParam.app);

    var xResultList = await _repoInstance.list(pParam);
    console.log(`MASTER LIST>>>>>>>>>, ${JSON.stringify(xResultList)}`);

    if (xResultList.status_code == "00") {
      if (xResultList.data.count > 0) {
        var xRows = xResultList.data.rows;
        for (var index in xRows) {
          var xJoList = JSON.parse(JSON.stringify(xRows[index]));
          xJoList.id = await _utilInstance.encrypt(
            xRows[index].id.toString(),
            config.cryptoKey.hashKey
          );
          xJoArrData.push(xJoList);
        }
        // console.log(`total_record>>>>>>>>>, ${JSON.stringify(xResultList)}`);
        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xJoArrData,
          total_record: xResultList.total_record,
        };
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Data not found",
        };
      }
    } else {
      xJoResult = xResultList;
    }

    console.log(`xJoResult>>>, ${JSON.stringify(xJoResult)}`);
    return xJoResult;
  }

  async dropDown(pParam) {
    var xJoResult = {};
    var xJoArrData = [];

    var _repoInstance = new MasterRepository(pParam.model, pParam.app);

    var xResultList = await _repoInstance.list(pParam);
    // console.log(`MASTER LIST>>>>>>>>>2, ${JSON.stringify(xResultList)}`);
    if (xResultList.status_code == "00") {
      if (xResultList.data.count > 0) {
        var xRows = xResultList.data.rows;
        for (var index in xRows) {
          if (pParam.model == "score") {
            xJoArrData.push({
              id: xRows[index].id,
              name: xRows[index].name,
              value: xRows[index].value,
            });
          } else if (pParam.model == "clause") {
            xJoArrData.push({
              id: xRows[index].id,
              description: xRows[index].description,
              clause_no: xRows[index].clause_no,
              reference: xRows[index].reference,
              clause_category:
                xRows[index].clause_category != null
                  ? {
                      id: xRows[index].clause_category.id,
                      name: xRows[index].clause_category.name,
                    }
                  : null,
            });
          } else {
            xJoArrData.push({
              id: xRows[index].id,
              name: xRows[index].name,
              description: xRows[index].description,
            });
          }
        }
        xJoResult = {
          status_code: "00",
          status_msg: "OK",
          data: xJoArrData,
          total_record: xResultList.data.total_record,
        };
      } else {
        xJoResult = {
          status_code: "-99",
          status_msg: "Data not found",
        };
      }
    } else {
      xJoResult = xResultList;
    }

    return xJoResult;
  }

  async save(pParam) {
    var xJoResult;
    var xAct = pParam.act;
    var xFlagProcess = true;
    var xExistingData = null;
    try {
      delete pParam.act;

      var _repoInstance = new MasterRepository(pParam.model, pParam.app);

      if (xAct == "add") {
        // Check if data exists
        if (pParam.hasOwnProperty("is_check_name")) {
          if (pParam.is_check_name) {
            xExistingData = await _repoInstance.isDataExists(
              pParam.name,
              pParam.filter
            );
          }
        }
        // Check if data exists
        if (pParam.hasOwnProperty("is_check_desc")) {
          if (pParam.is_check_desc) {
            xExistingData = await _repoInstance.isDataExistsByDesc(
              pParam.description,
              pParam.filter
            );
          }
        }
        // Check if data exists
        if (pParam.hasOwnProperty("is_check_code")) {
          if (pParam.is_check_code) {
            xExistingData = await _repoInstance.isDataExistByCode(
              pParam.code,
              pParam.filter
            );
          }
        }

        // console.log(`pParam>>>>>>: ${JSON.stringify(pParam)}`);
        // Check if data exists by name or code
        if (pParam.hasOwnProperty("is_check")) {
          if (pParam.is_check) {
            xExistingData = await _repoInstance.isDataExistsByNameCode(
              pParam.name,
              pParam.code,
              pParam.filter
            );
          }
        }

        if (xExistingData == null) {
          // User Id
          var xDecId = await _utilInstance.decrypt(
            pParam.user_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.created_by = xDecId.decrypted;
            pParam.created_by_name = pParam.user_name;
          } else {
            xFlagProcess = false;
            xJoResult = xDecId;
          }

          if (xFlagProcess) {
            var xAddResult = await _repoInstance.save(pParam, xAct);
            xJoResult = xAddResult;
          }
        } else {
          var msg = "";
          if (xExistingData.name.toLowerCase() == pParam.name.toLowerCase()) {
            msg = msg + `name: "${pParam.name}"`;
          }
          if (xExistingData.code.toLowerCase() == pParam.code.toLowerCase()) {
            if (xExistingData.name.toLowerCase() == pParam.name.toLowerCase()) {
              msg = msg + " or ";
            }
            msg = msg + `code: "${pParam.code}"`;
          }

          xJoResult = {
            status_code: "-99",
            status_msg: `Data with ${msg} already exists.`,
          };
        }
      } else if (xAct == "update") {
        // console.log(JSON.stringify(pParam));

        var xDecId = await _utilInstance.decrypt(
          pParam.id,
          config.cryptoKey.hashKey
        );
        if (xDecId.status_code == "00") {
          pParam.id = xDecId.decrypted;
          xDecId = await _utilInstance.decrypt(
            pParam.user_id,
            config.cryptoKey.hashKey
          );
          if (xDecId.status_code == "00") {
            pParam.updated_by = xDecId.decrypted;
            pParam.updated_by_name = pParam.user_name;
          } else {
            xFlagProcess = false;
            xJoResult = xDecId;
          }
        } else {
          xFlagProcess = false;
          xJoResult = xDecId;
        }

        if (xFlagProcess) {
          var xCheckID = await _repoInstance.getById(pParam);
          if (xCheckID.status_code == "00") {
            var xAddResult = await _repoInstance.save(pParam, xAct);
            xJoResult = xAddResult;
          } else {
            xJoResult = {
              status_code: "-99",
              status_msg: `Save or update failed, ${xCheckID.status_msg}`,
            };
          }
        }
      }
    } catch (e) {
      xJoResult = {
        status_code: "-99",
        status_msg: `Save or update [masterservice.save] Error : ${e.message}`,
      };
    }
    return xJoResult;
  }

  async archive(pParam) {
    var xJoResult;
    var xFlagProcess = true;

    var xDecId = await _utilInstance.decrypt(
      pParam.id,
      config.cryptoKey.hashKey
    );
    if (xDecId.status_code == "00") {
      pParam.id = xDecId.decrypted;
      xDecId = await _utilInstance.decrypt(
        pParam.user_id,
        config.cryptoKey.hashKey
      );
      if (xDecId.status_code == "00") {
        pParam.is_delete = 1;
        pParam.deleted_by = xDecId.decrypted;
        pParam.deleted_by_name = pParam.user_name;
      } else {
        xFlagProcess = false;
        xJoResult = xDecId;
      }
    } else {
      xFlagProcess = false;
      xJoResult = xDecId;
    }

    if (xFlagProcess) {
      var _repoInstance = new MasterRepository(pParam.model, pParam.app);

      var xDeleteResult = await _repoInstance.archive(pParam);
      xJoResult = xDeleteResult;
    }

    return xJoResult;
  }

  async unarchive(pParam) {
    var xJoResult;
    var xFlagProcess = true;

    var xDecId = await _utilInstance.decrypt(
      pParam.id,
      config.cryptoKey.hashKey
    );
    if (xDecId.status_code == "00") {
      pParam.id = xDecId.decrypted;
      xDecId = await _utilInstance.decrypt(
        pParam.user_id,
        config.cryptoKey.hashKey
      );
      if (xDecId.status_code == "00") {
        pParam.is_delete = 0;
        // pParam.deleted_by = xDecId.decrypted;
        // pParam.deleted_by_name = pParam.user_name;
      } else {
        xFlagProcess = false;
        xJoResult = xDecId;
      }
    } else {
      xFlagProcess = false;
      xJoResult = xDecId;
    }

    if (xFlagProcess) {
      var _repoInstance = new MasterRepository(pParam.model, pParam.app);

      var xDeleteResult = await _repoInstance.archive(pParam);
      xJoResult = xDeleteResult;
    }

    return xJoResult;
  }

  async delete(pParam) {
    var xJoResult;
    var xFlagProcess = true;

    var xDecId = await _utilInstance.decrypt(
      pParam.id,
      config.cryptoKey.hashKey
    );
    if (xDecId.status_code == "00") {
      pParam.id = xDecId.decrypted;
    } else {
      xFlagProcess = false;
      xJoResult = xDecId;
    }

    if (xFlagProcess) {
      var _repoInstance = new MasterRepository(pParam.model, pParam.app);
      var xDeleteResult = await _repoInstance.delete(pParam);
      xJoResult = xDeleteResult;
    }

    return xJoResult;
  }
}

module.exports = MasterService;
