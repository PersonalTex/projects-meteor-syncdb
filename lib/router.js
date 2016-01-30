/**
 * Created by paolo on 04/01/16.
 */
/*
Router.route('/settings/connections', {where: 'server'})
    .get(function () {
        this.response.end(EJSON.stringify(Meteor.settings.DbConnections));
    })
    .post(function () {
        this.response.end('post request\n');
    });
*/

/*
Router.route('/settings/connections/:alias', {where: 'server'})
    .get(function () {
         this.response.end(EJSON.stringify(Meteor.settings.DbConnections[this.params.alias]));


    })
    .post(function () {
        this.response.end('post request\n');
    }, {where: 'server'});
 */

Router.route('/', function () {
    template: 'list'
});

