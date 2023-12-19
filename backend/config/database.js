const CONNECTION_URI = require('../credentials.js');

module.exports = function (mongoose) {
    mongoose.set('useFindAndModify', false);
    mongoose
        .connect(CONNECTION_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'test',
        })
        .then(() => {
            console.log('MongoDB Connected…');
        })
        .catch(err => console.error(err));
};
