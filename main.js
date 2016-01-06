//"use strict";

var Future = Npm.require('fibers/future');
var util = Npm.require('util');
var events = Npm.require('events');

var app = null;

//AppOplog = {};
var AppOplog = function(){
    events.EventEmitter.call(this);
    this.connMgr = null;
    this.local = {};
    this.legacy = {};
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
        var dbTables = new DbTables(Meteor.settings.Def.Collections,self.local.connection);
        self.op = new OpLogWrite(self.local.uri, self.local.filter, self.legacy.connection, dbTables);
        future.return(true);
    }
    catch (e) {
        console.log(e);
        future.return(false);
    }
    return future.wait();
}.future();



AppOplog.prototype.run = function() {
    this.op.run();
}

Meteor.startup(function () {
  if (Meteor.isServer) {

      app = new AppOplog();

      /*
      app.on('error', function(err){
          console.log(err)
      })
      */


      var Setup = function () {
          try {
              app.connMgr = new DbConnectionManager(Meteor.settings.DbConnections);
              app.legacy.connection = app.openConnection(Meteor.settings.OpLog.Databases.legacy).wait();
              app.local.connection = app.openConnection(Meteor.settings.OpLog.Databases.local).wait();
              app.initOpLog().wait();
              app.run();
          }
          catch(e) {
              process.kill(process.pid, 'SIGHUP');
              //console.log(e);
              //app.emit('fatalError', e);
          }
      }
      Setup();
  }
});


process.on('SIGHUP', function() {
    console.log('Got SIGHUP signal.');
});



