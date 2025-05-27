const _auditController = require("../controllers").audit;

const { check, validationResult } = require("express-validator");
var _rootAPIPath = "/api/esanqua/dss/v1/audit";

module.exports = (app) => {
  app.get(_rootAPIPath, (req, res) =>
    res.status(200).send({
      message: "Welcome to the Todos API!",
    })
  );

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-method, x-token, x-application-id"
    );
    next();
  });

  var arrValidate = [];

  arrValidate = [];
  arrValidate = [
    check("act")
      .not()
      .isEmpty()
      .withMessage("Parameter action can not be empty"),
    check(
      "company_id",
      "Parameter company_id can not be empty and must be integer"
    )
      .not()
      .isEmpty()
      .isInt(),
    check("company_name")
      .not()
      .isEmpty()
      .withMessage("Parameter company_name can not be empty"),
    check("audit_date")
      .not()
      .isEmpty()
      .withMessage("Parameter audit_date can not be empty"),
    check("audit_type_id")
      .not()
      .isEmpty()
      .isInt()
      .withMessage(
        "Parameter audit_type_id can not be empty and must be integer"
      ),
  ];
  app.post(_rootAPIPath + "/save", arrValidate, _auditController.save);

  arrValidate = [];
  arrValidate = [
    check("limit", "Parameter limit can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
    check("offset", "Parameter offset can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
  ];
  app.get(_rootAPIPath + "/list", arrValidate, _auditController.list);

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.get(_rootAPIPath + "/detail/:id", arrValidate, _auditController.getById);

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(_rootAPIPath + "/submit", arrValidate, _auditController.submit);

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(_rootAPIPath + "/cancel", arrValidate, _auditController.cancel);

  arrValidate = [];
  arrValidate = [
    check("document_id")
      .not()
      .isEmpty()
      .withMessage("Parameter document_id can not be empty"),
  ];
  app.post(_rootAPIPath + "/approve", arrValidate, _auditController.approve);

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/set_to_draft",
    arrValidate,
    _auditController.setToDraft
  );

  arrValidate = [];
  arrValidate = [
    check("document_id")
      .not()
      .isEmpty()
      .withMessage("Parameter document_id can not be empty"),
  ];
  app.post(_rootAPIPath + "/reject", arrValidate, _auditController.reject);

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];

  app.post(_rootAPIPath + "/done", arrValidate, _auditController.done);

  // Fetch Matrix FPB
  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id cannot be empty"),
  ];
  app.post(
    _rootAPIPath + "/fetch_matrix",
    arrValidate,
    _auditController.fetchMatrix
  );

  arrValidate = [];
  arrValidate = [
    check("audit_id", "Parameter audit_id can not be empty").not().isEmpty(),
    check(
      "company_id",
      "Parameter company_id can not be empty and must be integer"
    )
      .not()
      .isEmpty()
      .isInt(),
    check("audit_type_id")
      .not()
      .isEmpty()
      .isInt()
      .withMessage(
        "Parameter audit_type_id can not be empty and must be integer"
      ),
  ];
  app.post(
    _rootAPIPath + "/generate_form",
    arrValidate,
    _auditController.generateFormAudit
  );
  // arrValidate = [];
  // app.post(_rootAPIPath + '/import', arrValidate, _auditController.importOvertime);
  arrValidate = [];
  arrValidate = [
    // check('limit', 'Parameter limit can not be empty and must be integer').not().isEmpty().isInt(),
    // check('offset', 'Parameter offset can not be empty and must be integer').not().isEmpty().isInt(),
    // check('audit_id', 'Parameter offset can not be empty and must be integer').not().isEmpty().isInt()
  ];
  app.get(_rootAPIPath + "/item/list", arrValidate, _auditController.itemList);

  arrValidate = [];
  arrValidate = [check("id", "Parameter id can not be empty").not().isEmpty()];
  app.get(
    _rootAPIPath + "/item/detail/:id",
    arrValidate,
    _auditController.itemDetail
  );

  arrValidate = [];
  arrValidate = [
    check("act")
      .not()
      .isEmpty()
      .withMessage("Parameter action can not be empty"),
    check("id", "Parameter id can not be empty and must be integer")
      .not()
      .isEmpty(),
  ];
  app.post(_rootAPIPath + "/item/save", arrValidate, _auditController.itemSave);

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/item/submit",
    arrValidate,
    _auditController.itemSubmit
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/item/cancel",
    arrValidate,
    _auditController.itemCancel
  );

  arrValidate = [];
  arrValidate = [
    check("id")
      .not()
      .isEmpty()
      .withMessage("Parameter document_id can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/item/verify",
    arrValidate,
    _auditController.itemVerify
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/item/set_to_draft",
    arrValidate,
    _auditController.itemSetDraft
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/item/unused",
    arrValidate,
    _auditController.itemSetUnused
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.delete(
    _rootAPIPath + "/item/delete/:id",
    arrValidate,
    _auditController.itemDelete
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id cannot be empty"),
    check("objective_evidence")
      .optional()
      .isArray()
      .withMessage(
        "Parameter objective_evidence must be array and cannot be empty"
      ),

    check("corrective_evidence")
      .optional()
      .isArray()
      .withMessage(
        "Parameter corrective_evidence must be array and cannot be empty"
      ),

    check("objective_evidence").custom((value, { req }) => {
      if (!value && !req.body.corrective_evidence) {
        throw new Error(
          "At least one field (objective_evidence or corrective_evidence) is required."
        );
      }
      return true;
    }),
    check("corrective_evidence").custom((value, { req }) => {
      if (!value && !req.body.objective_evidence) {
        throw new Error(
          "At least one field (objective_evidence or corrective_evidence) is required."
        );
      }
      return true;
    }),
  ];
  app.post(
    _rootAPIPath + "/item/update_file_upload",
    arrValidate,
    _auditController.itemUpdateFileUpload
  );

  arrValidate = [];
  arrValidate = [
    check("act")
      .not()
      .isEmpty()
      .withMessage("Parameter action can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/member/save",
    arrValidate,
    _auditController.memberSave
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.delete(
    _rootAPIPath + "/member/delete/:id",
    arrValidate,
    _auditController.memberDelete
  );

  // -----------DISCOVERY ITEMS-------------------
  arrValidate = [];
  arrValidate = [
    check("limit", "Parameter limit can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
    check("offset", "Parameter offset can not be empty and must be integer")
      .not()
      .isEmpty()
      .isInt(),
    check("audit_id", "Parameter offset can not be empty and must be integer")
      .not()
      .isEmpty(),
  ];
  app.get(
    _rootAPIPath + "/discoveryitem/list",
    arrValidate,
    _auditController.discoveryitemList
  );

  arrValidate = [];
  arrValidate = [
    check("act")
      .not()
      .isEmpty()
      .withMessage("Parameter action can not be empty"),
  ];
  app.post(
    _rootAPIPath + "/discoveryitem/save",
    arrValidate,
    _auditController.discoveryitemSave
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id can not be empty"),
  ];
  app.delete(
    _rootAPIPath + "/discoveryitem/delete/:id",
    arrValidate,
    _auditController.discoveryitemDelete
  );

  arrValidate = [];
  arrValidate = [
    check("id").not().isEmpty().withMessage("Parameter id cannot be empty"),
    check("objective_evidence")
      .optional()
      .isArray()
      .withMessage(
        "Parameter objective_evidence must be array and cannot be empty"
      ),

    check("corrective_evidence")
      .optional()
      .isArray()
      .withMessage(
        "Parameter corrective_evidence must be array and cannot be empty"
      ),

    check("objective_evidence").custom((value, { req }) => {
      if (!value && !req.body.corrective_evidence) {
        throw new Error(
          "At least one field (objective_evidence or corrective_evidence) is required."
        );
      }
      return true;
    }),
    check("corrective_evidence").custom((value, { req }) => {
      if (!value && !req.body.objective_evidence) {
        throw new Error(
          "At least one field (objective_evidence or corrective_evidence) is required."
        );
      }
      return true;
    }),
  ];
  app.post(
    _rootAPIPath + "/discoveryitem/update_file_upload",
    arrValidate,
    _auditController.discoveryitemFileUpload
  );
};
