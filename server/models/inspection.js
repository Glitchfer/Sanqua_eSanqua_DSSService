"use strict";

module.exports = (sequelize, DataTypes) => {
  const Inspection = sequelize.define("tr_inspections", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    initialreport_id: DataTypes.INTEGER,
    accident_classification_id: DataTypes.INTEGER,
    investigation_date: DataTypes.DATE,
    has_p2k3: DataTypes.BOOLEAN,
    has_bpjstk: DataTypes.BOOLEAN,
    has_emergency_procedure: DataTypes.BOOLEAN,
    danger_condition_id: DataTypes.INTEGER,
    danger_action_id: DataTypes.INTEGER, //1: Worker, 2: Visitor
    accident_source_id: DataTypes.INTEGER, //1: Korban, 2: Saksi
    accident_type_id: DataTypes.INTEGER,
    dangerous_process_desc: DataTypes.STRING,
    existing_function_protection: DataTypes.STRING,
    conclusion: DataTypes.STRING,
    corrective_action_due_date: DataTypes.BOOLEAN,
    corrective_action_desc: DataTypes.STRING,
    status: DataTypes.INTEGER,
    file: DataTypes.JSON,
    document_no: DataTypes.STRING,
    cancel_note: DataTypes.STRING,
    total_working_hours: DataTypes.STRING,
    total_missing_hours: DataTypes.STRING,
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

  Inspection.associate = function (models) {
    Inspection.hasMany(models.tr_accidentitemdescs, {
      foreignKey: "inspection_id",
      as: "accident_item_desc",
    });

    Inspection.hasMany(models.tr_damagedobjects, {
      foreignKey: "inspection_id",
      as: "damaged_object",
    });

    Inspection.belongsTo(models.tr_initialreports, {
      foreignKey: "initialreport_id",
      as: "initial_report",
    });

    Inspection.belongsTo(models.ms_accidentclassifications, {
      foreignKey: "accident_classification_id",
      as: "accident_classification",
    });

    Inspection.belongsTo(models.ms_dangerconditions, {
      foreignKey: "danger_condition_id",
      as: "danger_condition",
    });

    Inspection.belongsTo(models.ms_dangeractions, {
      foreignKey: "danger_action_id",
      as: "danger_action",
    });

    Inspection.belongsTo(models.ms_accidentsources, {
      foreignKey: "accident_source_id",
      as: "accident_source",
    });

    Inspection.belongsTo(models.ms_accidenttypes, {
      foreignKey: "accident_type_id",
      as: "accident_type",
    });
  };

  return Inspection;
};
