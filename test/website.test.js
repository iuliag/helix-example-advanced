/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable no-console */
/* eslint-disable no-undef */

const assert = require('assert');
const request = require('request');
const jquery = require('jquery');
const { JSDOM } = require('jsdom');

const HTTP_REQUEST_TIMEOUT_MSEC = 10000;

// TODO for now this require manually deploying the content at this URL,
// we should deploy it automatically (with the Helix bot?)
const testURL = `https://bertrand.helix-demo.xyz/?cacheKiller=${Math.random()}`;

// TODO we should first wait for the website output to be
// updated - include the Git revision hash in a response header
// (with Helix debug mode?) and check it, for example.
// The "get content" code look like website.content("/"), take
// care of that (+CDN cache clearing) and cache content for the
// duration of the tests.

describe(`Test the published website from ${testURL}`, () => {
  const content = {};

  // "function" is needed for "this", to set timeout
  // eslint-disable-next-line func-names
  before(function (done) {
    this.timeout(HTTP_REQUEST_TIMEOUT_MSEC);
    request(testURL, async (err, res, body) => {
      assert(!err);
      assert.equal(res.statusCode, 200);
      content.$ = jquery(new JSDOM(body).window);
      done();
    });
  });

  it('Contains the page title', () => {
    const expectedTitle = 'Helix - advanced example';
    assert.equal(expectedTitle, content.$('h1:first').text());
  });

  it('Contains the expected body texts', () => {
    [
      'This Helix example demonstrates advanced features'
    ].forEach((text) => {
      assert(
        content.$('body').text().indexOf(text) > 0,
        `Expecting '${text})' to be found in the page content`,
      );
    });
  });

  it('Contains the expected links', () => {
    [
      'README.html'
    ].forEach((href) => {
      const pattern = `a[href="${href}"]`;
      assert(
        content.$(pattern).length > 0,
        `Expecting '${pattern}' to be found`,
      );
    });
  });

  it('Contains the expected image elements', () => {
    [
      '/images/helix_logo.png'
    ].forEach((src) => {
      const pattern = `img[src="${src}"]`;
      assert(
        content.$(pattern).length > 0,
        `Expecting '${pattern}' to be found`,
      );
    });
  });
});