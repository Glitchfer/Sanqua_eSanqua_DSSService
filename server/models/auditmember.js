"use strict";

module.exports = (sequelize, DataTypes) => {
  const AuditMember = sequelize.define("tr_auditmembers", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    audit_id: DataTypes.INTEGER,
    employee_id: DataTypes.INTEGER,
    employee_name: DataTypes.STRING,
    employee_code: DataTypes.STRING,
    scope_ids: DataTypes.INTEGER,
    area_ids: DataTypes.INTEGER,
    member_type: DataTypes.INTEGER,

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

  AuditMember.associate = function (models) {
    AuditMember.belongsTo(models.tr_audits, {
      foreignKey: "audit_id",
      as: "audit",
      onDelete: "CASCADE",
    });
  };

  return AuditMember;
};
