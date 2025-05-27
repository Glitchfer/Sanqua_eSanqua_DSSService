"use strict";

module.exports = (sequelize, DataTypes) => {
  const PerformanceReport = sequelize.define("tr_performancereports", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    document_no: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    company_name: DataTypes.STRING,
    report_date: DataTypes.DATE,
    pic_id: DataTypes.INTEGER,
    pic_name: DataTypes.STRING,
    pic_nik: DataTypes.STRING,
    total_employee: DataTypes.DOUBLE,
    total_other_people: DataTypes.DOUBLE,
    workdays: DataTypes.INTEGER,
    cancel_note: DataTypes.STRING,
    status: DataTypes.INTEGER,
    approver_ids: DataTypes.JSONB,
    // is_delete: DataTypes.INTEGER,
    // deletedAt: {
    //   type: DataTypes.DATE,
    //   field: "deleted_at",
    // },
    // deleted_by: DataTypes.INTEGER,
    // deleted_by_name: DataTypes.STRING,

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("NOW()"),
      field: "created_at",
    },
    created_by: DataTypes.INTEGER,
    created_by_name: DataTypes.STRING,
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
    updated_by: DataTypes.INTEGER,
    updated_by_name: DataTypes.STRING,

    submited_by: DataTypes.INTEGER,
    submited_by_name: DataTypes.STRING,
    submitedAt: {
      type: DataTypes.DATE,
      field: "submited_at",
    },

    cancel_by: DataTypes.INTEGER,
    cancel_by_name: DataTypes.STRING,
    cancelAt: {
      type: DataTypes.DATE,
      field: "cancel_at",
    },

    set_draft_by: DataTypes.INTEGER,
    set_draft_by_name: DataTypes.STRING,
    set_draftAt: {
      type: DataTypes.DATE,
      field: "set_draft_at",
    },
  });

  // PerformanceReport.associate = function (models) {

  // PerformanceReport.belongsTo(models.ms_dangerconditions, {
  //   foreignKey: "danger_condition_id",
  //   as: "danger_condition",
  // });
  // };

  return PerformanceReport;
};
