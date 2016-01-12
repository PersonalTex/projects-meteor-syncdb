//"use strict";

var Future = Npm.require('fibers/future');
var util = Npm.require('util');
var events = Npm.require('events');
//var ChildProcess = Npm.require('child_process');
//var opChild = null;


var app = null;

var AppOplog = function(){
    events.EventEmitter.call(this);
    this.connMgr = null;
    this.local = {};
    this.legacy = {};
    this.dbTables = null;

};
util.inherits(AppOplog, events.EventEmitter);


AppOplog.prototype.openConnection = function (options) {var self = this;
    var future = new Future();
    console.log('openConnection '+ options);
    try {
        future.return(self.connMgr.open(options).wait());
    }
    catch(e) {
        console.log(e);
        future.return(null);
    }
    return future.wait();
}.future();

AppOplog.prototype.initOpLog = function () {
    var self = this;

    var future = new Future();
    try {
        self.local.uri = self.connMgr.getConnectionString(Meteor.settings.OpLog.Databases.local);
        self.local.filter = util.format('(^%s.doc)', Meteor.settings.DbConnections[Meteor.settings.OpLog.Databases.local].db);
        self.dbTables = new DbTables(Meteor.settings.Def.Collections,self.local.connection);
        self.op = new OpLogWrite(self.local.uri, self.local.filter, self.legacy.connection, self.dbTables);

        future.return(true);
    }
    catch (e) {
        console.log(e);
        future.return(false);
    }
    return future.wait();
}.future();



AppOplog.prototype.start = function() {
    if(this.legacy.connection.getInstance() == null)
      console.log("legacy connection failed");
    else if(this.local.connection.getInstance() == null)
        console.log("local connection failed");
    else
      this.op.start();

}
AppOplog.prototype.setup = function () {


    Meteor.methods({
        getOpLogCounters: function () {
            console.log('on server, getOpLogCounters called');
            return this.op.counters;
        }


    });

    try {
        this.connMgr = new DbConnectionManager(Meteor.settings.DbConnections);
        this.legacy.connection = app.openConnection(Meteor.settings.OpLog.Databases.legacy).wait();
        this.local.connection = app.openConnection(Meteor.settings.OpLog.Databases.local).wait();
        this.initOpLog().wait();


        //app.start();
    }
    catch(e) {
        //((process.kill(process.pid, 'SIGHUP');
        console.log(e);
        //app.emit('fatalError', e);
    }

}

//var msg = {action: 'init', settings: Meteor.settings, npmfuture: Future, npmevents: events, npmutil: util };

Meteor.startup(function () {
  if (Meteor.isServer) {



      /*
      opChild = ChildProcess.fork(process.env.PWD+'/server/child.js');

      opChild.on('message', function(m) {
          console.dir('received: ' + m);
      });
      opChild.send(msg);
      */

      app = new AppOplog();
      app.setup();
      app.start()

      /*
      app.on('error', function(err){
          console.log(err)
      })
      */


      //Setup();

  }
});




/*
process.on('SIGHUP', function() {
    console.log('Got SIGHUP signal.');
});
*/



