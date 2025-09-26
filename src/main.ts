import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Chart, registerables } from 'chart.js';

//Chart.register(...registerables);
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));