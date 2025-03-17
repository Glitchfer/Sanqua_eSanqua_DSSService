"use strict";

module.exports = (sequelize, DataTypes) => {
  const InitialReport = sequelize.define("tr_initialreports", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    document_no: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    company_name: DataTypes.STRING,
    incident_date: DataTypes.DATE,
    incident_time: DataTypes.STRING,
    reported_date: DataTypes.DATE,
    file: DataTypes.JSON,
    chronology: DataTypes.STRING,
    incident_location: DataTypes.STRING,
    status: DataTypes.INTEGER,
    cancel_note: DataTypes.STRING,
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
  });

  InitialReport.associate = function (models) {
    InitialReport.hasMany(models.tr_personinvolves, {
      foreignKey: "initialreport_id",
      as: "person_involve",
    });
    InitialReport.hasOne(models.tr_rootproblems, {
      foreignKey: "initialreport_id",
      as: "root_problem",
    });
    InitialReport.hasOne(models.tr_inspections, {
      foreignKey: "initialreport_id",
      as: "inspection",
    });

    // InitialReport.belongsTo(models.ms_audittypes, {
    //   foreignKey: "audit_type_id",
    //   as: "audit_type",
    // });
  };

  return InitialReport;
};
