'use strict'

const Datastore = require('nedb')
const winston = require('winston')

class DbPromise {
    constructor(config) {
		this.nedb = new Datastore(config.nedbConfig())
		this.mediaLogger = winston.createLogger(config.winstonConfig('DbPromise'))
    }

    find( query ) {
        return new Promise((resolve, reject) => {
          this.nedb.find(query, function (err, docs) {
            if (err) { reject(err) }
            else { resolve(docs) }
          })
		})
		.catch((err) => {
			this.mediaLogger.error({
				message: 'db find error',
				err
			})
		})
    }

    findOne(query) {
		return new Promise((resolve, reject) => {
			this.nedb.findOne( query, function (err, doc) {
				if (err) { reject(err) }
				resolve(doc)
			})
		}) 
		.catch((err) => {
			this.mediaLogger.error({
				message: 'db findOne error',
				query,
				err
			})
		})
    }

    update(query, update) {
		return new Promise((resolve, reject) => {
			this.nedb.update( query, update, {}, (err, numReplaced) => {
				if ( err ) reject(err)
				resolve(numReplaced)
			})
		})
		.catch((err) => {
			this.mediaLogger.error({
				message: 'db update error',
				query,
				err
			})
		}) 
    }

    insertNew(mediaInfo) {
		return this.find({ name: mediaInfo.name })
			.then((docs) => {
				if ( docs.length === 0) return this.insert(mediaInfo)  
				return mediaInfo
			})
			.catch((err) => {
				this.mediaLogger.error({
					message: 'db recording new doc error',
					mediaInfo,
					err
				})
			}) 
	}

	insert(mediaInfo) {
		return new Promise((resolve, reject) => {
			this.nedb.insert( mediaInfo, function(err, newDoc) {
				if (err) reject(err)
				resolve(newDoc)				
			})			
		})
		.catch((err) => {
			this.mediaLogger.error({
				message: 'db recording error',
				mediaInfo,
				err
			})
		}) 
	}

	remove(query, options = { multi: true }) {
		return new Promise((resolve, reject) => {
			this.nedb.remove(query, options, (err, numRemoved) => {
				if (err) reject(err)
				else resolve(numRemoved)				
			})
		})
		.catch((err) => {
			this.mediaLogger.error({
				message: 'db remove error',
				query,
				err
			})
		}) 
	}

	ensureIndex(field) {
		return new Promise((resolve, reject) => {
			this.nedb.ensureIndex({ fieldName: field, unique: true, sparse: true }, (err) => {
				if (err) reject(err)
				else resolve(true)
			})
		})
		.catch((err) => {
			this.mediaLogger.error({
				message: 'db ensureIndex error',
				field,
				err
			})
		}) 
	}
}

module.exports = DbPromise