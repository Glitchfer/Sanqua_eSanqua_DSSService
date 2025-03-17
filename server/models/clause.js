"use strict";

module.exports = (sequelize, DataTypes) => {
  const Clause = sequelize.define("ms_clauses", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: DataTypes.STRING,
    clause_no: DataTypes.STRING,
    reference: DataTypes.STRING,
    company_ids: DataTypes.INTEGER,
    area_ids: DataTypes.INTEGER,
    scope_ids: DataTypes.INTEGER,
    clause_category_id: DataTypes.INTEGER,
    audit_type_id: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER,
    status: DataTypes.INTEGER, //0:not active, 1: active
    deletedAt: {
      type: DataTypes.DATE,
      field: "deleted_at",
    },
    deleted_by: DataTypes.INTEGER,
    deleted_by_name: DataTypes.STRING,

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

  Clause.associate = function (models) {
    Clause.belongsTo(models.ms_clausecategories, {
      foreignKey: "clause_category_id",
      as: "clause_category",
    });
    Clause.belongsTo(models.ms_audittypes, {
      foreignKey: "audit_type_id",
      as: "audit_type",
    });
    // Clause.belongsTo(models.ms_areas, {
    //   foreignKey: "area_id",
    //   as: "area",
    // });
    // Clause.belongsTo(models.ms_scopes, {
    //   foreignKey: "scope_id",
    //   as: "scope",
    // });
  };

  return Clause;
};
