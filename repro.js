var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://readonly:readonly@ds041380.mongolab.com:41380/mongo-node-294',
    function (err, db) {
      var start = Date.now();
      runFindCursor(db, function (err) {
        if(err) throw err;

        console.log('find cursor took seconds:', (Date.now() - start) / 1000);

        start = Date.now();
        runAggregateCursor(db, function (err) {
          if(err) throw err;

          console.log('aggregate cursor took seconds:', (Date.now() - start) / 1000);
          db.close();
        });

      });

    });

function runFindCursor(db, callback) {
  var count = 0,
      cursor = db.collection('test-data').find({}, { sort: { timestamp: 1 } }).stream();

  cursor.on('data', function() { count++; });
  cursor.on('err', callback);
  cursor.on('close', function() {
    console.log('find processed count:', count);
    callback();
  });
}

function runAggregateCursor(db, callback) {
  var count = 0,
      cursor = db.collection('test-data')
      .aggregate([{ $sort: { timestamp: 1 } }], { cursor: { batchSize: 1000 } });

  cursor.on('data', function(){ count++; });
  cursor.on('err', callback);
  cursor.on('end', function() {
    console.log('aggregation processed count:', count);
    callback();
  });
}