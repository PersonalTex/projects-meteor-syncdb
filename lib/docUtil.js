
DocUtil = function(Def) {
 this.def = _.extend({}, Def);
 this.fields = null;
};

/*
DbDef.prototype.init = function(tableName) {
    this.fields = this.getFields(tableName);
    this.getLinkField( this.def['Collections'][tableName], '_id');

};
*/

/*
DbDef.prototype.getFields = function(tableName) {
    console.log('getFields');
    return _.extend([], this.def['Collections'][tableName]['fields'], this.def['Collections']['extend']['fields']);
};
*/

DocUtil.prototype.getLinkField = function(tableName, fieldName, fieldValue) {
    try {
        var key = _.findKey(this.def.Collections.tableName, fieldName );
        console.log('getLinkField '+key)
    }
    catch (e) {
        console.log(e)

    }
};

// Return an array of all instance {item[.itemn]} in str without {}
// Example str = 'update DOC set {_id} = :id, {updated.userName} where ...'
// Returns [{_id}, {updated.userName}]
DocUtil.prototype.getLinkFields = function(str) {
    var arr = str.match(/({\w+(.)\w+\})/g);
    // remove {}

    if(arr != null)
      arr  = arr.toString().replace(/\{/g, '').replace(/\}/g, '').split(',')
    console.log(arr);
    return arr;
};
/*
DbDef.prototype.normalizeValues = function(tableName, doc) {
    var self = this;
    for(fieldName in doc)
    {
        doc[fieldName] = self.getFieldValue(tableName, fieldName,doc)
    }
};

DbDef.prototype.getFieldValue = function (tableName,fieldName, record) {
    var self = this;
    var fields = this.fields;
    try {
      var field = fields[fieldName];
      if (field.fieldType == 'ISODATE') {
          return record[fieldName] ? new Date(record[fieldName]).format('DD-MMM-YYYY hh:mm:ss:SS') : null;
      }
      else if (field.fieldType == 'OBJECT') {
          return record[fieldName] ? record[fieldName].toString() : null;
      }
      else if (field.fieldType == 'ARRAY' ) {
              if(record[fieldName]) {
                  var result = '';
                  for (obj in record[fieldName])
                      result += obj+' ';
                  return result;
              }
              else
                  return null;
      }
      else {
          return record[fieldName] ? record[fieldName] : null;
      }


      }
    catch (error) {
            return null;
        }

};

*/

