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
const { getHeader, assertHeader } = require('./testutils');
const Website = require('./website');
const config = require('./config');

// TODO we should first wait for the website output to be
// updated - include the Git revision hash in a response header
// (with Helix debug mode?) and check it, for example.
// The "get content" code look like website.content("/"), take
// care of that (+CDN cache clearing) and cache content for the
// duration of the tests.
// https://github.com/adobe/helix-example-advanced/issues/3

describe(`Test the published website from ${config.siteURL}`, () => {
  const response = {};
  const site = new Website(config.siteURL);

  // eslint-disable-next-line func-names
  before(function (done) {
    this.timeout(config.httpRequestTimeoutMsec);
    site.getContent('/', (resp) => {
      Object.assign(response, resp);
      done();
    });
  });

  it('Contains the page title', () => {
    const expectedTitle = 'Helix - advanced example';
    assert.equal(expectedTitle, response.$('h1:first').text());
  });


  it('Contains the expected body texts', () => {
    [
      'This Helix example demonstrates advanced features'
    ].forEach((text) => {
      assert(
        response.$('body').text().indexOf(text) > 0,
        `Expecting '${text})' to be found in the page content`,
      );
    });
  });

  it('Contains the expected pre.js content', () => {
    const expected = 'This comes from pre.js';
    assert(
      response.$('body').text().indexOf(expected) > 0),
      'Expecting the pre.js content to be found in the page content'
  });

  it('Contains the expected planet.js content', () => {
    const jupiterRegexp = /Surface Area.*61575/;
    assert(
      response.$('body').text().match(jupiterRegexp),
      'Expecting the planet.js regexp (' + jupiterRegexp + ' to match the page content'
    )

    const untitledPattern = 'h3:contains("Untitled")';
    assert(
      response.$(untitledPattern).length == 1,
      `Expecting one ${untitledPattern} to be found`
    )
    assert(
      response.$(untitledPattern).text() == 'Untitled',
      `Expecting the text of ${untitledPattern} to match`
    )
  });

  it('Contains the expected pizza button', () => {
    const pattern = 'button';
    assert(
      response.$(pattern).length == 1,
      `Expecting one ${pattern} to be found`
    );
    const regexp = /win big pizza/i;
    assert(
      response.$(pattern).text().match(regexp),
      'Expecting the HTL-generated pizza button to be found in the page content'
  )});

  it('Contains the expected links', () => {
    [
      'README.html'
    ].forEach((href) => {
      const pattern = `a[href="${href}"]`;
      assert(
        response.$(pattern).length > 0,
        `Expecting '${pattern}' to be found`,
      );
    });
  });

  it('Contains the expected image elements', () => {
    [
      './images/helix_logo.png'
    ].forEach((src) => {
      const pattern = `img[src="${src}"]`;
      assert(
        response.$(pattern).length > 0,
        `Expecting '${pattern}' to be found`,
      );
    });
  });

  it('Contains the expected ESI hook headers', () => {
    assertHeader(response.headers, 'X-marker-before', /esi\/[0-9]+/);
    assertHeader(response.headers, 'X-marker-after', /esi\/[0-9]+/);
  });
});
