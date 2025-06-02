"use strict";

module.exports = (sequelize, DataTypes) => {
  const PersonInvolve = sequelize.define("tr_personinvolves", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    initialreport_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    gender: DataTypes.INTEGER, //1: Pria, 2: Wanita
    no_identitas: DataTypes.STRING,
    birth_date: DataTypes.DATE,
    person_type: DataTypes.INTEGER, //1: Worker, 2: Visitor
    engagement_type: DataTypes.INTEGER, //1: Korban, 2: Saksi
    employee_leader_id: DataTypes.INTEGER,
    employee_leader_name: DataTypes.INTEGER,
    injured_category_id: DataTypes.INTEGER,
    injured_body_part_id: DataTypes.INTEGER,
    machine_used: DataTypes.STRING,
    amount_loss: DataTypes.DOUBLE,
    rehabilitation_days: DataTypes.INTEGER,
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

  PersonInvolve.associate = function (models) {
    PersonInvolve.belongsTo(models.tr_initialreports, {
      foreignKey: "initialreport_id",
      as: "initial_report",
    });

    PersonInvolve.belongsTo(models.ms_injuredcategories, {
      foreignKey: "injured_category_id",
      as: "injured_category",
    });

    // PersonInvolve.belongsTo(models.ms_bodyparts, {
    //   foreignKey: "injured_body_part_id",
    //   as: "body_part",
    // });
  };

  return PersonInvolve;
};
