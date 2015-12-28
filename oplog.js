var Future = Npm.require('fibers/future');


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
          var commandMgr = null;
          var dbDef = null;
          var connManager = null;

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


                  dbDef = new DbDef(Meteor.settings.Def);


                  connManager = new DbConnectionManager(Meteor.settings.DbConnections);

                  //Future.wait(connManager.open('MSSQL'));
                  options.legacyConnection =connManager.open(Meteor.settings.OpLog.Databases.legacy).wait();
                  console.log(options.legacyConnection);

                  commandMgr = new SqlCommandManager(options.legacyConnection, dbDef);
                  options.commandManager = commandMgr;

                  future.return(options.legacyConnection.dbInstance!=null );
              }
              catch(e) {
                  future.return(false);
              }
              return future.wait();

              //process.nextTick(initOpLog);
          }.future();

          var initOpLog = function () {

              var future = new Future();

              console.log('initOpLog');

              var op = null;


              //var uri = 'mongodb://127.0.0.1:1961/link';
              var uri = connManager.getConnectionString(Meteor.settings.OpLog.Databases.local)
              console.log('uri '+ uri)
              var filter = '(^link.doc)';


              op = new OpLogWrite(uri, filter, options);
              op.run();

          }

          Setup();
      }
});


