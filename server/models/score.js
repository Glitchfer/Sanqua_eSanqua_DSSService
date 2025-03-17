"use strict";

module.exports = (sequelize, DataTypes) => {
  const Score = sequelize.define("ms_scores", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    value: DataTypes.DOUBLE,
    description: DataTypes.STRING,
    audit_type_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER, //0: not active, 1: active
    is_delete: DataTypes.INTEGER,
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

  Score.associate = function (models) {
    Score.belongsTo(models.ms_audittypes, {
      foreignKey: "audit_type_id",
      as: "audit_type",
    });
  };

  return Score;
};
