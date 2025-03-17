"use strict";

module.exports = (sequelize, DataTypes) => {
  const AuditItemScore = sequelize.define("tr_audititemscores", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    audit_id: DataTypes.INTEGER,
    clause_id: DataTypes.INTEGER,
    clause_desc: DataTypes.STRING,
    clause_no: DataTypes.STRING,
    clause_audit_type_id: DataTypes.INTEGER,
    clause_area_id: DataTypes.INTEGER,
    clause_scope_id: DataTypes.INTEGER,
    clause_company_id: DataTypes.INTEGER,
    clause_category_id: DataTypes.INTEGER,
    clause_category_name: DataTypes.STRING,
    score_id: DataTypes.INTEGER,
    score_name: DataTypes.STRING,
    score_value: DataTypes.DOUBLE,
    objective_evidence: DataTypes.JSON,
    corrective_plan_due_date: DataTypes.DATE,
    corrective_plan_desc: DataTypes.STRING,
    corrective_due_date: DataTypes.DATE,
    corrective_evidence: DataTypes.JSON,
    verification_note: DataTypes.STRING,
    status: DataTypes.INTEGER, //0:not active, 1: active
    is_block: DataTypes.BOOLEAN,

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

  AuditItemScore.associate = function (models) {
    AuditItemScore.belongsTo(models.tr_audits, {
      foreignKey: "audit_id",
      as: "audit",
      // onDelete: "CASCADE",
    });
    AuditItemScore.belongsTo(models.ms_audittypes, {
      foreignKey: "clause_audit_type_id",
      as: "audit_type",
    });
    AuditItemScore.belongsTo(models.ms_clauses, {
      foreignKey: "clause_id",
      as: "clause",
    });
    AuditItemScore.belongsTo(models.ms_areas, {
      foreignKey: "clause_area_id",
      as: "area",
    });
    AuditItemScore.belongsTo(models.ms_scopes, {
      foreignKey: "clause_scope_id",
      as: "scope",
    });
  };

  return AuditItemScore;
};
