"use strict";

module.exports = (sequelize, DataTypes) => {
  const AccidentItemDesc = sequelize.define("tr_accidentitemdescs", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inspection_id: DataTypes.INTEGER,
    desc_category_id: DataTypes.INTEGER,
    description: DataTypes.STRING,
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

  AccidentItemDesc.associate = function (models) {
    AccidentItemDesc.belongsTo(models.tr_inspections, {
      foreignKey: "inspection_id",
      as: "inspection",
    });

    AccidentItemDesc.belongsTo(models.ms_desccategories, {
      foreignKey: "desc_category_id",
      as: "desc_category",
    });
  };

  return AccidentItemDesc;
};
