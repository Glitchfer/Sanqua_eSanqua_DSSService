"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormTemplateItem = sequelize.define("tr_formtemplateitems", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    formtemplate_id: DataTypes.INTEGER,
    clause_id: DataTypes.INTEGER,
    area_id: DataTypes.INTEGER,
    scope_id: DataTypes.INTEGER,
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

  FormTemplateItem.associate = function (models) {
    FormTemplateItem.belongsTo(models.ms_formtemplates, {
      foreignKey: "formtemplate_id",
      as: "form_template",
      onDelete: "CASCADE",
    });

    FormTemplateItem.belongsTo(models.ms_clauses, {
      foreignKey: "clause_id",
      as: "clause",
      onDelete: "CASCADE",
    });

    FormTemplateItem.belongsTo(models.ms_areas, {
      foreignKey: "area_id",
      as: "area",
      onDelete: "CASCADE",
    });

    FormTemplateItem.belongsTo(models.ms_scopes, {
      foreignKey: "scope_id",
      as: "scope",
      onDelete: "CASCADE",
    });
  };

  return FormTemplateItem;
};
