//"use strict";

var Future = Npm.require('fibers/future');
var util = Npm.require('util');


Meteor.startup(function () {
  if (Meteor.isServer) {
      //var options = {};
      var connMgr = null;
      var connection = null;
      var op = null;
      //var dbUtil = null;

      var Setup = function () {

          console.log("1");
          connMgr = new DbConnectionManager(Meteor.settings.DbConnections);
          console.log("2");

          console.log(connMgr);
          if(!openConnection(Meteor.settings.OpLog.Databases.legacy).wait())
            console.log("openConnection failed")
          else
            initOpLog();
      }


      var openConnection = function (options) {
          var future = new Future();
          console.log('openConnection '+ options);
          try {


              connection = connMgr.open(options).wait();
              future.return(connection.dbInstance!=null );
          }
          catch(e) {
              future.return(false);
          }
          return future.wait();
      }.future();

      var initOpLog = function () {
          console.log('initOpLog');

          var uri = connMgr.getConnectionString(Meteor.settings.OpLog.Databases.local);
          var filter = util.format('(^%s.doc)', Meteor.settings.DbConnections[Meteor.settings.OpLog.Databases.local].db);
          var dbTables = new DbTables(Meteor.settings.Def.Collections);
          op = new OpLogWrite(uri, filter, connection, dbTables);
          op.run();
      }
      Setup();
  }
});


