Template.list.helpers({
    items: function() {
        return syncdb.find();
    }
});

Meteor.subscribe("syncdb");