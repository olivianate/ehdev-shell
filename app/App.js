/**
 * @author ryan.bian
 */
// import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { hot } from 'react-hot-loader';

moment.locale('zh-cn');

import './index.less?no-css-module';

// Pages
import DashboardModule from './modules/module.dashboard/';
import ProjectModule from './modules/module.project/';
import UploadModule from './modules/module.upload/';
import ConfigerModule from './modules/module.configer/';
import UserModule from './modules/module.user/';
// import ImageModule from './modules/module.image/';
import LayoutModule from './modules/module.layout/';
import QrCodeModule from './modules/module.qrcode/';
import PomodoraModule from './modules/module.pomodora/';
import Controller from './modules/module.controller/';
import CommandPalette from './modules/module.command.palette/';

import ErrorBoundary from './components/component.errorBoundary/';

const App = () => (
  <ErrorBoundary>
    <Controller>
      <BrowserRouter basename={window.location.pathname}>
        <LayoutModule>
          <Route exact path="/" component={DashboardModule}/>
          <Route exact path="/dashboard" component={DashboardModule}/>
          <Route path="/project" component={ProjectModule}/>
          <Route path="/upload" component={UploadModule}/>
          <Route path="/configer" component={ConfigerModule}/>
          <Route path="/user" component={UserModule}/>
          <Route path="/qrcode" component={QrCodeModule} />
          <Route path="/pomodora" component={PomodoraModule} />
          <CommandPalette />
        </LayoutModule>
      </BrowserRouter>
    </Controller>
  </ErrorBoundary>
);
// <Route path="/images" component={ImageModule}></Route>

export default hot(module)(App);
