"use strict";

module.exports = (sequelize, DataTypes) => {
  const LeadingReport = sequelize.define("tr_leadingreports", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    document_no: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    company_name: DataTypes.STRING,
    leading_id: DataTypes.INTEGER,
    leading_date: DataTypes.DATE,
    file: DataTypes.JSON,
    description: DataTypes.STRING,
    status: DataTypes.INTEGER,
    cancel_note: DataTypes.STRING,
    total_participant: DataTypes.INTEGER,
    location: DataTypes.STRING,
    lead_by: DataTypes.STRING,
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

  LeadingReport.associate = function (models) {
    LeadingReport.belongsTo(models.ms_leadingkpis, {
      foreignKey: "leading_id",
      as: "leading",
    });

    // LeadingReport.belongsTo(models.ms_audittypes, {
    //   foreignKey: "audit_type_id",
    //   as: "audit_type",
    // });
  };

  return LeadingReport;
};
