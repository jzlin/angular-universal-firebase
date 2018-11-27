require('zone.js/dist/zone-node');

const functions = require('firebase-functions');
const express = require('express');
const path = require('path');
const { enableProdMode } = require('@angular/core');
const { renderModuleFactory } = require('@angular/platform-server');

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');
const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

enableProdMode();

const index = require('fs')
  .readFileSync(path.resolve(__dirname, './dist/browser/index.html'), 'utf8')
  .toString();

let app = express();

app.engine('html', function(_, options, callback) {
  renderModuleFactory(AppServerModuleNgFactory, {
    document: index,
    url: options.req.url,
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  }).then(function(html) {
    callback(null, html);
  });
});

app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, './dist/browser'));

app.get('*.*', express.static(path.resolve(__dirname, './dist/browser')));

app.get('*', (req, res) => {
  res.render(path.resolve(__dirname, './dist/browser/index.html'), { req });
});

exports.ssr = functions.https.onRequest(app);
