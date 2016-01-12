/**
 * Created by paolo on 11/01/16.
 */

Template.simple.events = {
    'click button' : function () {
        Meteor.call('getOpLogCounters',function(err, response) {
            Session.set('OpLogCounters', response);
        });

    }
};
Template.simple.result = function () {
    return Session.get('OpLogCounters') || "";
};


