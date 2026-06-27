export const AUTH_BB = {
  loginEmail: "login-email-input",
  loginPassword: "login-password-input",
  loginSubmit: "login-submit-btn",
  signupCompany: "signup-company-input",
  signupName: "signup-name-input",
  signupEmail: "signup-email-input",
  signupPassword: "signup-password-input",
  signupSubmit: "signup-submit-btn",
  switchToSignup: "switch-to-signup-link",
  switchToLogin: "switch-to-login-link",
  inviteName: "invite-name-input",
  invitePassword: "invite-password-input",
  inviteSubmit: "invite-submit-btn",
  logoutBtn: "logout-btn",
  demoAdminBtn: "demo-admin-btn",
  demoEmployeeBtn: "demo-employee-btn",
};

export const LANDING = {
  getStartedBtn: "landing-get-started",
  loginBtn: "landing-login-btn",
  ctaBottomBtn: "landing-cta-bottom",
  heroDemoBtn: "landing-hero-demo-btn",
};

export const SIDEBAR = {
  nav: "sidebar-nav",
  navDashboard: "nav-dashboard",
  navChat: "nav-chat",
  navDocuments: "nav-documents",
  navEmployees: "nav-employees",
  userMenu: "sidebar-user-menu",
};

export const DASH = {
  page: "dashboard-page",
  statDocs: "stat-total-docs",
  statQuestions: "stat-total-questions",
  statMembers: "stat-total-members",
  statPending: "stat-pending-invites",
  recentActivity: "recent-activity-list",
};

export const DOCS = {
  page: "documents-page",
  uploadBtn: "upload-doc-btn",
  uploadDialog: "upload-doc-dialog",
  fileInput: "doc-file-input",
  deptSelect: "doc-dept-select",
  uploadSubmit: "doc-upload-submit",
  search: "doc-search-input",
  filterDept: "doc-filter-dept",
  list: "doc-list",
  deleteBtn: (id) => `doc-delete-${id}`,
};

export const CHAT = {
  page: "chat-page",
  input: "chat-input",
  sendBtn: "chat-send-btn",
  deptFilter: "chat-dept-filter",
  messageList: "chat-message-list",
  newChatBtn: "chat-new-btn",
};

export const EMP = {
  page: "employees-page",
  inviteBtn: "invite-emp-btn",
  inviteDialog: "invite-emp-dialog",
  inviteEmailInput: "invite-emp-email",
  inviteSubmitBtn: "invite-emp-submit",
  inviteLinkResult: "invite-link-result",
  copyInviteLink: "copy-invite-link",
  membersList: "members-list",
  pendingList: "pending-invites-list",
  removeMember: (id) => `remove-member-${id}`,
};
