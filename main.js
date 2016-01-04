var Future = Npm.require('fibers/future');
var util = Npm.require('util');


if (Meteor.isClient) {
  // counter starts at 0
  //Session.setDefault('counter', 0);

  Template.oplog.helpers({
    /*
    counter: function () {
      return Session.get('counter');
    }*/
  });

  Template.oplog.events({
    /*
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
    */
  });
}

  Meteor.startup(function () {


      if (Meteor.isServer) {
          var options = {};
          /*
          var commandMgr = null;
          var docUtil = null;
          */
          var connManager = null;
          var connection = null;
          var op = null;
          var dbUtil = null;

          var Setup = function () {
              if(!openConnection().wait())
                console.log("openConnection failed")
              else
                initOpLog();
          }


          var openConnection = function () {
              var future = new Future();
              console.log('openConnection');


              try {

                  connMgr = new DbConnectionManager(Meteor.settings.DbConnections);

                  connection = connMgr.open(Meteor.settings.OpLog.Databases.legacy).wait();


                  future.return(connection.dbInstance!=null );
              }
              catch(e) {
                  future.return(false);
              }
              return future.wait();

              //process.nextTick(initOpLog);
          }.future();

          var initOpLog = function () {

              //
              // var future = new Future();

              console.log('initOpLog');



              var uri = connMgr.getConnectionString(Meteor.settings.OpLog.Databases.local);
              var filter = util.format('(^%s.doc)', Meteor.settings.DbConnections[Meteor.settings.OpLog.Databases.local].db);
              //options.commandManager = new OpSequelizeCommandManager(connection, new DbUtil(Meteor.settings.Def));
              //var dbUtil = new DbUtil(Meteor.settings.Def)

              var dbTables = new DbTables(Meteor.settings.Def.Collections);

              op = new OpLogWrite(uri, filter, connection, dbTables);
              op.run();

          }

          Setup();
      }
});


