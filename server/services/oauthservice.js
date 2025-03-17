const jwt = require("jsonwebtoken");
const md5 = require("md5");
const crypto = require("crypto");
const moment = require("moment");
const sequelize = require("sequelize");
const dateFormat = require("dateformat");
const Op = sequelize.Op;
const bcrypt = require("bcrypt");

const env = process.env.NODE_ENV || "localhost";
const config = require(__dirname + "/../config/config.json")[env];

// Utility
const Util = require("peters-globallib-v2");
const { default: Axios } = require("axios");
const _utilInstance = new Util();

class OAuthService {
  constructor() {}

  async verifyToken(pToken, pMethod, pDevice = "") {
    // var xApiUrl = config.api.oAuth.url.verifyToken + '?token=' + pToken + '&method=' + pMethod;
    var xApiUrl = `${config.api.oAuth.url.verifyToken}?token=${pToken}&method=${pMethod}&device=${pDevice}`;
    var xResultVerify = await _utilInstance.axiosRequest(xApiUrl, {});
    return xResultVerify;
  }

  // Verify Access Token from OTP
  async verifyAccessToken(pToken, pMethod, pAccessToken) {
    // var xApiUrl = config.api.oAuth.url.verifyToken + '?token=' + pToken + '&method=' + pMethod;
    var xApiUrl = `${config.api.oAuth.url.base}/otp/access_token/verify`;
    var xResultVerify = await _utilInstance.axiosRequestPost(
      xApiUrl,
      "POST",
      {},
      {
        headers: {
          "x-method": pMethod,
          "x-token": pToken,
          "x-access-token": pAccessToken,
        },
      }
    );
    return xResultVerify;
  }

  async addApprovalMatrix(pMethod, pToken, pParam) {
    var xAPIUrl = config.api.oAuth.url.approval_matrix_document.save;
    // console.log(">>> API URL : " + xAPIUrl);
    var xHeader = {
      headers: {
        "x-method": pMethod,
        "x-token": pToken,
      },
    };
    var xResultVerify = await _utilInstance.axiosRequestPost(
      xAPIUrl,
      "POST",
      pParam,
      xHeader
    );

    return xResultVerify;
  }

  async addManualApprovalMatrix(pMethod, pToken, pParam) {
    var xAPIUrl = config.api.oAuth.url.approval_matrix_document.save_manual;
    console.log(">>> API URL : " + xAPIUrl);
    var xHeader = {
      headers: {
        "x-method": pMethod,
        "x-token": pToken,
      },
    };
    var xResultVerify = await _utilInstance.axiosRequestPost(
      xAPIUrl,
      "POST",
      pParam,
      xHeader
    );

    return xResultVerify;
  }

  async getApprovalMatrix(pMethod, pToken, pParam) {
    var xAPIUrl = config.api.oAuth.url.approval_matrix_document.list;
    var xQueryParam = `?offset=0&limit=10&keyword=&application_id=${pParam.application_id}&table_name=${pParam.table_name}&document_id=${pParam.document_id}`;
    var xHeader = {
      headers: {
        "x-method": pMethod,
        "x-token": pToken,
      },
    };
    var xResultVerify = await _utilInstance.axiosRequest(
      xAPIUrl + xQueryParam,
      xHeader
    );

    return xResultVerify;
  }

  async confirmApprovalMatrix(pMethod, pToken, pParam) {
    var xAPIUrl = config.api.oAuth.url.approval_matrix_document.confirm;
    var xHeader = {
      headers: {
        "x-method": pMethod,
        "x-token": pToken,
      },
    };
    var xResultVerify = await _utilInstance.axiosRequestPost(
      xAPIUrl,
      "POST",
      pParam,
      xHeader
    );

    return xResultVerify;
  }

  async confirmApprovalMatrixViaEmail(pParam) {
    var xAPIUrl =
      config.api.oAuth.url.approval_matrix_document.confirm_via_email;
    var xResultVerify = await _utilInstance.axiosRequestPost(
      xAPIUrl,
      "POST",
      pParam,
      {}
    );

    return xResultVerify;
  }

  async getEmployeeInfo(pMethod, pToken, pEmployeeId) {
    var xAPIUrl = config.api.hr.url.employeeInfo;
    var xQueryParam = `/${pEmployeeId}`;
    var xHeader = {
      headers: {
        "x-method": pMethod,
        "x-token": pToken,
      },
    };
    var xResultVerify = await _utilInstance.axiosRequest(
      xAPIUrl + xQueryParam,
      xHeader
    );

    return xResultVerify;
  }

  async getPlantInfo(pMethod, pToken, pId, pDevice) {
    console.log(`>>> pDevice : ${pDevice}`);
    var xAPIUrl = config.api.eSanqua;
    var xQueryParam = `/master/universal/plant/detail_non_auth/${pId}`;
    var xHeader = {
      // headers: {
      // 	'x-method': pMethod,
      // 	'x-token': pToken,
      // 	'x-device': pDevice
      // }
    };
    var xResultVerify = await _utilInstance.axiosRequest(
      xAPIUrl + xQueryParam,
      xHeader
    );

    return xResultVerify;
  }

  async getUserInfo(pParam) {
    var xAPIUrl = config.api.oAuth.url.userInfo;
    var xQueryParam = `${pParam.employee_id}`;
    var xHeader = {
      headers: {
        "x-method": pParam.method,
        "x-token": pParam.token,
      },
    };
    var xResultVerify = await _utilInstance.axiosRequest(
      xAPIUrl + xQueryParam,
      xHeader
    );

    return xResultVerify;
  }
}

module.exports = OAuthService;
