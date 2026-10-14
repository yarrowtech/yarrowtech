// // erp/models/Project.js
// import mongoose from "mongoose";

// const projectSchema = new mongoose.Schema({
//   projectId: { type: String, unique: true },
//   name: { type: String, required: true },
//   description: { type: String },
//   projectDetails: { type: String },
//   client: { type: mongoose.Schema.Types.ObjectId, ref: "ERPClient" },
//   clientName: String,
//   clientEmail: String,
//   managerEmail: String,
//   techLeadEmail: String,
//   expectedDelivery: Date,
//   status: { type: String, default: "new" },
//   createdAt: { type: Date, default: Date.now }
// });

// // ⬇⬇ FIX for OverwriteModelError ⬇⬇
// export default mongoose.models.ERPProject ||
//   mongoose.model("ERPProject", projectSchema);



import mongoose from "mongoose";

export const REQUIREMENT_STRING_FIELDS = [
  "paymentApproved", "paymentApprovedOn",
  "companyProfile", "brandMaterials", "existingSystem", "existingDocumentation",
  "catalogData", "databaseStructure", "apiDocumentation", "agreementNotes",
  "designFeedback", "changeRequests", "uatFeedback", "finalAcceptance",
  "finalAcceptanceName", "finalAcceptanceDate", "finalAcceptanceNotes",
  // 1. Introduction
  "businessName", "projectType", "purpose", "overview", "goals", "glossary", "referenceLinks",
  // 2. Overall description
  "industry", "targetAudience", "userRoles", "technology", "languages", "constraints",
  "assumptions", "competitors",
  // 3. Functional requirements (extra)
  "businessRules", "outOfScope",
  // 4. External interfaces
  "fontPreference", "logoStatus", "contentProvider", "externalInterfaces",
  // 5. Non-functional requirements
  "nfPerformance", "nfSecurity", "nfUsability", "nfReliability", "nfCompatibility",
  // 6. Deployment, timeline & acceptance
  "hostingStatus", "domainStatus", "domainName", "launchDate", "budgetRange",
  "acceptanceCriteria", "additionalNotes",
  // 7. Contact & approval
  "contactName", "contactPhone", "contactEmail", "approved", "approvalName", "approvedOn",
];

export const REQUIREMENT_LIST_FIELDS = [
  "pages", "brandColors", "designStyles", "platforms", "integrations", "extras",
];

export const REQUIREMENT_PRIORITIES = ["Must have", "Should have", "Nice to have"];

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true }, // display only
  name: { type: String, required: true },
  projectDetails: String,
  totalPayment: {
    type: Number,
    default: 0,
  },

  /* ✅ CLIENT RELATION */
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ERPClient",
    required: true,
  },
  clientName: String,
  clientEmail: String,

  /* ✅ MANAGER REAL RELATION (THIS FIXED YOUR ISSUE) */
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ERPUser",
    required: true,
  },

  /* ✅ KEEP EMAILS FOR DISPLAY / EMAIL PURPOSE */
  managerEmail: String,
  techLeadEmail: String,

  expectedDelivery: Date,
  status: { type: String, default: "pending" },
  progress: { type: Number, default: 0 },

  /* Final project requirements, filled by the client and shared with our team */
  requirements: {
    ...Object.fromEntries(
      REQUIREMENT_STRING_FIELDS.map((key) => [key, { type: String, default: "" }])
    ),
    ...Object.fromEntries(
      REQUIREMENT_LIST_FIELDS.map((key) => [key, { type: [String], default: [] }])
    ),
    functionalRequirements: {
      type: [
        {
          title: { type: String, default: "" },
          description: { type: String, default: "" },
          priority: { type: String, default: "Should have" },
          _id: false,
        },
      ],
      default: [],
    },
    updatedAt: Date,
  },

  /* Documents the client uploaded for the SRS (kept outside `requirements`,
     which is replaced on every form save) */
  requirementDocuments: [
    {
      name: String,
      url: String,
      publicId: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  srsRevision: { type: Number, default: 0 },
  srsPaymentTerms: {
    total: Number,
    currency: { type: String, default: "INR" },
    notes: String,
    updatedAt: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "ERPUser" },
    breakdown: [{ id: String, label: String, amount: Number, due: String, dueDate: String, description: String, _id: false }],
  },
  srsLockedAt: { type: Date, default: null },
  srsManagerApprovedAt: Date,
  srsManagerName: String,
  srsManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "ERPUser" },
  // After the lock only the external admin API may change the SRS
  srsExternalUpdatedAt: Date,
  srsWebhookStatus: String,
  srsWebhookAt: Date,
  srsWebhookError: String,

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ERPProject ||
  mongoose.model("ERPProject", projectSchema);
