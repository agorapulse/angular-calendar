/// <reference types="mocha" />

import '!!style-loader!css-loader!sass-loader!../src/angular-calendar.scss';
import 'core-js/es/reflect';
import 'zone.js';
import 'zone.js/testing';
import 'moment/locale/de';
import 'moment/locale/en-ca';
import { use } from 'chai';
import * as sinonChai from 'sinon-chai';
import { provideZoneChangeDetection } from '@angular/core';
import {
  ComponentFixtureAutoDetect,
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import * as sinon from 'sinon';

use((sinonChai as any).default ?? sinonChai);

let rafStub: sinon.SinonStub;
let requestIdleCallbackStub: sinon.SinonStub;
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideZoneChangeDetection(),
      { provide: ComponentFixtureAutoDetect, useValue: false },
    ],
  });
  rafStub = sinon.stub(window, 'requestAnimationFrame').callsArg(0);
  requestIdleCallbackStub = sinon
    .stub(window, 'requestIdleCallback' as any)
    .callsArg(0);
});

afterEach(() => {
  rafStub.restore();
  requestIdleCallbackStub.restore();
});

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: false },
  }
);
