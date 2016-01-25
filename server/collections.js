/**
 * Created by paolo on 24/01/16.
 */

//Conf = Meteor.Collection('conf')
Meteor.publish("Conf", function() {
    return Conf.find();
});