///////////////////////////////////////////////////////////////////////////////
// Create Party dialog

Template.createDialog.events({
  'click .save': function (event, template) {
    var title = template.find(".title").value;
    var description = template.find(".description").value;
    var dateTimeStartPicker = $('#datetimepicker1').data('datetimepicker');
    var dateTimeEndPicker = $('#datetimepicker2').data('datetimepicker');

    var public = ! template.find(".private").checked;
    var latlng = Session.get("createCoords");

    if (title.length && description.length) {
      Meteor.call('createParty', {
        title: title,
        description: description,
        latlng: latlng,
        start: dateTimeStartPicker.getLocalDate().toString(),
        end: dateTimeEndPicker.getLocalDate().toString(),
        public: public
      }, function (error, party) {
        if (! error) {
          Session.set("selected", party);
          if (! public && Meteor.users.find().count() > 1)
            Session.set("showInviteDialog", true);
        }
      });
      Session.set("showCreateDialog", false);
    } else {
      Session.set("createError",
                  "It needs a title and a description, or why bother?");
    }
  },

  'click .cancel': function () {
    Session.set("showCreateDialog", false);
  }
});

Template.createDialog.error = function () {
  return Session.get("createError");
};

Template.createDialog.rendered = function() {
  $('.date-time-picker').datetimepicker({
    language: 'en',
    format: 'dd/MM/yyyy hh:mm:ss',
    pick12HourFormat: true
  });
}
