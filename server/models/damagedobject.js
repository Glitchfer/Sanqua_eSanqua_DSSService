"use strict";

module.exports = (sequelize, DataTypes) => {
  const DamagedObject = sequelize.define("tr_damagedobjects", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inspection_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    object_category_id: DataTypes.INTEGER,
    qty: DataTypes.DOUBLE,
    uom_name: DataTypes.STRING,
    uom_id: DataTypes.INTEGER,
    description: DataTypes.STRING,

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

  DamagedObject.associate = function (models) {
    DamagedObject.belongsTo(models.tr_inspections, {
      foreignKey: "inspection_id",
      as: "inspection",
      // onDelete: "CASCADE",
    });
    DamagedObject.belongsTo(models.ms_objectcategories, {
      foreignKey: "object_category_id",
      as: "object_category",
    });
  };

  return DamagedObject;
};
