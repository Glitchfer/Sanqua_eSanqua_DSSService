"use strict";

module.exports = (sequelize, DataTypes) => {
  const DiscoveryItems = sequelize.define("tr_discoveryitems", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    audit_id: DataTypes.INTEGER,
    area_id: DataTypes.INTEGER,
    scope_id: DataTypes.INTEGER,

    objective_evidence: DataTypes.JSON,
    corrective_plan_due_date: DataTypes.DATE,
    corrective_plan_desc: DataTypes.STRING,
    corrective_due_date: DataTypes.DATE,
    corrective_evidence: DataTypes.JSON,

    description: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("NOW()"),
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  });

  DiscoveryItems.associate = function (models) {
    DiscoveryItems.belongsTo(models.tr_audits, {
      foreignKey: "audit_id",
      as: "audit",
      // onDelete: "CASCADE",
    });
    DiscoveryItems.belongsTo(models.ms_areas, {
      foreignKey: "area_id",
      as: "area",
    });
    DiscoveryItems.belongsTo(models.ms_scopes, {
      foreignKey: "scope_id",
      as: "scope",
    });
  };

  return DiscoveryItems;
};
