"use strict";

module.exports = (sequelize, DataTypes) => {
  const AccidentSource = sequelize.define("ms_accidentsources", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    description: DataTypes.STRING,
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

  // Shift.associate = function(models) {
  // 	Shift.belongsTo(models.ms_shiftcategories, {
  // 		foreignKey: 'shift_category_id',
  // 		onDelete: 'CASCADE',
  // 		as: 'shift_category'
  // 	});
  // };

  return AccidentSource;
};
