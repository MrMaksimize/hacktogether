Template.page.showInviteDialog = function () {
  return Session.get("showInviteDialog");
};

Template.page.showCreateDialog = function () {
  return Session.get("showCreateDialog");
};

// if (Meteor.isServer) {
// Email.send({
// from: "aranzadi@hotmail.com",
// to: "iiaranzadi@gmail.com",
// subject: "Por ahí va Sendgrid",
// text: "Si te llega este mensaje me avisas porque it works!"
// });
// }