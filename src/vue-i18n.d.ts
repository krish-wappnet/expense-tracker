// src/vue-i18n.d.ts
import { I18n } from 'vue-i18n';

declare module 'vue' {
  interface ComponentCustomProperties {
    t: I18n['t'];
    $i18n: I18n;
  }
}