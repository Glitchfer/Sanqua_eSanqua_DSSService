"use strict";

module.exports = (sequelize, DataTypes) => {
  const Scope = sequelize.define("ms_scopes", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    company_ids: DataTypes.INTEGER,
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

  // Scope.associate = function(models) {
  // 	Scope.belongsTo(models.ms_jobs, {
  // 		foreignKey: 'job_id',
  // 		as: 'job'
  // 	});
  // };

  return Scope;
};
