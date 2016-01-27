//use strict";

var Future = Npm.require('fibers/future');
var util = Npm.require('util');
var events = Npm.require('events');
//var ChildProcess = Npm.require('child_process');
//var opChild = null;


var app = null;

var App = function(){
    events.EventEmitter.call(this);
    this.connMgr = null;
    this.local = {};
    this.legacy = {};
    this.dbTables = null;
    this.conf = {};
};
util.inherits(App, events.EventEmitter);


/*
App.prototype.openConnection = function (options) {
    var self = this;
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
*/

App.prototype.initOpLog = function () {
    var self = this;

    var future = new Future();
    try {
        self.local.uri = self.connMgr.getConnectionString(self.conf.OpLog.Databases.local);
        self.local.filter = util.format('(^%s.doc)', self.conf.DbConnections[self.conf.OpLog.Databases.local].db);
        self.dbTables = new DbTables(self.conf.Def.Collections,self.local.connection);
        self.dbTables.init();
        self.op = new OpLogWrite(self.local.uri, self.local.filter, self.legacy.connection, self.dbTables);

        future.return(true);
    }
    catch (e) {
        console.log(e);
        future.return(false);
    }
    return future.wait();
}.future();


App.prototype.start = function() {
    var future = new Future();
    if(this.legacy.connection.getInstance() == null)
      console.log("legacy connection failed");
    else if(this.local.connection.getInstance() == null)
        console.log("local connection failed");
    else
      this.op.start();
    future.return(true);
    return future.wait();

}.future();
App.prototype.setup = function () {
    var self= this;
    var future = new Future();
    try {
        self.conf = self.readConf();
        //console.log(self.conf);
        self.connMgr = new DbConnectionManager(self.conf.DbConnections);
        self.legacy.connection = self.connMgr.open(self.conf.OpLog.Databases.legacy).wait();
        self.local.connection = self.connMgr.open(self.conf.OpLog.Databases.local).wait();
        //self.legacy.connection = app.openConnection(self.conf.OpLog.Databases.legacy).wait();
        //self.local.connection = app.openConnection(self.conf.OpLog.Databases.local).wait();
        self.initOpLog().wait();

        future.return(true);


        //app.start();
    }
    catch(e) {
        //((process.kill(process.pid, 'SIGHUP');
        console.log(e);
        future.return(false);
        //app.emit('fatalError', e);
    }
    return future.wait();
}.future();


App.prototype.readConf = function() {

    var conf = new Mongo.Collection('conf');
    return conf.findOne({});
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
      app = new App();
      app.setup().wait();
      app.start().wait();

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



