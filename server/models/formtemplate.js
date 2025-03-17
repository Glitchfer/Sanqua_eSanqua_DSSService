"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormTemplates = sequelize.define("ms_formtemplates", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    company_name: DataTypes.STRING,
    department_id: DataTypes.INTEGER,
    department_name: DataTypes.STRING,
    audit_type_id: DataTypes.INTEGER,
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

  FormTemplates.associate = function (models) {
    FormTemplates.hasMany(models.tr_formtemplateitems, {
      foreignKey: "formtemplate_id",
      as: "form_template_item",
    });

    FormTemplates.belongsTo(models.ms_audittypes, {
      foreignKey: "audit_type_id",
      as: "audit_type",
    });
  };

  return FormTemplates;
};
