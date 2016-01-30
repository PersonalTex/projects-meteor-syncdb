/*!
 * syncdb
 *
 *
 * Copyright
 * Released under the MIT license
 */
"use strict";

var Future = Npm.require('fibers/future');
var util = Npm.require('util');
var events = Npm.require('events');

var app = null;

var App = function(){
    events.EventEmitter.call(this);
    this.connMgr = null;
    //this.local = {};
    //this.legacy = {};
    this.dbCollUtil = null;
    this.localAlias = '';
    this.legacyAlias = '';
    this.opLogWrite = null;

    this.conf = {};
};

util.inherits(App, events.EventEmitter);



App.prototype.start = function() {
    var self = this;
    var future = new Future();

    // the application also start without legacy connection
    var legacyConn = self.connMgr.get(self.legacyAlias).wait();
    console.log(legacyConn);
    if(legacyConn.getInstance() == null)
      console.log("warning: legacy connection failed");

    var localConn = self.connMgr.get(self.localAlias).wait();
    console.log(localConn);
    if(localConn.getInstance() == null)
        console.log("error: local connection failed");
    else
      self.opLogWrite.start();

    future.return(true);
    return future.wait();
}.future();


App.prototype.initConnections = function () {
    var self= this;
    var future = new Future();
    try {
        // read configuration from meteor.conf collection
        self.conf = self.readConf();

        self.localAlias = self.conf.OpLog.Databases.local;
        self.legacyAlias = self.conf.OpLog.Databases.legacy;


        // create instance of DbConnecctionManager class
        self.connMgr = new DbConnectionManager(self.conf.DbConnections);

        self.connMgr.open(self.localAlias).wait();
        self.connMgr.open(self.legacyAlias).wait();
        //self.legacy.connection = self.connMgr.open(self.conf.OpLog.Databases.legacy).wait();
        //self.local.connection = self.connMgr.open(self.conf.OpLog.Databases.local).wait();
        //self.legacy.connection = app.openConnection(self.conf.OpLog.Databases.legacy).wait();
        //self.local.connection = app.openConnection(self.conf.OpLog.Databases.local).wait();

        future.return(true);
    }
    catch(e) {
        //((process.kill(process.pid, 'SIGHUP');
        console.log(e);
        future.return(false);
        //app.emit('fatalError', e);
    }
    return future.wait();
}.future();

App.prototype.initOpLog = function () {
    var self = this;

    var future = new Future();
    try {

        var uri = self.connMgr.getConnectionString(self.localAlias);
        var filter = util.format('(^%s.doc)', self.conf.DbConnections[self.localAlias].db);
        self.dbCollUtil = new DbCollectionUtil(self.conf.Def.Collections,self.connMgr.get(self.localAlias).wait());
        self.dbCollUtil.init().wait();
        self.opLogWrite = new OpLogWrite(uri, filter, self.connMgr.get(self.legacyAlias).wait()
        /*self.legacy.connection*/, self.dbCollUtil);

        future.return(true);
    }
    catch (e) {
        console.log(e);
        future.return(false);
    }
    return future.wait();
}.future();

// read the first document of meteor.conf collection
App.prototype.readConf = function() {
    var conf = new Mongo.Collection('conf');
    return conf.findOne({});
}

// startup meteor event
Meteor.startup(function () {
  if (Meteor.isServer) {
      app = new App();
      app.initConnections().wait();
      app.initOpLog().wait();

      app.start().wait();

  }
});

