"use strict";

module.exports = (sequelize, DataTypes) => {
  const RootProblem = sequelize.define("tr_rootproblems", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    initialreport_id: DataTypes.INTEGER,
    document_no: DataTypes.STRING,
    conclusion: DataTypes.STRING,
    corrective_recomendation: DataTypes.STRING,
    cancel_note: DataTypes.STRING,
    status: DataTypes.INTEGER,
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
    updated_by_name: DataTypes.STRING
  });

  RootProblem.associate = function (models) {
    RootProblem.hasMany(models.tr_rootcauseitemdescs, {
      foreignKey: "rootproblem_id",
      as: "root_cause",
    });
    
    RootProblem.belongsTo(models.tr_initialreports, {
      foreignKey: "initialreport_id",
      as: "initial_report",
    });

    // RootProblem.belongsTo(models.ms_accidentclassifications, {
    //   foreignKey: "accident_classification_id",
    //   as: "accident_classification",
    // });

    // RootProblem.belongsTo(models.ms_dangerconditions, {
    //   foreignKey: "danger_condition_id",
    //   as: "danger_condition",
    // });

    // RootProblem.belongsTo(models.ms_dangeractions, {
    //   foreignKey: "danger_action_id",
    //   as: "danger_action",
    // });

    // RootProblem.belongsTo(models.ms_accidentsources, {
    //   foreignKey: "accident_source_id",
    //   as: "accident_source",
    // });

    // RootProblem.belongsTo(models.ms_accidenttypes, {
    //   foreignKey: "accident_type_id",
    //   as: "accident_type",
    // });
  };

  return RootProblem;
};
