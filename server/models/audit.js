"use strict";

module.exports = (sequelize, DataTypes) => {
  const Audit = sequelize.define("tr_audits", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    audit_no: DataTypes.STRING,
    name: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    company_name: DataTypes.STRING,
    audit_type_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    audit_date: DataTypes.DATE,
    approver_ids: DataTypes.JSONB,
    note: DataTypes.STRING,
    cancel_note: DataTypes.STRING,

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

  Audit.associate = function (models) {
    Audit.hasMany(models.tr_audititemscores, {
      foreignKey: "audit_id",
      as: "audit_item",
      onDelete: "CASCADE"
    });
    Audit.hasMany(models.tr_auditmembers, {
      foreignKey: "audit_id",
      as: "audit_member",
      onDelete: "CASCADE"
    });
    Audit.belongsTo(models.ms_audittypes, {
      foreignKey: "audit_type_id",
      as: "audit_type",
    });
  };

  return Audit;
};
